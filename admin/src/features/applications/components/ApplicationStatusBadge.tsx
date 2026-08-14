import { Badge } from '@/components/ui';
import { cn } from '@/lib/utils';
import type { ApplicationStatus } from '../types';

const STATUS_CONFIG: Record<ApplicationStatus, { label: string; className: string }> = {
  submitted: { label: 'Submitted', className: 'bg-gray-50 text-gray-600 border-gray-200' },
  under_review: { label: 'In Review', className: 'bg-blue-50 text-blue-700 border-blue-100' },
  action_required: { label: 'Action Required', className: 'bg-amber-50 text-amber-700 border-amber-100' },
  processing: { label: 'Processing', className: 'bg-indigo-50 text-indigo-700 border-indigo-100' },
  approved: { label: 'Approved', className: 'bg-cyan-50 text-cyan-700 border-cyan-100' },
  completed: { label: 'Completed', className: 'bg-emerald-50 text-emerald-700 border-emerald-100' },
  rejected: { label: 'Rejected', className: 'bg-red-50 text-red-700 border-red-100' },
};

export function ApplicationStatusBadge({ status, className }: { status: ApplicationStatus; className?: string }) {
  const config = STATUS_CONFIG[status];
  return (
    <Badge variant="outline" className={cn(config.className, className)}>
      {config.label}
    </Badge>
  );
}
