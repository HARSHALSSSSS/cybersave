import { manualApplyApi } from '@/services/api';

type OpenManualApplyPortalParams = {
  subServiceId: string;
  stateCode?: string;
  portalUrl: string;
};

/** Create a tracking session and open the official government portal in a new tab. */
export async function openManualApplyPortal({
  subServiceId,
  stateCode,
  portalUrl,
}: OpenManualApplyPortalParams): Promise<void> {
  const session = await manualApplyApi.createSession(subServiceId, stateCode);
  const url = session.officialPortalUrl?.trim() || portalUrl.trim();

  if (!url) {
    throw new Error('Official portal URL is not configured for this service.');
  }

  window.open(url, '_blank', 'noopener,noreferrer');
  await manualApplyApi.markRedirected(session.id).catch(() => undefined);
}
