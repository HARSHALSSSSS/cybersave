import { useEffect } from 'react';
import { USE_HOSTED_API, shouldUseDevDiscovery } from '@app/config/env';
import { servicesApi, servicesQueryKeys } from '@services/api';
import { ensureApiReachable } from '@services/api/bootstrapApi';
import { queryClient } from './QueryProvider';

/** Re-validates dev API host when the app mounts (e.g. after device/network change). */
export function ApiWarmup() {
  useEffect(() => {
    async function warmup() {
      if (shouldUseDevDiscovery()) {
        await ensureApiReachable(3000);
        return;
      }
      if (!USE_HOSTED_API) {
        return;
      }
      await ensureApiReachable(45000);
      void queryClient.prefetchQuery({
        queryKey: servicesQueryKeys.catalog(),
        queryFn: () => servicesApi.getServicesCatalog(),
        staleTime: 1000 * 60 * 10,
      });
    }

    void warmup();
  }, []);

  return null;
}
