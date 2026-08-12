import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Prisma, SupportTicketStatus } from '@prisma/client';

import { ActorType } from '@/common/constants/auth.constants';
import {
  paginate,
  PaginationQueryDto,
  paginationMeta,
} from '@/common/dto/pagination.dto';
import { PrismaService } from '@/database/database.module';

export interface CreateTicketParams {
  citizenId: string;
  subject: string;
  content: string;
}

export interface AddMessageParams {
  ticketId: string;
  senderType: ActorType;
  senderId: string;
  content: string;
}

export interface SupportTicketsQuery extends PaginationQueryDto {
  status?: SupportTicketStatus;
}

@Injectable()
export class SupportTicketsService {
  constructor(private readonly prisma: PrismaService) {}

  async createTicket(params: CreateTicketParams) {
    return this.prisma.supportTicket.create({
      data: {
        citizenId: params.citizenId,
        subject: params.subject,
        messages: {
          create: {
            senderType: ActorType.CITIZEN,
            senderId: params.citizenId,
            content: params.content,
          },
        },
      },
      include: { messages: { orderBy: { createdAt: 'asc' } } },
    });
  }

  async listForCitizen(citizenId: string, query: PaginationQueryDto) {
    const { skip, take, page, limit } = paginate(query.page, query.limit);

    const where: Prisma.SupportTicketWhereInput = { citizenId };

    const [items, total] = await Promise.all([
      this.prisma.supportTicket.findMany({
        where,
        skip,
        take,
        orderBy: { updatedAt: 'desc' },
        include: {
          messages: {
            orderBy: { createdAt: 'desc' },
            take: 1,
          },
        },
      }),
      this.prisma.supportTicket.count({ where }),
    ]);

    return {
      data: items,
      meta: paginationMeta(total, page, limit),
    };
  }

  async getForCitizen(citizenId: string, ticketId: string) {
    const ticket = await this.prisma.supportTicket.findFirst({
      where: { id: ticketId, citizenId },
      include: { messages: { orderBy: { createdAt: 'asc' } } },
    });

    if (!ticket) {
      throw new NotFoundException('Support ticket not found');
    }

    return ticket;
  }

  async addMessageForCitizen(citizenId: string, ticketId: string, content: string) {
    const ticket = await this.getForCitizen(citizenId, ticketId);

    if (
      ticket.status === SupportTicketStatus.CLOSED ||
      ticket.status === SupportTicketStatus.RESOLVED
    ) {
      throw new ForbiddenException('Cannot add messages to a closed ticket');
    }

    return this.addMessage({
      ticketId,
      senderType: ActorType.CITIZEN,
      senderId: citizenId,
      content,
    });
  }

  async listAdmin(query: SupportTicketsQuery) {
    const { skip, take, page, limit } = paginate(query.page, query.limit);

    const where: Prisma.SupportTicketWhereInput = {};
    if (query.status) {
      where.status = query.status;
    }

    const [items, total] = await Promise.all([
      this.prisma.supportTicket.findMany({
        where,
        skip,
        take,
        orderBy: { updatedAt: 'desc' },
        include: {
          citizen: {
            select: {
              id: true,
              phone: true,
              firstName: true,
              lastName: true,
            },
          },
          messages: {
            orderBy: { createdAt: 'desc' },
            take: 1,
          },
        },
      }),
      this.prisma.supportTicket.count({ where }),
    ]);

    return {
      data: items,
      meta: paginationMeta(total, page, limit),
    };
  }

  async getAdmin(ticketId: string) {
    const ticket = await this.prisma.supportTicket.findUnique({
      where: { id: ticketId },
      include: {
        citizen: {
          select: {
            id: true,
            phone: true,
            firstName: true,
            lastName: true,
            email: true,
          },
        },
        messages: { orderBy: { createdAt: 'asc' } },
      },
    });

    if (!ticket) {
      throw new NotFoundException('Support ticket not found');
    }

    return ticket;
  }

  async replyAdmin(adminId: string, ticketId: string, content: string) {
    await this.getAdmin(ticketId);

    await this.prisma.supportTicket.update({
      where: { id: ticketId },
      data: { status: SupportTicketStatus.IN_PROGRESS },
    });

    return this.addMessage({
      ticketId,
      senderType: ActorType.ADMIN,
      senderId: adminId,
      content,
    });
  }

  async resolveAdmin(ticketId: string) {
    await this.getAdmin(ticketId);

    return this.prisma.supportTicket.update({
      where: { id: ticketId },
      data: { status: SupportTicketStatus.RESOLVED },
      include: { messages: { orderBy: { createdAt: 'asc' } } },
    });
  }

  private async addMessage(params: AddMessageParams) {
    const [message] = await this.prisma.$transaction([
      this.prisma.ticketMessage.create({
        data: {
          ticketId: params.ticketId,
          senderType: params.senderType,
          senderId: params.senderId,
          content: params.content,
        },
      }),
      this.prisma.supportTicket.update({
        where: { id: params.ticketId },
        data: { updatedAt: new Date() },
      }),
    ]);

    return message;
  }
}
