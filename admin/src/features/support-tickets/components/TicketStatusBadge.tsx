import { Badge } from '@/components/ui';
import { cn } from '@/lib/utils';
import type { TicketStatus } from '../types';

const STATUS_CONFIG: Record<TicketStatus, { label: string; className: string }> = {
  open: { label: 'Open', className: 'border-info-border bg-info-bg text-info-text' },
  in_progress: { label: 'In Progress', className: 'border-warning-border bg-warning-bg text-warning-text' },
  resolved: { label: 'Resolved', className: 'border-success-border bg-success-bg text-success-text' },
  escalated: { label: 'Escalated', className: 'border-danger-border bg-danger-bg text-danger-text' },
};

export function TicketStatusBadge({ status, className }: { status: TicketStatus; className?: string }) {
  const config = STATUS_CONFIG[status];
  return (
    <Badge variant="outline" className={cn(config.className, className)}>
      {config.label}
    </Badge>
  );
}
