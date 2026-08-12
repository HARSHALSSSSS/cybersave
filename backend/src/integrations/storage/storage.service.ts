import { Inject, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

import type {
  ObjectMetadata,
  PresignedDownload,
  PresignedDownloadRequest,
  PresignedUpload,
  PresignedUploadRequest,
  StorageProvider,
} from './storage-provider.interface';
import { STORAGE_PROVIDER } from './storage-provider.interface';
import { LocalStorageProvider } from './local-storage.provider';

@Injectable()
export class StorageService {
  constructor(
    @Inject(STORAGE_PROVIDER) private readonly provider: StorageProvider,
    private readonly configService: ConfigService,
    private readonly localStorageProvider: LocalStorageProvider,
  ) {}

  get defaultTtlSeconds(): number {
    return this.configService.get<number>('storage.uploadUrlTtlSeconds', 900);
  }

  generateStorageKey(citizenId: string, fileName: string): string {
    return LocalStorageProvider.generateStorageKey(citizenId, fileName);
  }

  async requestUploadUrl(
    params: Omit<PresignedUploadRequest, 'ttlSeconds'> & { ttlSeconds?: number },
  ): Promise<PresignedUpload> {
    return this.provider.generateUploadUrl({
      ...params,
      ttlSeconds: params.ttlSeconds ?? this.defaultTtlSeconds,
    });
  }

  async requestDownloadUrl(
    params: Omit<PresignedDownloadRequest, 'ttlSeconds'> & { ttlSeconds?: number },
  ): Promise<PresignedDownload> {
    return this.provider.generateDownloadUrl({
      ...params,
      ttlSeconds: params.ttlSeconds ?? this.defaultTtlSeconds,
    });
  }

  async verifyObject(storageKey: string): Promise<ObjectMetadata> {
    return this.provider.verifyObjectExists(storageKey);
  }

  async deleteObject(storageKey: string): Promise<void> {
    return this.provider.deleteObject(storageKey);
  }

  async saveUploadedBytes(
    storageKey: string,
    buffer: Buffer,
    maxSizeBytes: number,
  ): Promise<ObjectMetadata> {
    return this.localStorageProvider.saveUploadedFile(
      storageKey,
      buffer,
      maxSizeBytes,
    );
  }
}
