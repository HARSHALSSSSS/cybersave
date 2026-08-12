import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Query,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { SupportTicketStatus } from '@prisma/client';
import { IsEnum, IsOptional, IsString } from 'class-validator';

import { PERMISSIONS } from '@/common/constants/permissions.constants';
import {
  AuthType,
  CurrentUser,
  RequirePermissions,
} from '@/common/decorators/auth.decorators';
import type { AuthenticatedAdmin, AuthenticatedCitizen } from '@/common/decorators/auth.decorators';
import { PaginationQueryDto } from '@/common/dto/pagination.dto';
import { SupportTicketsService } from './support-tickets.service';

class CreateTicketDto {
  @IsString()
  subject!: string;

  @IsString()
  content!: string;
}

class AddMessageDto {
  @IsString()
  content!: string;
}

class AdminTicketsQueryDto extends PaginationQueryDto {
  @IsOptional()
  @IsEnum(SupportTicketStatus)
  status?: SupportTicketStatus;
}

@ApiTags('Citizen Support')
@Controller('support/tickets')
@AuthType('citizen')
export class CitizenSupportTicketsController {
  constructor(private readonly supportTicketsService: SupportTicketsService) {}

  @Post()
  @ApiOperation({ summary: 'Create a support ticket' })
  create(
    @CurrentUser() user: AuthenticatedCitizen,
    @Body() dto: CreateTicketDto,
  ) {
    return this.supportTicketsService.createTicket({
      citizenId: user.id,
      subject: dto.subject,
      content: dto.content,
    });
  }

  @Get()
  @ApiOperation({ summary: 'List own support tickets' })
  list(
    @CurrentUser() user: AuthenticatedCitizen,
    @Query() query: PaginationQueryDto,
  ) {
    return this.supportTicketsService.listForCitizen(user.id, query);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get support ticket detail' })
  get(
    @CurrentUser() user: AuthenticatedCitizen,
    @Param('id') id: string,
  ) {
    return this.supportTicketsService.getForCitizen(user.id, id);
  }

  @Post(':id/messages')
  @ApiOperation({ summary: 'Add message to support ticket' })
  addMessage(
    @CurrentUser() user: AuthenticatedCitizen,
    @Param('id') id: string,
    @Body() dto: AddMessageDto,
  ) {
    return this.supportTicketsService.addMessageForCitizen(
      user.id,
      id,
      dto.content,
    );
  }
}

@ApiTags('Admin Support')
@ApiBearerAuth('admin-auth')
@Controller('admin/support/tickets')
@AuthType('admin')
export class AdminSupportTicketsController {
  constructor(private readonly supportTicketsService: SupportTicketsService) {}

  @Get()
  @RequirePermissions(PERMISSIONS.APPLICATION_VIEW_ALL)
  @ApiOperation({ summary: 'List support tickets' })
  list(@Query() query: AdminTicketsQueryDto) {
    return this.supportTicketsService.listAdmin(query);
  }

  @Get(':id')
  @RequirePermissions(PERMISSIONS.APPLICATION_VIEW_ALL)
  @ApiOperation({ summary: 'Get support ticket detail' })
  get(@Param('id') id: string) {
    return this.supportTicketsService.getAdmin(id);
  }

  @Post(':id/messages')
  @RequirePermissions(PERMISSIONS.APPLICATION_VIEW_ALL)
  @ApiOperation({ summary: 'Reply to support ticket' })
  reply(
    @CurrentUser() user: AuthenticatedAdmin,
    @Param('id') id: string,
    @Body() dto: AddMessageDto,
  ) {
    return this.supportTicketsService.replyAdmin(user.id, id, dto.content);
  }

  @Post(':id/resolve')
  @RequirePermissions(PERMISSIONS.APPLICATION_VIEW_ALL)
  @ApiOperation({ summary: 'Resolve support ticket' })
  resolve(@Param('id') id: string) {
    return this.supportTicketsService.resolveAdmin(id);
  }
}
