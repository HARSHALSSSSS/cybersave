import { Badge } from '@/components/ui';
import type { OperatorStatus } from '../types';

const MAP: Record<OperatorStatus, { label: string; variant: 'completed' | 'pending' | 'rejected' }> = {
  active: { label: 'Active', variant: 'completed' },
  pending: { label: 'Pending', variant: 'pending' },
  suspended: { label: 'Suspended', variant: 'rejected' },
};

export function OperatorStatusBadge({ status }: { status: OperatorStatus }) {
  const cfg = MAP[status];
  return <Badge variant={cfg.variant}>{cfg.label}</Badge>;
}
