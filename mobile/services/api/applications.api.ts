import type {
  ApplicationFilter,
  ApplicationRecord,
  ApplicationStatus,
} from '@constants/index';

import { apiClient } from './client';
import { unwrapApiResponse, unwrapPaginated } from './types';

export type BackendApplicationStatus =
  | 'DRAFT'
  | 'FORM_IN_PROGRESS'
  | 'DOCUMENTS_PENDING'
  | 'PAYMENT_PENDING'
  | 'SUBMITTED'
  | 'UNDER_REVIEW'
  | 'PROCESSING'
  | 'ACTION_REQUIRED'
  | 'APPROVED'
  | 'COMPLETED'
  | 'REJECTED'
  | 'CANCELLED';

export interface ApplicationListItem {
  id: string;
  publicRef: string | null;
  status: BackendApplicationStatus;
  submittedAt: string | null;
  createdAt: string;
  updatedAt: string;
  applicantStateCode?: string | null;
  applicantStateName?: string | null;
  serviceVersion: {
    overview: {
      displayName: string;
      department?: string | null;
      processingTime?: string | null;
    } | null;
    subService: {
      id: string;
      name: string;
      slug: string;
      mainService: {
        id: string;
        name: string;
        slug: string;
      };
    };
  };
}

export interface ApplicationFieldValue {
  id: string;
  fieldKey: string;
  value: unknown;
}

export interface ApplicationDetail extends ApplicationListItem {
  fieldValues: ApplicationFieldValue[];
  documents: unknown[];
  actionRequests?: Array<{
    id: string;
    reason: string;
    instructions?: string | null;
    requiredFieldKeys: string[];
    requiredDocumentIds: string[];
    status: string;
    deadline?: string | null;
  }>;
  payment: {
    amount: string | number;
    currency: string;
    status: string;
  } | null;
  statusHistory: Array<{
    id: string;
    fromStatus: BackendApplicationStatus;
    toStatus: BackendApplicationStatus;
    createdAt: string;
    comment?: string | null;
  }>;
  assignedOperatorId?: string | null;
  pricingSnapshot?: {
    totalAmount: string | number;
    currency: string;
  } | null;
}

export interface PaginatedApplications {
  data: ApplicationListItem[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

function formatShortDate(iso: string): string {
  const date = new Date(iso);
  return date.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' });
}

function formatFullDate(iso: string): string {
  const date = new Date(iso);
  return date.toLocaleString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  });
}

export function mapBackendStatus(status: BackendApplicationStatus): ApplicationStatus {
  switch (status) {
    case 'APPROVED':
    case 'COMPLETED':
      return 'approved';
    case 'REJECTED':
      return 'rejected';
    case 'SUBMITTED':
    case 'UNDER_REVIEW':
    case 'PROCESSING':
      return 'pending';
    case 'ACTION_REQUIRED':
      return 'in_progress';
    case 'DRAFT':
    case 'FORM_IN_PROGRESS':
    case 'DOCUMENTS_PENDING':
    case 'PAYMENT_PENDING':
    case 'CANCELLED':
    default:
      return 'in_progress';
  }
}

function extractApplicantName(fieldValues: ApplicationFieldValue[]): string {
  const nameKeys = ['fullName', 'full_name', 'name', 'applicantName'];
  for (const key of nameKeys) {
    const match = fieldValues.find(fv => fv.fieldKey === key);
    if (match && typeof match.value === 'string' && match.value.trim()) {
      return match.value;
    }
  }
  return 'Applicant';
}

export function mapApplicationListItem(
  item: ApplicationListItem,
): ApplicationRecord & { backendStatus: BackendApplicationStatus } {
  const title =
    item.serviceVersion.overview?.displayName ??
    item.serviceVersion.subService.name;
  const submittedAt = item.submittedAt ?? item.createdAt;

  return {
    id: item.id,
    ref: item.publicRef ?? item.id.slice(0, 8).toUpperCase(),
    title,
    submittedShort: formatShortDate(submittedAt),
    submittedFull: formatFullDate(submittedAt),
    status: mapBackendStatus(item.status),
    backendStatus: item.status,
    department:
      item.serviceVersion.overview?.department ??
      item.serviceVersion.subService.mainService.name,
    applicantName: '—',
    phone: '—',
    categoryId: item.serviceVersion.subService.mainService.id,
    optionId: item.serviceVersion.subService.id,
    stateCode: item.applicantStateCode ?? undefined,
    stateName: item.applicantStateName ?? undefined,
  };
}

