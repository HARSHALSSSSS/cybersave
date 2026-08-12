import { Injectable, NotFoundException } from '@nestjs/common';

import { PrismaService } from '@/database/database.module';
import { uniqueSlug } from '@/common/utils/slug.util';
import { ServiceVersionsBundleService } from '@/modules/service-versions/services/service-versions-bundle.service';
import { CreateSubServiceDto } from '../dto/create-sub-service.dto';
import { ReorderSubServicesDto } from '../dto/reorder-sub-services.dto';
import { UpdateSubServiceDto } from '../dto/update-sub-service.dto';

@Injectable()
export class SubServicesService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly bundleService: ServiceVersionsBundleService,
  ) {}

  async create(mainServiceId: string, dto: CreateSubServiceDto) {
    const mainService = await this.prisma.mainService.findUnique({
      where: { id: mainServiceId },
    });

    if (!mainService) {
      throw new NotFoundException('Main service not found');
    }

    const slug = await uniqueSlug(dto.name, async (candidate) => {
      const existing = await this.prisma.subService.findUnique({
        where: {
          mainServiceId_slug: { mainServiceId, slug: candidate },
        },
      });
      return Boolean(existing);
    });

    const maxOrder = await this.prisma.subService.aggregate({
      where: { mainServiceId },
      _max: { sortOrder: true },
    });

    const subService = await this.prisma.subService.create({
      data: {
        mainServiceId,
        name: dto.name,
        slug,
        description: dto.description,
        sortOrder: (maxOrder._max.sortOrder ?? 0) + 1,
      },
    });

    const draftVersion = await this.bundleService.createDraftVersion(
      subService.id,
      dto.name,
    );

    return {
      subService,
      draftVersionId: draftVersion.id,
      draftVersion,
    };
  }

  async update(id: string, dto: UpdateSubServiceDto) {
    await this.ensureExists(id);

    return this.prisma.subService.update({
      where: { id },
      data: {
        ...(dto.name !== undefined ? { name: dto.name } : {}),
        ...(dto.description !== undefined
          ? { description: dto.description }
          : {}),
        ...(dto.status !== undefined ? { status: dto.status } : {}),
      },
    });
  }

  async reorder(mainServiceId: string, dto: ReorderSubServicesDto) {
    await this.prisma.$transaction(
      dto.orderedIds.map((id, index) =>
        this.prisma.subService.update({
          where: { id, mainServiceId },
          data: { sortOrder: index },
        }),
      ),
    );

    return { message: 'Sub services reordered' };
  }

  async archive(id: string) {
    await this.ensureExists(id);

    return this.prisma.subService.update({
      where: { id },
      data: { status: 'ARCHIVED' },
    });
  }

  private async ensureExists(id: string) {
    const item = await this.prisma.subService.findUnique({ where: { id } });
    if (!item) {
      throw new NotFoundException('Sub service not found');
    }
    return item;
  }
}
