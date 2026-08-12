import { Module } from '@nestjs/common';

import { HomeBannersAdminController } from './controllers/home-banners-admin.controller';
import { HomeBannersController } from './controllers/home-banners.controller';
import { HomeBannersService } from './services/home-banners.service';

@Module({
  controllers: [HomeBannersController, HomeBannersAdminController],
  providers: [HomeBannersService],
  exports: [HomeBannersService],
})
export class HomeBannersModule {}
