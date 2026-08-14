import { env } from '@/app/config/env';

const UPLOAD_TIMEOUT_MS = 120_000;

/** Align presigned storage URLs with the API base URL (fixes localhost in dev). */
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
