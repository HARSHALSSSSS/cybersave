import * as React from 'react';

import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import type { StatusValue, StatusVariant } from '@/types/common';

const STATUS_VARIANT_MAP: Record<StatusValue, StatusVariant> = {
  completed: 'success',
  success: 'success',
  active: 'success',
  approved: 'success',
  pending: 'warning',
  processing: 'warning',
  'in-review': 'info',
  review: 'info',
  rejected: 'danger',
  failed: 'danger',
  danger: 'danger',
  unverified: 'muted',
  inactive: 'muted',
  blocked: 'blocked',
  suspended: 'blocked',
};

const STATUS_LABEL_OVERRIDES: Partial<Record<StatusValue, string>> = {
  'in-review': 'In Review',
};

function toTitleCase(value: string): string {
  return value
    .split(/[-_\s]+/)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}

export interface StatusBadgeProps extends Omit<React.HTMLAttributes<HTMLSpanElement>, 'children'> {
  status: StatusValue | string;
  label?: string;
}

/** Renders a semantic `Badge` for any known app status string. */
export function StatusBadge({ status, label, className, ...props }: StatusBadgeProps) {
  const normalized = status as StatusValue;
  const variant = STATUS_VARIANT_MAP[normalized] ?? 'muted';
  const text = label ?? STATUS_LABEL_OVERRIDES[normalized] ?? toTitleCase(status);

  return (
    <Badge variant={variant} className={cn('capitalize', className)} {...props}>
      <span className="size-1.5 rounded-full bg-current" aria-hidden="true" />
      {text}
    </Badge>
  );
}
