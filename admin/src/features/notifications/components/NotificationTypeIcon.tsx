import { AlertTriangle, FileCheck2, Info, ShieldAlert } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';

import { cn } from '@/lib/utils';
import type { NotificationCategory } from '../types';

const CATEGORY_CONFIG: Record<NotificationCategory, { icon: LucideIcon; bg: string; text: string }> = {
  security: { icon: ShieldAlert, bg: 'bg-danger-bg', text: 'text-danger-text' },
  expiry: { icon: AlertTriangle, bg: 'bg-warning-bg', text: 'text-warning-text' },
  document: { icon: FileCheck2, bg: 'bg-success-bg', text: 'text-success-text' },
  support: { icon: Info, bg: 'bg-info-bg', text: 'text-info-text' },
};

export function NotificationTypeIcon({
  category,
  className,
}: {
  category: NotificationCategory;
  className?: string;
}) {
  const { icon: Icon, bg, text } = CATEGORY_CONFIG[category];
  return (
    <span className={cn('flex h-10 w-10 shrink-0 items-center justify-center rounded-full', bg, text, className)}>
      <Icon className="h-5 w-5" />
    </span>
  );
}
