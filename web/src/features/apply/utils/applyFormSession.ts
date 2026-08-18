const PREFIX = 'cybersave:apply-form:';

function storageKey(serviceKey: string, applicationId?: string) {
  return `${PREFIX}${serviceKey}:${applicationId ?? 'draft'}`;
}

export function readApplyFormSession(
  serviceKey: string,
  applicationId?: string,
): Record<string, unknown> | null {
  try {
    const raw = sessionStorage.getItem(storageKey(serviceKey, applicationId));
    if (!raw) return null;
    const parsed = JSON.parse(raw) as Record<string, unknown>;
    return parsed && typeof parsed === 'object' ? parsed : null;
  } catch {
    return null;
  }
}

export function writeApplyFormSession(
  serviceKey: string,
  applicationId: string | undefined,
  values: Record<string, unknown>,
) {
  try {
    if (Object.keys(values).length === 0) {
      sessionStorage.removeItem(storageKey(serviceKey, applicationId));
      return;
    }
    sessionStorage.setItem(storageKey(serviceKey, applicationId), JSON.stringify(values));
  } catch {
    // Ignore quota / private mode errors.
  }
}

export function clearApplyFormSession(serviceKey: string, applicationId?: string) {
  try {
    sessionStorage.removeItem(storageKey(serviceKey, applicationId));
  } catch {
    // Ignore.
  }
}
