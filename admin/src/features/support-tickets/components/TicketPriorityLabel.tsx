import { cn } from '@/lib/utils';
import type { TicketPriority } from '../types';

const PRIORITY_CONFIG: Record<TicketPriority, { label: string; className: string }> = {
  critical: { label: 'Critical', className: 'text-danger-text' },
  high: { label: 'High', className: 'text-danger-text' },
  medium: { label: 'Medium', className: 'text-warning-text' },
  low: { label: 'Low', className: 'text-muted-foreground' },
};

export function TicketPriorityLabel({ priority, className }: { priority: TicketPriority; className?: string }) {
  const config = PRIORITY_CONFIG[priority];
  return <span className={cn('text-sm font-medium', config.className, className)}>{config.label}</span>;
}
