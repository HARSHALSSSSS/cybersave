import { cn } from '@/lib/utils';
import type { ApplicationPriority } from '../types';

const PRIORITY_CONFIG: Record<ApplicationPriority, { label: string; color: string }> = {
  high: { label: 'High', color: '#DC2626' },
  medium: { label: 'Medium', color: '#D97706' },
  low: { label: 'Low', color: '#16A34A' },
};

export function PriorityIndicator({ priority, className }: { priority: ApplicationPriority; className?: string }) {
  const config = PRIORITY_CONFIG[priority];
  return (
    <span className={cn('inline-flex items-center gap-1.5 text-sm text-gray-700', className)}>
      <span className="h-2 w-2 rounded-full" style={{ backgroundColor: config.color }} />
      {config.label}
    </span>
  );
}
