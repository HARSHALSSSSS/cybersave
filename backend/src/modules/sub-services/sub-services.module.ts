import { Module } from '@nestjs/common';

import { ServiceVersionsModule } from '@/modules/service-versions/service-versions.module';
import {
  SubServiceVersionsController,
  SubServicesController,
} from './controllers/sub-services.controller';
import { SubServicesService } from './services/sub-services.service';

@Module({
  imports: [ServiceVersionsModule],
  controllers: [SubServicesController, SubServiceVersionsController],
  providers: [SubServicesService],
})
export class SubServicesModule {}
