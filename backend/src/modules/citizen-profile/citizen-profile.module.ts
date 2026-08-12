import { Module } from '@nestjs/common';

import { StorageModule } from '@/integrations/storage/storage.module';
import { CitizenProfileController } from './citizen-profile.controller';
import { CitizenProfileService } from './citizen-profile.service';

@Module({
  imports: [StorageModule],
  controllers: [CitizenProfileController],
  providers: [CitizenProfileService],
  exports: [CitizenProfileService],
})
export class CitizenProfileModule {}
