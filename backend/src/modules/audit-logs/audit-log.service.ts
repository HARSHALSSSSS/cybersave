import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';

import { paginate, PaginationQueryDto, paginationMeta } from '@/common/dto/pagination.dto';
import { PrismaService } from '@/database/database.module';

@Injectable()
export class AuditLogService {
  constructor(private readonly prisma: PrismaService) {}

  log(
    actorAdminId: string | null,
    action: string,
    resourceType: string,
    resourceId: string,
    metadata?: Record<string, unknown>,
  ) {
    return this.prisma.auditLog.create({
      data: {
        actorAdminId: actorAdminId ?? undefined,
        action,
        resourceType,
        resourceId,
        metadata: (metadata ?? {}) as Prisma.InputJsonValue,
      },
    });
  }

  async list(query: PaginationQueryDto, resourceType?: string) {
    const { skip, take, page, limit } = paginate(query.page, query.limit);
    const where = resourceType ? { resourceType } : {};

    const [data, total] = await Promise.all([
      this.prisma.auditLog.findMany({
        where,
        skip,
        take,
        orderBy: { createdAt: 'desc' },
        include: { actorAdmin: { select: { id: true, email: true } } },
      }),
      this.prisma.auditLog.count({ where }),
    ]);

    return { data, meta: paginationMeta(total, page, limit) };
  }
}
