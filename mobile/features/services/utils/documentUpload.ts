import { Platform } from 'react-native';
import {
  errorCodes,
  isErrorWithCode,
  keepLocalCopy,
  pick,
  types,
} from '@react-native-documents/picker';

import { ENV } from '@app/config/env';
import { apiClient } from '@services/api/client';

const UPLOAD_TIMEOUT_MS = 120_000;

/** Align storage URLs with the same host the mobile app uses for API calls. */
export function rewriteStorageUrl(url: string): string {
  const apiBase = apiClient.defaults.baseURL ?? ENV.API_BASE_URL;
  try {
    const api = new URL(apiBase);
    const target = new URL(url);
    target.protocol = api.protocol;
    target.hostname = api.hostname;
    target.port = api.port;
    return target.toString();
  } catch {
    return rewriteDevHost(url);
  }
}

/** @deprecated Use rewriteStorageUrl — kept for download links that still call this name. */
export function rewriteDevHost(url: string): string {
  return rewriteStorageUrl(url);
}

const EXT_TO_MIME: Record<string, string> = {
  pdf: 'application/pdf',
  jpg: 'image/jpeg',
  jpeg: 'image/jpeg',
  png: 'image/png',
  doc: 'application/msword',
  docx: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
};

export function normalizeMimeType(mimeType: string, fileName?: string): string {
  const trimmed = (mimeType || '').trim().toLowerCase();
  if (trimmed && trimmed.includes('/')) {
    if (trimmed === 'image/jpg') return 'image/jpeg';
    return trimmed;
  }
  const ext = fileName?.split('.').pop()?.toLowerCase();
  if (ext && EXT_TO_MIME[ext]) return EXT_TO_MIME[ext];
  return trimmed || 'application/octet-stream';
}

export function mimeMatchesRequirement(
  mimeType: string,
  fileName: string,
  allowedMimeTypes: string[] = [],
  allowedFormats: string[] = [],
): boolean {
  const normalized = normalizeMimeType(mimeType, fileName);
  const formats = allowedFormats.map(f => f.toLowerCase().replace(/^\./, ''));
  const mimes = allowedMimeTypes.map(m => normalizeMimeType(m));

  if (mimes.length === 0 && formats.length === 0) return true;
  if (mimes.includes(normalized)) return true;

  const ext = fileName.split('.').pop()?.toLowerCase();
  if (ext && formats.includes(ext)) {
    const expected = EXT_TO_MIME[ext];
    if (!expected || mimes.length === 0) return true;
    return mimes.includes(expected);
  }

  return false;
}

export function validateDocumentForRequirement(
  picked: PickedDocument,
  allowedMimeTypes: string[] = [],
  allowedFormats: string[] = [],
): { ok: true; mimeType: string } | { ok: false; message: string } {
  const mimeType = normalizeMimeType(picked.mimeType, picked.name);
  if (!mimeMatchesRequirement(mimeType, picked.name, allowedMimeTypes, allowedFormats)) {
    const formats =
      allowedFormats.length > 0
        ? allowedFormats.join(', ').toUpperCase()
        : 'PDF, JPG, or PNG';
    return {
      ok: false,
      message: `This document must be ${formats}. Selected: ${picked.name}`,
    };
  }
  return { ok: true, mimeType };
}

export type PickedDocument = {
  name: string;
  mimeType: string;
  uri: string;
  size?: number | null;
};

export type DocumentUploadSession = {
  uploadSessionId: string;
  storedFileId: string;
  uploadUrl: string;
  method: string;
  headers: Record<string, string>;
};

const FORMAT_TO_PICKER: Record<string, string | string[]> = {
  pdf: types.pdf,
  jpg: types.images,
  jpeg: types.images,
  png: types.images,
  image: types.images,
  images: types.images,
  doc: types.doc,
  docx: types.docx,
};

export function pickerTypesForFormats(formats?: string[]): string | string[] {
  if (!formats?.length) {
    return [types.pdf, types.images];
  }
  const mapped = formats.flatMap(format => {
    const key = format.toLowerCase().replace(/^\./, '');
    const value = FORMAT_TO_PICKER[key];
    if (!value) return [];
    return Array.isArray(value) ? value : [value];
  });
  return mapped.length > 0 ? mapped : [types.pdf, types.images];
}

export function mimeForFile(name: string, fallback?: string | null): string {
  return normalizeMimeType(fallback ?? '', name);
}

async function ensureLocalFileUri(uri: string, fileName: string): Promise<string> {
  if (uri.startsWith('file://') || (Platform.OS === 'android' && uri.startsWith('file:/'))) {
    return uri;
  }

  const [local] = await keepLocalCopy({
    files: [{ uri, fileName }],
    destination: 'cachesDirectory',
  });

  if (local.status !== 'success' || !local.localUri) {
    throw new Error(
      'Could not read the selected file. Try again or choose a different document.',
    );
  }

  return local.localUri;
}

