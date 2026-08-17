import {
  BadRequestException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';

import { PrismaService } from '@/database/database.module';
import { slugify, uniqueSlug } from '@/common/utils/slug.util';
import { DEFAULT_GOVERNMENT_SCHEMES } from '../data/default-schemes';
import {
  CreateGovernmentSchemeDto,
  UpdateGovernmentSchemeDto,
} from '../dto/government-scheme.dto';

const DEFAULT_CATEGORIES = [
  'Housing',
  'Agriculture',
  'Health',
  'Education',
  'Social Welfare',
  'Women & Child',
  'Financial Inclusion',
  'Employment',
  'Other',
] as const;

@Injectable()
export class GovernmentSchemesService {
  private readonly logger = new Logger(GovernmentSchemesService.name);
  private seedingDefaults: Promise<void> | null = null;

  constructor(private readonly prisma: PrismaService) {}

  async listPublic(category?: string) {
    await this.ensureDefaultSchemes();
    const schemes = await this.prisma.governmentScheme.findMany({
      where: {
        isActive: true,
        ...(category && category !== 'All' ? { category } : {}),
      },
      orderBy: [{ displayOrder: 'asc' }, { createdAt: 'asc' }],
    });
    return schemes.map((scheme) => this.format(scheme));
  }

  async getPublic(idOrSlug: string) {
    await this.ensureDefaultSchemes();
    const scheme = await this.findByIdOrSlug(idOrSlug);
    if (!scheme || !scheme.isActive) {
      throw new NotFoundException('Scheme not found');
    }
    return this.format(scheme);
  }

  async listAdmin() {
    await this.ensureDefaultSchemes();
    const schemes = await this.prisma.governmentScheme.findMany({
      orderBy: [{ displayOrder: 'asc' }, { createdAt: 'desc' }],
    });
    return schemes.map((scheme) => this.format(scheme));
  }

  async create(dto: CreateGovernmentSchemeDto) {
    const officialPortalUrl = this.assertHttpUrl(dto.officialPortalUrl);
    const slug = await uniqueSlug(dto.name, (value) =>
      this.prisma.governmentScheme
        .findUnique({ where: { slug: value } })
        .then((row) => Boolean(row)),
    );

    const scheme = await this.prisma.governmentScheme.create({
      data: {
        name: dto.name.trim(),
        slug,
        ministry: dto.ministry?.trim() || null,
        category: dto.category.trim(),
        description: dto.description.trim(),
        whoCanApply: dto.whoCanApply.trim(),
        eligibility: dto.eligibility.trim(),
        documentsRequired: this.normalizeDocuments(dto.documentsRequired),
        officialPortalUrl,
        officialPortalLabel: dto.officialPortalLabel?.trim() || 'Official Portal',
        displayOrder: dto.displayOrder ?? 0,
        isActive: dto.isActive ?? true,
      },
    });

    return this.format(scheme);
  }

  async update(id: string, dto: UpdateGovernmentSchemeDto) {
    const existing = await this.prisma.governmentScheme.findUnique({ where: { id } });
    if (!existing) {
      throw new NotFoundException('Scheme not found');
    }

    let slug = existing.slug;
    if (dto.name && slugify(dto.name) !== slugify(existing.name)) {
      slug = await uniqueSlug(dto.name, async (value) => {
        const row = await this.prisma.governmentScheme.findUnique({ where: { slug: value } });
        return Boolean(row) && row?.id !== id;
      });
    }

    const scheme = await this.prisma.governmentScheme.update({
      where: { id },
      data: {
        ...(dto.name !== undefined ? { name: dto.name.trim(), slug } : {}),
        ...(dto.ministry !== undefined ? { ministry: dto.ministry.trim() || null } : {}),
        ...(dto.category !== undefined ? { category: dto.category.trim() } : {}),
        ...(dto.description !== undefined ? { description: dto.description.trim() } : {}),
        ...(dto.whoCanApply !== undefined ? { whoCanApply: dto.whoCanApply.trim() } : {}),
        ...(dto.eligibility !== undefined ? { eligibility: dto.eligibility.trim() } : {}),
        ...(dto.documentsRequired !== undefined
          ? { documentsRequired: this.normalizeDocuments(dto.documentsRequired) }
          : {}),
        ...(dto.officialPortalUrl !== undefined
          ? { officialPortalUrl: this.assertHttpUrl(dto.officialPortalUrl) }
          : {}),
        ...(dto.officialPortalLabel !== undefined
          ? { officialPortalLabel: dto.officialPortalLabel.trim() || 'Official Portal' }
          : {}),
        ...(dto.displayOrder !== undefined ? { displayOrder: dto.displayOrder } : {}),
        ...(dto.isActive !== undefined ? { isActive: dto.isActive } : {}),
      },
    });

    return this.format(scheme);
  }

  async delete(id: string) {
    const existing = await this.prisma.governmentScheme.findUnique({ where: { id } });
    if (!existing) {
      throw new NotFoundException('Scheme not found');
    }
    await this.prisma.governmentScheme.delete({ where: { id } });
    return { deleted: true };
  }

  categories() {
    return [...DEFAULT_CATEGORIES];
  }

  private async ensureDefaultSchemes() {
    if (this.seedingDefaults) {
      await this.seedingDefaults;
      return;
    }

    this.seedingDefaults = (async () => {
      try {
        const count = await this.prisma.governmentScheme.count();
        if (count > 0) return;
        this.logger.log('No government schemes found — seeding defaults');
        for (const scheme of DEFAULT_GOVERNMENT_SCHEMES) {
          await this.prisma.governmentScheme.upsert({
            where: { slug: scheme.slug },
            update: {},
            create: scheme,
          });
        }
      } catch (error) {
        this.logger.error(
          'Could not seed government schemes',
          error instanceof Error ? error.stack : error,
        );
      } finally {
        this.seedingDefaults = null;
      }
    })();

    await this.seedingDefaults;
  }

  private async findByIdOrSlug(idOrSlug: string) {
    return this.prisma.governmentScheme.findFirst({
      where: { OR: [{ id: idOrSlug }, { slug: idOrSlug }] },
    });
  }

  private assertHttpUrl(value: string): string {
    let parsed: URL;
    try {
      parsed = new URL(value.trim());
    } catch {
      throw new BadRequestException('Enter a valid official portal URL (https://...)');
    }
    if (parsed.protocol !== 'http:' && parsed.protocol !== 'https:') {
      throw new BadRequestException('Official portal URL must start with http:// or https://');
    }
    return parsed.toString();
  }

  private normalizeDocuments(value?: string[]): string[] {
    return [...new Set((value ?? []).map((item) => item.trim()).filter(Boolean))];
  }

  private format(scheme: {
    id: string;
    name: string;
    slug: string;
    ministry: string | null;
    category: string;
    description: string;
    whoCanApply: string;
    eligibility: string;
    documentsRequired: string[];
    officialPortalUrl: string;
    officialPortalLabel: string;
    displayOrder: number;
    isActive: boolean;
    createdAt: Date;
    updatedAt: Date;
  }) {
    return {
      id: scheme.id,
      name: scheme.name,
      slug: scheme.slug,
      ministry: scheme.ministry,
      category: scheme.category,
      description: scheme.description,
      whoCanApply: scheme.whoCanApply,
      eligibility: scheme.eligibility,
      documentsRequired: scheme.documentsRequired,
      officialPortalUrl: scheme.officialPortalUrl,
      officialPortalLabel: scheme.officialPortalLabel,
      displayOrder: scheme.displayOrder,
      isActive: scheme.isActive,
      createdAt: scheme.createdAt.toISOString(),
      updatedAt: scheme.updatedAt.toISOString(),
    };
  }
}
