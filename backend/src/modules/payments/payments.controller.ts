import { Body, Controller, Get, Headers, Post, Query, Req } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import type { Request } from 'express';

import { PERMISSIONS } from '@/common/constants/permissions.constants';
import {
  AuthType,
  CurrentUser,
  Public,
  RequirePermissions,
} from '@/common/decorators/auth.decorators';
import type { AuthenticatedCitizen } from '@/common/decorators/auth.decorators';
import { RazorpayPaymentProvider } from '@/integrations/payment/razorpay-payment.provider';
import { PaymentsService } from './payments.service';

@ApiTags('Payments')
@Controller()
export class PaymentsController {
  constructor(
    private readonly paymentsService: PaymentsService,
    private readonly razorpayProvider: RazorpayPaymentProvider,
  ) {}

  @Public()
  @Post('webhooks/payments/mock')
  @ApiOperation({ summary: 'Mock payment webhook — auto-captures payment' })
  async mockWebhook(@Body() body: { paymentId: string }) {
    return this.paymentsService.verifyAndCapture(body.paymentId);
  }

  @Public()
  @Post('webhooks/payments/razorpay')
  @ApiOperation({ summary: 'Razorpay payment webhook' })
  async razorpayWebhook(
    @Req() req: Request & { rawBody?: Buffer },
    @Headers('x-razorpay-signature') signature: string,
    @Body() body: { event?: string; payload?: { payment?: { entity?: { order_id?: string; id?: string; status?: string } } } },
  ) {
    const rawBody =
      req.rawBody?.toString('utf8') ?? JSON.stringify(body);
    if (!this.razorpayProvider.verifyWebhookSignature(rawBody, signature ?? '')) {
      return { success: false, message: 'Invalid signature' };
    }

    const paymentEntity = body.payload?.payment?.entity;
    if (body.event === 'payment.captured' && paymentEntity?.order_id) {
      await this.paymentsService.verifyAndCaptureByProviderRef(paymentEntity.order_id);
    }

    return { success: true };
  }
}

@ApiTags('Citizen Payments')
@ApiBearerAuth('citizen-auth')
@Controller('payments')
@AuthType('citizen')
export class CitizenPaymentsController {
  constructor(private readonly paymentsService: PaymentsService) {}

  @Get()
  @ApiOperation({ summary: 'List captured payments for the signed-in citizen' })
  listMine(@CurrentUser() user: AuthenticatedCitizen) {
    return this.paymentsService.listForCitizen(user.id);
  }
}

@ApiTags('Admin Payments')
@ApiBearerAuth('admin-auth')
@Controller('admin/payments')
@AuthType('admin')
export class AdminPaymentsController {
  constructor(private readonly paymentsService: PaymentsService) {}

  @Get()
  @RequirePermissions(PERMISSIONS.PAYMENT_VIEW)
  @ApiOperation({ summary: 'List payments / transactions' })
  list(@Query('page') page = 1, @Query('limit') limit = 20) {
    return this.paymentsService.listAdmin(Number(page), Number(limit));
  }
}
