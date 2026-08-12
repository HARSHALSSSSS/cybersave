import { Badge } from '@/components/ui';
import { cn } from '@/lib/utils';
import type { ServiceStatus } from '../types';

const STATUS_CONFIG: Record<ServiceStatus, { label: string; className: string }> = {
  active: { label: 'Active', className: 'bg-emerald-50 text-emerald-700 border-emerald-100' },
  maintenance: { label: 'Maintenance', className: 'bg-amber-50 text-amber-700 border-amber-100' },
  inactive: { label: 'Inactive', className: 'bg-gray-100 text-gray-500 border-gray-200' },
};

export function ServiceStatusBadge({ status, className }: { status: ServiceStatus; className?: string }) {
  const config = STATUS_CONFIG[status];
  return (
    <Badge variant="outline" className={cn(config.className, className)}>
      {config.label}
    </Badge>
  );
}
