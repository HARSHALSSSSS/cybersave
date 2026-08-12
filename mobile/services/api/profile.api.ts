import { shouldUseDevDiscovery } from '@app/config/env';
import { apiClient } from './client';
import {
  devAwareDelete,
  devAwareGet,
  devAwarePatch,
  devAwarePost,
} from './devRequest';
import { unwrapApiResponse } from './types';

export interface CitizenAddress {
  id: string;
  citizenId: string;
  label: string;
  line1: string;
  line2: string | null;
  city: string;
  state: string;
  pincode: string;
  isDefault: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CreateAddressPayload {
  label: string;
  line1: string;
  line2?: string;
  city: string;
  state: string;
  pincode: string;
  isDefault?: boolean;
}

export interface UpdateAddressPayload {
  label?: string;
  line1?: string;
  line2?: string | null;
  city?: string;
  state?: string;
  pincode?: string;
  isDefault?: boolean;
}

export interface CitizenSavedDocument {
  id: string;
  citizenId: string;
  name: string;
  documentType: string | null;
  storedFileId: string | null;
  mimeType: string | null;
  originalFileName: string | null;
  createdAt: string;
  storedFile?: {
    id: string;
    originalFileName: string;
    mimeType: string;
    sizeBytes: number;
    status: string;
  } | null;
}

export interface CreateSavedDocumentPayload {
  name: string;
  documentType?: string;
  storedFileId?: string;
  mimeType?: string;
  originalFileName?: string;
}

export interface ProfileDocumentUploadSession {
  uploadSessionId: string;
  storedFileId: string;
  uploadUrl: string;
  method: string;
  headers: Record<string, string>;
  storageKey: string;
  expiresAt: string;
}

function unwrapEnvelope<T>(body: unknown): T {
  if (
    body &&
    typeof body === 'object' &&
    'success' in body &&
    (body as { success: boolean }).success
  ) {
    return (body as { data: T }).data;
  }
  return body as T;
}

export async function listAddresses() {
  if (shouldUseDevDiscovery()) {
    return devAwareGet<unknown>('/profile/addresses').then(unwrapEnvelope<CitizenAddress[]>);
  }
  const response = await apiClient.get('/profile/addresses');
  return unwrapApiResponse<CitizenAddress[]>(response);
}

export async function createAddress(payload: CreateAddressPayload) {
  if (shouldUseDevDiscovery()) {
    return devAwarePost<unknown>('/profile/addresses', payload).then(
      unwrapEnvelope<CitizenAddress>,
    );
  }
  const response = await apiClient.post('/profile/addresses', payload);
  return unwrapApiResponse<CitizenAddress>(response);
}

export async function updateAddress(id: string, payload: UpdateAddressPayload) {
  if (shouldUseDevDiscovery()) {
    return devAwarePatch<unknown>(`/profile/addresses/${id}`, payload).then(
      unwrapEnvelope<CitizenAddress>,
    );
  }
  const response = await apiClient.patch(`/profile/addresses/${id}`, payload);
  return unwrapApiResponse<CitizenAddress>(response);
}

export async function deleteAddress(id: string) {
  if (shouldUseDevDiscovery()) {
    return devAwareDelete<unknown>(`/profile/addresses/${id}`).then(
      unwrapEnvelope<{ id: string; deleted: boolean }>,
    );
  }
  const response = await apiClient.delete(`/profile/addresses/${id}`);
  return unwrapApiResponse<{ id: string; deleted: boolean }>(response);
}

export async function listSavedDocuments() {
  if (shouldUseDevDiscovery()) {
    return devAwareGet<unknown>('/profile/documents').then(
      unwrapEnvelope<CitizenSavedDocument[]>,
    );
  }
  const response = await apiClient.get('/profile/documents');
  return unwrapApiResponse<CitizenSavedDocument[]>(response);
}

export async function createSavedDocument(payload: CreateSavedDocumentPayload) {
  if (shouldUseDevDiscovery()) {
    return devAwarePost<unknown>('/profile/documents', payload).then(
      unwrapEnvelope<CitizenSavedDocument>,
    );
  }
  const response = await apiClient.post('/profile/documents', payload);
  return unwrapApiResponse<CitizenSavedDocument>(response);
}

export async function deleteSavedDocument(id: string) {
  if (shouldUseDevDiscovery()) {
    return devAwareDelete<unknown>(`/profile/documents/${id}`).then(
      unwrapEnvelope<{ id: string; deleted: boolean }>,
    );
  }
  const response = await apiClient.delete(`/profile/documents/${id}`);
  return unwrapApiResponse<{ id: string; deleted: boolean }>(response);
}

export async function requestDocumentUpload(originalFileName: string, mimeType: string) {
  const body = { originalFileName, mimeType };
  if (shouldUseDevDiscovery()) {
    return devAwarePost<unknown>('/profile/documents/uploads/request', body).then(
      unwrapEnvelope<ProfileDocumentUploadSession>,
    );
  }
  const response = await apiClient.post('/profile/documents/uploads/request', body);
  return unwrapApiResponse<ProfileDocumentUploadSession>(response);
}

export async function completeDocumentUpload(uploadSessionId: string, storedFileId: string) {
  const body = { uploadSessionId, storedFileId };
  if (shouldUseDevDiscovery()) {
    return devAwarePost<unknown>('/profile/documents/uploads/complete', body).then(
      unwrapEnvelope<{
        storedFileId: string;
        originalFileName: string;
        mimeType: string;
        sizeBytes: number;
      }>,
    );
  }
  const response = await apiClient.post('/profile/documents/uploads/complete', body);
  return unwrapApiResponse<{
    storedFileId: string;
    originalFileName: string;
    mimeType: string;
    sizeBytes: number;
  }>(response);
}

export async function getSavedDocumentDownload(id: string) {
  if (shouldUseDevDiscovery()) {
    return devAwareGet<unknown>(`/profile/documents/${id}/download`).then(
      unwrapEnvelope<{ downloadUrl: string }>,
    );
  }
  const response = await apiClient.get(`/profile/documents/${id}/download`);
  return unwrapApiResponse<{ downloadUrl: string }>(response);
}

export const profileApi = {
  listAddresses,
  createAddress,
  updateAddress,
  deleteAddress,
  listSavedDocuments,
  createSavedDocument,
  deleteSavedDocument,
  requestDocumentUpload,
  completeDocumentUpload,
  getSavedDocumentDownload,
};

export const profileQueryKeys = {
  all: ['profile'] as const,
  addresses: () => [...profileQueryKeys.all, 'addresses'] as const,
  documents: () => [...profileQueryKeys.all, 'documents'] as const,
};
