import { Injectable, Logger } from '@nestjs/common';
import { BbpsSyncStatus, Prisma } from '@prisma/client';

import { PrismaService } from '@/database/database.module';
import {
  BBPS_PROVIDER,
  type BbpsProvider,
} from '@/integrations/bbps/bbps-provider.interface';
import {
  categoryDisplayName,
  categoryIcon,
} from '@/integrations/bbps/bbps-field.util';
import { Inject } from '@nestjs/common';

@Injectable()
export class BillerSyncService {
  private readonly logger = new Logger(BillerSyncService.name);

  constructor(
    private readonly prisma: PrismaService,
    @Inject(BBPS_PROVIDER) private readonly bbpsProvider: BbpsProvider,
  ) {}

  async syncAll() {
    await this.syncCategories();
    await this.syncBillers();
  }

  async syncCategories() {
    const run = await this.prisma.bbpsSyncRun.create({
      data: { syncType: 'categories', status: BbpsSyncStatus.RUNNING },
    });

    try {
      const categories = await this.bbpsProvider.getCategories();
      let processed = 0;

      for (let i = 0; i < categories.length; i++) {
        const providerCategory = categories[i].toLowerCase();
        await this.prisma.bbpsCategory.upsert({
          where: { providerCategory },
          create: {
            providerCategory,
            displayName: categoryDisplayName(providerCategory),
            icon: categoryIcon(providerCategory),
            displayOrder: i,
            isFeatured: ['electricity', 'water', 'gas', 'broadband', 'dth'].includes(
              providerCategory,
            ),
            lastSyncedAt: new Date(),
          },
          update: {
            lastSyncedAt: new Date(),
          },
        });
        processed += 1;
      }

      await this.prisma.bbpsSyncRun.update({
        where: { id: run.id },
        data: {
          status: BbpsSyncStatus.COMPLETED,
          itemsProcessed: processed,
          completedAt: new Date(),
        },
      });

      return { processed, categories: categories.length };
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Sync failed';
      await this.prisma.bbpsSyncRun.update({
        where: { id: run.id },
        data: {
          status: BbpsSyncStatus.FAILED,
          errorMessage: message,
          completedAt: new Date(),
        },
      });
      throw error;
    }
  }

