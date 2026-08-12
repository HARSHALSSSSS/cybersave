import { fullName, shortId } from '@/services/api/adapters';
import type { Operator, OperatorStats, OperatorStatus } from '../types';

interface BackendAdminUser {
  id: string;
  email: string;
  firstName?: string | null;
  lastName?: string | null;
  status: string;
  createdAt: string;
  roles?: Array<{ id: string; key: string; name: string }>;
}

function mapOperatorStatus(status: string): OperatorStatus {
  if (status === 'ACTIVE') return 'active';
  if (status === 'SUSPENDED') return 'suspended';
  return 'pending';
}

export function mapOperator(user: BackendAdminUser): Operator {
  const name = fullName(user.firstName, user.lastName, user.email);
  const role = user.roles?.[0]?.name ?? 'Operator';
  return {
    id: user.id,
    employeeId: shortId(user.id, 6),
    name,
    role,
    department: user.roles?.[0]?.key ?? 'Operations',
    status: mapOperatorStatus(user.status),
    avatarUrl: '',
    joinedDate: user.createdAt,
    lastActive: user.createdAt,
    email: user.email,
    phone: '—',
    dateOfBirth: '—',
    address: '—',
    supervisorName: '—',
    supervisorRole: '—',
    shift: '—',
    twoFactorEnabled: false,
    lastLogin: '—',
    activeSessions: 0,
    ipWhitelisting: false,
    metrics: {
      tasksCompleted: 0,
      tasksTrend: '—',
      avgResponseTime: '—',
      responseBadge: '—',
      satisfaction: 0,
      documentsProcessed: 0,
      accuracy: '—',
    },
  };
}

export function computeOperatorStats(operators: Operator[]): OperatorStats {
  return {
    total: operators.length,
    active: operators.filter((o) => o.status === 'active').length,
    pending: operators.filter((o) => o.status === 'pending').length,
    suspended: operators.filter((o) => o.status === 'suspended').length,
  };
}
