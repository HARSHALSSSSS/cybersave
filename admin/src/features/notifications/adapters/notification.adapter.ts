import type { NotificationCategory, NotificationItem, NotificationPriority } from '../types';

interface BackendNotification {
  id: string;
  title: string;
  body: string;
  readAt?: string | null;
  createdAt: string;
  metadata?: Record<string, unknown>;
}

function inferCategory(title: string, body: string): NotificationCategory {
  const text = `${title} ${body}`.toLowerCase();
  if (text.includes('security') || text.includes('login')) return 'security';
  if (text.includes('expir')) return 'expiry';
  if (text.includes('application') || text.includes('submitted') || text.includes('review')) return 'document';
  if (text.includes('support') || text.includes('ticket')) return 'support';
  return 'document';
}

function inferPriority(title: string): NotificationPriority {
  const lower = title.toLowerCase();
  if (lower.includes('urgent') || lower.includes('critical')) return 'high';
  if (lower.includes('reminder')) return 'low';
  return 'medium';
}

const CATEGORY_LABELS: Record<NotificationCategory, string> = {
  security: 'Security',
  expiry: 'Expiry Alert',
  document: 'Document',
  support: 'Support',
};

export function mapNotificationItem(row: BackendNotification): NotificationItem {
  const category = inferCategory(row.title, row.body);
  return {
    id: row.id,
    category,
    categoryLabel: CATEGORY_LABELS[category],
    priority: inferPriority(row.title),
    title: row.title,
    description: row.body,
    timestamp: row.createdAt,
    read: Boolean(row.readAt),
  };
}

export function computeNotificationStats(items: NotificationItem[], total: number) {
  return {
    total,
    unread: items.filter((i) => !i.read).length,
    successLogs: items.filter((i) => i.read).length,
    pendingChecks: items.filter((i) => !i.read && i.priority === 'high').length,
  };
}