async function fetchWithTimeout(
  url: string,
  init: RequestInit,
  timeoutMs = UPLOAD_TIMEOUT_MS,
): Promise<Response> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  try {
    return await fetch(url, { ...init, signal: controller.signal });
  } catch (error) {
    if (error instanceof Error && error.name === 'AbortError') {
      throw new Error('Upload timed out. Check your connection and try again.');
    }
    throw error;
  } finally {
    clearTimeout(timer);
  }
}

/** Upload via authenticated API (same host as all other requests — reliable on device/emulator). */
export async function uploadFileViaApi(
  apiPath: string,
  file: PickedDocument,
): Promise<void> {
  const uri = await ensureLocalFileUri(file.uri, file.name);
  const formData = new FormData();
  formData.append('file', {
    uri,
    name: file.name,
    type: file.mimeType,
  } as unknown as Blob);

  await apiClient.post(apiPath, formData, {
    timeout: UPLOAD_TIMEOUT_MS,
    maxBodyLength: Infinity,
    maxContentLength: Infinity,
    transformRequest: (data, headers) => {
      if (headers) {
        delete headers['Content-Type'];
      }
      return data;
    },
  });
}

/** Fallback: PUT bytes to presigned storage URL (host rewritten to match API). */
export async function uploadPickedDocument(
  uploadUrl: string,
  method: string,
  headers: Record<string, string>,
  fileUri: string,
  mimeType: string,
  fileName = 'document',
): Promise<void> {
  const uri = await ensureLocalFileUri(fileUri, fileName);
  const url = rewriteStorageUrl(uploadUrl);

  const fileResponse = await fetchWithTimeout(uri, {});
  if (!fileResponse.ok) {
    throw new Error('Could not read the selected file.');
  }
  const blob = await fileResponse.blob();

  const response = await fetchWithTimeout(url, {
    method: method || 'PUT',
    headers: {
      ...headers,
      'Content-Type': mimeType || headers['Content-Type'] || 'application/octet-stream',
    },
    body: blob,
  });

  if (!response.ok) {
    throw new Error(`Upload failed (${response.status})`);
  }
}

/**
 * A presigned URL that still points at our own API host (dev discovery rewrites
 * it) buys nothing over the authenticated multipart route.
 */
function presignedGoesDirectToStorage(uploadUrl: string): boolean {
  if (!uploadUrl) return false;
  try {
    const apiBase = apiClient.defaults.baseURL ?? ENV.API_BASE_URL;
    return new URL(uploadUrl).hostname !== new URL(apiBase).hostname;
  } catch {
    return false;
  }
}

/**
 * Transfer file bytes for an open upload session.
 *
 * Uploading straight to storage skips a relay through the API server, which is
 * the slowest part of attaching a document. The authenticated multipart route
 * stays as a fallback for hosts we cannot reach directly.
 */
export async function transferFileToUploadSession(
  file: PickedDocument,
  directUploadPath: string,
  presigned: Pick<DocumentUploadSession, 'uploadUrl' | 'method' | 'headers'>,
): Promise<void> {
  if (presignedGoesDirectToStorage(presigned.uploadUrl)) {
    try {
      await uploadPickedDocument(
        presigned.uploadUrl,
        presigned.method,
        presigned.headers,
        file.uri,
        file.mimeType,
        file.name,
      );
      return;
    } catch {
      // Storage host unreachable — relay through the API instead.
    }
  }

  try {
    await uploadFileViaApi(directUploadPath, file);
  } catch (directError) {
    try {
      await uploadPickedDocument(
        presigned.uploadUrl,
        presigned.method,
        presigned.headers,
        file.uri,
        file.mimeType,
        file.name,
      );
    } catch {
      const message =
        directError instanceof Error
          ? directError.message
          : 'Upload failed. Check your connection and try again.';
      throw new Error(message);
    }
  }
}

export async function pickDocument(allowedFormats?: string[]): Promise<PickedDocument | null> {
  try {
    const [file] = await pick({
      type: pickerTypesForFormats(allowedFormats),
      allowMultiSelection: false,
    });
    if (!file) return null;

    const name = file.name ?? `document_${Date.now()}.pdf`;
    let uri = file.uri;
    const maybeCopyError = (file as { copyError?: string }).copyError;

    if (maybeCopyError || !uri.startsWith('file:')) {
      const [local] = await keepLocalCopy({
        files: [
          {
            uri: file.uri,
            fileName: name,
          },
        ],
        destination: 'cachesDirectory',
      });
      if (local.status !== 'success' || !local.localUri) {
        throw new Error(
          'Could not access the selected file. Try again or pick a different document.',
        );
      }
      uri = local.localUri;
    }

    return {
      name,
      mimeType: mimeForFile(name, file.type),
      uri,
      size: file.size,
    };
  } catch (error) {
    if (isErrorWithCode(error) && error.code === errorCodes.OPERATION_CANCELED) {
      return null;
    }
    throw error;
  }
}
