import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { ServiceVersionLifecycleStatus } from '@prisma/client';

import { PrismaService } from '@/database/database.module';
import { applyBannerLocale } from '@/common/utils/locale.util';
import {
  CreateHomeBannerDto,
  ReorderHomeBannersDto,
  UpdateHomeBannerDto,
} from '../dto/home-banner.dto';

@Injectable()
export class HomeBannersService {
  constructor(private readonly prisma: PrismaService) {}

  async listForMobile(placement = 'home', locale = 'en') {
    const now = new Date();
    const banners = await this.prisma.homeBanner.findMany({
      where: {
        placement,
        isActive: true,
        AND: [
          { OR: [{ startsAt: null }, { startsAt: { lte: now } }] },
          { OR: [{ endsAt: null }, { endsAt: { gte: now } }] },
        ],
      },
      orderBy: [{ displayOrder: 'asc' }, { createdAt: 'asc' }],
      include: {
        mainService: { select: { id: true, name: true, slug: true } },
        subService: {
          select: {
            id: true,
            name: true,
            slug: true,
            versions: {
              where: { lifecycleStatus: ServiceVersionLifecycleStatus.PUBLISHED },
              take: 1,
              select: { id: true },
            },
          },
        },
      },
    });

    return banners
      .filter((banner) => banner.subService.versions.length > 0)
      .map((banner) =>
        applyBannerLocale(this.formatBanner(banner), locale),
      );
  }

  async listForAdmin(placement?: string) {
    const banners = await this.prisma.homeBanner.findMany({
      where: placement ? { placement } : undefined,
      orderBy: [{ placement: 'asc' }, { displayOrder: 'asc' }, { createdAt: 'asc' }],
      include: {
        mainService: { select: { id: true, name: true, slug: true } },
        subService: {
          select: {
            id: true,
            name: true,
            slug: true,
            versions: {
              where: { lifecycleStatus: ServiceVersionLifecycleStatus.PUBLISHED },
              take: 1,
              select: { id: true, lifecycleStatus: true },
            },
          },
        },
      },
    });

    return banners.map((banner) => ({
      ...this.formatBanner(banner),
      isPublished: banner.subService.versions.length > 0,
      servicePath: `${banner.mainService.name} → ${banner.subService.name}`,
    }));
  }

  async create(dto: CreateHomeBannerDto) {
    await this.validateServiceLink(dto.mainServiceId, dto.subServiceId);

    const banner = await this.prisma.homeBanner.create({
      data: {
        tag: dto.tag,
        title: dto.title,
        description: dto.description,
        ctaLabel: dto.ctaLabel ?? 'Learn More',
        imageUrl: dto.imageUrl,
        gradientStart: dto.gradientStart ?? '#1E40AF',
        gradientMiddle: dto.gradientMiddle,
        gradientEnd: dto.gradientEnd ?? '#3B82F6',
        mainServiceId: dto.mainServiceId,
        subServiceId: dto.subServiceId,
        placement: dto.placement ?? 'home',
        displayOrder: dto.displayOrder ?? 0,
        isActive: dto.isActive ?? true,
        startsAt: dto.startsAt ? new Date(dto.startsAt) : null,
        endsAt: dto.endsAt ? new Date(dto.endsAt) : null,
      },
      include: this.includeRelations(),
    });

    return this.formatBanner(banner);
  }

