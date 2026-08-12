import { Body, Controller, Get, Param, Post, Query } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { IsOptional, IsString } from 'class-validator';

import { PERMISSIONS } from '@/common/constants/permissions.constants';
import {
  AuthType,
  CurrentUser,
  RequirePermissions,
} from '@/common/decorators/auth.decorators';
import type { AuthenticatedCitizen } from '@/common/decorators/auth.decorators';
import { ManualApplyService } from '../services/manual-apply.service';

class CreateManualApplyDto {
  @IsString()
  subServiceId!: string;

  @IsOptional()
  @IsString()
  stateCode?: string;
}

class PaymentIntentDto {
  @IsString()
  idempotencyKey!: string;
}

@ApiTags('Manual Apply')
@ApiBearerAuth('citizen-auth')
@Controller('manual-apply')
@AuthType('citizen')
export class ManualApplyCitizenController {
  constructor(private readonly manualApplyService: ManualApplyService) {}

  @Post('sessions')
  @ApiOperation({ summary: 'Create manual apply session' })
  createSession(
    @CurrentUser() user: AuthenticatedCitizen,
    @Body() dto: CreateManualApplyDto,
  ) {
    return this.manualApplyService.createSession(
      user.id,
      dto.subServiceId,
      dto.stateCode,
    );
  }

  @Get('sessions')
  listSessions(@CurrentUser() user: AuthenticatedCitizen) {
    return this.manualApplyService.listForCitizen(user.id);
  }

  @Get('sessions/:sessionId')
  getSession(
    @CurrentUser() user: AuthenticatedCitizen,
    @Param('sessionId') sessionId: string,
  ) {
    return this.manualApplyService.getForCitizen(sessionId, user.id);
  }

  @Post('sessions/:sessionId/payment-intent')
  createPaymentIntent(
    @CurrentUser() user: AuthenticatedCitizen,
    @Param('sessionId') sessionId: string,
    @Body() dto: PaymentIntentDto,
  ) {
    return this.manualApplyService.createPaymentIntent(
      sessionId,
      user.id,
      dto.idempotencyKey,
    );
  }

  @Post('sessions/:sessionId/confirm-payment')
  confirmPayment(
    @CurrentUser() user: AuthenticatedCitizen,
    @Param('sessionId') sessionId: string,
  ) {
    return this.manualApplyService.confirmPayment(sessionId, user.id);
  }

  @Post('sessions/:sessionId/redirected')
  markRedirected(
    @CurrentUser() user: AuthenticatedCitizen,
    @Param('sessionId') sessionId: string,
  ) {
    return this.manualApplyService.markRedirected(sessionId, user.id);
  }

  @Post('sessions/:sessionId/confirm-applied')
  confirmApplied(
    @CurrentUser() user: AuthenticatedCitizen,
    @Param('sessionId') sessionId: string,
  ) {
    return this.manualApplyService.confirmApplied(sessionId, user.id);
  }
}

@ApiTags('Admin Manual Apply')
@ApiBearerAuth('admin-auth')
@Controller('admin/manual-apply')
@AuthType('admin')
export class ManualApplyAdminController {
  constructor(private readonly manualApplyService: ManualApplyService) {}

  @Get('sessions')
  @RequirePermissions(PERMISSIONS.APPLICATION_VIEW_ALL)
  list(@Query('page') page?: string, @Query('limit') limit?: string) {
    return this.manualApplyService.listForAdmin(
      page ? parseInt(page, 10) : 1,
      limit ? parseInt(limit, 10) : 50,
    );
  }
}
