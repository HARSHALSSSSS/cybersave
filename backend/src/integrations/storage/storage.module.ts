import { Module } from '@nestjs/common';

import { STORAGE_PROVIDER } from './storage-provider.interface';
import { LocalStorageController } from './local-storage.controller';
import { LocalStorageProvider } from './local-storage.provider';
import { StorageService } from './storage.service';

@Module({
  controllers: [LocalStorageController],
  providers: [
    LocalStorageProvider,
    StorageService,
    {
      provide: STORAGE_PROVIDER,
      useExisting: LocalStorageProvider,
    },
  ],
  exports: [StorageService, STORAGE_PROVIDER, LocalStorageProvider],
})
export class StorageModule {}
