import { apiClient } from '@/services/api/client';
import { unwrapApiResponse, unwrapPaginated } from '@/services/api/types';

export interface MainService {
  id: string;
  name: string;
  slug: string;
  description?: string | null;
  iconUrl?: string | null;
  sortOrder: number;
  status: string;
  isVisible: boolean;
  subServiceCount?: number;
}

export interface SubServiceSummary {
  id: string;
  name: string;
  slug: string;
  description?: string | null;
  sortOrder: number;
  status: string;
  latestVersion?: {
    id: string;
    versionNumber: number;
    lifecycleStatus: string;
  } | null;
}

export interface MainServiceDetail extends MainService {
  subServices: SubServiceSummary[];
}

export async function listMainServices(page = 1, limit = 50) {
  const response = await apiClient.get('/admin/main-services', { params: { page, limit } });
  return unwrapPaginated<MainService[]>(response);
}

export async function getMainService(id: string) {
  const response = await apiClient.get(`/admin/main-services/${id}`);
  return unwrapApiResponse<MainServiceDetail>(response);
}

export async function createMainService(payload: {
  name: string;
  description?: string;
  isVisible?: boolean;
}) {
  const response = await apiClient.post('/admin/main-services', payload);
  return unwrapApiResponse<MainService>(response);
}

export async function createSubService(
  mainServiceId: string,
  payload: { name: string; description?: string },
) {
  const response = await apiClient.post(
    `/admin/main-services/${mainServiceId}/sub-services`,
    payload,
  );
  return unwrapApiResponse<{
    subService: SubServiceSummary;
    draftVersionId: string;
  }>(response);
}

export async function createVersion(
  subServiceId: string,
  payload?: { cloneFromVersionId?: string },
) {
  const response = await apiClient.post(`/admin/sub-services/${subServiceId}/versions`, payload ?? {});
  return unwrapApiResponse<{ id: string; lifecycleStatus?: string }>(response);
}

export async function getServiceVersion(versionId: string) {
  const response = await apiClient.get(`/admin/service-versions/${versionId}`);
  return unwrapApiResponse<Record<string, unknown>>(response);
}

export async function updateOverview(
  versionId: string,
  payload: Record<string, unknown>,
) {
  const response = await apiClient.put(`/admin/service-versions/${versionId}/overview`, payload);
  return unwrapApiResponse(response);
}

export async function saveForm(versionId: string, payload: { fields: unknown[]; conditions?: unknown[] }) {
  const response = await apiClient.put(`/admin/service-versions/${versionId}/form`, payload);
  return unwrapApiResponse(response);
}

export async function saveDocuments(versionId: string, payload: { requirements: unknown[] }) {
  const response = await apiClient.put(`/admin/service-versions/${versionId}/documents`, payload);
  return unwrapApiResponse(response);
}

export async function savePricing(versionId: string, payload: Record<string, unknown>) {
  const response = await apiClient.put(`/admin/service-versions/${versionId}/pricing`, payload);
  return unwrapApiResponse(response);
}

export async function saveFulfillment(versionId: string, payload: Record<string, unknown>) {
  const response = await apiClient.put(`/admin/service-versions/${versionId}/fulfillment`, payload);
  return unwrapApiResponse(response);
}

export async function saveWorkflow(
  versionId: string,
  payload: { steps: unknown[]; transitions: unknown[] },
) {
  const response = await apiClient.put(`/admin/service-versions/${versionId}/workflow`, payload);
  return unwrapApiResponse(response);
}

export async function validateVersion(versionId: string) {
  const response = await apiClient.post(`/admin/service-versions/${versionId}/validate`);
  return unwrapApiResponse<{ valid: boolean; errors: string[]; checklist: Record<string, unknown> }>(response);
}

export async function publishVersion(versionId: string) {
  const response = await apiClient.post(`/admin/service-versions/${versionId}/publish`);
  return unwrapApiResponse(response);
}

export const servicesApi = {
  listMainServices,
  getMainService,
  createMainService,
  createSubService,
  createVersion,
  getServiceVersion,
  updateOverview,
  saveForm,
  saveDocuments,
  savePricing,
  saveFulfillment,
  saveWorkflow,
  validateVersion,
  publishVersion,
};
