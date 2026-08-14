import type { BackendApplicationStatus } from '@services/api';

export type ApplyResumeScreen = 'ApplyService' | 'UploadProofs' | 'ServicePayment';

/** Map draft application status to the correct screen in the apply stack. */
export function getApplyResumeScreen(status: BackendApplicationStatus | string): ApplyResumeScreen {
  switch (status) {
    case 'PAYMENT_PENDING':
      return 'ServicePayment';
    case 'DOCUMENTS_PENDING':
      return 'UploadProofs';
    default:
      return 'ApplyService';
  }
}

export const RESUME_DRAFT_STATUSES = new Set<string>([
  'DRAFT',
  'FORM_IN_PROGRESS',
  'DOCUMENTS_PENDING',
  'PAYMENT_PENDING',
]);
