import { Module } from '@nestjs/common';

import { GovernmentSchemesAdminController } from './controllers/government-schemes-admin.controller';
import { GovernmentSchemesController } from './controllers/government-schemes.controller';
import { GovernmentSchemesService } from './services/government-schemes.service';

@Module({
  controllers: [GovernmentSchemesController, GovernmentSchemesAdminController],
  providers: [GovernmentSchemesService],
  exports: [GovernmentSchemesService],
})
export class GovernmentSchemesModule {}
