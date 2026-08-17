import { Module, forwardRef } from '@nestjs/common';

import { StorageModule } from '@/integrations/storage/storage.module';
import { NotificationsModule } from '@/modules/notifications/notifications.module';
import { PaymentsModule } from '@/modules/payments/payments.module';
import { WalletModule } from '@/modules/wallet/wallet.module';
import { ServiceVersionsModule } from '@/modules/service-versions/service-versions.module';
import { ApplicationsAdminController } from './controllers/applications-admin.controller';
import { ApplicationsCitizenController } from './controllers/applications-citizen.controller';
import { ApplicationSnapshotService } from './services/application-snapshot.service';
import { ApplicationStateMachineService } from './services/application-state-machine.service';
import { ApplicationValidationService } from './services/application-validation.service';
import { ApplicationsAdminService } from './services/applications-admin.service';
import { ApplicationsCitizenService } from './services/applications-citizen.service';

@Module({
  imports: [
    StorageModule,
    ServiceVersionsModule,
    NotificationsModule,
    forwardRef(() => PaymentsModule),
    WalletModule,
  ],
  controllers: [ApplicationsCitizenController, ApplicationsAdminController],
  providers: [
    ApplicationSnapshotService,
    ApplicationValidationService,
    ApplicationStateMachineService,
    ApplicationsCitizenService,
    ApplicationsAdminService,
  ],
  exports: [
    ApplicationsCitizenService,
    ApplicationsAdminService,
    ApplicationValidationService,
  ],
})
export class ApplicationsModule {}
