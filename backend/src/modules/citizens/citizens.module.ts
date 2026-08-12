import { Module } from '@nestjs/common';

import { CitizensAdminController } from './citizens-admin.controller';
import { CitizensAdminService } from './citizens-admin.service';

@Module({
  controllers: [CitizensAdminController],
  providers: [CitizensAdminService],
})
export class CitizensModule {}
