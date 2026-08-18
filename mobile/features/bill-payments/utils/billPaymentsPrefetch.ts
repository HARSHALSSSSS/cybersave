import type { QueryClient } from '@tanstack/react-query';
import { billPaymentsApi, billPaymentsQueryKeys } from '@services/api/billPayments.api';

const BBPS_CATALOG_STALE_MS = 1000 * 60 * 5;
const BBPS_BILLER_STALE_MS = 1000 * 60 * 10;

export function prefetchBillPaymentsHome(queryClient: QueryClient) {
  return Promise.allSettled([
    queryClient.prefetchQuery({
      queryKey: billPaymentsQueryKeys.categories(),
      queryFn: () => billPaymentsApi.listCategories(),
      staleTime: BBPS_CATALOG_STALE_MS,
    }),
    queryClient.prefetchQuery({
      queryKey: billPaymentsQueryKeys.recent(),
      queryFn: () => billPaymentsApi.listRecentBillers(),
      staleTime: BBPS_CATALOG_STALE_MS,
    }),
  ]);
}

export function prefetchBillPaymentsCategory(
  queryClient: QueryClient,
  category: string,
) {
  return queryClient.prefetchQuery({
    queryKey: billPaymentsQueryKeys.billers(category, ''),
    queryFn: () => billPaymentsApi.listBillers({ category, limit: 100 }),
    staleTime: BBPS_CATALOG_STALE_MS,
  });
}

export function prefetchBillerDetail(queryClient: QueryClient, billerId: string) {
  return queryClient.prefetchQuery({
    queryKey: billPaymentsQueryKeys.biller(billerId),
    queryFn: () => billPaymentsApi.getBiller(billerId),
    staleTime: BBPS_BILLER_STALE_MS,
  });
}

export function prefetchBillPaymentIntent(queryClient: QueryClient, requestId: string) {
  return queryClient.prefetchQuery({
    queryKey: billPaymentsQueryKeys.paymentIntent(requestId),
    queryFn: () => billPaymentsApi.createPaymentIntent(requestId),
    staleTime: 1000 * 60 * 5,
  });
}

export { BBPS_CATALOG_STALE_MS, BBPS_BILLER_STALE_MS };
