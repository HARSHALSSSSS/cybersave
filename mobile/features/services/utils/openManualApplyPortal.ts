import { Linking } from 'react-native';

import { manualApplyApi } from '@services/api';

type OpenManualApplyPortalParams = {
  optionId: string;
  stateCode?: string;
  portalUrl: string;
};

/** Create a tracking session and open the official government portal in the device browser. */
export async function openManualApplyPortal({
  optionId,
  stateCode,
  portalUrl,
}: OpenManualApplyPortalParams): Promise<void> {
  const session = await manualApplyApi.createSession(optionId, stateCode);
  const url = session.officialPortalUrl?.trim() || portalUrl.trim();

  if (!url) {
    throw new Error('Official portal URL is not configured for this service.');
  }

  const canOpen = await Linking.canOpenURL(url);
  if (!canOpen) {
    throw new Error('Could not open the official portal on this device.');
  }

  await Linking.openURL(url);
  await manualApplyApi.markRedirected(session.id).catch(() => undefined);
}
