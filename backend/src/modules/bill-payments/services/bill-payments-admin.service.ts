import { Injectable, NotFoundException } from '@nestjs/common';
import { BbpsBillPaymentStatus, Prisma } from '@prisma/client';

import { PrismaService } from '@/database/database.module';
import { Inject } from '@nestjs/common';
import {
  BBPS_PROVIDER,
  type BbpsProvider,
} from '@/integrations/bbps/bbps-provider.interface';
import { BillerSyncService } from './biller-sync.service';

@Injectable()
export class BillPaymentsAdminService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly syncService: BillerSyncService,
    @Inject(BBPS_PROVIDER) private readonly bbpsProvider: BbpsProvider,
  ) {}

  async getDashboard() {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const [total, todayCount, successful, pending, failed, amountAgg] =
      await Promise.all([
        this.prisma.bbpsBillPayment.count(),
        this.prisma.bbpsBillPayment.count({
          where: { createdAt: { gte: today } },
        }),
        this.prisma.bbpsBillPayment.count({
          where: { status: BbpsBillPaymentStatus.SUCCESS },
        }),
        this.prisma.bbpsBillPayment.count({
          where: {
            status: {
              in: [
                BbpsBillPaymentStatus.PENDING,
                BbpsBillPaymentStatus.PROCESSING,
              ],
            },
          },
        }),
        this.prisma.bbpsBillPayment.count({
          where: { status: BbpsBillPaymentStatus.FAILED },
        }),
        this.prisma.bbpsBillPayment.aggregate({
          where: { status: BbpsBillPaymentStatus.SUCCESS },
          _sum: { totalAmount: true },
        }),
      ]);

    return {
      totalTransactions: total,
      todayTransactions: todayCount,
      successful,
      pending,
      failed,
      totalAmount: Number(amountAgg._sum.totalAmount ?? 0),
    };
  }

  async listCategories() {
    return this.prisma.bbpsCategory.findMany({
      orderBy: [{ displayOrder: 'asc' }],
      include: { _count: { select: { billers: true } } },
    });
  }

  async updateCategory(
    id: string,
    data: {
      displayName?: string;
      icon?: string;
      description?: string;
      appStatus?: string;
      displayOrder?: number;
      isFeatured?: boolean;
    },
  ) {
    return this.prisma.bbpsCategory.update({ where: { id }, data });
  }

  async listBillers(params: {
    category?: string;
    search?: string;
    page?: number;
    limit?: number;
  }) {
    const page = params.page ?? 1;
    const limit = Math.min(params.limit ?? 50, 100);
    const skip = (page - 1) * limit;

    const where: Prisma.BbpsBillerWhereInput = {
      ...(params.category
        ? { providerCategory: params.category.toLowerCase() }
        : {}),
      ...(params.search?.trim()
        ? {
            OR: [
              { name: { contains: params.search, mode: 'insensitive' } },
              { aliasName: { contains: params.search, mode: 'insensitive' } },
            ],
          }
        : {}),
    };

    const [data, total] = await Promise.all([
      this.prisma.bbpsBiller.findMany({
        where,
        include: { category: true },
        orderBy: { name: 'asc' },
        skip,
        take: limit,
      }),
      this.prisma.bbpsBiller.count({ where }),
    ]);

    return { data, meta: { total, page, limit, totalPages: Math.ceil(total / limit) } };
  }

  async updateBiller(
    id: string,
    data: {
      isVisible?: boolean;
      isFeatured?: boolean;
      displayOrder?: number;
      internalAlias?: string;
      internalDescription?: string;
    },
  ) {
    return this.prisma.bbpsBiller.update({ where: { id }, data });
  }

  async getBiller(id: string) {
    const biller = await this.prisma.bbpsBiller.findUnique({
      where: { id },
      include: { category: true },
    });
    if (!biller) throw new NotFoundException('Biller not found');
    return biller;
  }

  async listTransactions(params: {
    status?: string;
    category?: string;
    billerId?: string;
    search?: string;
    page?: number;
    limit?: number;
  }) {
    const page = params.page ?? 1;
    const limit = Math.min(params.limit ?? 50, 100);
    const skip = (page - 1) * limit;

    const where: Prisma.BbpsBillPaymentWhereInput = {
      ...(params.status
        ? { status: params.status.toUpperCase() as BbpsBillPaymentStatus }
        : {}),
      ...(params.billerId ? { billerId: params.billerId } : {}),
      ...(params.category
        ? { biller: { providerCategory: params.category.toLowerCase() } }
        : {}),
      ...(params.search?.trim()
        ? {
            OR: [
              { id: { contains: params.search, mode: 'insensitive' } },
              { razorpayPaymentId: { contains: params.search, mode: 'insensitive' } },
              { accountHolderMasked: { contains: params.search, mode: 'insensitive' } },
            ],
          }
        : {}),
    };

    const [data, total] = await Promise.all([
      this.prisma.bbpsBillPayment.findMany({
        where,
        include: {
          biller: true,
          citizen: { select: { id: true, phone: true, firstName: true, lastName: true } },
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      this.prisma.bbpsBillPayment.count({ where }),
    ]);

    return { data, meta: { total, page, limit, totalPages: Math.ceil(total / limit) } };
  }

  async getTransaction(id: string) {
    const tx = await this.prisma.bbpsBillPayment.findUnique({
      where: { id },
      include: {
        biller: true,
        billRequest: true,
        citizen: { select: { id: true, phone: true, firstName: true, lastName: true, email: true } },
      },
    });
    if (!tx) throw new NotFoundException('Transaction not found');
    return tx;
  }

  async getIntegrationStatus() {
    const lastSync = await this.prisma.bbpsSyncRun.findFirst({
      orderBy: { startedAt: 'desc' },
    });
    const lastLog = await this.prisma.bbpsIntegrationLog.findFirst({
      where: { success: true },
      orderBy: { createdAt: 'desc' },
    });
    const categoryCount = await this.prisma.bbpsCategory.count();
    const billerCount = await this.prisma.bbpsBiller.count();

    return {
      provider: 'Razorpay',
      service: 'BBPS Bill Payments',
      activeProvider: this.bbpsProvider.name,
      environment: process.env.NODE_ENV === 'production' ? 'production' : 'test',
      connection: 'connected',
      lastSuccessfulApiCall: lastLog?.createdAt ?? null,
      lastBillerSync: lastSync?.completedAt ?? lastSync?.startedAt ?? null,
      lastSyncStatus: lastSync?.status ?? null,
      apiHealth: lastLog ? 'healthy' : 'unknown',
      catalogue: { categories: categoryCount, billers: billerCount },
    };
  }

  async listIntegrationLogs(page = 1, limit = 50) {
    const skip = (page - 1) * limit;
    const [data, total] = await Promise.all([
      this.prisma.bbpsIntegrationLog.findMany({
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      this.prisma.bbpsIntegrationLog.count(),
    ]);
    return { data, meta: { total, page, limit } };
  }

  triggerSync() {
    return this.syncService.syncAll();
  }
}
