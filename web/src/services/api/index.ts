export {
  apiClient,
  clearAuthTokens,
  getAccessToken,
  getRefreshToken,
  setAuthTokens,
} from './client';
export * from './auth.api';
export * from './types';
export * from './services.api';
export * from './applications.api';
export * from './profile.api';
export * from './support.api';
export * from './bill-payments.api';
export * from './manualApply.api';
export * from './notifications.api';
export * from './payments.api';

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
  list: (placement: string) => ['home-banners', placement] as const,
};

export const homeBannersApi = { getHomeBanners };
