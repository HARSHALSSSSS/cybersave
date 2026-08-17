import {
  BadRequestException,
  Inject,
  Injectable,
  Logger,
  NotFoundException,
  OnModuleInit,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
  BbpsBillPaymentStatus,
  BbpsBillRequestStatus,
  Prisma,
} from '@prisma/client';

import { PrismaService } from '@/database/database.module';
import {
  mapProviderErrorToUserCode,
  userMessageForCode,
} from '@/integrations/bbps/bbps-error.util';
import {
  maskAccountHolderData,
  normalizeAccountHolderFields,
  normalizeBillAmountFromProvider,
  remapAccountHolderForProvider,
  validateAccountHolderData,
} from '@/integrations/bbps/bbps-field.util';
import {
  BBPS_PROVIDER,
  type BbpsProvider,
} from '@/integrations/bbps/bbps-provider.interface';
import { BillerSyncService } from './biller-sync.service';

@Injectable()
export class BillPaymentsService implements OnModuleInit {
  private readonly logger = new Logger(BillPaymentsService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly configService: ConfigService,
    private readonly syncService: BillerSyncService,
    @Inject(BBPS_PROVIDER) private readonly bbpsProvider: BbpsProvider,
  ) {}

  async onModuleInit() {
    this.logger.log(`BBPS bill payments using provider: ${this.bbpsProvider.name}`);
    void this.syncService.ensureCatalogueSeeded(this.bbpsProvider.name);
  }

  getSettings() {
    return {
      provider: this.bbpsProvider.name,
      convenienceFeeFlat: this.getConvenienceFee(),
    };
  }

  async listCategories() {
    const categories = await this.prisma.bbpsCategory.findMany({
      where: { appStatus: 'active' },
      orderBy: [{ isFeatured: 'desc' }, { displayOrder: 'asc' }],
    });

    return categories.map((c) => ({
      id: c.id,
      providerCategory: c.providerCategory,
      displayName: c.displayName,
      icon: c.icon,
      description: c.description,
      isFeatured: c.isFeatured,
    }));
  }

  async listBillers(params: {
    category: string;
    search?: string;
    state?: string;
    city?: string;
    page?: number;
    limit?: number;
  }) {
    const page = params.page ?? 1;
    const limit = Math.min(params.limit ?? 50, 100);
    const skip = (page - 1) * limit;

    const where: Prisma.BbpsBillerWhereInput = {
      providerCategory: params.category.toLowerCase(),
      isVisible: true,
      providerStatus: 'active',
      ...(this.bbpsProvider.name === 'mock'
        ? { razorpayBillerId: { startsWith: 'mock_' } }
        : {}),
      ...(params.state ? { state: params.state } : {}),
      ...(params.city ? { city: { contains: params.city, mode: 'insensitive' } } : {}),
      ...(params.search?.trim()
        ? {
            OR: [
              { name: { contains: params.search, mode: 'insensitive' } },
              { aliasName: { contains: params.search, mode: 'insensitive' } },
              { internalAlias: { contains: params.search, mode: 'insensitive' } },
            ],
          }
        : {}),
    };

    const [items, total] = await Promise.all([
      this.prisma.bbpsBiller.findMany({
        where,
        orderBy: [{ isFeatured: 'desc' }, { displayOrder: 'asc' }, { name: 'asc' }],
        skip,
        take: limit,
      }),
      this.prisma.bbpsBiller.count({ where }),
    ]);

    return {
      data: items.map((b) => this.formatBillerSummary(b)),
      meta: { total, page, limit, totalPages: Math.ceil(total / limit) },
    };
  }

  async getBiller(billerId: string) {
    const biller = await this.findVisibleBiller(billerId);
    return this.formatBillerDetail(biller);
  }

