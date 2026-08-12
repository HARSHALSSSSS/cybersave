import { Module } from '@nestjs/common';

import { MainServicesController } from './controllers/main-services.controller';
import { MainServicesService } from './services/main-services.service';

@Module({
  controllers: [MainServicesController],
  providers: [MainServicesService],
  exports: [MainServicesService],
})
export class MainServicesModule {}
