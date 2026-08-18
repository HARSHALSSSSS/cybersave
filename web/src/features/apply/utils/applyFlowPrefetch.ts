import type { QueryClient } from '@tanstack/react-query';
import {
  applicationsApi,
  applicationsQueryKeys,
  servicesApi,
  servicesQueryKeys,
  walletApi,
  walletQueryKeys,
} from '@/services/api';

const APPLY_QUERY_STALE_MS = 1000 * 60 * 15;

export function prefetchApplyConfiguration(
  queryClient: QueryClient,
  subServiceId: string,
  stateCode?: string,
) {
  return queryClient.prefetchQuery({
    queryKey: servicesQueryKeys.configuration(subServiceId, stateCode),
    queryFn: () => servicesApi.getSubServiceConfiguration(subServiceId, stateCode),
    staleTime: APPLY_QUERY_STALE_MS,
  });
}

export function prefetchApplicationDetail(
  queryClient: QueryClient,
  applicationId: string,
) {
  return queryClient.prefetchQuery({
    queryKey: applicationsQueryKeys.detail(applicationId),
    queryFn: () => applicationsApi.getApplicationById(applicationId),
    staleTime: APPLY_QUERY_STALE_MS,
  });
}

export function prefetchWalletForPayment(queryClient: QueryClient) {
  return queryClient.prefetchQuery({
    queryKey: walletQueryKeys.summary(),
    queryFn: () => walletApi.getWalletSummary(),
    staleTime: APPLY_QUERY_STALE_MS,
  });
}
