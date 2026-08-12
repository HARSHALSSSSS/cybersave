import { apiClient } from './client';
import { unwrapApiResponse } from './types';

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
}

export async function getHomeBanners(placement = 'home') {
  const response = await apiClient.get('/home/banners', { params: { placement } });
  return unwrapApiResponse<HomeBanner[]>(response);
}

export const homeBannersQueryKeys = {
  all: ['home-banners'] as const,
  list: (placement: string) => [...homeBannersQueryKeys.all, placement] as const,
};

export const homeBannersApi = {
  getHomeBanners,
};
