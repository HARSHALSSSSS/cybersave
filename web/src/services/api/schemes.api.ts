import { apiClient } from './client';
import { unwrapApiResponse } from './types';

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
}

export async function getGovernmentSchemes(category?: string) {
  const response = await apiClient.get('/schemes', {
    params: category && category !== 'All' ? { category } : undefined,
  });
  return unwrapApiResponse<GovernmentScheme[]>(response);
}

export async function getGovernmentScheme(idOrSlug: string) {
  const response = await apiClient.get(`/schemes/${idOrSlug}`);
  return unwrapApiResponse<GovernmentScheme>(response);
}

export const schemesQueryKeys = {
  all: ['schemes'] as const,
  list: (category = 'All') => [...schemesQueryKeys.all, 'list', category] as const,
  detail: (idOrSlug: string) => [...schemesQueryKeys.all, 'detail', idOrSlug] as const,
};

export const schemesApi = {
  getGovernmentSchemes,
  getGovernmentScheme,
};
