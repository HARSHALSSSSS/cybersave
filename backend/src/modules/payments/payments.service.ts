import { Inject, Injectable, NotFoundException, ForbiddenException, BadRequestException } from '@nestjs/common';
import { ApplicationStatus, PaymentStatus, Prisma } from '@prisma/client';

import { PrismaService } from '@/database/database.module';
import { AuditLogService } from '@/modules/audit-logs/audit-log.service';
import { ServiceVersionsBundleService } from '@/modules/service-versions/services/service-versions-bundle.service';
import { calculateAssistedTotalAmount } from '@/modules/service-versions/utils/assisted-pricing.util';
import {
  PAYMENT_PROVIDER,
  type PaymentProvider,
} from '@/integrations/payment/payment-provider.interface';
import { RazorpayPaymentProvider } from '@/integrations/payment/razorpay-payment.provider';
import {
  isLiveRazorpayOrderId,
  publicRazorpayKeyId,
} from '@/integrations/payment/razorpay-enabled';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class PaymentsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly bundleService: ServiceVersionsBundleService,
    @Inject(PAYMENT_PROVIDER) private readonly provider: PaymentProvider,
    private readonly auditLogService: AuditLogService,
    private readonly configService: ConfigService,
    private readonly razorpayProvider: RazorpayPaymentProvider,
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
    const variant = application.applicantStateCode
      ? bundle.fulfillmentConfig?.stateVariants.find(
          (v) => v.stateCode === application.applicantStateCode,
        )
      : undefined;
    const amount = calculateAssistedTotalAmount(
      bundle.pricingConfig,
      bundle.fulfillmentConfig,
      application.applicantStateCode,
      variant?.baseFeeOverride ? Number(variant.baseFeeOverride) : null,
    );
    const currency = bundle.pricingConfig?.currency ?? 'INR';

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

  async confirmCheckout(
    paymentId: string,
    citizenId: string,
    options?: {
      mockCapture?: boolean;
      razorpayPaymentId?: string;
      razorpayOrderId?: string;
      razorpaySignature?: string;
    },
  ) {
    const payment = await this.prisma.payment.findUnique({ where: { id: paymentId } });
    if (!payment) throw new NotFoundException('Payment not found');
    if (payment.citizenId !== citizenId) {
      throw new ForbiddenException('Not allowed to confirm this payment');
    }
    if (payment.status === PaymentStatus.CAPTURED) {
      return { success: true, paymentId: payment.id, status: payment.status };
    }

    const liveOrder = isLiveRazorpayOrderId(payment.providerRef);
    const useMock =
      !liveOrder &&
      (options?.mockCapture === true ||
        payment.provider === 'mock' ||
        !payment.providerRef ||
        payment.providerRef.startsWith('mock_'));

    if (!useMock) {
      if (!options?.razorpayPaymentId || !options?.razorpayOrderId || !options?.razorpaySignature) {
        throw new BadRequestException('Missing Razorpay payment details');
      }
      const valid = this.razorpayProvider.verifyCheckoutSignature(
        options.razorpayOrderId,
        options.razorpayPaymentId,
        options.razorpaySignature,
      );
      if (!valid) {
        throw new BadRequestException('Invalid payment signature');
      }
    }

    return this.capturePaymentRecord(payment, {
      skipProviderVerify: !useMock && Boolean(options?.razorpaySignature),
    });
  }

  getCheckoutKeyId(): string {
    return publicRazorpayKeyId(this.configService);
  }

  private async capturePaymentRecord(
    payment: {
      id: string;
      providerRef: string | null;
      applicationId: string;
      citizenId: string;
      status: PaymentStatus;
    },
    options?: { skipProviderVerify?: boolean },
  ) {
    if (payment.status === PaymentStatus.CAPTURED) {
      return { success: true, paymentId: payment.id };
    }

    if (!payment.providerRef) {
      throw new Error('Missing provider reference');
    }

    if (!options?.skipProviderVerify) {
      const result = await this.provider.verifyPayment(payment.providerRef);

      if (!result.success) {
        await this.prisma.payment.update({
          where: { id: payment.id },
          data: { status: PaymentStatus.FAILED },
        });
        return { success: false };
      }
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
      // Scoped to pre-submit statuses so a replayed capture cannot pull an
      // already submitted application back into PAYMENT_PENDING.
      this.prisma.application.updateMany({
        where: {
          id: payment.applicationId,
          status: {
            in: [
              ApplicationStatus.DRAFT,
              ApplicationStatus.FORM_IN_PROGRESS,
              ApplicationStatus.DOCUMENTS_PENDING,
            ],
          },
        },
        data: { status: ApplicationStatus.PAYMENT_PENDING },
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

  async listForCitizen(citizenId: string) {
    const payments = await this.prisma.payment.findMany({
      where: { citizenId, status: PaymentStatus.CAPTURED },
      orderBy: { createdAt: 'desc' },
      take: 50,
      include: {
        application: {
          select: {
            id: true,
            publicRef: true,
            serviceVersion: {
              include: {
                overview: { select: { displayName: true } },
                subService: { select: { name: true } },
              },
            },
          },
        },
      },
    });

    return payments.map((payment) => ({
      id: payment.id,
      amount: Number(payment.amount),
      currency: payment.currency,
      status: payment.status,
      createdAt: payment.createdAt,
      applicationId: payment.applicationId,
      publicRef: payment.application.publicRef,
      serviceName:
        payment.application.serviceVersion.overview?.displayName ??
        payment.application.serviceVersion.subService.name,
    }));
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
