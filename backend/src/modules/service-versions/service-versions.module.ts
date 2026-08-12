import { Module } from '@nestjs/common';

import { ServiceVersionsController } from './controllers/service-versions.controller';
import { ServicesCatalogController } from './controllers/services-catalog.controller';
import { ServiceVersionsBundleService } from './services/service-versions-bundle.service';
import {
  ServiceVersionsPublishService,
  ServiceVersionsWizardService,
} from './services/service-versions-wizard.service';
import {
  ServiceVersionsService,
  ServicesCatalogService,
} from './services/service-versions.service';
import { ServicesCatalogMapper } from './services/services-catalog.mapper';

@Module({
  controllers: [ServiceVersionsController, ServicesCatalogController],
  providers: [
    ServiceVersionsBundleService,
    ServiceVersionsService,
    ServiceVersionsWizardService,
    ServiceVersionsPublishService,
    ServicesCatalogService,
    ServicesCatalogMapper,
  ],
  exports: [
    ServiceVersionsBundleService,
    ServicesCatalogService,
    ServicesCatalogMapper,
  ],
})
export class ServiceVersionsModule {}
