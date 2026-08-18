import { useEffect } from 'react';
import { USE_HOSTED_API, shouldUseDevDiscovery } from '@app/config/env';
import {
  applicationsApi,
  applicationsQueryKeys,
  homeBannersApi,
  homeBannersQueryKeys,
  notificationsApi,
  notificationsQueryKeys,
  servicesApi,
  servicesQueryKeys,
  walletApi,
  walletQueryKeys,
} from '@services/api';
import { billPaymentsApi, billPaymentsQueryKeys } from '@services/api/billPayments.api';
import { ensureApiReachable } from '@services/api/bootstrapApi';
import { getString, StorageKeys } from '@services/storage';
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
      // The hosted base URL is fixed, so the health ping only warms the server.
      // Waiting on it would delay the prefetches that actually fill the tabs.
      void ensureApiReachable(4000).catch(() => undefined);

      const prefetch = [
        queryClient.prefetchQuery({
          queryKey: servicesQueryKeys.catalog(),
          queryFn: () => servicesApi.getServicesCatalog(),
          staleTime: 1000 * 60 * 15,
        }),
        queryClient.prefetchQuery({
          queryKey: homeBannersQueryKeys.list('home'),
          queryFn: () => homeBannersApi.getHomeBanners('home'),
          staleTime: 1000 * 60 * 15,
        }),
        queryClient.prefetchQuery({
          queryKey: notificationsQueryKeys.unread(),
          queryFn: async () => {
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
          queryClient.prefetchQuery({
            queryKey: billPaymentsQueryKeys.categories(),
            queryFn: () => billPaymentsApi.listCategories(),
            staleTime: 1000 * 60 * 5,
          }),
          queryClient.prefetchQuery({
            queryKey: billPaymentsQueryKeys.recent(),
            queryFn: () => billPaymentsApi.listRecentBillers(),
            staleTime: 1000 * 60 * 5,
          }),
          // Same key/shape the home screen asks for, so it lands as a cache hit.
          queryClient.prefetchQuery({
            queryKey: applicationsQueryKeys.all,
            queryFn: () => applicationsApi.listApplications({ page: 1, limit: 1 }),
            staleTime: 1000 * 60 * 2,
          }),
        );
      }

      void Promise.allSettled(prefetch);
    }

    void warmup();
  }, []);

  return null;
}
