import { apiClient } from '@/services/api/client';
import { unwrapPaginated } from '@/services/api/types';
import { getTotalFromMeta } from '@/services/api/pagination';
import { computeNotificationStats, mapNotificationItem } from '../adapters/notification.adapter';
import type { NotificationCategory, NotificationItem, NotificationPriority, NotificationsStats } from '../types';

export interface GetNotificationsParams {
  search?: string;
  category?: NotificationCategory | 'all';
  priority?: NotificationPriority | 'all';
  page?: number;
  pageSize?: number;
}

export interface GetNotificationsResult {
  data: NotificationItem[];
  total: number;
  page: number;
  pageSize: number;
}

export async function getNotificationsStats(): Promise<NotificationsStats> {
  const result = await getNotifications({ page: 1, pageSize: 50 });
  return computeNotificationStats(result.data, result.total);
}

export async function getNotifications(params: GetNotificationsParams = {}): Promise<GetNotificationsResult> {
  const { search = '', category = 'all', priority = 'all', page = 1, pageSize = 8 } = params;

  const response = await apiClient.get('/admin/notifications', { params: { page, limit: pageSize } });
  const { data, meta } = unwrapPaginated<Parameters<typeof mapNotificationItem>[0][]>(response);

  let items = data.map(mapNotificationItem);

  if (category !== 'all') {
    items = items.filter((item) => item.category === category);
  }
  if (priority !== 'all') {
    items = items.filter((item) => item.priority === priority);
  }
  if (search.trim()) {
    const query = search.trim().toLowerCase();
    items = items.filter(
      (item) =>
        item.title.toLowerCase().includes(query) ||
        item.description.toLowerCase().includes(query) ||
        item.id.toLowerCase().includes(query),
    );
  }

  return { data: items, total: getTotalFromMeta(meta), page, pageSize };
}

export async function markNotificationRead(_notificationId: string): Promise<{ success: true }> {
  return { success: true };
}

export async function markAllNotificationsRead(): Promise<{ success: true }> {
  return { success: true };
}

export const notificationsService = {
  getNotificationsStats,
  getNotifications,
  markNotificationRead,
  markAllNotificationsRead,
};
