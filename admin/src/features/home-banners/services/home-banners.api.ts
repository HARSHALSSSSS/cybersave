import { apiClient } from '@/services/api/client';
import { unwrapApiResponse } from '@/services/api/types';

export interface HomeBanner {
  id: string;
  tag: string | null;
  title: string;
  description: string | null;
  ctaLabel: string;
  imageUrl: string | null;
  gradientStart: string;
  gradientMiddle: string | null;
  gradientEnd: string;
  mainServiceId: string;
  subServiceId: string;
  mainServiceName: string;
  subServiceName: string;
  mainServiceSlug: string;
  subServiceSlug: string;
  placement: string;
  displayOrder: number;
  isActive: boolean;
  startsAt: string | null;
  endsAt: string | null;
}

export interface AdminHomeBanner extends HomeBanner {
  isPublished?: boolean;
  servicePath?: string;
}

export interface CreateHomeBannerPayload {
  tag?: string;
  title: string;
  description?: string;
  ctaLabel?: string;
  imageUrl?: string;
  gradientStart?: string;
  gradientMiddle?: string;
  gradientEnd?: string;
  mainServiceId: string;
  subServiceId: string;
  placement?: string;
  displayOrder?: number;
  isActive?: boolean;
  startsAt?: string;
  endsAt?: string;
}

export type UpdateHomeBannerPayload = Partial<CreateHomeBannerPayload>;

export async function listHomeBanners(placement?: string) {
  const response = await apiClient.get('/admin/home-banners', {
    params: placement ? { placement } : undefined,
  });
  return unwrapApiResponse<AdminHomeBanner[]>(response);
}

export async function createHomeBanner(payload: CreateHomeBannerPayload) {
  const response = await apiClient.post('/admin/home-banners', payload);
  return unwrapApiResponse<AdminHomeBanner>(response);
}

export async function updateHomeBanner(id: string, payload: UpdateHomeBannerPayload) {
  const response = await apiClient.patch(`/admin/home-banners/${id}`, payload);
  return unwrapApiResponse<AdminHomeBanner>(response);
}

export async function deleteHomeBanner(id: string) {
  const response = await apiClient.delete(`/admin/home-banners/${id}`);
  return unwrapApiResponse<{ deleted: boolean }>(response);
}

export async function reorderHomeBanners(orderedIds: string[]) {
  const response = await apiClient.post('/admin/home-banners/reorder', { orderedIds });
  return unwrapApiResponse<AdminHomeBanner[]>(response);
}
