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
    return (first + last).toUpperCase() || 'CS';
  }
  const phone = citizen?.phone?.replace(/\D/g, '') ?? '';
  return phone.slice(-2) || 'CS';
}

export type ProfileCompletionStep = {
  id: 'phone' | 'name' | 'email' | 'address' | 'document';
  labelKey:
    | 'completionPhone'
    | 'completionName'
    | 'completionEmail'
    | 'completionAddress'
    | 'completionDocument';
  done: boolean;
};

export type ProfileCompletion = {
  percent: number;
  completedCount: number;
  totalCount: number;
  steps: ProfileCompletionStep[];
};

export function getProfileCompletion(
  citizen: Pick<CitizenProfile, 'firstName' | 'lastName' | 'phone' | 'email'> | null | undefined,
  context?: { addressCount?: number; documentCount?: number },
): ProfileCompletion {
  const steps: ProfileCompletionStep[] = [
    { id: 'phone', labelKey: 'completionPhone', done: Boolean(citizen?.phone?.trim()) },
    { id: 'name', labelKey: 'completionName', done: isProfileComplete(citizen) },
    { id: 'email', labelKey: 'completionEmail', done: Boolean(citizen?.email?.trim()) },
    { id: 'address', labelKey: 'completionAddress', done: (context?.addressCount ?? 0) > 0 },
    { id: 'document', labelKey: 'completionDocument', done: (context?.documentCount ?? 0) > 0 },
  ];
  const completedCount = steps.filter(step => step.done).length;
  return {
    percent: Math.round((completedCount / steps.length) * 100),
    completedCount,
    totalCount: steps.length,
    steps,
  };
}
