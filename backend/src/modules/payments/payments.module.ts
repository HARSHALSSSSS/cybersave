import { Module } from '@nestjs/common';

import { PaymentIntegrationModule } from '@/integrations/payment/payment.module';
import { ServiceVersionsModule } from '@/modules/service-versions/service-versions.module';
import { AdminPaymentsController, PaymentsController } from './payments.controller';
import { PaymentsService } from './payments.service';

@Module({
  imports: [ServiceVersionsModule, PaymentIntegrationModule],
  controllers: [PaymentsController, AdminPaymentsController],
  providers: [PaymentsService],
  exports: [PaymentsService],
})
export class PaymentsModule {}
