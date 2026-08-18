import type { CitizenProfile } from '@services/api';
import { getString, remove, setString, StorageKeys } from '@services/storage';

/**
 * Last known profile, persisted so a returning user lands on the home screen
 * immediately instead of waiting for a network round trip on cold start.
 */
export function cacheCitizenProfile(citizen: CitizenProfile): void {
  try {
    setString(StorageKeys.CITIZEN_PROFILE, JSON.stringify(citizen));
  } catch {
    // A cache miss next launch is harmless.
  }
}

export function readCachedCitizenProfile(): CitizenProfile | null {
  const raw = getString(StorageKeys.CITIZEN_PROFILE);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as CitizenProfile;
  } catch {
    return null;
  }
}

export function clearCachedCitizenProfile(): void {
  remove(StorageKeys.CITIZEN_PROFILE);
}