  async update(id: string, dto: UpdateHomeBannerDto) {
    const existing = await this.prisma.homeBanner.findUnique({ where: { id } });
    if (!existing) {
      throw new NotFoundException('Banner not found');
    }

    const mainServiceId = dto.mainServiceId ?? existing.mainServiceId;
    const subServiceId = dto.subServiceId ?? existing.subServiceId;
    if (dto.mainServiceId || dto.subServiceId) {
      await this.validateServiceLink(mainServiceId, subServiceId);
    }

    const banner = await this.prisma.homeBanner.update({
      where: { id },
      data: {
        ...(dto.tag !== undefined ? { tag: dto.tag } : {}),
        ...(dto.title !== undefined ? { title: dto.title } : {}),
        ...(dto.description !== undefined ? { description: dto.description } : {}),
        ...(dto.ctaLabel !== undefined ? { ctaLabel: dto.ctaLabel } : {}),
        ...(dto.imageUrl !== undefined ? { imageUrl: dto.imageUrl } : {}),
        ...(dto.gradientStart !== undefined ? { gradientStart: dto.gradientStart } : {}),
        ...(dto.gradientMiddle !== undefined ? { gradientMiddle: dto.gradientMiddle } : {}),
        ...(dto.gradientEnd !== undefined ? { gradientEnd: dto.gradientEnd } : {}),
        ...(dto.mainServiceId !== undefined ? { mainServiceId: dto.mainServiceId } : {}),
        ...(dto.subServiceId !== undefined ? { subServiceId: dto.subServiceId } : {}),
        ...(dto.placement !== undefined ? { placement: dto.placement } : {}),
        ...(dto.displayOrder !== undefined ? { displayOrder: dto.displayOrder } : {}),
        ...(dto.isActive !== undefined ? { isActive: dto.isActive } : {}),
        ...(dto.startsAt !== undefined
          ? { startsAt: dto.startsAt ? new Date(dto.startsAt) : null }
          : {}),
        ...(dto.endsAt !== undefined
          ? { endsAt: dto.endsAt ? new Date(dto.endsAt) : null }
          : {}),
      },
      include: this.includeRelations(),
    });

    return this.formatBanner(banner);
  }

  async delete(id: string) {
    await this.prisma.homeBanner.delete({ where: { id } });
    return { deleted: true };
  }

  async reorder(dto: ReorderHomeBannersDto) {
    await this.prisma.$transaction(
      dto.orderedIds.map((id, index) =>
        this.prisma.homeBanner.update({
          where: { id },
          data: { displayOrder: index + 1 },
        }),
      ),
    );
    return this.listForAdmin();
  }

  private async validateServiceLink(mainServiceId: string, subServiceId: string) {
    const subService = await this.prisma.subService.findFirst({
      where: { id: subServiceId, mainServiceId },
    });
    if (!subService) {
      throw new BadRequestException(
        'Sub-service must belong to the selected main service category',
      );
    }
  }

  private includeRelations() {
    return {
      mainService: { select: { id: true, name: true, slug: true } },
      subService: { select: { id: true, name: true, slug: true } },
    } as const;
  }

  private formatBanner(banner: {
    id: string;
    tag: string | null;
    title: string;
    description: string | null;
    ctaLabel: string;
    imageUrl: string | null;
    gradientStart: string;
    gradientMiddle: string | null;
    gradientEnd: string;
    mainServiceId: string;
    subServiceId: string;
    placement: string;
    displayOrder: number;
    isActive: boolean;
    startsAt: Date | null;
    endsAt: Date | null;
    translations?: unknown;
    mainService: { id: string; name: string; slug: string };
    subService: { id: string; name: string; slug: string };
  }) {
    return {
      id: banner.id,
      tag: banner.tag,
      title: banner.title,
      description: banner.description,
      ctaLabel: banner.ctaLabel,
      imageUrl: banner.imageUrl,
      gradientStart: banner.gradientStart,
      gradientMiddle: banner.gradientMiddle,
      gradientEnd: banner.gradientEnd,
      mainServiceId: banner.mainServiceId,
      subServiceId: banner.subServiceId,
      mainServiceName: banner.mainService.name,
      subServiceName: banner.subService.name,
      mainServiceSlug: banner.mainService.slug,
      subServiceSlug: banner.subService.slug,
      placement: banner.placement,
      displayOrder: banner.displayOrder,
      isActive: banner.isActive,
      startsAt: banner.startsAt?.toISOString() ?? null,
      endsAt: banner.endsAt?.toISOString() ?? null,
    };
  }
}
