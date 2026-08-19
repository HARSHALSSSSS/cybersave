import { apiClient } from './client';
import { unwrapApiResponse } from './types';

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
  tokenType: string;
}

export interface CitizenProfile {
  id: string;
  phone: string;
  email?: string | null;
  firstName?: string | null;
  lastName?: string | null;
  status?: string;
  createdAt?: string;
}

export async function requestOtp(phone: string) {
  const response = await apiClient.post('/auth/otp/request', { phone });
  return unwrapApiResponse<{ message: string; expiresAt: string; devCode?: string }>(response);
}

export async function verifyOtp(phone: string, code: string) {
  const response = await apiClient.post('/auth/otp/verify', { phone, code: code.trim() });
  return unwrapApiResponse<AuthTokens>(response);
}

export async function verifyFirebaseToken(idToken: string) {
  const response = await apiClient.post('/auth/firebase/verify', { idToken });
  return unwrapApiResponse<AuthTokens>(response);
}

export async function getAuthConfig() {
  const response = await apiClient.get('/auth/config');
  return unwrapApiResponse<{
    authProvider: 'firebase' | 'whatsapp' | 'legacy';
    otpChannel: 'firebase' | 'whatsapp' | 'sms';
    firebaseConfigured: boolean;
    whatsappConfigured: boolean;
    otpLength: number;
  }>(response);
}

export async function getMe() {
  const response = await apiClient.get('/auth/me');
  return unwrapApiResponse<CitizenProfile>(response);
}

export async function updateProfile(payload: {
  firstName?: string;
  lastName?: string;
  email?: string;
}) {
  const response = await apiClient.patch('/auth/me', payload);
  return unwrapApiResponse<CitizenProfile>(response);
}

export async function logout(refreshToken: string) {
  await apiClient.post('/auth/logout', { refreshToken }).catch(() => undefined);
}

export const authApi = {
  requestOtp,
  verifyOtp,
  verifyFirebaseToken,
  getAuthConfig,
  getMe,
  updateProfile,
  logout,
};
