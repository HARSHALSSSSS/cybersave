import { Check } from 'lucide-react';

import { Button } from '@/components/ui';
import { cn } from '@/lib/utils';
import { formatRelativeTime } from '@/utils/format';
import type { NotificationItem } from '../types';
import { NotificationTypeIcon } from './NotificationTypeIcon';

const CATEGORY_TEXT_COLOR: Record<NotificationItem['category'], string> = {
  security: 'text-danger-text',
  expiry: 'text-warning-text',
  document: 'text-success-text',
  support: 'text-info-text',
};

export function NotificationListItem({
  notification,
  onView,
  onMarkRead,
}: {
  notification: NotificationItem;
  onView: (notification: NotificationItem) => void;
  onMarkRead: (notification: NotificationItem) => void;
}) {
  return (
    <div
      className={cn(
        'flex items-start gap-3 rounded-xl border border-border p-4 transition-colors duration-150',
        notification.read ? 'bg-card' : 'bg-accent/40',
      )}
    >
      <span className="mt-2 flex h-2 w-2 shrink-0 items-center justify-center">
        {!notification.read ? <span className="h-2 w-2 rounded-full bg-primary" /> : null}
      </span>

      <NotificationTypeIcon category={notification.category} />

      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-x-2 gap-y-0.5 text-xs leading-4 font-semibold tracking-wide">
          <span className="text-muted-foreground">{notification.id}</span>
          <span className="text-muted-foreground">&middot;</span>
          <span className={CATEGORY_TEXT_COLOR[notification.category]}>{notification.categoryLabel}</span>
        </div>
        <p className="mt-1 text-sm leading-5 font-semibold text-foreground">{notification.title}</p>
        <p className="mt-0.5 line-clamp-2 text-sm leading-5 text-muted-foreground">{notification.description}</p>
      </div>

      <div className="flex shrink-0 flex-col items-end gap-2">
        <span className="text-xs leading-4 whitespace-nowrap text-muted-foreground">
          {formatRelativeTime(notification.timestamp)}
        </span>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={() => onView(notification)}>
            View
          </Button>
          <Button
            variant="outline"
            size="icon"
            className="h-8 w-8"
            disabled={notification.read}
            title="Mark as read"
            onClick={() => onMarkRead(notification)}
          >
            <Check className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}
