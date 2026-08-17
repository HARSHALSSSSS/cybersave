import { Body, Controller, Get, Param, Post } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';

import {
  AuthType,
  CurrentUser,
} from '@/common/decorators/auth.decorators';
import type { AuthenticatedCitizen } from '@/common/decorators/auth.decorators';
import {
  ConfirmWalletTopUpDto,
  CreateWalletTopUpDto,
} from './dto/wallet.dto';
import { WalletService } from './wallet.service';

@ApiTags('Wallet')
@ApiBearerAuth('citizen-auth')
@Controller('wallet')
@AuthType('citizen')
export class WalletCitizenController {
  constructor(private readonly walletService: WalletService) {}

  @Get()
  @ApiOperation({ summary: 'Get wallet balance and recent transactions' })
  getSummary(@CurrentUser() user: AuthenticatedCitizen) {
    return this.walletService.getSummary(user.id);
  }

  @Post('top-up-intent')
  @ApiOperation({ summary: 'Create Razorpay order for wallet recharge' })
  createTopUpIntent(
    @CurrentUser() user: AuthenticatedCitizen,
    @Body() dto: CreateWalletTopUpDto,
  ) {
    return this.walletService.createTopUpIntent(
      user.id,
      dto.amount,
      dto.idempotencyKey,
    );
  }

  @Post('top-ups/:topUpId/confirm')
  @ApiOperation({ summary: 'Confirm wallet top-up after Razorpay checkout' })
  confirmTopUp(
    @CurrentUser() user: AuthenticatedCitizen,
    @Param('topUpId') topUpId: string,
    @Body() dto: ConfirmWalletTopUpDto,
  ) {
    return this.walletService.confirmTopUp(user.id, topUpId, dto);
  }
}
