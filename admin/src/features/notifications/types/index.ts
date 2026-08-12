export type NotificationCategory = 'security' | 'expiry' | 'document' | 'support';

export type NotificationPriority = 'high' | 'medium' | 'low';

export interface NotificationItem {
  id: string;
  category: NotificationCategory;
  categoryLabel: string;
  priority: NotificationPriority;
  title: string;
  description: string;
  timestamp: string;
  read: boolean;
}

export interface NotificationsStats {
  total: number;
  unread: number;
  successLogs: number;
  pendingChecks: number;
}
