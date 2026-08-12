import { useEffect } from 'react';
import { ensureApiReachable } from '@services/api/bootstrapApi';

/** Re-validates dev API host when the app mounts (e.g. after device/network change). */
export function ApiWarmup() {
  useEffect(() => {
    if (__DEV__) {
      void ensureApiReachable(3000);
    }
  }, []);

  return null;
}
