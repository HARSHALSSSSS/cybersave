import { apiClient } from './client';
import { unwrapApiResponse } from './types';
import { fallbackScheme, fallbackSchemes } from './schemes.fallback';

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

function unwrapList(response: { data: unknown }): GovernmentScheme[] {
  const body = response.data as { success?: boolean; data?: unknown } | GovernmentScheme[];
  if (Array.isArray(body)) return body;
  if (body && typeof body === 'object' && Array.isArray((body as { data?: unknown }).data)) {
    return (body as { data: GovernmentScheme[] }).data;
  }
  return [];
}

export async function getGovernmentSchemes(category?: string) {
  try {
    const response = await apiClient.get('/schemes', {
      params: category && category !== 'All' ? { category } : undefined,
    });
    const list = unwrapList(response);
    if (list.length > 0) return list;
  } catch {
    // Hosted API may not have /schemes deployed yet.
  }
  return fallbackSchemes(category);
}

export async function getGovernmentScheme(idOrSlug: string) {
  try {
    const response = await apiClient.get(`/schemes/${idOrSlug}`);
    return unwrapApiResponse<GovernmentScheme>(response);
  } catch {
    const local = fallbackScheme(idOrSlug);
    if (local) return local;
    throw new Error('Scheme not found');
  }
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
