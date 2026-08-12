import { useEffect } from 'react';
import { USE_HOSTED_API, shouldUseDevDiscovery } from '@app/config/env';
import { ensureApiReachable } from '@services/api/bootstrapApi';

/** Re-validates dev API host when the app mounts (e.g. after device/network change). */
export function ApiWarmup() {
  useEffect(() => {
    if (shouldUseDevDiscovery()) {
      void ensureApiReachable(3000);
    } else if (USE_HOSTED_API) {
      void ensureApiReachable(8000);
    }
  }, []);

  return null;
}
