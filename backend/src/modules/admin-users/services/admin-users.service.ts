import { Injectable } from '@nestjs/common';

import {
  paginate,
  PaginationQueryDto,
  paginationMeta,
} from '@/common/dto/pagination.dto';
import { PrismaService } from '@/database/database.module';

const adminUserSelect = {
  id: true,
  email: true,
  firstName: true,
  lastName: true,
  status: true,
  createdAt: true,
  roles: {
    include: {
      role: { select: { id: true, key: true, name: true } },
    },
  },
} as const;

@Injectable()
export class AdminUsersService {
  constructor(private readonly prisma: PrismaService) {}

  async list(query: PaginationQueryDto) {
    const { skip, take, page, limit } = paginate(query.page, query.limit);

    const [items, total] = await Promise.all([
      this.prisma.adminUser.findMany({
        skip,
        take,
        orderBy: { createdAt: 'desc' },
        select: adminUserSelect,
      }),
      this.prisma.adminUser.count(),
    ]);

    return {
      data: items.map((user) => this.mapAdminUser(user)),
      meta: paginationMeta(total, page, limit),
    };
  }

  async getById(id: string) {
    const user = await this.prisma.adminUser.findUniqueOrThrow({
      where: { id },
      select: adminUserSelect,
    });
    return this.mapAdminUser(user);
  }

  private mapAdminUser(
    user: {
      id: string;
      email: string;
      firstName: string | null;
      lastName: string | null;
      status: string;
      createdAt: Date;
      roles: Array<{ role: { id: string; key: string; name: string } }>;
    },
  ) {
    return {
      ...user,
      roles: user.roles.map((r) => r.role),
    };
  }
}
