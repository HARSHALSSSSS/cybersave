import {
  BadRequestException,
  ConflictException,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import {
  ManualApplySessionStatus,
  PaymentStatus,
  Prisma,
  ServiceVersionLifecycleStatus,
} from '@prisma/client';
import { randomUUID } from 'crypto';

import { getStateName } from '@/common/constants/indian-states.constants';
import { PrismaService } from '@/database/database.module';
import {
  PAYMENT_PROVIDER,
  type PaymentProvider,
} from '@/integrations/payment/payment-provider.interface';
import { ServiceVersionsBundleService } from '@/modules/service-versions/services/service-versions-bundle.service';
import { ServicesCatalogMapper } from '@/modules/service-versions/services/services-catalog.mapper';

@Injectable()
export class ManualApplyService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly bundleService: ServiceVersionsBundleService,
    private readonly catalogMapper: ServicesCatalogMapper,
    @Inject(PAYMENT_PROVIDER) private readonly paymentProvider: PaymentProvider,
  ) {}

  async createSession(
    citizenId: string,
    subServiceId: string,
    stateCode?: string,
  ) {
    const version = await this.prisma.serviceVersion.findFirst({
      where: {
        subServiceId,
        lifecycleStatus: ServiceVersionLifecycleStatus.PUBLISHED,
      },
      orderBy: { versionNumber: 'desc' },
    });
    if (!version) {
      throw new NotFoundException('Published service not found');
    }

    const bundle = await this.bundleService.getFullBundle(version.id);
    const config = this.catalogMapper.toConfigurationResponse(
      bundle,
      stateCode?.toUpperCase(),
    );

    if (!config.fulfillment.manualEnabled) {
      throw new BadRequestException('Manual apply is not available for this service');
    }

    if (config.fulfillment.requiresStateSelection && !stateCode) {
      throw new BadRequestException('State selection is required');
    }

    const normalizedState = stateCode?.toUpperCase();
    if (
      config.fulfillment.requiresStateSelection &&
      normalizedState &&
      !config.fulfillment.availableStates.some((s) => s.code === normalizedState)
    ) {
      throw new BadRequestException(
        'This service is not available in the selected state',
      );
    }

    const portalUrl = config.fulfillment.officialPortalUrl;
    if (!portalUrl) {
      throw new BadRequestException(
        'Official portal URL is not configured for this service and state',
      );
    }

    return this.prisma.manualApplySession.create({
      data: {
        citizenId,
        subServiceId,
        serviceVersionId: version.id,
        stateCode: stateCode?.toUpperCase(),
        stateName: stateCode
          ? getStateName(stateCode.toUpperCase()) ?? stateCode
          : null,
        serviceName: config.overview?.displayName ?? config.subService.name,
        officialPortalUrl: portalUrl,
        platformFee: new Prisma.Decimal(0),
        status: ManualApplySessionStatus.PAID,
      },
    });
  }

  async createPaymentIntent(
    sessionId: string,
    citizenId: string,
    idempotencyKey: string,
  ) {
    const session = await this.findOwnedSession(sessionId, citizenId);

    if (session.status !== ManualApplySessionStatus.PENDING_PAYMENT) {
      if (session.payment) {
        return this.formatPaymentIntent(session.payment, session);
      }
      throw new BadRequestException('Session is not awaiting payment');
    }

    const existing = await this.prisma.manualApplyPayment.findUnique({
      where: { idempotencyKey },
    });
    if (existing) {
      if (existing.manualApplySessionId !== sessionId) {
        throw new ConflictException('Idempotency key already used');
      }
      return this.formatPaymentIntent(existing, session);
    }

    const amount = Number(session.platformFee);
    const order = await this.paymentProvider.createOrder({
      applicationId: sessionId,
      citizenId,
      amount,
      currency: 'INR',
      idempotencyKey,
    });

    const payment = await this.prisma.manualApplyPayment.create({
      data: {
        manualApplySessionId: sessionId,
        citizenId,
        provider: order.provider,
        providerRef: order.providerRef,
        amount: new Prisma.Decimal(amount),
        currency: 'INR',
        status: PaymentStatus.PENDING,
        idempotencyKey,
      },
    });

    return this.formatPaymentIntent(payment, session);
  }

  async confirmPayment(sessionId: string, citizenId: string) {
    const session = await this.prisma.manualApplySession.findFirst({
      where: { id: sessionId, citizenId },
      include: { payment: true },
    });
    if (!session) throw new NotFoundException('Session not found');

    if (
      session.status === ManualApplySessionStatus.PAID ||
      session.status === ManualApplySessionStatus.REDIRECTED ||
      session.status === ManualApplySessionStatus.USER_CONFIRMED
    ) {
      return this.formatSession(session);
    }

    if (!session.payment) {
      throw new BadRequestException('Payment not initiated');
    }

    if (session.payment.status !== PaymentStatus.CAPTURED) {
      const verified = await this.paymentProvider.verifyPayment(
        session.payment.providerRef ?? session.payment.id,
      );
      if (!verified.success) {
        throw new BadRequestException('Payment verification failed');
      }
      await this.prisma.manualApplyPayment.update({
        where: { id: session.payment.id },
        data: { status: PaymentStatus.CAPTURED },
      });
    }

    const updated = await this.prisma.manualApplySession.update({
      where: { id: sessionId },
      data: { status: ManualApplySessionStatus.PAID },
      include: { payment: true },
    });

    return this.formatSession(updated);
  }

  async markRedirected(sessionId: string, citizenId: string) {
    const session = await this.findOwnedSession(sessionId, citizenId);
    if (
      session.status !== ManualApplySessionStatus.PAID &&
      session.status !== ManualApplySessionStatus.REDIRECTED &&
      session.status !== ManualApplySessionStatus.PENDING_PAYMENT
    ) {
      throw new BadRequestException('Session is not ready for portal redirect');
    }

    const updated = await this.prisma.manualApplySession.update({
      where: { id: sessionId },
      data: {
        status: ManualApplySessionStatus.REDIRECTED,
        redirectedAt: session.redirectedAt ?? new Date(),
      },
      include: { payment: true },
    });

    return this.formatSession(updated);
  }

  async confirmApplied(sessionId: string, citizenId: string) {
    const session = await this.findOwnedSession(sessionId, citizenId);
    const updated = await this.prisma.manualApplySession.update({
      where: { id: sessionId },
      data: {
        status: ManualApplySessionStatus.USER_CONFIRMED,
        confirmedAt: new Date(),
      },
      include: { payment: true },
    });
    return this.formatSession(updated);
  }

  async listForCitizen(citizenId: string) {
    const sessions = await this.prisma.manualApplySession.findMany({
      where: { citizenId },
      include: { payment: true },
      orderBy: { createdAt: 'desc' },
    });
    return sessions.map((s) => this.formatSession(s));
  }

  async listForAdmin(page = 1, limit = 20) {
    const skip = (page - 1) * limit;
    const [data, total] = await Promise.all([
      this.prisma.manualApplySession.findMany({
        include: {
          payment: true,
          citizen: { select: { id: true, phone: true, firstName: true, lastName: true } },
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      this.prisma.manualApplySession.count(),
    ]);
    return {
      data: data.map((s) => ({
        ...this.formatSession(s),
        citizen: s.citizen,
      })),
      meta: { total, page, limit, totalPages: Math.ceil(total / limit) },
    };
  }

  async getForCitizen(sessionId: string, citizenId: string) {
    const session = await this.prisma.manualApplySession.findFirst({
      where: { id: sessionId, citizenId },
      include: { payment: true },
    });
    if (!session) throw new NotFoundException('Session not found');
    return this.formatSession(session);
  }

  private async findOwnedSession(sessionId: string, citizenId: string) {
    const session = await this.prisma.manualApplySession.findFirst({
      where: { id: sessionId, citizenId },
      include: { payment: true },
    });
    if (!session) throw new NotFoundException('Session not found');
    return session;
  }

  private formatPaymentIntent(
    payment: {
      id: string;
      providerRef: string | null;
      amount: Prisma.Decimal;
      currency: string;
      status: PaymentStatus;
    },
    session: { id: string; officialPortalUrl: string; platformFee: Prisma.Decimal },
  ) {
    return {
      paymentId: payment.id,
      sessionId: session.id,
      providerRef: payment.providerRef,
      amount: Number(payment.amount),
      currency: payment.currency,
      status: payment.status.toLowerCase(),
      officialPortalUrl: session.officialPortalUrl,
      platformFee: Number(session.platformFee),
    };
  }

  private formatSession(
    session: {
      id: string;
      serviceName: string;
      stateCode: string | null;
      stateName: string | null;
      officialPortalUrl: string;
      platformFee: Prisma.Decimal;
      status: ManualApplySessionStatus;
      redirectedAt: Date | null;
      confirmedAt: Date | null;
      createdAt: Date;
      payment?: { id: string; status: PaymentStatus; providerRef: string | null } | null;
    },
  ) {
    return {
      id: session.id,
      serviceName: session.serviceName,
      stateCode: session.stateCode,
      stateName: session.stateName,
      officialPortalUrl: session.officialPortalUrl,
      platformFee: Number(session.platformFee),
      status: session.status.toLowerCase(),
      redirectedAt: session.redirectedAt?.toISOString() ?? null,
      confirmedAt: session.confirmedAt?.toISOString() ?? null,
      createdAt: session.createdAt.toISOString(),
      paymentId: session.payment?.id ?? null,
      paymentStatus: session.payment?.status.toLowerCase() ?? null,
    };
  }
}
