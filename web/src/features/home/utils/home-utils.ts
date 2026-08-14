import type { ApplicationListItem, BackendApplicationStatus } from '@/services/api';

const IN_PROGRESS: BackendApplicationStatus[] = [
  'DRAFT',
  'FORM_IN_PROGRESS',
  'DOCUMENTS_PENDING',
  'PAYMENT_PENDING',
  'SUBMITTED',
  'UNDER_REVIEW',
  'PROCESSING',
  'ACTION_REQUIRED',
];

export function getApplicationProgress(status: BackendApplicationStatus): number {
  switch (status) {
    case 'DRAFT':
    case 'FORM_IN_PROGRESS':
      return 25;
    case 'DOCUMENTS_PENDING':
      return 50;
    case 'PAYMENT_PENDING':
      return 65;
    case 'SUBMITTED':
      return 75;
    case 'UNDER_REVIEW':
    case 'ACTION_REQUIRED':
      return 80;
    case 'PROCESSING':
      return 90;
    case 'APPROVED':
    case 'COMPLETED':
      return 100;
    default:
      return 15;
  }
}

export function getStatusChipTone(status: BackendApplicationStatus) {
  if (['APPROVED', 'COMPLETED'].includes(status)) return 'text-emerald-600 bg-emerald-50';
  if (status === 'PAYMENT_PENDING') return 'text-[#2563EB] bg-[#EFF6FF]';
  if (status === 'REJECTED' || status === 'CANCELLED') return 'text-red-600 bg-red-50';
  return 'text-amber-600 bg-amber-50';
}

export function countApplicationsByStatus(apps: ApplicationListItem[]) {
  return {
    inProgress: apps.filter(a => IN_PROGRESS.includes(a.status)).length,
    completed: apps.filter(a => ['APPROVED', 'COMPLETED'].includes(a.status)).length,
    drafts: apps.filter(a => ['DRAFT', 'FORM_IN_PROGRESS'].includes(a.status)).length,
    submitted: apps.filter(a => a.status === 'SUBMITTED').length,
    underReview: apps.filter(a =>
      ['UNDER_REVIEW', 'PROCESSING', 'ACTION_REQUIRED'].includes(a.status),
    ).length,
    approved: apps.filter(a => ['APPROVED', 'COMPLETED'].includes(a.status)).length,
    rejected: apps.filter(a => a.status === 'REJECTED').length,
    paymentPending: apps.filter(a => a.status === 'PAYMENT_PENDING').length,
  };
}

export function findFeaturedApplication(apps: ApplicationListItem[]) {
  const active = apps.find(a => IN_PROGRESS.includes(a.status) && a.status !== 'DRAFT');
  if (active) return active;
  return apps.find(a => IN_PROGRESS.includes(a.status)) ?? apps[0];
}
