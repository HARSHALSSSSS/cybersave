import { useQuery } from '@tanstack/react-query';
import { notificationsApi, notificationsQueryKeys } from '@services/api';

/** Lightweight unread count for header badges — cached aggressively. */
export function useUnreadNotificationCount(enabled = true) {
  const { data } = useQuery({
    queryKey: notificationsQueryKeys.unread(),
    queryFn: async () => {
      const result = await notificationsApi.listNotifications(1, 20);
      return result.data.filter(n => !n.readAt).length;
    },
    enabled,
    staleTime: 1000 * 60 * 2,
    gcTime: 1000 * 60 * 10,
    refetchInterval: 1000 * 30,
    placeholderData: 0,
  });
  return data ?? 0;
}
