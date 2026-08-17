import { Module } from '@nestjs/common';

import { BbpsModule } from '@/integrations/bbps/bbps.module';
import { PaymentIntegrationModule } from '@/integrations/payment/payment.module';
import { BillPaymentsAdminController } from './controllers/bill-payments-admin.controller';
import { BillPaymentsCitizenController } from './controllers/bill-payments-citizen.controller';
import { BillPaymentsAdminService } from './services/bill-payments-admin.service';
import { BillPaymentsService } from './services/bill-payments.service';
import { BillerSyncService } from './services/biller-sync.service';

@Module({
  imports: [BbpsModule, PaymentIntegrationModule],
  controllers: [BillPaymentsCitizenController, BillPaymentsAdminController],
  providers: [BillPaymentsService, BillPaymentsAdminService, BillerSyncService],
  exports: [BillPaymentsService, BillerSyncService],
})
export class BillPaymentsModule {}
