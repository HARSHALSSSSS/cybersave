import { Badge } from '@/components/ui';
import type { AuditStatus } from '../types';

const STATUS_CONFIG: Record<AuditStatus, { label: string; variant: 'success' | 'danger' | 'warning' }> = {
  success: { label: 'Success', variant: 'success' },
  failed: { label: 'Failed', variant: 'danger' },
  warning: { label: 'Warning', variant: 'warning' },
};

export function AuditStatusBadge({ status }: { status: AuditStatus }) {
  const config = STATUS_CONFIG[status];
  return <Badge variant={config.variant}>{config.label}</Badge>;
}