export function mapApplicationDetail(item: ApplicationDetail): ApplicationRecord & {
  backendStatus: BackendApplicationStatus;
  openActionRequest?: NonNullable<ApplicationDetail['actionRequests']>[number];
} {
  const base = mapApplicationListItem(item);
  const applicantName = extractApplicantName(item.fieldValues);
  const openActionRequest = item.actionRequests?.find(r => r.status === 'OPEN');

  let feePaid: string | undefined;
  if (item.payment && item.payment.status === 'CAPTURED') {
    feePaid = `₹${Number(item.payment.amount).toFixed(2)} (Success)`;
  } else if (item.pricingSnapshot) {
    feePaid = `₹${Number(item.pricingSnapshot.totalAmount).toFixed(2)}`;
  }

  const addressField = item.fieldValues.find(fv =>
    ['address', 'newAddress', 'currentAddress'].includes(fv.fieldKey),
  );

  return {
    ...base,
    backendStatus: item.status,
    openActionRequest,
    applicantName,
    address:
      typeof addressField?.value === 'string' ? addressField.value : undefined,
    feePaid,
    timeline: item.statusHistory.map((entry, index, arr) => ({
      id: entry.id,
      label: entry.toStatus.replace(/_/g, ' '),
      timestamp: formatFullDate(entry.createdAt),
      state:
        index === arr.length - 1 && base.status === 'in_progress'
          ? ('active' as const)
          : ('completed' as const),
    })),
  };
}

/** Backend accepts a single status; multi-status tabs use client filtering. */
function filterStatusParam(filter: ApplicationFilter): string | undefined {
  if (filter === 'Rejected') return 'REJECTED';
  return undefined;
}

const PENDING_STATUSES: BackendApplicationStatus[] = [
  'SUBMITTED',
  'UNDER_REVIEW',
  'PROCESSING',
  'ACTION_REQUIRED',
];

const APPROVED_STATUSES: BackendApplicationStatus[] = [
  'APPROVED',
  'COMPLETED',
];

export function clientFilterApplications(
  items: ApplicationListItem[],
  filter: ApplicationFilter,
  query?: string,
): ApplicationListItem[] {
  let list = items;

  if (filter === 'Pending') {
    list = list.filter(item => PENDING_STATUSES.includes(item.status));
  } else if (filter === 'Approved') {
    list = list.filter(item => APPROVED_STATUSES.includes(item.status));
  } else if (filter === 'Rejected') {
    list = list.filter(item => item.status === 'REJECTED');
  }

  if (query?.trim()) {
    const q = query.toLowerCase();
    list = list.filter(item => {
      const title =
        item.serviceVersion.overview?.displayName ??
        item.serviceVersion.subService.name;
      const ref = item.publicRef ?? item.id;
      return title.toLowerCase().includes(q) || ref.toLowerCase().includes(q);
    });
  }

  return list;
}

export async function listApplications(params?: {
  status?: string;
  page?: number;
  limit?: number;
}) {
  const response = await apiClient.get('/applications', { params });
  const body = unwrapPaginated<ApplicationListItem[]>(response);
  return {
    data: body.data,
    meta: body.meta as PaginatedApplications['meta'],
  };
}

export async function listApplicationsForFilter(
  filter: ApplicationFilter,
  page = 1,
  limit = 50,
) {
  const status = filterStatusParam(filter);
  return listApplications({ status, page, limit });
}

export async function listDrafts() {
  const response = await apiClient.get('/applications/drafts');
  return unwrapApiResponse<ApplicationListItem[]>(response);
}

export async function getApplicationById(id: string) {
  const response = await apiClient.get(`/applications/${id}`);
  return unwrapApiResponse<ApplicationDetail>(response);
}

export async function createDraftApplication(
  subServiceId: string,
  stateCode?: string,
  stateName?: string,
) {
  const response = await apiClient.post('/applications', {
    subServiceId,
    stateCode,
    stateName,
  });
  return unwrapApiResponse<ApplicationDetail>(response);
}

export async function saveApplicationFormValues(
  applicationId: string,
  values: Record<string, unknown>,
) {
  const response = await apiClient.patch(`/applications/${applicationId}/form`, {
    values,
  });
  return unwrapApiResponse<ApplicationDetail>(response);
}

export async function validateApplication(applicationId: string) {
  const response = await apiClient.post(`/applications/${applicationId}/validate`);
  return unwrapApiResponse<unknown>(response);
}

export async function submitApplication(applicationId: string) {
  const response = await apiClient.post(`/applications/${applicationId}/submit`);
  return unwrapApiResponse<ApplicationDetail>(response);
}

