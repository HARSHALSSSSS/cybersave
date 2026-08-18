import { apiClient } from './client';
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

export interface ProfileDocumentUploadSession {
  uploadSessionId: string;
  storedFileId: string;
  uploadUrl: string;
  method: string;
  headers: Record<string, string>;
  storageKey: string;
  expiresAt: string;
}

export async function listAddresses() {
  const response = await apiClient.get('/profile/addresses');
  return unwrapApiResponse<CitizenAddress[]>(response);
}

export async function createAddress(payload: {
  label: string;
  line1: string;
  line2?: string;
  city: string;
  state: string;
  pincode: string;
  isDefault?: boolean;
}) {
  const response = await apiClient.post('/profile/addresses', payload);
  return unwrapApiResponse<CitizenAddress>(response);
}

export async function updateAddress(
  id: string,
  payload: Partial<{
    label: string;
    line1: string;
    line2: string | null;
    city: string;
    state: string;
    pincode: string;
    isDefault: boolean;
  }>,
) {
  const response = await apiClient.patch(`/profile/addresses/${id}`, payload);
  return unwrapApiResponse<CitizenAddress>(response);
}

export async function listSavedDocuments() {
  const response = await apiClient.get('/profile/documents');
  return unwrapApiResponse<CitizenSavedDocument[]>(response);
}

export async function createSavedDocument(payload: {
  name: string;
  documentType?: string;
  storedFileId?: string;
  mimeType?: string;
  originalFileName?: string;
}) {
  const response = await apiClient.post('/profile/documents', payload);
  return unwrapApiResponse<CitizenSavedDocument>(response);
}

export async function deleteSavedDocument(id: string) {
  const response = await apiClient.delete(`/profile/documents/${id}`);
  return unwrapApiResponse<{ id: string; deleted: boolean }>(response);
}

export async function requestProfileDocumentUpload(originalFileName: string, mimeType: string) {
  const response = await apiClient.post('/profile/documents/uploads/request', {
    originalFileName,
    mimeType,
  });
  return unwrapApiResponse<ProfileDocumentUploadSession>(response);
}

export async function completeProfileDocumentUpload(uploadSessionId: string, storedFileId: string) {
  const response = await apiClient.post('/profile/documents/uploads/complete', {
    uploadSessionId,
    storedFileId,
  });
  return unwrapApiResponse<{
    storedFileId: string;
    originalFileName: string;
    mimeType: string;
    sizeBytes: number;
  }>(response);
}

export async function getSavedDocumentDownload(id: string) {
  const response = await apiClient.get(`/profile/documents/${id}/download`);
  return unwrapApiResponse<{ downloadUrl: string }>(response);
}

export const profileApi = {
  listAddresses,
  createAddress,
  updateAddress,
  listSavedDocuments,
  createSavedDocument,
  deleteSavedDocument,
  requestProfileDocumentUpload,
  completeProfileDocumentUpload,
  getSavedDocumentDownload,
};

export const profileQueryKeys = {
  all: ['profile'] as const,
  addresses: () => [...profileQueryKeys.all, 'addresses'] as const,
  documents: () => [...profileQueryKeys.all, 'documents'] as const,
};
