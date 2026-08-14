import type { CitizenProfile } from '@/services/api';

export function isProfileComplete(
  citizen: Pick<CitizenProfile, 'firstName' | 'lastName' | 'phone'> | null | undefined,
): boolean {
  const first = citizen?.firstName?.trim() ?? '';
  if (first.length < 2) return false;
  const digitsOnly = first.replace(/\D/g, '');
  if (digitsOnly.length >= 8 && digitsOnly === first.replace(/\s+/g, '')) return false;
  return true;
}

export function getProfileGreetingName(
  citizen: Pick<CitizenProfile, 'firstName' | 'lastName' | 'phone'> | null | undefined,
): string | null {
  if (!isProfileComplete(citizen)) return null;
  const first = citizen?.firstName?.trim() ?? '';
  return first.split(/\s+/)[0] || null;
}

export function getProfileDisplayName(
  citizen: Pick<CitizenProfile, 'firstName' | 'lastName' | 'phone'> | null | undefined,
): string {
  if (isProfileComplete(citizen)) {
    return [citizen?.firstName, citizen?.lastName].filter(Boolean).join(' ').trim();
  }
  return citizen?.phone ?? 'Citizen';
}
