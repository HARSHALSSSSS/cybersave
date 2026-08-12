import { Module } from '@nestjs/common';

import { PaymentIntegrationModule } from '@/integrations/payment/payment.module';
import { ServiceVersionsModule } from '@/modules/service-versions/service-versions.module';
import {
  ManualApplyAdminController,
  ManualApplyCitizenController,
} from './controllers/manual-apply.controller';
import { ManualApplyService } from './services/manual-apply.service';

@Module({
  imports: [PaymentIntegrationModule, ServiceVersionsModule],
  controllers: [ManualApplyCitizenController, ManualApplyAdminController],
  providers: [ManualApplyService],
  exports: [ManualApplyService],
})
export class ManualApplyModule {}
