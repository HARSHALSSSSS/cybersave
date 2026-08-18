import { env } from '@/app/config/env';

const UPLOAD_TIMEOUT_MS = 300_000;

/** Align presigned storage URLs with the API base URL (fixes localhost in dev/production). */
export function rewriteStorageUrl(url: string): string {
  try {
    const api = new URL(env.apiBaseUrl);
    const target = new URL(url);
    target.protocol = api.protocol;
    target.hostname = api.hostname;
    target.port = api.port;
    return target.toString();
  } catch {
    return url;
  }
}

/** Local-storage presigned URLs must use the authenticated multipart relay (PUT routes 404 in browser). */
export function isLocalStorageUploadUrl(uploadUrl: string): boolean {
  try {
    return new URL(uploadUrl).pathname.includes('/storage/local/upload/');
  } catch {
    return false;
  }
}

/** True when the presigned URL targets external object storage (S3, etc.). */
export function presignedGoesDirectToStorage(uploadUrl: string): boolean {
  if (!uploadUrl || isLocalStorageUploadUrl(uploadUrl)) return false;
  try {
    const api = new URL(env.apiBaseUrl);
    const target = new URL(uploadUrl);
    return target.hostname !== api.hostname;
  } catch {
    return false;
  }
}

/** Open a presigned storage download URL in a new tab. */
export function openStorageDownloadUrl(downloadUrl: string): void {
  const resolved = rewriteStorageUrl(downloadUrl);
  const opened = window.open(resolved, '_blank', 'noopener,noreferrer');
  if (!opened) {
    window.location.assign(resolved);
  }
}

export async function uploadToPresignedUrl(
  uploadUrl: string,
  file: File | Blob,
  headers: Record<string, string>,
  method = 'PUT',
): Promise<void> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), UPLOAD_TIMEOUT_MS);

  try {
    const response = await fetch(rewriteStorageUrl(uploadUrl), {
      method,
      headers,
      body: file,
      signal: controller.signal,
    });
    if (!response.ok) {
      throw new Error(`Upload failed (${response.status})`);
    }
  } finally {
    clearTimeout(timer);
  }
}

/**
 * Upload via presigned URL when it points at external storage; otherwise use the
 * authenticated API relay (local storage PUT routes fail when keys contain `/`).
 */
export async function transferFileToUploadSession(
  uploadUrl: string | undefined,
  method: string | undefined,
  headers: Record<string, string> | undefined,
  file: File,
  apiUpload: () => Promise<unknown>,
): Promise<void> {
  if (uploadUrl && presignedGoesDirectToStorage(uploadUrl)) {
    try {
      await uploadToPresignedUrl(uploadUrl, file, headers ?? {}, method || 'PUT');
      return;
    } catch {
      // Fall back to the API relay if external storage is unreachable.
    }
  }
  await apiUpload();
}