  async createBillRequest(
    citizenId: string,
    billerId: string,
    accountHolder: Record<string, string>,
  ) {
    const biller = await this.findVisibleBiller(billerId);
    const fields = normalizeAccountHolderFields(biller.accountHolderConfig);
    const errors = validateAccountHolderData(fields, accountHolder);
    if (Object.keys(errors).length > 0) {
      throw new BadRequestException({
        message: userMessageForCode('VALIDATION_ERROR'),
        code: 'VALIDATION_ERROR',
        errors,
      });
    }

    const started = Date.now();
    let providerResult;
    try {
      const providerAccountHolder = remapAccountHolderForProvider(
        biller.accountHolderConfig,
        accountHolder,
      );
      providerResult = await this.bbpsProvider.createBillRequest({
        billerId: biller.razorpayBillerId,
        gatewayBillerId: biller.gatewayBillerId ?? undefined,
        accountHolder: providerAccountHolder,
      });
      await this.logIntegration({
        endpoint: 'createBillRequest',
        requestId: providerResult.id,
        success: true,
        durationMs: Date.now() - started,
      });
    } catch (error) {
      await this.logIntegration({
        endpoint: 'createBillRequest',
        success: false,
        durationMs: Date.now() - started,
        errorReason: error instanceof Error ? error.message : 'Unknown',
      });
      throw this.toUserError(error);
    }

    const record = await this.prisma.bbpsBillRequest.create({
      data: {
        citizenId,
        billerId: biller.id,
        razorpayBillRequestId: providerResult.id,
        status: this.mapRequestStatus(providerResult.status),
        accountHolderData: accountHolder,
      },
      include: { biller: true },
    });

    return this.formatBillRequest(record);
  }

  async getBillRequest(citizenId: string, requestId: string, poll = false) {
    const record = await this.prisma.bbpsBillRequest.findFirst({
      where: { id: requestId, citizenId },
      include: { biller: true },
    });
    if (!record) throw new NotFoundException('Bill request not found');

    if (
      poll &&
      record.razorpayBillRequestId &&
      (record.status === BbpsBillRequestStatus.PROCESSING)
    ) {
      return this.pollBillRequest(record);
    }

    return this.formatBillRequest(record);
  }

  async createPaymentIntent(
    citizenId: string,
    billRequestId: string,
    idempotencyKey: string,
  ) {
    const existing = await this.prisma.bbpsBillPayment.findUnique({
      where: { idempotencyKey },
      include: { biller: true, billRequest: true },
    });
    if (existing) {
      return this.formatBillPayment(existing, true);
    }

    const billRequest = await this.prisma.bbpsBillRequest.findFirst({
      where: { id: billRequestId, citizenId },
      include: { biller: true },
    });
    if (!billRequest) throw new NotFoundException('Bill request not found');

    if (billRequest.status !== BbpsBillRequestStatus.SUCCESS) {
      const refreshed = await this.pollBillRequest(billRequest);
      if (refreshed.status !== 'success') {
        throw new BadRequestException({
          message: userMessageForCode('BILL_NOT_FOUND'),
          code: 'BILL_NOT_FOUND',
        });
      }
    }

    const latestRequest = await this.prisma.bbpsBillRequest.findFirst({
      where: { id: billRequestId, citizenId },
      include: { biller: true },
    });
    const billAmount = Number(latestRequest?.billAmount ?? billRequest.billAmount ?? 0);
    if (!Number.isFinite(billAmount) || billAmount <= 0) {
      throw new BadRequestException({
        message: userMessageForCode('BILL_NOT_FOUND'),
        code: 'BILL_NOT_FOUND',
      });
    }

    const convenienceFee = this.getConvenienceFee();
    const totalAmount = billAmount + convenienceFee;

    const order = await this.bbpsProvider.createPgOrder({
      amount: totalAmount,
      currency: 'INR',
      receipt: idempotencyKey.slice(0, 40),
      notes: {
        billRequestId,
        citizenId,
        type: 'bbps_bill_payment',
      },
    });

    const payment = await this.prisma.bbpsBillPayment.create({
      data: {
        citizenId,
        billerId: latestRequest?.billerId ?? billRequest.billerId,
        billRequestId: billRequest.id,
        razorpayOrderId: order.orderId,
        status: BbpsBillPaymentStatus.PROCESSING,
        billAmount,
        convenienceFee,
        totalAmount,
        billDetails:
          ((latestRequest?.billDetails ?? billRequest.billDetails) as object) ?? {},
        accountHolderMasked: maskAccountHolderData(
          (latestRequest?.accountHolderData ??
            billRequest.accountHolderData) as Record<string, string>,
        ),
        idempotencyKey,
      },
      include: { biller: true, billRequest: true },
    });

    return {
      ...this.formatBillPayment(payment, true),
      orderId: order.orderId,
      keyId: order.keyId,
      provider: this.bbpsProvider.name,
    };
  }

