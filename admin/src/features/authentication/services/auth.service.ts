import { apiClient, AUTH_TOKEN_STORAGE_KEY } from '@/services/api/client';
import { unwrapApiResponse } from '@/services/api/types';

export interface LoginPayload {
  email: string;
  password: string;
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
  tokenType: string;
  roles?: string[];
  permissions?: string[];
}

export interface AdminProfile {
  id: string;
  email: string;
  firstName?: string | null;
  lastName?: string | null;
  status: string;
  roles: Array<{ id: string; key: string; name: string }>;
  permissions: string[];
}

export async function login(payload: LoginPayload): Promise<AuthTokens> {
  const response = await apiClient.post('/admin/auth/login', payload);
  const data = unwrapApiResponse<AuthTokens>(response);
  localStorage.setItem(AUTH_TOKEN_STORAGE_KEY, data.accessToken);
  localStorage.setItem('cybersave_admin_refresh_token', data.refreshToken);
  return data;
}

export async function logout(): Promise<void> {
  const refreshToken = localStorage.getItem('cybersave_admin_refresh_token');
  if (refreshToken) {
    try {
      await apiClient.post('/admin/auth/logout', { refreshToken });
    } catch {
      // ignore logout errors
    }
  }
  localStorage.removeItem(AUTH_TOKEN_STORAGE_KEY);
  localStorage.removeItem('cybersave_admin_refresh_token');
}

export async function getMe(): Promise<AdminProfile> {
  const response = await apiClient.get('/admin/auth/me');
  return unwrapApiResponse<AdminProfile>(response);
}
