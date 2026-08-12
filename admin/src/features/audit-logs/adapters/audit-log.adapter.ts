import type { AuditEventCategory, AuditLogEntry, AuditStatus } from '../types';

interface BackendAuditLog {
  id: string;
  action: string;
  resourceType: string;
  resourceId: string;
  metadata?: Record<string, unknown>;
  createdAt: string;
  actorAdmin?: { id: string; email?: string } | null;
}

function inferCategory(resourceType: string, action: string): AuditEventCategory {
  const combined = `${resourceType} ${action}`.toLowerCase();
  if (combined.includes('login') || combined.includes('auth')) return 'login';
  if (combined.includes('document') || combined.includes('file')) return 'document';
  if (combined.includes('security')) return 'security';
  if (combined.includes('user') || combined.includes('citizen') || combined.includes('admin')) return 'user';
  return 'system';
}

function inferStatus(action: string): AuditStatus {
  if (action.toLowerCase().includes('fail')) return 'failed';
  if (action.toLowerCase().includes('warn')) return 'warning';
  return 'success';
}

export function mapAuditLogEntry(row: BackendAuditLog): AuditLogEntry {
  const email = row.actorAdmin?.email ?? 'System';
  return {
    id: row.id,
    timestamp: row.createdAt,
    userName: email.includes('@') ? email.split('@')[0] : email,
    userRole: 'Admin',
    category: inferCategory(row.resourceType, row.action),
    action: row.action,
    resource: `${row.resourceType}:${row.resourceId}`,
    ipAddress: (row.metadata?.ipAddress as string) ?? '—',
    status: inferStatus(row.action),
  };
}

export function computeAuditStats(entries: AuditLogEntry[], total: number) {
  return {
    totalEvents: total,
    loginActivities: entries.filter((e) => e.category === 'login').length,
    documentActions: entries.filter((e) => e.category === 'document').length,
    systemChanges: entries.filter((e) => e.category === 'system').length,
  };
}
