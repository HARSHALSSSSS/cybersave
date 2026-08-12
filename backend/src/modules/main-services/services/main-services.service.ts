import { Injectable, NotFoundException } from '@nestjs/common';
import { Prisma } from '@prisma/client';

import { PrismaService } from '@/database/database.module';
import {
  paginate,
  PaginationQueryDto,
  paginationMeta,
} from '@/common/dto/pagination.dto';
import { uniqueSlug } from '@/common/utils/slug.util';
import { CreateMainServiceDto } from '../dto/create-main-service.dto';
import { ReorderMainServicesDto } from '../dto/reorder-main-services.dto';
import { UpdateMainServiceDto } from '../dto/update-main-service.dto';

@Injectable()
export class MainServicesService {
  constructor(private readonly prisma: PrismaService) {}

  async list(query: PaginationQueryDto) {
    const { skip, take, page, limit } = paginate(query.page, query.limit);

    const where: Prisma.MainServiceWhereInput = {
      status: { not: 'ARCHIVED' },
    };

    const [items, total] = await Promise.all([
      this.prisma.mainService.findMany({
        where,
        skip,
        take,
        orderBy: [{ sortOrder: 'asc' }, { createdAt: 'desc' }],
        include: {
          _count: { select: { subServices: true } },
        },
      }),
      this.prisma.mainService.count({ where }),
    ]);

    return {
      data: items.map((item) => ({
        id: item.id,
        name: item.name,
        slug: item.slug,
        description: item.description,
        iconUrl: item.iconUrl,
        sortOrder: item.sortOrder,
        status: item.status,
        isVisible: item.isVisible,
        subServiceCount: item._count.subServices,
        createdAt: item.createdAt,
        updatedAt: item.updatedAt,
      })),
      meta: paginationMeta(total, page, limit),
    };
  }

  async getById(id: string) {
    const mainService = await this.prisma.mainService.findUnique({
      where: { id },
      include: {
        subServices: {
          where: { status: { not: 'ARCHIVED' } },
          orderBy: [{ sortOrder: 'asc' }, { createdAt: 'desc' }],
          include: {
            versions: {
              orderBy: { versionNumber: 'desc' },
              take: 1,
              select: {
                id: true,
                versionNumber: true,
                lifecycleStatus: true,
                publishedAt: true,
              },
            },
          },
        },
      },
    });

    if (!mainService) {
      return null;
    }

    return {
      ...mainService,
      subServices: mainService.subServices.map((sub) => ({
        id: sub.id,
        name: sub.name,
        slug: sub.slug,
        description: sub.description,
        sortOrder: sub.sortOrder,
        status: sub.status,
        latestVersion: sub.versions[0] ?? null,
        createdAt: sub.createdAt,
        updatedAt: sub.updatedAt,
      })),
    };
  }

  async create(dto: CreateMainServiceDto) {
    const slug = await uniqueSlug(dto.name, async (candidate) => {
      const existing = await this.prisma.mainService.findUnique({
        where: { slug: candidate },
      });
      return Boolean(existing);
    });

    const maxOrder = await this.prisma.mainService.aggregate({
      _max: { sortOrder: true },
    });

    return this.prisma.mainService.create({
      data: {
        name: dto.name,
        slug,
        description: dto.description,
        iconUrl: dto.iconUrl,
        isVisible: dto.isVisible ?? true,
        status: dto.isVisible === false ? 'INACTIVE' : 'ACTIVE',
        sortOrder: (maxOrder._max.sortOrder ?? 0) + 1,
      },
    });
  }

  async update(id: string, dto: UpdateMainServiceDto) {
    await this.ensureExists(id);

    return this.prisma.mainService.update({
      where: { id },
      data: {
        ...(dto.name !== undefined ? { name: dto.name } : {}),
        ...(dto.description !== undefined
          ? { description: dto.description }
          : {}),
        ...(dto.iconUrl !== undefined ? { iconUrl: dto.iconUrl } : {}),
        ...(dto.isVisible !== undefined ? { isVisible: dto.isVisible } : {}),
        ...(dto.status !== undefined ? { status: dto.status } : {}),
      },
    });
  }

  async reorder(dto: ReorderMainServicesDto) {
    await this.prisma.$transaction(
      dto.orderedIds.map((id, index) =>
        this.prisma.mainService.update({
          where: { id },
          data: { sortOrder: index },
        }),
      ),
    );

    return { message: 'Main services reordered' };
  }

  async archive(id: string) {
    await this.ensureExists(id);

    return this.prisma.mainService.update({
      where: { id },
      data: { status: 'ARCHIVED', isVisible: false },
    });
  }

  private async ensureExists(id: string) {
    const exists = await this.prisma.mainService.findUnique({ where: { id } });
    if (!exists) {
      throw new NotFoundException('Main service not found');
    }
    return exists;
  }
}
