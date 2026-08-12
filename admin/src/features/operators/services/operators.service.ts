import { apiClient } from '@/services/api/client';
import { unwrapApiResponse, unwrapPaginated } from '@/services/api/types';
import { getTotalFromMeta } from '@/services/api/pagination';
import { computeOperatorStats, mapOperator } from '../adapters/operator.adapter';
import { PERMISSION_CATEGORIES } from '../constants/mock-data';
import type { Operator, OperatorStatus } from '../types';

export async function getOperatorsStats() {
  const result = await getOperators({ page: 1, pageSize: 100 });
  return computeOperatorStats(result.data);
}

export async function getOperators(params: {
  search?: string;
  department?: string;
  status?: OperatorStatus | 'all';
  page?: number;
  pageSize?: number;
}) {
  const { search = '', department = 'all', status = 'all', page = 1, pageSize = 9 } = params;

  const response = await apiClient.get('/admin/admin-users', { params: { page, limit: pageSize } });
  const { data, meta } = unwrapPaginated<Parameters<typeof mapOperator>[0][]>(response);

  let operators = data.map(mapOperator);

  if (search.trim()) {
    const q = search.toLowerCase();
    operators = operators.filter(
      (o) =>
        o.name.toLowerCase().includes(q) ||
        o.employeeId.toLowerCase().includes(q) ||
        o.department.toLowerCase().includes(q) ||
        o.email.toLowerCase().includes(q),
    );
  }
  if (department !== 'all') {
    operators = operators.filter((o) => o.department === department);
  }
  if (status !== 'all') {
    operators = operators.filter((o) => o.status === status);
  }

  return { data: operators, total: getTotalFromMeta(meta) };
}

export async function getOperator(id: string): Promise<Operator | undefined> {
  try {
    const response = await apiClient.get(`/admin/admin-users/${id}`);
    const data = unwrapApiResponse<Parameters<typeof mapOperator>[0]>(response);
    return mapOperator(data);
  } catch {
    return undefined;
  }
}

export async function getOperatorActivities(operatorId?: string) {
  const response = await apiClient.get('/admin/audit-logs', { params: { page: 1, limit: 20 } });
  const { data } = unwrapPaginated<Array<{
    id: string;
    action: string;
    resourceType: string;
    createdAt: string;
    actorAdminId?: string | null;
  }>>(response);

  const filtered = operatorId
    ? data.filter((row) => row.actorAdminId === operatorId)
    : data;

  return filtered.map((row) => ({
    id: row.id,
    dateTime: new Date(row.createdAt).toLocaleString('en-IN'),
    action: row.action.replace(/_/g, ' '),
    status: 'success' as const,
    ip: '—',
  }));
}

export async function getOperatorPermissions(operatorId?: string) {
  if (!operatorId) {
    return structuredClone(PERMISSION_CATEGORIES);
  }

  try {
    const response = await apiClient.get(`/admin/admin-users/${operatorId}`);
    const user = unwrapApiResponse<{
      permissions?: string[];
      roles?: Array<{ name: string }>;
    }>(response);

    const granted = new Set(user.permissions ?? []);
    const roleName = user.roles?.[0]?.name ?? 'Operator';

    if (granted.size === 0) {
      return structuredClone(PERMISSION_CATEGORIES);
    }

    return [
      {
        id: 'assigned',
        title: `${roleName} permissions`,
        enabled: true,
        permissions: [...granted].map((key) => ({
          id: key,
          title: key.replace(/\./g, ' › ').replace(/_/g, ' '),
          description: 'Granted via role assignment',
          enabled: true,
        })),
      },
    ];
  } catch {
    return structuredClone(PERMISSION_CATEGORIES);
  }
}

export async function getOperatorDocuments() {
  return [];
}

export async function getPolicyChanges() {
  return [];
}

export const operatorsService = {
  getOperatorsStats,
  getOperators,
  getOperator,
  getOperatorActivities,
  getOperatorPermissions,
  getOperatorDocuments,
  getPolicyChanges,
};
