const STORAGE_PREFIX = 'cybersave_wizard_version_';

export function getWizardVersionId(subServiceId: string): string | null {
  return sessionStorage.getItem(`${STORAGE_PREFIX}${subServiceId}`);
}

export function setWizardVersionId(subServiceId: string, versionId: string): void {
  sessionStorage.setItem(`${STORAGE_PREFIX}${subServiceId}`, versionId);
}
