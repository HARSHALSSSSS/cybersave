import { apiClient } from '@/services/api/client';
import { unwrapApiResponse } from '@/services/api/types';
import type { AdminProfile } from '@/features/authentication/services/auth.service';

export interface UpdateProfilePayload {
  firstName?: string;
  lastName?: string;
}

export interface ChangePasswordPayload {
  currentPassword: string;
  newPassword: string;
}

export async function updateProfile(payload: UpdateProfilePayload): Promise<AdminProfile> {
  const response = await apiClient.patch('/admin/auth/me', payload);
  return unwrapApiResponse<AdminProfile>(response);
}

export async function changePassword(payload: ChangePasswordPayload): Promise<{ message: string }> {
  const response = await apiClient.post('/admin/auth/change-password', payload);
  return unwrapApiResponse<{ message: string }>(response);
}

export const settingsService = {
  updateProfile,
  changePassword,
};
