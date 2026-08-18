import type { QueryClient } from '@tanstack/react-query';
import {
  applicationsApi,
  applicationsQueryKeys,
  servicesApi,
  servicesQueryKeys,
  walletApi,
  walletQueryKeys,
} from '@services/api';

export const APPLY_QUERY_STALE_MS = 1000 * 60 * 15;

export function prefetchApplyConfiguration(
  queryClient: QueryClient,
  optionId: string,
  stateCode?: string,
) {
  return queryClient.prefetchQuery({
    queryKey: servicesQueryKeys.configuration(optionId, stateCode),
    queryFn: () => servicesApi.getSubServiceConfiguration(optionId, stateCode),
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

/** Warm the Razorpay order before the user taps Pay so checkout opens immediately. */
export function prefetchPaymentIntent(
  queryClient: QueryClient,
  applicationId: string,
  idempotencyKey: string,
) {
  return queryClient.prefetchQuery({
    queryKey: applicationsQueryKeys.paymentIntent(applicationId, idempotencyKey),
    queryFn: () => applicationsApi.createPaymentIntent(applicationId, idempotencyKey),
    staleTime: 1000 * 60 * 5,
  });
}
