export interface PresignedUploadRequest {
  storageKey: string;
  mimeType: string;
  maxSizeBytes: number;
  originalFileName: string;
  ttlSeconds: number;
}

export interface PresignedUpload {
  uploadUrl: string;
  method: 'PUT' | 'POST';
  headers: Record<string, string>;
  storageKey: string;
  expiresAt: Date;
}

export interface PresignedDownloadRequest {
  storageKey: string;
  ttlSeconds: number;
  fileName?: string;
  mimeType?: string;
}

export interface PresignedDownload {
  downloadUrl: string;
  expiresAt: Date;
}

export interface ObjectMetadata {
  storageKey: string;
  mimeType: string;
  sizeBytes: number;
  exists: boolean;
}

export interface StorageProvider {
  generateUploadUrl(params: PresignedUploadRequest): Promise<PresignedUpload>;
  generateDownloadUrl(
    params: PresignedDownloadRequest,
  ): Promise<PresignedDownload>;
  deleteObject(storageKey: string): Promise<void>;
  verifyObjectExists(storageKey: string): Promise<ObjectMetadata>;
}

export const STORAGE_PROVIDER = Symbol('STORAGE_PROVIDER');
