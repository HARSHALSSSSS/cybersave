import { useEffect } from 'react';
import { USE_HOSTED_API } from '@app/config/env';
import { ensureApiReachable } from '@services/api/bootstrapApi';

/** Re-validates dev API host when the app mounts (e.g. after device/network change). */
export function ApiWarmup() {
  useEffect(() => {
    if (__DEV__) {
      void ensureApiReachable(USE_HOSTED_API ? 60000 : 3000);
    }
  }, []);

  return null;
}
