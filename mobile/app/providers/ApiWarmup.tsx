import { useEffect } from 'react';
import { USE_HOSTED_API, shouldUseDevDiscovery } from '@app/config/env';
import {
  homeBannersQueryKeys,
  notificationsQueryKeys,
  servicesApi,
  servicesQueryKeys,
  walletApi,
  walletQueryKeys,
} from '@services/api';
import { ensureApiReachable } from '@services/api/bootstrapApi';
import { getString, StorageKeys } from '@utils/storage';
import { queryClient } from './QueryProvider';

/** Prefetch catalog and common lists so tabs feel instant on slow APIs. */
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
      await ensureApiReachable(4000);

      const prefetch = [
        queryClient.prefetchQuery({
          queryKey: servicesQueryKeys.catalog(),
          queryFn: () => servicesApi.getServicesCatalog(),
          staleTime: 1000 * 60 * 15,
        }),
        queryClient.prefetchQuery({
          queryKey: homeBannersQueryKeys.list('home'),
          queryFn: async () => {
            const { homeBannersApi } = await import('@services/api');
            return homeBannersApi.getHomeBanners('home');
          },
          staleTime: 1000 * 60 * 15,
        }),
        queryClient.prefetchQuery({
          queryKey: notificationsQueryKeys.unread(),
          queryFn: async () => {
            const { notificationsApi } = await import('@services/api');
            const result = await notificationsApi.listNotifications(1, 10);
            return result.data.filter(n => !n.readAt).length;
          },
          staleTime: 1000 * 60 * 2,
        }),
      ];

      if (getString(StorageKeys.AUTH_TOKEN)) {
        prefetch.push(
          queryClient.prefetchQuery({
            queryKey: walletQueryKeys.summary(),
            queryFn: () => walletApi.getWalletSummary(),
            staleTime: 1000 * 60 * 15,
          }),
        );
      }

      void Promise.allSettled(prefetch);
    }

    void warmup();
  }, []);

  return null;
}
