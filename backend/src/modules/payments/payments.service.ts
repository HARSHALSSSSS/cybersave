import { Inject, Injectable } from '@nestjs/common';
import { PaymentStatus, Prisma } from '@prisma/client';

import { PrismaService } from '@/database/database.module';
import { AuditLogService } from '@/modules/audit-logs/audit-log.service';
import { ServiceVersionsBundleService } from '@/modules/service-versions/services/service-versions-bundle.service';
import {
  PAYMENT_PROVIDER,
  type PaymentProvider,
} from '@/integrations/payment/payment-provider.interface';

@Injectable()
export class PaymentsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly bundleService: ServiceVersionsBundleService,
    @Inject(PAYMENT_PROVIDER) private readonly provider: PaymentProvider,
    private readonly auditLogService: AuditLogService,
  ) {}

  async createForApplication(
    applicationId: string,
    citizenId: string,
    idempotencyKey: string,
  ) {
    const existing = await this.prisma.payment.findUnique({
      where: { idempotencyKey },
    });
    if (existing) {
      return existing;
    }

    const application = await this.prisma.application.findUniqueOrThrow({
      where: { id: applicationId },
    });

    const bundle = await this.bundleService.getFullBundle(application.serviceVersionId);
    const pricing = bundle.pricingConfig;
    const baseFee = pricing ? Number(pricing.baseFee) : 0;
    const taxRate = pricing ? Number(pricing.taxRate) : 0;
    const taxAmount = pricing?.taxEnabled ? (baseFee * taxRate) / 100 : 0;
    const additional =
      pricing?.additionalCharges.reduce((s, c) => s + Number(c.amount), 0) ?? 0;
    const amount = baseFee + taxAmount + additional;
    const currency = pricing?.currency ?? 'INR';

    const order = await this.provider.createOrder({
      applicationId,
      citizenId,
      amount,
      currency,
      idempotencyKey,
    });

    const payment = await this.prisma.payment.create({
      data: {
        applicationId,
        citizenId,
        provider: order.provider,
        providerRef: order.providerRef,
        amount: new Prisma.Decimal(amount),
        currency,
        status: PaymentStatus.PENDING,
        idempotencyKey,
      },
    });

    return payment;
  }

  async verifyAndCapture(paymentId: string) {
    const payment = await this.prisma.payment.findUniqueOrThrow({
      where: { id: paymentId },
    });
    return this.capturePaymentRecord(payment);
  }

  async verifyAndCaptureByProviderRef(providerRef: string) {
    const payment = await this.prisma.payment.findFirst({
      where: { providerRef },
    });
    if (!payment) {
      return { success: false, message: 'Payment not found' };
    }
    return this.capturePaymentRecord(payment);
  }

  private async capturePaymentRecord(payment: {
    id: string;
    providerRef: string | null;
    applicationId: string;
    citizenId: string;
    status: PaymentStatus;
  }) {
    if (payment.status === PaymentStatus.CAPTURED) {
      return { success: true, paymentId: payment.id };
    }

    if (!payment.providerRef) {
      throw new Error('Missing provider reference');
    }

    const result = await this.provider.verifyPayment(payment.providerRef);

    if (!result.success) {
      await this.prisma.payment.update({
        where: { id: payment.id },
        data: { status: PaymentStatus.FAILED },
      });
      return { success: false };
    }

    await this.prisma.$transaction([
      this.prisma.payment.update({
        where: { id: payment.id },
        data: { status: PaymentStatus.CAPTURED },
      }),
      this.prisma.paymentTransaction.create({
        data: {
          paymentId: payment.id,
          eventType: 'CAPTURED',
          providerRef: payment.providerRef,
        },
      }),
      this.prisma.application.update({
        where: { id: payment.applicationId },
        data: { status: 'PAYMENT_PENDING' },
      }),
    ]);

    await this.auditLogService.log(
      null,
      'PAYMENT_CAPTURED',
      'payment',
      payment.id,
      { applicationId: payment.applicationId, citizenId: payment.citizenId },
    );

    return { success: true, paymentId: payment.id };
  }

  async listAdmin(page = 1, limit = 20) {
    const skip = (page - 1) * limit;
    const [data, total] = await Promise.all([
      this.prisma.payment.findMany({
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          application: { select: { publicRef: true, id: true } },
          citizen: { select: { phone: true, id: true } },
        },
      }),
      this.prisma.payment.count(),
    ]);
    return {
      data,
      meta: { page, limit, total, totalPages: Math.ceil(total / limit) || 1 },
    };
  }
}
