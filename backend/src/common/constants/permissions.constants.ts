export const PERMISSIONS = {
  SERVICE_CREATE: 'service:create',
  SERVICE_UPDATE: 'service:update',
  SERVICE_PUBLISH: 'service:publish',
  SERVICE_ARCHIVE: 'service:archive',
  FORM_CREATE: 'form:create',
  FORM_UPDATE: 'form:update',
  FORM_PUBLISH: 'form:publish',
  WORKFLOW_CONFIGURE: 'workflow:configure',
  APPLICATION_VIEW: 'application:view',
  APPLICATION_VIEW_ALL: 'application:view_all',
  APPLICATION_ASSIGN: 'application:assign',
  APPLICATION_TRANSITION: 'application:transition',
  APPLICATION_APPROVE: 'application:approve',
  APPLICATION_REJECT: 'application:reject',
  APPLICATION_REQUEST_CORRECTION: 'application:request_correction',
  PAYMENT_VIEW: 'payment:view',
  PAYMENT_REFUND: 'payment:refund',
  USER_VIEW: 'user:view',
  USER_MANAGE: 'user:manage',
  ADMIN_MANAGE: 'admin:manage',
  ROLE_MANAGE: 'role:manage',
  AUDIT_VIEW: 'audit:view',
  REPORTS_VIEW: 'reports:view',
} as const;

export type PermissionKey = (typeof PERMISSIONS)[keyof typeof PERMISSIONS];

export const ALL_PERMISSIONS: Array<{
  key: PermissionKey;
  name: string;
  module: string;
  description: string;
}> = [
  {
    key: PERMISSIONS.SERVICE_CREATE,
    name: 'Create Service',
    module: 'services',
    description: 'Create main and sub services',
  },
  {
    key: PERMISSIONS.SERVICE_UPDATE,
    name: 'Update Service',
    module: 'services',
    description: 'Update service configuration',
  },
  {
    key: PERMISSIONS.SERVICE_PUBLISH,
    name: 'Publish Service',
    module: 'services',
    description: 'Publish service versions',
  },
  {
    key: PERMISSIONS.SERVICE_ARCHIVE,
    name: 'Archive Service',
    module: 'services',
    description: 'Archive services',
  },
  {
    key: PERMISSIONS.FORM_CREATE,
    name: 'Create Form',
    module: 'forms',
    description: 'Create form versions',
  },
  {
    key: PERMISSIONS.FORM_UPDATE,
    name: 'Update Form',
    module: 'forms',
    description: 'Update form fields',
  },
  {
    key: PERMISSIONS.FORM_PUBLISH,
    name: 'Publish Form',
    module: 'forms',
    description: 'Publish forms',
  },
  {
    key: PERMISSIONS.WORKFLOW_CONFIGURE,
    name: 'Configure Workflow',
    module: 'workflows',
    description: 'Configure service workflows',
  },
  {
    key: PERMISSIONS.APPLICATION_VIEW,
    name: 'View Application',
    module: 'applications',
    description: 'View assigned applications',
  },
  {
    key: PERMISSIONS.APPLICATION_VIEW_ALL,
    name: 'View All Applications',
    module: 'applications',
    description: 'View all applications',
  },
  {
    key: PERMISSIONS.APPLICATION_ASSIGN,
    name: 'Assign Application',
    module: 'applications',
    description: 'Assign applications to operators',
  },
  {
    key: PERMISSIONS.APPLICATION_TRANSITION,
    name: 'Transition Application',
    module: 'applications',
    description: 'Execute workflow transitions',
  },
  {
    key: PERMISSIONS.APPLICATION_APPROVE,
    name: 'Approve Application',
    module: 'applications',
    description: 'Approve applications',
  },
  {
    key: PERMISSIONS.APPLICATION_REJECT,
    name: 'Reject Application',
    module: 'applications',
    description: 'Reject applications',
  },
  {
    key: PERMISSIONS.APPLICATION_REQUEST_CORRECTION,
    name: 'Request Correction',
    module: 'applications',
    description: 'Request citizen corrections',
  },
  {
    key: PERMISSIONS.PAYMENT_VIEW,
    name: 'View Payments',
    module: 'payments',
    description: 'View payment records',
  },
  {
    key: PERMISSIONS.PAYMENT_REFUND,
    name: 'Refund Payment',
    module: 'payments',
    description: 'Process refunds',
  },
  {
    key: PERMISSIONS.USER_VIEW,
    name: 'View Users',
    module: 'users',
    description: 'View citizen profiles',
  },
  {
    key: PERMISSIONS.USER_MANAGE,
    name: 'Manage Users',
    module: 'users',
    description: 'Manage citizen accounts',
  },
  {
    key: PERMISSIONS.ADMIN_MANAGE,
    name: 'Manage Admins',
    module: 'admins',
    description: 'Manage admin users',
  },
  {
    key: PERMISSIONS.ROLE_MANAGE,
    name: 'Manage Roles',
    module: 'roles',
    description: 'Manage roles and permissions',
  },
  {
    key: PERMISSIONS.AUDIT_VIEW,
    name: 'View Audit Logs',
    module: 'audit',
    description: 'View audit logs',
  },
  {
    key: PERMISSIONS.REPORTS_VIEW,
    name: 'View Reports',
    module: 'reports',
    description: 'View analytics and reports',
  },
];