  async syncBillers(category?: string) {
    const run = await this.prisma.bbpsSyncRun.create({
      data: {
        syncType: category ? `billers:${category}` : 'billers',
        status: BbpsSyncStatus.RUNNING,
      },
    });

    try {
      const categories = category
        ? [{ providerCategory: category.toLowerCase() }]
        : await this.prisma.bbpsCategory.findMany({
            select: { providerCategory: true },
          });

      let processed = 0;
      const lastSync = await this.prisma.bbpsBiller.findFirst({
        orderBy: { gatewayUpdatedAt: 'desc' },
        select: { gatewayUpdatedAt: true },
      });
      const updatedSince = lastSync?.gatewayUpdatedAt
        ? Math.floor(lastSync.gatewayUpdatedAt.getTime() / 1000)
        : undefined;

      for (const cat of categories) {
        let skip = 0;
        const pageSize = 100;
        let hasMore = true;

        while (hasMore) {
          const dbCategory = await this.prisma.bbpsCategory.findUnique({
            where: { providerCategory: cat.providerCategory },
          });
          if (!dbCategory) continue;

          const { items } = await this.bbpsProvider.getBillers({
            category: cat.providerCategory,
            updatedSince,
            skip,
            count: pageSize,
          });

          if (items.length === 0) {
            hasMore = false;
            break;
          }

          for (const item of items) {
            await this.prisma.bbpsBiller.upsert({
              where: { razorpayBillerId: item.id },
              create: {
                razorpayBillerId: item.id,
                gatewayBillerId: item.gatewayBillerId,
                name: item.name,
                aliasName: item.aliasName,
                categoryId: dbCategory.id,
                providerCategory: item.category,
                providerStatus: item.status,
                country: item.country,
                state: item.state,
                city: item.city,
                logoUrl: item.logoUrl,
                supportedChannels: item.supportedChannels ?? [],
                accountHolderConfig: (item.accountHolderConfig ?? {}) as Prisma.InputJsonValue,
                billRequestConfig: (item.billRequestConfig ?? {}) as Prisma.InputJsonValue,
                paymentConfig: (item.paymentConfig ?? {}) as Prisma.InputJsonValue,
                feeConfig: (item.feeConfig ?? {}) as Prisma.InputJsonValue,
                rawConfiguration: (item.rawConfiguration ?? item) as Prisma.InputJsonValue,
                gatewayUpdatedAt: item.gatewayUpdatedAt
                  ? new Date(item.gatewayUpdatedAt * 1000)
                  : null,
                lastSyncedAt: new Date(),
              },
              update: {
                gatewayBillerId: item.gatewayBillerId,
                name: item.name,
                aliasName: item.aliasName,
                providerCategory: item.category,
                providerStatus: item.status,
                country: item.country,
                state: item.state,
                city: item.city,
                logoUrl: item.logoUrl,
                supportedChannels: item.supportedChannels ?? [],
                accountHolderConfig: (item.accountHolderConfig ?? {}) as Prisma.InputJsonValue,
                billRequestConfig: (item.billRequestConfig ?? {}) as Prisma.InputJsonValue,
                paymentConfig: (item.paymentConfig ?? {}) as Prisma.InputJsonValue,
                feeConfig: (item.feeConfig ?? {}) as Prisma.InputJsonValue,
                rawConfiguration: (item.rawConfiguration ?? item) as Prisma.InputJsonValue,
                gatewayUpdatedAt: item.gatewayUpdatedAt
                  ? new Date(item.gatewayUpdatedAt * 1000)
                  : null,
                lastSyncedAt: new Date(),
              },
            });
            processed += 1;
          }

          skip += pageSize;
          if (items.length < pageSize) hasMore = false;
        }
      }

      await this.prisma.bbpsSyncRun.update({
        where: { id: run.id },
        data: {
          status: BbpsSyncStatus.COMPLETED,
          itemsProcessed: processed,
          completedAt: new Date(),
        },
      });

      this.logger.log(`Synced ${processed} billers`);
      return { processed };
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Sync failed';
      await this.prisma.bbpsSyncRun.update({
        where: { id: run.id },
        data: {
          status: BbpsSyncStatus.FAILED,
          errorMessage: message,
          completedAt: new Date(),
        },
      });
      throw error;
    }
  }

  /** Seed catalogue on first run; re-sync from Razorpay when switching off mock billers. */
  async ensureCatalogueSeeded(providerName: string) {
    const count = await this.prisma.bbpsCategory.count();
    const mockCount = await this.prisma.bbpsBiller.count({
      where: { razorpayBillerId: { startsWith: 'mock_' } },
    });

    if (providerName === 'mock') {
      await this.prisma.bbpsBiller.updateMany({
        where: { razorpayBillerId: { startsWith: 'mock_' } },
        data: { isVisible: true },
      });
      const hidden = await this.prisma.bbpsBiller.updateMany({
        where: {
          NOT: { razorpayBillerId: { startsWith: 'mock_' } },
        },
        data: { isVisible: false },
      });
      if (hidden.count > 0) {
        this.logger.log(`Hidden ${hidden.count} non-mock billers (mock mode)`);
      }
      if (count === 0) {
        this.logger.log('Seeding BBPS catalogue from mock provider...');
        await this.syncAll();
      }
      return;
    }

    if (providerName === 'razorpay') {
      if (count === 0 || mockCount > 0) {
        try {
          this.logger.log('Syncing BBPS catalogue from Razorpay...');
          await this.syncAll();
          await this.prisma.bbpsBiller.updateMany({
            where: { razorpayBillerId: { startsWith: 'mock_' } },
            data: { isVisible: false },
          });
        } catch (error) {
          const message = error instanceof Error ? error.message : 'Razorpay sync failed';
          this.logger.warn(
            `BBPS Razorpay catalogue sync failed: ${message}. Use admin sync or check API keys.`,
          );
        }
      }
      return;
    }

    if (count === 0) {
      this.logger.log('Seeding BBPS catalogue from provider...');
      await this.syncAll();
    }
  }
}
