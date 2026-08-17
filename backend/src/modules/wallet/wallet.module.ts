import { Module } from '@nestjs/common';

import { PaymentIntegrationModule } from '@/integrations/payment/payment.module';
import { WalletCitizenController } from './wallet-citizen.controller';
import { WalletService } from './wallet.service';

@Module({
  imports: [PaymentIntegrationModule],
  controllers: [WalletCitizenController],
  providers: [WalletService],
  exports: [WalletService],
})
export class WalletModule {}
