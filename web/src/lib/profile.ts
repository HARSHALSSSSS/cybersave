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

export type ProfileCompletionStep = {
  id: 'phone' | 'name' | 'email' | 'address' | 'document';
  label: string;
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
    { id: 'phone', label: 'Mobile number verified', done: Boolean(citizen?.phone?.trim()) },
    { id: 'name', label: 'Legal name saved', done: isProfileComplete(citizen) },
    { id: 'email', label: 'Email address added', done: Boolean(citizen?.email?.trim()) },
    { id: 'address', label: 'Address on file', done: (context?.addressCount ?? 0) > 0 },
    { id: 'document', label: 'Document in vault', done: (context?.documentCount ?? 0) > 0 },
  ];
  const completedCount = steps.filter(step => step.done).length;
  return {
    percent: Math.round((completedCount / steps.length) * 100),
    completedCount,
    totalCount: steps.length,
    steps,
  };
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
