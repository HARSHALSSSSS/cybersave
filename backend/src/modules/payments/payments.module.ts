import { Module } from '@nestjs/common';

import { PaymentIntegrationModule } from '@/integrations/payment/payment.module';
import { ServiceVersionsModule } from '@/modules/service-versions/service-versions.module';
import { AdminPaymentsController, CitizenPaymentsController, PaymentsController } from './payments.controller';
import { PaymentsService } from './payments.service';

@Module({
  imports: [ServiceVersionsModule, PaymentIntegrationModule],
  controllers: [PaymentsController, CitizenPaymentsController, AdminPaymentsController],
  providers: [PaymentsService],
  exports: [PaymentsService],
})
export class PaymentsModule {}
