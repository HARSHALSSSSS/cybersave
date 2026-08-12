export type AuditEventCategory = 'login' | 'document' | 'system' | 'security' | 'user';

export type AuditStatus = 'success' | 'failed' | 'warning';

export interface AuditLogEntry {
  id: string;
  timestamp: string;
  userName: string;
  userRole: string;
  category: AuditEventCategory;
  action: string;
  resource: string;
  ipAddress: string;
  status: AuditStatus;
}

export interface AuditLogsStats {
  totalEvents: number;
  loginActivities: number;
  documentActions: number;
  systemChanges: number;
}
