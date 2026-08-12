import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { IsObject, IsOptional, IsString } from 'class-validator';

import {
  AuthType,
  CurrentUser,
} from '@/common/decorators/auth.decorators';
import type { AuthenticatedCitizen } from '@/common/decorators/auth.decorators';
import { BillPaymentsService } from '../services/bill-payments.service';

class CreateBillRequestDto {
  @IsObject()
  accountHolder!: Record<string, string>;
}

class SaveBillerDto {
  @IsObject()
  accountHolder!: Record<string, string>;

  @IsOptional()
  @IsString()
  nickname?: string;
}

class PaymentIntentDto {
  @IsString()
  idempotencyKey!: string;
}

class ConfirmPaymentDto {
  @IsOptional()
  @IsString()
  razorpayPaymentId?: string;

  @IsOptional()
  @IsString()
  razorpayOrderId?: string;

  @IsOptional()
  @IsString()
  razorpaySignature?: string;
}

@ApiTags('Bill Payments')
@ApiBearerAuth('citizen-auth')
@Controller('bill-payments')
@AuthType('citizen')
export class BillPaymentsCitizenController {
  constructor(private readonly billPaymentsService: BillPaymentsService) {}

  @Get('settings')
  @ApiOperation({ summary: 'Bill payments configuration' })
  getSettings() {
    return this.billPaymentsService.getSettings();
  }

  @Get('categories')
  @ApiOperation({ summary: 'List bill payment categories' })
  listCategories() {
    return this.billPaymentsService.listCategories();
  }

  @Get('categories/:category/billers')
  @ApiOperation({ summary: 'List billers for a category' })
  listBillers(
    @Param('category') category: string,
    @Query('search') search?: string,
    @Query('state') state?: string,
    @Query('city') city?: string,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    return this.billPaymentsService.listBillers({
      category,
      search,
      state,
      city,
      page: page ? parseInt(page, 10) : 1,
      limit: limit ? parseInt(limit, 10) : 50,
    });
  }

  @Get('billers/:billerId')
  @ApiOperation({ summary: 'Get biller with dynamic form fields' })
  getBiller(@Param('billerId') billerId: string) {
    return this.billPaymentsService.getBiller(billerId);
  }

  @Post('billers/:billerId/bill-requests')
  @ApiOperation({ summary: 'Create bill fetch request' })
  createBillRequest(
    @CurrentUser() user: AuthenticatedCitizen,
    @Param('billerId') billerId: string,
    @Body() dto: CreateBillRequestDto,
  ) {
    return this.billPaymentsService.createBillRequest(
      user.id,
      billerId,
      dto.accountHolder,
    );
  }

  @Get('bill-requests/:requestId')
  @ApiOperation({ summary: 'Get/poll bill request status' })
  getBillRequest(
    @CurrentUser() user: AuthenticatedCitizen,
    @Param('requestId') requestId: string,
    @Query('poll') poll?: string,
  ) {
    return this.billPaymentsService.getBillRequest(
      user.id,
      requestId,
      poll === 'true',
    );
  }

  @Post('bill-requests/:requestId/payment-intent')
  @ApiOperation({ summary: 'Create payment intent for bill' })
  createPaymentIntent(
    @CurrentUser() user: AuthenticatedCitizen,
    @Param('requestId') requestId: string,
    @Body() dto: PaymentIntentDto,
  ) {
    return this.billPaymentsService.createPaymentIntent(
      user.id,
      requestId,
      dto.idempotencyKey,
    );
  }

  @Post('payments/:paymentId/confirm')
  @ApiOperation({ summary: 'Confirm bill payment after PG capture' })
  confirmPayment(
    @CurrentUser() user: AuthenticatedCitizen,
    @Param('paymentId') paymentId: string,
    @Query('mock') mock?: string,
    @Body() body?: ConfirmPaymentDto,
  ) {
    return this.billPaymentsService.confirmPayment(user.id, paymentId, {
      mockCapture: mock === 'true',
      razorpayPaymentId: body?.razorpayPaymentId,
      razorpayOrderId: body?.razorpayOrderId,
      razorpaySignature: body?.razorpaySignature,
    });
  }

  @Get('payments/:paymentId')
  @ApiOperation({ summary: 'Get/poll payment status' })
  getPayment(
    @CurrentUser() user: AuthenticatedCitizen,
    @Param('paymentId') paymentId: string,
    @Query('poll') poll?: string,
  ) {
    return this.billPaymentsService.getPayment(
      user.id,
      paymentId,
      poll === 'true',
    );
  }

  @Get('history')
  @ApiOperation({ summary: 'Bill payment history' })
  history(
    @CurrentUser() user: AuthenticatedCitizen,
    @Query('filter') filter?: 'all' | 'success' | 'pending' | 'failed',
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    return this.billPaymentsService.listHistory(
      user.id,
      filter ?? 'all',
      page ? parseInt(page, 10) : 1,
      limit ? parseInt(limit, 10) : 20,
    );
  }

  @Get('recent-billers')
  @ApiOperation({ summary: 'Recently used billers' })
  recentBillers(@CurrentUser() user: AuthenticatedCitizen) {
    return this.billPaymentsService.listRecentBillers(user.id);
  }

  @Get('saved-billers')
  @ApiOperation({ summary: 'Saved billers' })
  savedBillers(@CurrentUser() user: AuthenticatedCitizen) {
    return this.billPaymentsService.listSavedBillers(user.id);
  }

  @Post('saved-billers/:billerId')
  @ApiOperation({ summary: 'Save a biller' })
  saveBiller(
    @CurrentUser() user: AuthenticatedCitizen,
    @Param('billerId') billerId: string,
    @Body() dto: SaveBillerDto,
  ) {
    return this.billPaymentsService.saveBiller(
      user.id,
      billerId,
      dto.accountHolder,
      dto.nickname,
    );
  }

  @Delete('saved-billers/:savedId')
  @ApiOperation({ summary: 'Delete saved biller' })
  deleteSaved(
    @CurrentUser() user: AuthenticatedCitizen,
    @Param('savedId') savedId: string,
  ) {
    return this.billPaymentsService.deleteSavedBiller(user.id, savedId);
  }
}