  async confirmPayment(
    citizenId: string,
    paymentId: string,
    options?: {
      mockCapture?: boolean;
      razorpayPaymentId?: string;
      razorpayOrderId?: string;
      razorpaySignature?: string;
    },
  ) {
    const payment = await this.prisma.bbpsBillPayment.findFirst({
      where: { id: paymentId, citizenId },
      include: { biller: true, billRequest: true },
    });
    if (!payment) throw new NotFoundException('Payment not found');

    if (
      payment.status === BbpsBillPaymentStatus.SUCCESS ||
      payment.status === BbpsBillPaymentStatus.PENDING
    ) {
      return this.formatBillPayment(payment, true);
    }

    if (payment.status === BbpsBillPaymentStatus.FAILED) {
      throw new BadRequestException({
        message: userMessageForCode('PAYMENT_FAILED'),
        code: 'PAYMENT_FAILED',
      });
    }

    let razorpayPaymentId = payment.razorpayPaymentId ?? options?.razorpayPaymentId;
    if (!razorpayPaymentId && payment.razorpayOrderId) {
      if (this.bbpsProvider.name === 'mock' || options?.mockCapture) {
        const captured = await this.bbpsProvider.captureMockPayment(
          payment.razorpayOrderId,
        );
        razorpayPaymentId = captured.paymentId;
      } else {
        const resolved = await this.bbpsProvider.resolvePgPayment(
          options?.razorpayOrderId ?? payment.razorpayOrderId,
          options?.razorpayPaymentId,
        );
        razorpayPaymentId = resolved.paymentId;
      }
    }

    if (!razorpayPaymentId) {
      throw new BadRequestException('Missing payment reference');
    }

    await this.prisma.bbpsBillPayment.update({
      where: { id: payment.id },
      data: { razorpayPaymentId },
    });

    const started = Date.now();
    let providerResult;
    try {
      providerResult = await this.bbpsProvider.createBillPayment({
        billRequestId: payment.billRequest?.razorpayBillRequestId ?? undefined,
        billerId: payment.biller.razorpayBillerId,
        gatewayBillerId: payment.biller.gatewayBillerId ?? undefined,
        accountHolder: payment.billRequest
          ? remapAccountHolderForProvider(
              payment.biller.accountHolderConfig,
              payment.billRequest.accountHolderData as Record<string, string>,
            )
          : undefined,
        razorpayPaymentId,
        amount: Number(payment.totalAmount),
      });
      await this.logIntegration({
        endpoint: 'createBillPayment',
        requestId: providerResult.id,
        internalRefId: payment.id,
        success: true,
        durationMs: Date.now() - started,
      });
    } catch (error) {
      await this.logIntegration({
        endpoint: 'createBillPayment',
        internalRefId: payment.id,
        success: false,
        durationMs: Date.now() - started,
        errorReason: error instanceof Error ? error.message : 'Unknown',
      });
      await this.prisma.bbpsBillPayment.update({
        where: { id: payment.id },
        data: {
          status: BbpsBillPaymentStatus.FAILED,
          errorMessage: userMessageForCode('PAYMENT_FAILED'),
        },
      });
      throw this.toUserError(error, 'PAYMENT_FAILED');
    }

    const updated = await this.prisma.bbpsBillPayment.update({
      where: { id: payment.id },
      data: {
        razorpayBillPaymentId: providerResult.id,
        status: this.mapPaymentStatus(providerResult.status),
      },
      include: { biller: true, billRequest: true },
    });

    if (updated.status === BbpsBillPaymentStatus.PROCESSING) {
      return this.pollUntilPaymentSettles(updated);
    }

    await this.upsertSavedBiller(citizenId, updated);
    return this.formatBillPayment(updated, true);
  }

