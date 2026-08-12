import { Badge } from '@/components/ui';
import { cn } from '@/lib/utils';
import type { CitizenStatus } from '../types';

const STATUS_CONFIG: Record<CitizenStatus, { label: string; className: string }> = {
  verified: { label: 'Verified', className: 'bg-emerald-50 text-emerald-700 border-emerald-100' },
  unverified: { label: 'Unverified', className: 'bg-amber-50 text-amber-700 border-amber-100' },
  blocked: { label: 'Blocked', className: 'bg-red-50 text-red-700 border-red-100' },
};

export function CitizenStatusBadge({ status, className }: { status: CitizenStatus; className?: string }) {
  const config = STATUS_CONFIG[status];
  return (
    <Badge variant="outline" className={cn(config.className, className)}>
      {config.label}
    </Badge>
  );
}
