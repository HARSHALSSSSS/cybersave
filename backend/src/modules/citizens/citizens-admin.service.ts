import { Injectable } from '@nestjs/common';

import { paginate, PaginationQueryDto, paginationMeta } from '@/common/dto/pagination.dto';
import { PrismaService } from '@/database/database.module';

@Injectable()
export class CitizensAdminService {
  constructor(private readonly prisma: PrismaService) {}

  async list(query: PaginationQueryDto, search?: string) {
    const { skip, take, page, limit } = paginate(query.page, query.limit);
    const where = search
      ? {
          OR: [
            { phone: { contains: search } },
            { email: { contains: search, mode: 'insensitive' as const } },
            { firstName: { contains: search, mode: 'insensitive' as const } },
          ],
        }
      : {};

    const [data, total] = await Promise.all([
      this.prisma.citizen.findMany({
        where,
        skip,
        take,
        orderBy: { createdAt: 'desc' },
        include: { _count: { select: { applications: true } } },
      }),
      this.prisma.citizen.count({ where }),
    ]);

    return { data, meta: paginationMeta(total, page, limit) };
  }

  async getById(id: string) {
    return this.prisma.citizen.findUniqueOrThrow({
      where: { id },
      include: {
        applications: {
          take: 20,
          orderBy: { createdAt: 'desc' },
          include: { serviceVersion: { include: { overview: true } } },
        },
      },
    });
  }
}
