export type ProfileExtras = {
  gender?: string;
  dateOfBirth?: string;
  fatherOrGuardianName?: string;
};

const cache = new Map<string, ProfileExtras>();

export function getProfileExtras(citizenId: string | undefined): ProfileExtras {
  if (!citizenId) return {};
  return cache.get(citizenId) ?? {};
}

export function saveProfileExtras(citizenId: string, extras: ProfileExtras): void {
  cache.set(citizenId, {
    gender: extras.gender?.trim() || undefined,
    dateOfBirth: extras.dateOfBirth?.trim() || undefined,
    fatherOrGuardianName: extras.fatherOrGuardianName?.trim() || undefined,
  });
}
