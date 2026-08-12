import { Body, Controller, Get, Param, Patch, Post, Query } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { IsArray, IsOptional, IsString, ArrayMinSize } from 'class-validator';

import { PERMISSIONS } from '@/common/constants/permissions.constants';
import {
  AuthType,
  CurrentUser,
  RequirePermissions,
} from '@/common/decorators/auth.decorators';
import type { AuthenticatedAdmin, AuthenticatedCitizen } from '@/common/decorators/auth.decorators';
import { PaginationQueryDto } from '@/common/dto/pagination.dto';
import { NotificationsService } from './notifications.service';

class SendNotificationDto {
  @IsString()
  title!: string;

  @IsString()
  body!: string;

  @IsArray()
  @ArrayMinSize(1)
  @IsString({ each: true })
  citizenIds!: string[];

  @IsOptional()
  metadata?: Record<string, unknown>;
}

@ApiTags('Citizen Notifications')
@Controller('notifications')
@AuthType('citizen')
export class CitizenNotificationsController {
  constructor(private readonly notificationsService: NotificationsService) {}

  @Get()
  @ApiOperation({ summary: 'List in-app notifications for current citizen' })
  list(
    @CurrentUser() user: AuthenticatedCitizen,
    @Query() query: PaginationQueryDto,
  ) {
    return this.notificationsService.listForCitizen(user.id, query);
  }

  @Patch(':id/read')
  @ApiOperation({ summary: 'Mark notification as read' })
  markRead(
    @CurrentUser() user: AuthenticatedCitizen,
    @Param('id') id: string,
  ) {
    return this.notificationsService.markReadForCitizen(user.id, id);
  }
}

@ApiTags('Admin Notifications')
@ApiBearerAuth('admin-auth')
@Controller('admin/notifications')
@AuthType('admin')
export class AdminNotificationsController {
  constructor(private readonly notificationsService: NotificationsService) {}

  @Get()
  @RequirePermissions(PERMISSIONS.APPLICATION_VIEW_ALL)
  @ApiOperation({ summary: 'List admin notification center' })
  list(
    @CurrentUser() user: AuthenticatedAdmin,
    @Query() query: PaginationQueryDto,
  ) {
    return this.notificationsService.listForAdmin(user.id, query);
  }

  @Post('send')
  @RequirePermissions(PERMISSIONS.USER_MANAGE)
  @ApiOperation({ summary: 'Send in-app notification to citizen(s)' })
  send(@Body() dto: SendNotificationDto) {
    return this.notificationsService.sendToCitizens(dto);
  }
}
