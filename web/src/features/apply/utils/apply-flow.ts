import type { BackendApplicationStatus } from '@/services/api/applications.api';
import type { ApplyStep } from '@/features/apply/components/ApplyStepper';

export const DRAFT_STATUSES: BackendApplicationStatus[] = [
  'DRAFT',
  'FORM_IN_PROGRESS',
  'DOCUMENTS_PENDING',
  'PAYMENT_PENDING',
];

export function isDraftStatus(status: BackendApplicationStatus): boolean {
  return DRAFT_STATUSES.includes(status);
}

export function defaultApplyStepForStatus(status: BackendApplicationStatus): ApplyStep {
  switch (status) {
    case 'PAYMENT_PENDING':
      return 'payment';
    case 'DOCUMENTS_PENDING':
      return 'documents';
    case 'SUBMITTED':
    case 'UNDER_REVIEW':
    case 'PROCESSING':
    case 'APPROVED':
    case 'COMPLETED':
      return 'confirmation';
    default:
      return 'form';
  }
}

const STEP_ORDER: ApplyStep[] = ['form', 'documents', 'payment', 'confirmation'];

export function clampApplyStep(requested: ApplyStep, allowed: ApplyStep): ApplyStep {
  const reqIdx = STEP_ORDER.indexOf(requested);
  const allowIdx = STEP_ORDER.indexOf(allowed);
  if (reqIdx <= allowIdx) return requested;
  // User just finished the previous step — allow advancing one step before status catches up.
  if (reqIdx === allowIdx + 1) return requested;
  return allowed;
}

export function buildApplyUrl(
  mainSlug: string,
  subSlug: string,
  applicationId?: string,
  step: ApplyStep = 'form',
  stateCode?: string,
  stateName?: string,
): string {
  const base = applicationId
    ? `/services/${mainSlug}/${subSlug}/apply/${applicationId}`
    : `/services/${mainSlug}/${subSlug}/apply`;
  const params = new URLSearchParams();
  params.set('step', step);
  if (stateCode) params.set('state', stateCode);
  if (stateName) params.set('stateName', stateName);
  return `${base}?${params.toString()}`;
}

export function randomIdempotencyKey(prefix: string): string {
  return `${prefix}-${crypto.randomUUID()}`;
}
