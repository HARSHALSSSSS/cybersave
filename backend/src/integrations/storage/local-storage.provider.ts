import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { createHash, randomUUID } from 'crypto';
import { mkdir, stat, unlink, writeFile } from 'fs/promises';
import { dirname } from 'path';
import { join } from 'path';

import {
  ObjectMetadata,
  PresignedDownload,
  PresignedDownloadRequest,
  PresignedUpload,
  PresignedUploadRequest,
  StorageProvider,
} from './storage-provider.interface';

@Injectable()
export class LocalStorageProvider implements StorageProvider {
  private readonly logger = new Logger(LocalStorageProvider.name);
  private readonly basePath: string;
  private readonly publicBaseUrl: string;

  constructor(private readonly configService: ConfigService) {
    this.basePath = this.configService.get<string>(
      'storage.localPath',
      './storage',
    );
    const configured = this.configService.get<string>('storage.publicBaseUrl');
    if (configured) {
      this.publicBaseUrl = configured.replace(/\/+$/, '');
    } else {
      const port = this.configService.get<number>('app.port', 8000);
      const prefix = this.configService.get<string>('app.apiPrefix', 'api/v1');
      this.publicBaseUrl = `http://localhost:${port}/${prefix}/storage/local`;
    }
  }

  async generateUploadUrl(
    params: PresignedUploadRequest,
  ): Promise<PresignedUpload> {
    await mkdir(this.basePath, { recursive: true });

    const expiresAt = new Date(Date.now() + params.ttlSeconds * 1000);
    const token = this.createUploadToken(params.storageKey, expiresAt);

    return {
      uploadUrl: `${this.publicBaseUrl}/upload/${encodeURIComponent(params.storageKey)}?token=${token}&expiresAt=${encodeURIComponent(expiresAt.toISOString())}`,
      method: 'PUT',
      headers: {
        'Content-Type': params.mimeType,
        'X-Original-Filename': params.originalFileName,
        'X-Max-Size': String(params.maxSizeBytes),
      },
      storageKey: params.storageKey,
      expiresAt,
    };
  }

  async generateDownloadUrl(
    params: PresignedDownloadRequest,
  ): Promise<PresignedDownload> {
    const filePath = this.resolvePath(params.storageKey);
    try {
      await stat(filePath);
    } catch {
      throw new NotFoundException('File not found in storage');
    }

    const expiresAt = new Date(Date.now() + params.ttlSeconds * 1000);
    const token = this.createUploadToken(params.storageKey, expiresAt);

    return {
      downloadUrl: `${this.publicBaseUrl}/download/${encodeURIComponent(params.storageKey)}?token=${token}&expiresAt=${encodeURIComponent(expiresAt.toISOString())}`,
      expiresAt,
    };
  }

  async deleteObject(storageKey: string): Promise<void> {
    const filePath = this.resolvePath(storageKey);
    try {
      await unlink(filePath);
    } catch {
      this.logger.warn(`File not found for deletion: ${storageKey}`);
    }
  }

  async verifyObjectExists(storageKey: string): Promise<ObjectMetadata> {
    const filePath = this.resolvePath(storageKey);
    try {
      const fileStat = await stat(filePath);
      return {
        storageKey,
        mimeType: 'application/octet-stream',
        sizeBytes: fileStat.size,
        exists: true,
      };
    } catch {
      return {
        storageKey,
        mimeType: 'application/octet-stream',
        sizeBytes: 0,
        exists: false,
      };
    }
  }

  resolvePath(storageKey: string): string {
    const normalized = storageKey.replace(/\.\./g, '').replace(/^\/+/, '');
    return join(this.basePath, normalized);
  }

  createUploadToken(storageKey: string, expiresAt: Date): string {
    const secret = this.configService.get<string>(
      'citizenAuth.jwtSecret',
      'dev-secret',
    );
    return createHash('sha256')
      .update(`${storageKey}:${expiresAt.toISOString()}:${secret}`)
      .digest('hex');
  }

  verifyToken(storageKey: string, token: string, expiresAt: Date): boolean {
    if (expiresAt.getTime() < Date.now()) {
      return false;
    }
    return this.createUploadToken(storageKey, expiresAt) === token;
  }

  static generateStorageKey(citizenId: string, fileName: string): string {
    const ext = fileName.includes('.') ? fileName.split('.').pop() : 'bin';
    return `citizens/${citizenId}/${randomUUID()}.${ext}`;
  }

  async saveUploadedFile(
    storageKey: string,
    buffer: Buffer,
    maxSizeBytes: number,
  ): Promise<ObjectMetadata> {
    if (buffer.length > maxSizeBytes) {
      throw new Error('File exceeds maximum allowed size');
    }

    const filePath = this.resolvePath(storageKey);
    await mkdir(dirname(filePath), { recursive: true });
    await writeFile(filePath, buffer);

    return {
      storageKey,
      mimeType: 'application/octet-stream',
      sizeBytes: buffer.length,
      exists: true,
    };
  }
}
