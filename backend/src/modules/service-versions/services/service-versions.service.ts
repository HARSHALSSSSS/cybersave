import { BadRequestException, Injectable } from '@nestjs/common';
import { ServiceVersionLifecycleStatus } from '@prisma/client';

import { INDIAN_STATES } from '@/common/constants/indian-states.constants';
import { applyOverviewLocale } from '@/common/utils/locale.util';
import { PrismaService } from '@/database/database.module';
import { UpdateServiceOverviewDto } from '../dto/update-service-overview.dto';
import { ServiceVersionsBundleService } from './service-versions-bundle.service';
import { ServicesCatalogMapper } from './services-catalog.mapper';

@Injectable()
export class ServiceVersionsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly bundleService: ServiceVersionsBundleService,
    private readonly catalogMapper: ServicesCatalogMapper,
  ) {}

  getById(id: string) {
    return this.bundleService.getFullBundle(id);
  }

  async updateOverview(id: string, dto: UpdateServiceOverviewDto) {
    await this.bundleService.ensureDraft(id);

    return this.prisma.serviceOverview.update({
      where: { serviceVersionId: id },
      data: {
        ...(dto.displayName !== undefined ? { displayName: dto.displayName } : {}),
        ...(dto.shortDescription !== undefined
          ? { shortDescription: dto.shortDescription }
          : {}),
        ...(dto.richDescription !== undefined
          ? { richDescription: dto.richDescription }
          : {}),
        ...(dto.instructions !== undefined
          ? { instructions: dto.instructions }
          : {}),
        ...(dto.termsAndConditions !== undefined
          ? { termsAndConditions: dto.termsAndConditions }
          : {}),
        ...(dto.processingTime !== undefined
          ? { processingTime: dto.processingTime }
          : {}),
        ...(dto.department !== undefined ? { department: dto.department } : {}),
        ...(dto.seoTags !== undefined ? { seoTags: dto.seoTags } : {}),
      },
    });
  }

  async preview(id: string, stateCode?: string) {
    const bundle = await this.bundleService.getFullBundle(id);
    return this.catalogMapper.toConfigurationResponse(bundle, stateCode);
  }
}

@Injectable()
export class ServicesCatalogService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly bundleService: ServiceVersionsBundleService,
    private readonly catalogMapper: ServicesCatalogMapper,
  ) {}

  async listPublishedCatalogue(locale = 'en') {
    const mainServices = await this.prisma.mainService.findMany({
      where: {
        status: 'ACTIVE',
        isVisible: true,
      },
      orderBy: [{ sortOrder: 'asc' }, { name: 'asc' }],
      include: {
        subServices: {
          where: { status: 'ACTIVE' },
          orderBy: [{ sortOrder: 'asc' }, { name: 'asc' }],
          include: {
            versions: {
              where: { lifecycleStatus: ServiceVersionLifecycleStatus.PUBLISHED },
              orderBy: { versionNumber: 'desc' },
              take: 1,
              include: {
                overview: true,
                pricingConfig: true,
                fulfillmentConfig: {
                  include: {
                    stateVariants: {
                      orderBy: { sortOrder: 'asc' },
                      select: { stateCode: true, stateName: true },
                    },
                  },
                },
              },
            },
          },
        },
      },
    });

    return mainServices
      .map((main) => ({
        id: main.id,
        name: main.name,
        slug: main.slug,
        description: main.description,
        iconUrl: main.iconUrl,
        subServices: main.subServices
          .filter((sub) => sub.versions.length > 0)
          .map((sub) => {
            const version = sub.versions[0];
            const overview = version.overview
              ? applyOverviewLocale(version.overview, locale)
              : null;
            return {
              id: sub.id,
              name: sub.name,
              slug: sub.slug,
              description: sub.description,
              publishedVersionId: version.id,
              displayName: overview?.displayName ?? sub.name,
              shortDescription: overview?.shortDescription,
              processingTime: overview?.processingTime,
              baseFee: version.pricingConfig?.baseFee?.toString() ?? '0',
              currency: version.pricingConfig?.currency ?? 'INR',
              requiresStateSelection:
                version.fulfillmentConfig?.requiresStateSelection ?? false,
              availableStates:
                version.fulfillmentConfig?.requiresStateSelection === true
                  ? (version.fulfillmentConfig.stateVariants ?? []).map((v) => ({
                      code: v.stateCode,
                      name: v.stateName,
                    }))
                  : [],
              assistedEnabled:
                version.fulfillmentConfig?.assistedEnabled ?? true,
              manualEnabled: version.fulfillmentConfig?.manualEnabled ?? false,
            };
          }),
      }))
      .filter((main) => main.subServices.length > 0);
  }

  async getPublishedConfiguration(
    subServiceId: string,
    stateCode?: string,
    locale = 'en',
  ) {
    const version = await this.prisma.serviceVersion.findFirst({
      where: {
        subServiceId,
        lifecycleStatus: ServiceVersionLifecycleStatus.PUBLISHED,
      },
      orderBy: { versionNumber: 'desc' },
    });

    if (!version) {
      return null;
    }

    const bundle = await this.bundleService.getFullBundle(version.id);
    const normalizedState = stateCode?.toUpperCase();

    if (bundle.fulfillmentConfig?.requiresStateSelection) {
      const variants = bundle.fulfillmentConfig.stateVariants ?? [];
      if (normalizedState) {
        const match = variants.some((v) => v.stateCode === normalizedState);
        if (!match) {
          throw new BadRequestException(
            'This service is not available in the selected state',
          );
        }
      }
    }

    return this.catalogMapper.toConfigurationResponse(
      bundle,
      normalizedState,
      locale,
    );
  }

  listIndianStates() {
    return INDIAN_STATES;
  }
}
