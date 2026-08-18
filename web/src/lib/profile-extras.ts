import { GENDER_OPTIONS } from '@/lib/indian-states';

export type ProfileExtras = {
  gender?: string;
  dateOfBirth?: string;
  fatherOrGuardianName?: string;
};

const STORAGE_KEY = 'cybersave_profile_extras';

function readAll(): Record<string, ProfileExtras> {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return {};
    return JSON.parse(raw) as Record<string, ProfileExtras>;
  } catch {
    return {};
  }
}

export function getProfileExtras(citizenId: string | undefined): ProfileExtras {
  if (!citizenId) return {};
  return readAll()[citizenId] ?? {};
}

export function saveProfileExtras(citizenId: string, extras: ProfileExtras): void {
  const all = readAll();
  all[citizenId] = {
    gender: extras.gender?.trim() || undefined,
    dateOfBirth: extras.dateOfBirth?.trim() || undefined,
    fatherOrGuardianName: extras.fatherOrGuardianName?.trim() || undefined,
  };
  localStorage.setItem(STORAGE_KEY, JSON.stringify(all));
}

export function normalizeGender(value: string | undefined): string {
  if (!value) return GENDER_OPTIONS[0];
  return GENDER_OPTIONS.includes(value as (typeof GENDER_OPTIONS)[number]) ? value : GENDER_OPTIONS[0];
}
