import { apiClient } from './client';
import { unwrapApiResponse, unwrapPaginated } from './types';

export interface CitizenNotification {
  id: string;
  title: string;
  body: string;
  type?: string;
  readAt: string | null;
  createdAt: string;
  metadata?: {
    applicationId?: string;
    ticketId?: string;
    status?: string;
    publicRef?: string | null;
    type?: string;
  };
}

/** Prefer explicit type; fall back to metadata.status when type is absent. */
export function resolveNotificationType(notification: CitizenNotification): string {
  return notification.type ?? notification.metadata?.status ?? 'system';
}

export async function listNotifications(page = 1, limit = 30) {
  const response = await apiClient.get('/notifications', { params: { page, limit } });
  return unwrapPaginated<CitizenNotification[]>(response);
}

export async function markNotificationRead(id: string) {
  const response = await apiClient.patch(`/notifications/${id}/read`);
  return unwrapApiResponse(response);
}

export const notificationsApi = {
  listNotifications,
  markNotificationRead,
  resolveNotificationType,
};