  async getPayment(citizenId: string, paymentId: string, poll = false) {
    const payment = await this.prisma.bbpsBillPayment.findFirst({
      where: { id: paymentId, citizenId },
      include: { biller: true, billRequest: true },
    });
    if (!payment) throw new NotFoundException('Payment not found');

    if (
      poll &&
      payment.razorpayBillPaymentId &&
      (payment.status === BbpsBillPaymentStatus.PROCESSING ||
        payment.status === BbpsBillPaymentStatus.PENDING)
    ) {
      return this.pollBillPayment(payment);
    }

    return this.formatBillPayment(payment, true);
  }

  async listHistory(
    citizenId: string,
    filter?: 'all' | 'success' | 'pending' | 'failed',
    page = 1,
    limit = 20,
  ) {
    const where: Prisma.BbpsBillPaymentWhereInput = { citizenId };
    if (filter === 'success') where.status = BbpsBillPaymentStatus.SUCCESS;
    if (filter === 'pending') {
      where.status = {
        in: [BbpsBillPaymentStatus.PENDING, BbpsBillPaymentStatus.PROCESSING],
      };
    }
    if (filter === 'failed') where.status = BbpsBillPaymentStatus.FAILED;

    const skip = (page - 1) * limit;
    const [items, total] = await Promise.all([
      this.prisma.bbpsBillPayment.findMany({
        where,
        include: { biller: true, billRequest: true },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      this.prisma.bbpsBillPayment.count({ where }),
    ]);

    return {
      data: items.map((p) => this.formatBillPayment(p, false)),
      meta: { total, page, limit, totalPages: Math.ceil(total / limit) },
    };
  }

  async listRecentBillers(citizenId: string) {
    const payments = await this.prisma.bbpsBillPayment.findMany({
      where: { citizenId, status: BbpsBillPaymentStatus.SUCCESS },
      include: { biller: true, billRequest: true },
      orderBy: { paidAt: 'desc' },
      take: 20,
    });

    const seen = new Set<string>();
    const result = [];
    for (const p of payments) {
      const key = `${p.billerId}:${p.accountHolderMasked}`;
      if (seen.has(key)) continue;
      seen.add(key);
      result.push({
        billerId: p.biller.id,
        billerName: p.biller.name,
        category: p.biller.providerCategory,
        logoUrl: p.biller.logoUrl,
        accountMasked: p.accountHolderMasked,
        accountHolder: (p.billRequest?.accountHolderData as Record<string, string> | undefined) ?? {},
        lastUsedAt: p.paidAt ?? p.createdAt,
        lastPaymentAmount: Number(p.totalAmount),
      });
      if (result.length >= 5) break;
    }
    return result;
  }

  async listSavedBillers(citizenId: string) {
    const items = await this.prisma.bbpsSavedBiller.findMany({
      where: { citizenId },
      include: { biller: true },
      orderBy: { lastUsedAt: 'desc' },
    });
    return items.map((s) => ({
      id: s.id,
      billerId: s.billerId,
      billerName: s.biller.name,
      category: s.biller.providerCategory,
      logoUrl: s.biller.logoUrl,
      nickname: s.nickname,
      accountMasked: s.displayMasked,
      accountHolderData: s.accountHolderData,
      lastUsedAt: s.lastUsedAt,
      lastPaymentAmount: s.lastPaymentAmount
        ? Number(s.lastPaymentAmount)
        : null,
    }));
  }

  async saveBiller(
    citizenId: string,
    billerId: string,
    accountHolder: Record<string, string>,
    nickname?: string,
  ) {
    const biller = await this.findVisibleBiller(billerId);
    const masked = maskAccountHolderData(accountHolder);
    return this.prisma.bbpsSavedBiller.upsert({
      where: {
        citizenId_billerId_displayMasked: {
          citizenId,
          billerId: biller.id,
          displayMasked: masked,
        },
      },
      create: {
        citizenId,
        billerId: biller.id,
        nickname,
        accountHolderData: accountHolder,
        displayMasked: masked,
      },
      update: { nickname, lastUsedAt: new Date() },
    });
  }

  async deleteSavedBiller(citizenId: string, savedId: string) {
    const item = await this.prisma.bbpsSavedBiller.findFirst({
      where: { id: savedId, citizenId },
    });
    if (!item) throw new NotFoundException('Saved biller not found');
    await this.prisma.bbpsSavedBiller.delete({ where: { id: savedId } });
    return { id: savedId, deleted: true };
  }

  private async pollBillRequest(
    record: Prisma.BbpsBillRequestGetPayload<{ include: { biller: true } }>,
  ) {
    if (!record.razorpayBillRequestId) return this.formatBillRequest(record);

    const provider = await this.bbpsProvider.fetchBillRequest(
      record.razorpayBillRequestId,
    );
    const billDetails = provider.billDetails ?? {};
    const rawAmount = Number(
      (billDetails as Record<string, unknown>).amount_due ??
        (billDetails as Record<string, unknown>).bill_amount ??
        0,
    );
    const amount = normalizeBillAmountFromProvider(
      rawAmount,
      this.bbpsProvider.name,
    );

    const updated = await this.prisma.bbpsBillRequest.update({
      where: { id: record.id },
      data: {
        status: this.mapRequestStatus(provider.status),
        billDetails: billDetails as object,
        customerName: String(
          (billDetails as Record<string, unknown>).customer_name ??
            (provider.accountHolder as Record<string, unknown>)?.customer_name ??
            '',
        ) || null,
        billAmount: amount > 0 ? amount : null,
        dueDate: (billDetails as Record<string, unknown>).due_date
          ? new Date(String((billDetails as Record<string, unknown>).due_date))
          : null,
        billNumber: (billDetails as Record<string, unknown>).bill_number as
          | string
          | undefined,
        errorCode:
          provider.status === 'failed'
            ? mapProviderErrorToUserCode(provider.error?.description)
            : null,
        errorMessage:
          provider.status === 'failed'
            ? userMessageForCode(
                mapProviderErrorToUserCode(provider.error?.description),
              )
            : null,
        providerError: provider.error as object | undefined,
      },
      include: { biller: true },
    });

    return this.formatBillRequest(updated);
  }

  private async pollBillPayment(
    payment: Prisma.BbpsBillPaymentGetPayload<{
      include: { biller: true; billRequest: true };
    }>,
  ) {
    if (!payment.razorpayBillPaymentId) {
      return this.formatBillPayment(payment, true);
    }

    const provider = await this.bbpsProvider.fetchBillPayment(
      payment.razorpayBillPaymentId,
    );

    const updated = await this.prisma.bbpsBillPayment.update({
      where: { id: payment.id },
      data: {
        status: this.mapPaymentStatus(provider.status),
        references: (provider.references ?? {}) as object,
        paidAt: provider.status === 'success' ? new Date() : null,
        errorCode:
          provider.status === 'failed' ? 'PAYMENT_FAILED' : payment.errorCode,
        errorMessage:
          provider.status === 'failed'
            ? userMessageForCode('PAYMENT_FAILED')
            : payment.errorMessage,
        providerError: provider.error as object | undefined,
      },
      include: { biller: true, billRequest: true },
    });

    if (updated.status === BbpsBillPaymentStatus.SUCCESS) {
      await this.upsertSavedBiller(updated.citizenId, updated);
    }

    return this.formatBillPayment(updated, true);
  }

  private async upsertSavedBiller(
    citizenId: string,
    payment: Prisma.BbpsBillPaymentGetPayload<{ include: { billRequest: true } }>,
  ) {
    if (!payment.billRequest) return;
    const accountHolder = payment.billRequest
      .accountHolderData as Record<string, string>;
    const masked = maskAccountHolderData(accountHolder);
    await this.prisma.bbpsSavedBiller.upsert({
      where: {
        citizenId_billerId_displayMasked: {
          citizenId,
          billerId: payment.billerId,
          displayMasked: masked,
        },
      },
      create: {
        citizenId,
        billerId: payment.billerId,
        accountHolderData: accountHolder,
        displayMasked: masked,
        lastPaymentAmount: payment.totalAmount,
      },
      update: {
        lastUsedAt: new Date(),
        lastPaymentAmount: payment.totalAmount,
      },
    });
  }

  private async findVisibleBiller(id: string) {
    const biller = await this.prisma.bbpsBiller.findFirst({
      where: {
        OR: [{ id }, { razorpayBillerId: id }],
        isVisible: true,
        providerStatus: 'active',
        ...(this.bbpsProvider.name === 'mock'
          ? { razorpayBillerId: { startsWith: 'mock_' } }
          : {}),
      },
    });
    if (!biller) throw new NotFoundException('Biller not found');
    return biller;
  }

  private formatBillerSummary(biller: {
    id: string;
    name: string;
    aliasName: string | null;
    providerCategory: string;
    logoUrl: string | null;
    state: string | null;
    city: string | null;
    isFeatured: boolean;
  }) {
    return {
      id: biller.id,
      name: biller.name,
      aliasName: biller.aliasName,
      category: biller.providerCategory,
      logoUrl: biller.logoUrl,
      state: biller.state,
      city: biller.city,
      isFeatured: biller.isFeatured,
    };
  }

  private formatBillerDetail(biller: {
    id: string;
    name: string;
    aliasName: string | null;
    providerCategory: string;
    logoUrl: string | null;
    state: string | null;
    city: string | null;
    isFeatured?: boolean;
    accountHolderConfig: unknown;
    billRequestConfig: unknown;
  }) {
    return {
      ...this.formatBillerSummary({
        ...biller,
        isFeatured: biller.isFeatured ?? false,
      }),
      fields: normalizeAccountHolderFields(biller.accountHolderConfig),
      billRequestRequired:
        (biller.billRequestConfig as Record<string, unknown>)
          ?.bill_request_required ?? 'mandatory',
    };
  }

  private formatBillRequest(
    record: Prisma.BbpsBillRequestGetPayload<{ include: { biller: true } }>,
  ) {
    const details = (record.billDetails as Record<string, unknown>) ?? {};
    return {
      id: record.id,
      status: record.status.toLowerCase(),
      biller: this.formatBillerSummary(record.biller),
      accountHolderData: record.accountHolderData,
      customerName: record.customerName,
      billAmount: record.billAmount == null ? null : Number(record.billAmount),
      dueDate: record.dueDate?.toISOString() ?? null,
      billNumber: record.billNumber,
      billDetails: details,
      breakdown: details.breakdown ?? null,
      errorCode: record.errorCode,
      errorMessage: record.errorMessage,
      createdAt: record.createdAt.toISOString(),
    };
  }

  private formatBillPayment(
    payment: Prisma.BbpsBillPaymentGetPayload<{
      include: { biller: true; billRequest?: true };
    }>,
    detailed: boolean,
  ) {
    const base = {
      id: payment.id,
      status: payment.status.toLowerCase(),
      biller: this.formatBillerSummary(payment.biller),
      billAmount: Number(payment.billAmount),
      convenienceFee: Number(payment.convenienceFee),
      totalAmount: Number(payment.totalAmount),
      accountMasked: payment.accountHolderMasked,
      paidAt: payment.paidAt?.toISOString() ?? null,
      createdAt: payment.createdAt.toISOString(),
      errorCode: payment.errorCode,
      errorMessage: payment.errorMessage,
    };

    if (!detailed) return base;

    const refs = (payment.references as Record<string, string>) ?? {};
    return {
      ...base,
      billRequestId: payment.billRequestId,
      billDetails: payment.billDetails,
      transactionId: payment.razorpayPaymentId ?? payment.razorpayOrderId,
      bbpsReference: refs.bbps_reference ?? refs.bbpsReference,
      billerReference: refs.biller_reference ?? refs.billerReference,
      npciReference: refs.npci_reference ?? refs.npciReference,
    };
  }

  private mapRequestStatus(status: string): BbpsBillRequestStatus {
    if (status === 'success') return BbpsBillRequestStatus.SUCCESS;
    if (status === 'failed') return BbpsBillRequestStatus.FAILED;
    return BbpsBillRequestStatus.PROCESSING;
  }

  private mapPaymentStatus(status: string): BbpsBillPaymentStatus {
    if (status === 'success') return BbpsBillPaymentStatus.SUCCESS;
    if (status === 'failed') return BbpsBillPaymentStatus.FAILED;
    if (status === 'pending') return BbpsBillPaymentStatus.PENDING;
    return BbpsBillPaymentStatus.PROCESSING;
  }

  private getConvenienceFee(): number {
    const fee = Number(this.configService.get<number>('bbps.convenienceFeeFlat', 5));
    return Number.isFinite(fee) && fee >= 0 ? fee : 5;
  }

  private async pollUntilPaymentSettles(
    payment: Prisma.BbpsBillPaymentGetPayload<{
      include: { biller: true; billRequest: true };
    }>,
  ) {
    const maxAttempts = Math.min(
      Number(this.configService.get<number>('bbps.pollMaxAttempts', 8) ?? 8),
      8,
    );
    const intervalMs = Math.min(
      Number(this.configService.get<number>('bbps.pollIntervalMs', 400) ?? 400),
      800,
    );

    let current = payment;
    let formatted = await this.pollBillPayment(current);

    for (let attempt = 0; attempt < maxAttempts; attempt += 1) {
      if (formatted.status !== 'processing') {
        return formatted;
      }
      await new Promise((resolve) => setTimeout(resolve, intervalMs));
      const fresh = await this.prisma.bbpsBillPayment.findFirst({
        where: { id: payment.id },
        include: { biller: true, billRequest: true },
      });
      if (!fresh) return formatted;
      current = fresh;
      formatted = await this.pollBillPayment(current);
    }

    return formatted;
  }

  private toUserError(error: unknown, fallback = 'SERVICE_UNAVAILABLE') {
    const message =
      error instanceof BadRequestException
        ? (error.getResponse() as { message?: string })?.message ??
          error.message
        : error instanceof Error
          ? error.message
          : 'Unknown error';
    const code = mapProviderErrorToUserCode(message);
    throw new BadRequestException({
      message: userMessageForCode(code || fallback),
      code: code || fallback,
    });
  }

  private async logIntegration(params: {
    endpoint: string;
    requestId?: string;
    internalRefId?: string;
    success: boolean;
    durationMs?: number;
    errorReason?: string;
  }) {
    await this.prisma.bbpsIntegrationLog.create({
      data: {
        integration: this.bbpsProvider.name,
        endpoint: params.endpoint,
        requestId: params.requestId,
        internalRefId: params.internalRefId,
        success: params.success,
        durationMs: params.durationMs,
        errorReason: params.errorReason,
        httpStatus: params.success ? 200 : 400,
      },
    });
  }
}
