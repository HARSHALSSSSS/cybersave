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
      mainService: { id: string; name: string; slug: string };
    };
  };
}

export interface ApplicationFieldValue {
  id: string;
  fieldKey: string;
  value: unknown;
}

export interface ApplicationDocument {
  id: string;
  documentRequirementId: string;
  storedFileId: string;
  status: string;
  documentRequirement?: { id: string; name: string };
  storedFile?: { id: string; originalFileName?: string | null };
}

export interface ApplicationDetail extends ApplicationListItem {
  fieldValues: ApplicationFieldValue[];
  documents: ApplicationDocument[];
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
    id?: string;
    amount: string | number;
    currency: string;
    status: string;
    providerRef?: string | null;
  } | null;
  pricingSnapshot?: {
    totalAmount: string | number;
    currency: string;
    baseFee?: string | number;
    platformFee?: string | number;
  } | null;
  statusHistory: Array<{
    id: string;
    fromStatus: BackendApplicationStatus;
    toStatus: BackendApplicationStatus;
    createdAt: string;
    comment?: string | null;
  }>;
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
}

export async function listApplications(params?: {
  status?: string;
  page?: number;
  limit?: number;
}) {
  const response = await apiClient.get('/applications', { params });
  return unwrapPaginated<ApplicationListItem[]>(response);
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
  const response = await apiClient.patch(`/applications/${applicationId}/form`, { values });
  return unwrapApiResponse<ApplicationDetail>(response);
}

export async function validateApplication(
  applicationId: string,
  scope: 'form' | 'documents' | 'all' = 'all',
) {
  const response = await apiClient.post(`/applications/${applicationId}/validate`, {}, {
    params: scope === 'all' ? undefined : { scope },
  });
  return unwrapApiResponse<{
    valid: boolean;
    errors: Array<{ field: string; message: string }>;
    warnings: string[];
    application: ApplicationDetail;
  }>(response);
}

export async function submitApplication(applicationId: string) {
  const response = await apiClient.post(`/applications/${applicationId}/submit`);
  return unwrapApiResponse<ApplicationDetail>(response);
}

export async function requestDocumentUpload(
  applicationId: string,
  documentRequirementId: string,
  originalFileName: string,
  mimeType: string,
) {
  const response = await apiClient.post(`/applications/${applicationId}/uploads/request`, {
    documentRequirementId,
    originalFileName,
    mimeType,
  });
  return unwrapApiResponse<DocumentUploadSession>(response);
}

export async function uploadApplicationFile(
  applicationId: string,
  uploadSessionId: string,
  file: File,
) {
  const form = new FormData();
  form.append('file', file);
  const response = await apiClient.post(
    `/applications/${applicationId}/uploads/${uploadSessionId}/file`,
    form,
    {
      transformRequest: [
        (data, headers) => {
          if (data instanceof FormData) {
            delete headers['Content-Type'];
          }
          return data;
        },
      ],
      maxBodyLength: Infinity,
      maxContentLength: Infinity,
    },
  );
  return unwrapApiResponse<{ success: boolean; storageKey: string; sizeBytes: number }>(response);
}

export async function completeDocumentUpload(
  applicationId: string,
  uploadSessionId: string,
  storedFileId: string,
) {
  const response = await apiClient.post(`/applications/${applicationId}/uploads/complete`, {
    uploadSessionId,
    storedFileId,
  });
  return unwrapApiResponse<ApplicationDetail>(response);
}

export async function createPaymentIntent(applicationId: string, idempotencyKey: string) {
  const response = await apiClient.post(`/applications/${applicationId}/payment-intent`, {
    idempotencyKey,
  });
  return unwrapApiResponse<PaymentIntent>(response);
}

export async function captureMockPayment(paymentId: string) {
  const response = await apiClient.post('/webhooks/payments/mock', { paymentId });
  return unwrapApiResponse<{ success: boolean }>(response);
}

export async function deleteApplicationDocument(applicationId: string, documentId: string) {
  const response = await apiClient.delete(
    `/applications/${applicationId}/documents/${documentId}`,
  );
  return unwrapApiResponse<ApplicationDetail>(response);
}

export async function submitCorrection(
  applicationId: string,
  values: Record<string, unknown>,
) {
  const response = await apiClient.post(`/applications/${applicationId}/corrections/submit`, {
    values,
  });
  return unwrapApiResponse<ApplicationDetail>(response);
}

export interface ApplicationCertificate {
  id: string;
  applicationId: string;
  certificateNumber: string;
  issuedAt: string;
  title: string;
  downloadUrl: string | null;
}

export async function getApplicationCertificate(applicationId: string) {
  const response = await apiClient.get(`/applications/${applicationId}/certificate`);
  return unwrapApiResponse<ApplicationCertificate>(response);
}

export const applicationsApi = {
  listApplications,
  listDrafts,
  getApplicationById,
  createDraftApplication,
  saveApplicationFormValues,
  validateApplication,
  submitApplication,
  requestDocumentUpload,
  uploadApplicationFile,
  completeDocumentUpload,
  createPaymentIntent,
  captureMockPayment,
  deleteApplicationDocument,
  submitCorrection,
  getApplicationCertificate,
};

export const applicationsQueryKeys = {
  all: ['applications'] as const,
  list: (page: number, status?: string) =>
    [...applicationsQueryKeys.all, 'list', page, status ?? 'all'] as const,
  drafts: () => [...applicationsQueryKeys.all, 'drafts'] as const,
  detail: (id: string) => [...applicationsQueryKeys.all, 'detail', id] as const,
};
