import { apiClient } from './client';
import { unwrapApiResponse, unwrapPaginated } from './types';

export interface CitizenNotification {
  id: string;
  title: string;
  body: string;
  readAt: string | null;
  createdAt: string;
  metadata?: Record<string, unknown> | null;
}

export async function listNotifications(page = 1, limit = 20) {
  const response = await apiClient.get('/notifications', { params: { page, limit } });
  return unwrapPaginated<CitizenNotification[]>(response);
}

export async function markNotificationRead(id: string) {
  const response = await apiClient.patch(`/notifications/${id}/read`);
  return response.data;
}

export async function markAllNotificationsRead() {
  const response = await apiClient.patch('/notifications/read-all');
  return unwrapApiResponse<{ updated: boolean }>(response);
}

export const notificationsApi = {
  listNotifications,
  markNotificationRead,
  markAllNotificationsRead,
};

export const notificationsQueryKeys = {
  all: ['notifications'] as const,
  list: (page = 1) => [...notificationsQueryKeys.all, 'list', page] as const,
};
