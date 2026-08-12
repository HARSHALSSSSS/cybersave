export type OperatorStatus = 'active' | 'pending' | 'suspended';

export interface Operator {
  id: string;
  employeeId: string;
  name: string;
  role: string;
  department: string;
  status: OperatorStatus;
  avatarUrl: string;
  joinedDate: string;
  lastActive: string;
  email: string;
  phone: string;
  dateOfBirth: string;
  address: string;
  supervisorName: string;
  supervisorRole: string;
  shift: string;
  twoFactorEnabled: boolean;
  lastLogin: string;
  activeSessions: number;
  ipWhitelisting: boolean;
  metrics: {
    tasksCompleted: number;
    tasksTrend: string;
    avgResponseTime: string;
    responseBadge: string;
    satisfaction: number;
    documentsProcessed: number;
    accuracy: string;
  };
}

export interface OperatorActivity {
  id: string;
  dateTime: string;
  action: string;
  status: 'success' | 'warning' | 'error';
  ip: string;
}

export interface PermissionItem {
  id: string;
  title: string;
  description: string;
  enabled: boolean;
}

export interface PermissionCategory {
  id: string;
  title: string;
  enabled: boolean;
  permissions: PermissionItem[];
}

export interface OperatorDocument {
  id: string;
  title: string;
  maskedId: string;
  type: 'pdf' | 'image';
  status: 'verified' | 'valid' | 'pending' | 'expired';
  uploaded: string;
  expires: string;
}

export interface OperatorStats {
  total: number;
  active: number;
  pending: number;
  suspended: number;
}