export async function cancelDraftApplication(applicationId: string) {
  const response = await apiClient.post(`/applications/${applicationId}/cancel`);
  return unwrapApiResponse<ApplicationDetail>(response);
}

export interface DocumentUploadSession {
  uploadSessionId: string;
  storedFileId: string;
  uploadUrl: string;
  method: string;
  headers: Record<string, string>;
  storageKey: string;
  expiresAt: string;
}

export interface PaymentIntent {
  paymentId: string;
  amount: string;
  currency: string;
  status: string;
  provider?: string;
  providerRef?: string | null;
  idempotencyKey?: string;
  keyId?: string;
  orderId?: string | null;
}

export async function requestDocumentUpload(
  applicationId: string,
  documentRequirementId: string,
  originalFileName: string,
  mimeType: string,
) {
  const response = await apiClient.post(
    `/applications/${applicationId}/uploads/request`,
    { documentRequirementId, originalFileName, mimeType },
  );
  return unwrapApiResponse<DocumentUploadSession>(response);
}

export async function completeDocumentUpload(
  applicationId: string,
  uploadSessionId: string,
  storedFileId: string,
) {
  const response = await apiClient.post(
    `/applications/${applicationId}/uploads/complete`,
    { uploadSessionId, storedFileId },
  );
  return unwrapApiResponse<ApplicationDetail>(response);
}

export async function createPaymentIntent(
  applicationId: string,
  idempotencyKey: string,
) {
  const response = await apiClient.post(
    `/applications/${applicationId}/payment-intent`,
    { idempotencyKey },
  );
  return unwrapApiResponse<PaymentIntent>(response);
}

export async function confirmApplicationPayment(
  applicationId: string,
  body: {
    paymentId: string;
    mockCapture?: boolean;
    razorpayPaymentId?: string;
    razorpayOrderId?: string;
    razorpaySignature?: string;
  },
) {
  const response = await apiClient.post(`/applications/${applicationId}/payments/confirm`, body);
  return unwrapApiResponse<{ success: boolean; paymentId: string }>(response);
}

export async function payWithWallet(applicationId: string, idempotencyKey: string) {
  const response = await apiClient.post(`/applications/${applicationId}/pay-with-wallet`, {
    idempotencyKey,
  });
  return unwrapApiResponse<{ success: boolean; paymentId: string; method: string; amount: number }>(
    response,
  );
}

/** @deprecated Use confirmApplicationPayment instead */
export async function captureMockPayment(paymentId: string) {
  const response = await apiClient.post('/webhooks/payments/mock', { paymentId });
  return unwrapApiResponse<{ success: boolean }>(response);
}

export async function submitCorrection(
  applicationId: string,
  values: Record<string, unknown>,
) {
  const response = await apiClient.post(
    `/applications/${applicationId}/corrections/submit`,
    { values },
  );
  return unwrapApiResponse<ApplicationDetail>(response);
}

export interface ApplicationCertificate {
  id: string;
  applicationId: string;
  certificateNumber: string;
  issuedAt: string;
  title: string;
  pdfStorageKey: string | null;
  downloadUrl: string | null;
  createdAt: string;
}

export async function getApplicationCertificate(applicationId: string) {
  const response = await apiClient.get(
    `/applications/${applicationId}/certificate`,
  );
  return unwrapApiResponse<ApplicationCertificate>(response);
}

export async function deleteApplicationDocument(
  applicationId: string,
  documentId: string,
) {
  const response = await apiClient.delete(
    `/applications/${applicationId}/documents/${documentId}`,
  );
  return unwrapApiResponse<ApplicationDetail>(response);
}

export const applicationsApi = {
  listApplications,
  listApplicationsForFilter,
  listDrafts,
  getApplicationById,
  createDraftApplication,
  saveApplicationFormValues,
  validateApplication,
  submitApplication,
  cancelDraftApplication,
  requestDocumentUpload,
  completeDocumentUpload,
  createPaymentIntent,
  confirmApplicationPayment,
  payWithWallet,
  captureMockPayment,
  submitCorrection,
  getApplicationCertificate,
  deleteApplicationDocument,
  mapApplicationListItem,
  mapApplicationDetail,
};

export const applicationsQueryKeys = {
  all: ['applications'] as const,
  list: (filter: ApplicationFilter) =>
    [...applicationsQueryKeys.all, 'list', filter] as const,
  detail: (id: string) => [...applicationsQueryKeys.all, 'detail', id] as const,
  certificate: (id: string) =>
    [...applicationsQueryKeys.all, 'certificate', id] as const,
};
