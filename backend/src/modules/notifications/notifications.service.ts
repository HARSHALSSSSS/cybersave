import { Injectable, NotFoundException } from '@nestjs/common';
import { NotificationChannel, Prisma } from '@prisma/client';

import {
  paginate,
  PaginationQueryDto,
  paginationMeta,
} from '@/common/dto/pagination.dto';
import { PrismaService } from '@/database/database.module';

export interface CreateNotificationParams {
  title: string;
  body: string;
  citizenId?: string;
  adminUserId?: string;
  channel?: NotificationChannel;
  metadata?: Record<string, unknown>;
}

export interface SendNotificationParams {
  title: string;
  body: string;
  citizenIds: string[];
  metadata?: Record<string, unknown>;
}

@Injectable()
export class NotificationsService {
  constructor(private readonly prisma: PrismaService) {}

  async create(params: CreateNotificationParams) {
    return this.prisma.notification.create({
      data: {
        title: params.title,
        body: params.body,
        citizenId: params.citizenId,
        adminUserId: params.adminUserId,
        channel: params.channel ?? NotificationChannel.IN_APP,
        metadata: (params.metadata ?? {}) as Prisma.InputJsonValue,
        deliveries: {
          create: {
            channel: params.channel ?? NotificationChannel.IN_APP,
            status: 'delivered',
            deliveredAt: new Date(),
          },
        },
      },
    });
  }

  async listForCitizen(citizenId: string, query: PaginationQueryDto) {
    const { skip, take, page, limit } = paginate(query.page, query.limit);

    const where: Prisma.NotificationWhereInput = { citizenId };

    const [items, total] = await Promise.all([
      this.prisma.notification.findMany({
        where,
        skip,
        take,
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.notification.count({ where }),
    ]);

    return {
      data: items,
      meta: paginationMeta(total, page, limit),
    };
  }

  async listForAdmin(adminUserId: string, query: PaginationQueryDto) {
    const { skip, take, page, limit } = paginate(query.page, query.limit);

    const where: Prisma.NotificationWhereInput = { adminUserId };

    const [items, total] = await Promise.all([
      this.prisma.notification.findMany({
        where,
        skip,
        take,
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.notification.count({ where }),
    ]);

    return {
      data: items,
      meta: paginationMeta(total, page, limit),
    };
  }

  async markReadForCitizen(citizenId: string, notificationId: string) {
    const notification = await this.prisma.notification.findFirst({
      where: { id: notificationId, citizenId },
    });

    if (!notification) {
      throw new NotFoundException('Notification not found');
    }

    if (notification.readAt) {
      return notification;
    }

    return this.prisma.notification.update({
      where: { id: notificationId },
      data: { readAt: new Date() },
    });
  }

  async sendToCitizens(params: SendNotificationParams) {
    const notifications = await Promise.all(
      params.citizenIds.map((citizenId) =>
        this.create({
          title: params.title,
          body: params.body,
          citizenId,
          metadata: params.metadata,
        }),
      ),
    );

    return { sent: notifications.length, notifications };
  }
}
