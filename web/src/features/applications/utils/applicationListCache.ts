import type { QueryClient } from '@tanstack/react-query';
import type {
  ApplicationDetail,
  ApplicationListItem,
} from '@/services/api/applications.api';
import { applicationsQueryKeys } from '@/services/api/applications.api';
import { notificationsQueryKeys } from '@/services/api/notifications.api';

type PaginatedList = {
  data: ApplicationListItem[];
  meta?: { total?: number; page?: number; limit?: number; totalPages?: number };
};

function toListItem(
  application: ApplicationDetail | ApplicationListItem,
): ApplicationListItem {
  return {
    id: application.id,
    publicRef: application.publicRef,
    status: application.status,
    submittedAt: application.submittedAt,
    createdAt: application.createdAt,
    updatedAt: application.updatedAt,
    serviceVersion: application.serviceVersion,
  };
}

/** Merge one application into every cached list query. */
export function upsertApplicationListItem(
  queryClient: QueryClient,
  application: ApplicationDetail | ApplicationListItem,
) {
  const item = toListItem(application);

  queryClient.setQueriesData<PaginatedList>(
    {
      queryKey: applicationsQueryKeys.all,
      predicate: query =>
        query.queryKey[0] === 'applications' && query.queryKey[1] === 'list',
    },
    old => {
      if (!old?.data) return old;
      const exists = old.data.some(row => row.id === item.id);
      const data = exists
        ? old.data.map(row => (row.id === item.id ? item : row))
        : [item, ...old.data];
      const meta =
        old.meta && typeof old.meta.total === 'number'
          ? { ...old.meta, total: exists ? old.meta.total : old.meta.total + 1 }
          : old.meta;
      return { ...old, data, meta };
    },
  );
}

export function syncSubmittedApplicationInCaches(
  queryClient: QueryClient,
  application: ApplicationDetail | ApplicationListItem,
) {
  queryClient.setQueryData(
    applicationsQueryKeys.detail(application.id),
    application,
  );
  upsertApplicationListItem(queryClient, application);
}

export function refreshApplicationsListQueries(queryClient: QueryClient) {
  void queryClient.invalidateQueries({ queryKey: applicationsQueryKeys.all });
  return queryClient.refetchQueries({
    queryKey: applicationsQueryKeys.all,
    type: 'active',
  });
}

/** Notifications are created server-side on submit — refresh after a confirmed submission. */
export function refreshNotificationsAfterSubmit(queryClient: QueryClient) {
  void queryClient.invalidateQueries({ queryKey: notificationsQueryKeys.all });
}
