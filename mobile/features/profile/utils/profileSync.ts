import type { QueryClient } from '@tanstack/react-query';
import type { AppDispatch } from '@app/store';
import { setCitizen } from '@features/auth/store/authSlice';
import { authApi, type CitizenProfile } from '@services/api';
import { isProfileComplete } from '@utils/profile';

export type SaveProfilePayload = {
  firstName: string;
  lastName?: string;
  email?: string;
};

export function parseFullName(fullName: string): SaveProfilePayload {
  const parts = fullName.trim().split(/\s+/).filter(Boolean);
  const firstName = parts[0] ?? '';
  const lastName = parts.slice(1).join(' ') || undefined;
  return { firstName, lastName };
}

export function validateProfileName(fullName: string): string | null {
  const { firstName } = parseFullName(fullName);
  if (firstName.length < 2) {
    return 'Please enter your full name (at least first and last name).';
  }
  const digitsOnly = firstName.replace(/\D/g, '');
  if (digitsOnly.length >= 8 && digitsOnly === firstName.replace(/\s+/g, '')) {
    return 'Please enter your real name, not your phone number.';
  }
  return null;
}

export async function syncCitizenProfile(
  dispatch: AppDispatch,
  queryClient: QueryClient,
  payload: SaveProfilePayload,
): Promise<CitizenProfile> {
  const updated = await authApi.updateProfile({
    firstName: payload.firstName,
    lastName: payload.lastName,
    email: payload.email,
  });
  dispatch(setCitizen(updated));
  queryClient.setQueryData(['citizen', 'me'], updated);
  await queryClient.invalidateQueries({ queryKey: ['citizen', 'me'] });
  return updated;
}

export function profileJustCompleted(
  before: CitizenProfile | null | undefined,
  after: CitizenProfile,
): boolean {
  return !isProfileComplete(before) && isProfileComplete(after);
}
