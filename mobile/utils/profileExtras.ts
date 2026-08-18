import { getString, setString, StorageKeys } from '@services/storage';

export type ProfileExtras = {
  gender?: string;
  dateOfBirth?: string;
  fatherOrGuardianName?: string;
};

function readAll(): Record<string, ProfileExtras> {
  try {
    const raw = getString(StorageKeys.PROFILE_EXTRAS);
    if (!raw) return {};
    return JSON.parse(raw) as Record<string, ProfileExtras>;
  } catch {
    return {};
  }
}

function writeAll(all: Record<string, ProfileExtras>): void {
  setString(StorageKeys.PROFILE_EXTRAS, JSON.stringify(all));
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
  writeAll(all);
}
