import { ApplicationStatus } from '@prisma/client';

export interface DefaultWorkflowStepInput {
  stepKey: string;
  name: string;
  applicationStatus: ApplicationStatus;
  sortOrder: number;
  isInitial?: boolean;
  isTerminal?: boolean;
  citizenVisible?: boolean;
}

export interface DefaultWorkflowTransitionInput {
  fromStepKey: string;
  toStepKey: string;
  actionKey: string;
  label: string;
  requiredPermissions?: string[];
  requiresComment?: boolean;
  createsActionRequest?: boolean;
  notifyCitizen?: boolean;
}

export const DEFAULT_WORKFLOW_STEPS: DefaultWorkflowStepInput[] = [
  {
    stepKey: 'submitted',
    name: 'Submitted',
    applicationStatus: ApplicationStatus.SUBMITTED,
    sortOrder: 0,
    citizenVisible: true,
  },
  {
    stepKey: 'under_review',
    name: 'Under Review',
    applicationStatus: ApplicationStatus.UNDER_REVIEW,
    sortOrder: 1,
    isInitial: true,
    citizenVisible: true,
  },
  {
    stepKey: 'processing',
    name: 'Processing',
    applicationStatus: ApplicationStatus.PROCESSING,
    sortOrder: 2,
    citizenVisible: true,
  },
  {
    stepKey: 'action_required',
    name: 'Action Required',
    applicationStatus: ApplicationStatus.ACTION_REQUIRED,
    sortOrder: 3,
    citizenVisible: true,
  },
  {
    stepKey: 'approved',
    name: 'Approved',
    applicationStatus: ApplicationStatus.APPROVED,
    sortOrder: 4,
    isTerminal: true,
    citizenVisible: true,
  },
  {
    stepKey: 'rejected',
    name: 'Rejected',
    applicationStatus: ApplicationStatus.REJECTED,
    sortOrder: 5,
    isTerminal: true,
    citizenVisible: true,
  },
  {
    stepKey: 'completed',
    name: 'Completed',
    applicationStatus: ApplicationStatus.COMPLETED,
    sortOrder: 6,
    isTerminal: true,
    citizenVisible: true,
  },
];

export const DEFAULT_WORKFLOW_TRANSITIONS: DefaultWorkflowTransitionInput[] = [
  {
    fromStepKey: 'submitted',
    toStepKey: 'under_review',
    actionKey: 'START_REVIEW',
    label: 'Start Review',
    requiredPermissions: ['application:transition'],
  },
  {
    fromStepKey: 'under_review',
    toStepKey: 'processing',
    actionKey: 'START_PROCESSING',
    label: 'Start Processing',
    requiredPermissions: ['application:transition'],
  },
  {
    fromStepKey: 'under_review',
    toStepKey: 'action_required',
    actionKey: 'REQUEST_CORRECTION',
    label: 'Request Correction',
    requiredPermissions: ['application:request_correction'],
    requiresComment: true,
    createsActionRequest: true,
    notifyCitizen: true,
  },
  {
    fromStepKey: 'under_review',
    toStepKey: 'rejected',
    actionKey: 'REJECT',
    label: 'Reject',
    requiredPermissions: ['application:reject'],
    requiresComment: true,
    notifyCitizen: true,
  },
  {
    fromStepKey: 'under_review',
    toStepKey: 'approved',
    actionKey: 'APPROVE',
    label: 'Approve',
    requiredPermissions: ['application:approve'],
    notifyCitizen: true,
  },
  {
    fromStepKey: 'action_required',
    toStepKey: 'under_review',
    actionKey: 'RESUME_REVIEW',
    label: 'Resume Review',
    requiredPermissions: ['application:transition'],
  },
  {
    fromStepKey: 'action_required',
    toStepKey: 'processing',
    actionKey: 'RESUME_PROCESSING',
    label: 'Resume Processing',
    requiredPermissions: ['application:transition'],
  },
  {
    fromStepKey: 'processing',
    toStepKey: 'completed',
    actionKey: 'COMPLETE',
    label: 'Complete',
    requiredPermissions: ['application:transition'],
    notifyCitizen: true,
  },
  {
    fromStepKey: 'processing',
    toStepKey: 'action_required',
    actionKey: 'REQUEST_CORRECTION',
    label: 'Request Correction',
    requiredPermissions: ['application:request_correction'],
    requiresComment: true,
    createsActionRequest: true,
    notifyCitizen: true,
  },
  {
    fromStepKey: 'approved',
    toStepKey: 'completed',
    actionKey: 'COMPLETE',
    label: 'Mark Completed',
    requiredPermissions: ['application:transition'],
    notifyCitizen: true,
  },
];
