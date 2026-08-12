import { ApplicationStatus } from '@prisma/client';

/** Citizen-facing statuses before submit — fixed by platform. */
export const PRE_SUBMIT_STATUSES: ReadonlySet<ApplicationStatus> = new Set([
  ApplicationStatus.DRAFT,
  ApplicationStatus.FORM_IN_PROGRESS,
  ApplicationStatus.DOCUMENTS_PENDING,
  ApplicationStatus.PAYMENT_PENDING,
]);

export const TERMINAL_STATUSES: ReadonlySet<ApplicationStatus> = new Set([
  ApplicationStatus.APPROVED,
  ApplicationStatus.REJECTED,
  ApplicationStatus.COMPLETED,
  ApplicationStatus.CANCELLED,
]);

/** Allowed platform transitions while application is pre-submit. */
export const PRE_SUBMIT_TRANSITIONS: Partial<
  Record<ApplicationStatus, ApplicationStatus[]>
> = {
  [ApplicationStatus.DRAFT]: [
    ApplicationStatus.FORM_IN_PROGRESS,
    ApplicationStatus.CANCELLED,
  ],
  [ApplicationStatus.FORM_IN_PROGRESS]: [
    ApplicationStatus.DOCUMENTS_PENDING,
    ApplicationStatus.PAYMENT_PENDING,
    ApplicationStatus.SUBMITTED,
    ApplicationStatus.CANCELLED,
  ],
  [ApplicationStatus.DOCUMENTS_PENDING]: [
    ApplicationStatus.PAYMENT_PENDING,
    ApplicationStatus.SUBMITTED,
    ApplicationStatus.FORM_IN_PROGRESS,
    ApplicationStatus.CANCELLED,
  ],
  [ApplicationStatus.PAYMENT_PENDING]: [
    ApplicationStatus.SUBMITTED,
    ApplicationStatus.CANCELLED,
  ],
};

export interface WorkflowSnapshotTransition {
  actionKey: string;
  label: string;
  fromStepKey: string;
  toStepKey: string;
  fromApplicationStatus: ApplicationStatus;
  toApplicationStatus: ApplicationStatus;
  requiredPermissions: string[];
  allowedRoleIds: string[];
  requiresComment: boolean;
  requiresAssignment: boolean;
  createsActionRequest: boolean;
  notifyCitizen: boolean;
}

export interface WorkflowSnapshot {
  steps: Array<{
    stepKey: string;
    name: string;
    applicationStatus: ApplicationStatus;
    isInitial: boolean;
    isTerminal: boolean;
    citizenVisible: boolean;
  }>;
  transitions: WorkflowSnapshotTransition[];
}

export function isPreSubmitStatus(status: ApplicationStatus): boolean {
  return PRE_SUBMIT_STATUSES.has(status);
}

export function isPostSubmitStatus(status: ApplicationStatus): boolean {
  return !isPreSubmitStatus(status);
}

export function canTransitionPreSubmit(
  from: ApplicationStatus,
  to: ApplicationStatus,
): boolean {
  const allowed = PRE_SUBMIT_TRANSITIONS[from];
  return allowed?.includes(to) ?? false;
}

export function assertPreSubmitTransition(
  from: ApplicationStatus,
  to: ApplicationStatus,
): void {
  if (!canTransitionPreSubmit(from, to)) {
    throw new Error(
      `Invalid pre-submit transition from ${from} to ${to}`,
    );
  }
}

export function findSnapshotStepByStatus(
  snapshot: WorkflowSnapshot,
  status: ApplicationStatus,
) {
  return snapshot.steps.find((step) => step.applicationStatus === status);
}

export function findSnapshotStepByKey(
  snapshot: WorkflowSnapshot,
  stepKey: string,
) {
  return snapshot.steps.find((step) => step.stepKey === stepKey);
}

/** Validate post-submit transition against snapshotted workflow definition. */
export function canTransitionPostSubmit(
  snapshot: WorkflowSnapshot,
  currentStepKey: string,
  actionKey: string,
): WorkflowSnapshotTransition | null {
  const transition = snapshot.transitions.find(
    (t) => t.fromStepKey === currentStepKey && t.actionKey === actionKey,
  );
  return transition ?? null;
}

export function validatePostSubmitTransition(
  snapshot: WorkflowSnapshot,
  currentStepKey: string,
  actionKey: string,
): WorkflowSnapshotTransition {
  const transition = canTransitionPostSubmit(
    snapshot,
    currentStepKey,
    actionKey,
  );
  if (!transition) {
    throw new Error(
      `Transition "${actionKey}" is not allowed from step "${currentStepKey}"`,
    );
  }
  return transition;
}
