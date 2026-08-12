import type { CitizenProfile } from '@services/api';

/** Profile is complete once the citizen has saved a real name (not just phone login). */
export function isProfileComplete(
  citizen: Pick<CitizenProfile, 'firstName' | 'lastName' | 'phone'> | null | undefined,
): boolean {
  const first = citizen?.firstName?.trim() ?? '';
  if (first.length < 2) return false;
  // Reject accidental saves where phone was used as the display name
  const digitsOnly = first.replace(/\D/g, '');
  if (digitsOnly.length >= 8 && digitsOnly === first.replace(/\s+/g, '')) {
    return false;
  }
  return true;
}

/** First name for greeting — only when profile is complete; never falls back to phone. */
export function getProfileGreetingName(
  citizen: Pick<CitizenProfile, 'firstName' | 'lastName' | 'phone'> | null | undefined,
): string | null {
  if (!isProfileComplete(citizen)) return null;
  const first = citizen?.firstName?.trim() ?? '';
  return first.split(/\s+/)[0] || null;
}

export function getProfileInitials(
  citizen: Pick<CitizenProfile, 'firstName' | 'lastName' | 'phone'> | null | undefined,
): string {
  if (isProfileComplete(citizen)) {
    const first = citizen?.firstName?.trim()?.[0] ?? '';
    const last = citizen?.lastName?.trim()?.[0] ?? '';
    return (first + last).toUpperCase() || 'U';
  }
  return '?';
}
