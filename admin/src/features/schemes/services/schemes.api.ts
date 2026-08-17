import { apiClient } from '@/services/api/client';
import { unwrapApiResponse } from '@/services/api/types';

export const SCHEME_CATEGORIES = [
  'Housing',
  'Agriculture',
  'Health',
  'Education',
  'Social Welfare',
  'Women & Child',
  'Financial Inclusion',
  'Employment',
  'Other',
] as const;

export interface GovernmentScheme {
  id: string;
  name: string;
  slug: string;
  ministry: string | null;
  category: string;
  description: string;
  whoCanApply: string;
  eligibility: string;
  documentsRequired: string[];
  officialPortalUrl: string;
  officialPortalLabel: string;
  displayOrder: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface SchemePayload {
  name: string;
  ministry?: string;
  category: string;
  description: string;
  whoCanApply: string;
  eligibility: string;
  documentsRequired?: string[];
  officialPortalUrl: string;
  officialPortalLabel?: string;
  displayOrder?: number;
  isActive?: boolean;
}

export async function listAdminSchemes() {
  const response = await apiClient.get('/admin/schemes');
  return unwrapApiResponse<GovernmentScheme[]>(response);
}

export async function createScheme(payload: SchemePayload) {
  const response = await apiClient.post('/admin/schemes', payload);
  return unwrapApiResponse<GovernmentScheme>(response);
}

export async function updateScheme(id: string, payload: Partial<SchemePayload>) {
  const response = await apiClient.patch(`/admin/schemes/${id}`, payload);
  return unwrapApiResponse<GovernmentScheme>(response);
}

export async function deleteScheme(id: string) {
  const response = await apiClient.delete(`/admin/schemes/${id}`);
  return unwrapApiResponse<{ deleted: boolean }>(response);
}
