import { shouldUseDevDiscovery } from '@app/config/env';
import { apiClient } from './client';
import { devAwareDelete, devAwareGet, devAwarePost } from './devRequest';
import { unwrapApiResponse, unwrapPaginated } from './types';

export interface BbpsCategory {
  id: string;
  providerCategory: string;
  displayName: string;
  icon: string | null;
  description: string | null;
  isFeatured: boolean;
}

export interface BbpsBillerSummary {
  id: string;
  name: string;
  aliasName: string | null;
  category: string;
  logoUrl: string | null;
  state: string | null;
  city: string | null;
  isFeatured: boolean;
}

export interface BbpsField {
  key: string;
  label: string;
  type: string;
  required: boolean;
  minLength?: number;
  maxLength?: number;
  regex?: string;
  placeholder?: string;
  helpText?: string;
  options?: Array<{ label: string; value: string }>;
}

export interface BbpsBillerDetail extends BbpsBillerSummary {
  fields: BbpsField[];
  billRequestRequired: string;
}

export interface BbpsBillRequest {
  id: string;
  status: 'processing' | 'success' | 'failed';
  biller: BbpsBillerSummary;
  accountHolderData: Record<string, string>;
  customerName: string | null;
  billAmount: number | null;
  dueDate: string | null;
  billNumber: string | null;
  billDetails: Record<string, unknown>;
  breakdown: unknown;
  errorCode: string | null;
  errorMessage: string | null;
  createdAt: string;
}

export interface BbpsBillPayment {
  id: string;
  status: 'processing' | 'pending' | 'success' | 'failed';
  biller: BbpsBillerSummary;
  billAmount: number;
  convenienceFee: number;
  totalAmount: number;
  accountMasked: string;
  paidAt: string | null;
  createdAt: string;
  errorCode: string | null;
  errorMessage: string | null;
  billRequestId?: string;
  billDetails?: Record<string, unknown>;
  transactionId?: string;
  bbpsReference?: string;
  billerReference?: string;
  npciReference?: string;
  orderId?: string;
  keyId?: string;
  provider?: string;
}

export interface RecentBiller {
  billerId: string;
  billerName: string;
  category: string;
  logoUrl: string | null;
  accountMasked: string;
  lastUsedAt: string;
  lastPaymentAmount: number;
}

export interface SavedBiller {
  id: string;
  billerId: string;
  billerName: string;
  category: string;
  logoUrl: string | null;
  nickname: string | null;
  accountMasked: string;
  accountHolderData: Record<string, string>;
  lastUsedAt: string;
  lastPaymentAmount: number | null;
}

export interface BbpsSettings {
  provider: string;
  convenienceFeeFlat: number;
}

export const billPaymentsQueryKeys = {
  all: ['bill-payments'] as const,
  settings: () => [...billPaymentsQueryKeys.all, 'settings'] as const,
  categories: () => [...billPaymentsQueryKeys.all, 'categories'] as const,
  billers: (category: string, search?: string) =>
    [...billPaymentsQueryKeys.all, 'billers', category, search ?? ''] as const,
  biller: (id: string) => [...billPaymentsQueryKeys.all, 'biller', id] as const,
  billRequest: (id: string) => [...billPaymentsQueryKeys.all, 'bill-request', id] as const,
  payment: (id: string) => [...billPaymentsQueryKeys.all, 'payment', id] as const,
  history: (filter: string, page: number) =>
    [...billPaymentsQueryKeys.all, 'history', filter, page] as const,
  recent: () => [...billPaymentsQueryKeys.all, 'recent'] as const,
  saved: () => [...billPaymentsQueryKeys.all, 'saved'] as const,
};

function randomIdempotencyKey(): string {
  return `bbps_${Date.now()}_${Math.random().toString(36).slice(2, 10)}`;
}

function unwrapEnvelope<T>(body: unknown): T {
  if (body && typeof body === 'object' && 'success' in body && (body as { success: boolean }).success) {
    return (body as { data: T }).data;
  }
  return body as T;
}

function unwrapPaginatedBody<T>(body: unknown): { data: T; meta: Record<string, unknown> } {
  if (body && typeof body === 'object' && 'success' in body) {
    const envelope = body as { success: boolean; data: T; meta?: Record<string, unknown> };
    return { data: envelope.data, meta: envelope.meta ?? {} };
  }
  return body as { data: T; meta: Record<string, unknown> };
}

export const billPaymentsApi = {
  getSettings(): Promise<BbpsSettings> {
    if (shouldUseDevDiscovery()) {
      return devAwareGet<unknown>('/bill-payments/settings').then(unwrapEnvelope<BbpsSettings>);
    }
    return apiClient
      .get('/bill-payments/settings')
      .then(res => unwrapApiResponse<BbpsSettings>(res));
  },

  listCategories(): Promise<BbpsCategory[]> {
    if (shouldUseDevDiscovery()) {
      return devAwareGet<unknown>('/bill-payments/categories').then(unwrapEnvelope<BbpsCategory[]>);
    }
    return apiClient
      .get('/bill-payments/categories')
      .then(res => unwrapApiResponse<BbpsCategory[]>(res));
  },

  listBillers(params: {
    category: string;
    search?: string;
    page?: number;
    limit?: number;
  }): Promise<{ data: BbpsBillerSummary[]; meta: Record<string, unknown> }> {
    const query = {
      search: params.search,
      page: params.page,
      limit: params.limit,
    };
    const path = `/bill-payments/categories/${encodeURIComponent(params.category)}/billers`;
    if (shouldUseDevDiscovery()) {
      return devAwareGet<unknown>(path, query).then(
        body => unwrapPaginatedBody<BbpsBillerSummary[]>(body),
      );
    }
    return apiClient
      .get(path, { params: query })
      .then(res =>
        unwrapPaginated<BbpsBillerSummary[]>(res) as {
          data: BbpsBillerSummary[];
          meta: Record<string, unknown>;
        },
      );
  },

  getBiller(billerId: string): Promise<BbpsBillerDetail> {
    if (shouldUseDevDiscovery()) {
      return devAwareGet<unknown>(`/bill-payments/billers/${billerId}`).then(
        unwrapEnvelope<BbpsBillerDetail>,
      );
    }
    return apiClient
      .get(`/bill-payments/billers/${billerId}`)
      .then(res => unwrapApiResponse<BbpsBillerDetail>(res));
  },

  createBillRequest(
    billerId: string,
    accountHolder: Record<string, string>,
  ): Promise<BbpsBillRequest> {
    if (shouldUseDevDiscovery()) {
      return devAwarePost<unknown>(`/bill-payments/billers/${billerId}/bill-requests`, {
        accountHolder,
      }).then(unwrapEnvelope<BbpsBillRequest>);
    }
    return apiClient
      .post(`/bill-payments/billers/${billerId}/bill-requests`, { accountHolder })
      .then(res => unwrapApiResponse<BbpsBillRequest>(res));
  },

  getBillRequest(requestId: string, poll = false): Promise<BbpsBillRequest> {
    const params = poll ? { poll: 'true' } : undefined;
    if (shouldUseDevDiscovery()) {
      return devAwareGet<unknown>(`/bill-payments/bill-requests/${requestId}`, params).then(
        unwrapEnvelope<BbpsBillRequest>,
      );
    }
    return apiClient
      .get(`/bill-payments/bill-requests/${requestId}`, { params })
      .then(res => unwrapApiResponse<BbpsBillRequest>(res));
  },

  createPaymentIntent(billRequestId: string): Promise<BbpsBillPayment> {
    const body = { idempotencyKey: randomIdempotencyKey() };
    if (shouldUseDevDiscovery()) {
      return devAwarePost<unknown>(
        `/bill-payments/bill-requests/${billRequestId}/payment-intent`,
        body,
      ).then(unwrapEnvelope<BbpsBillPayment>);
    }
    return apiClient
      .post(`/bill-payments/bill-requests/${billRequestId}/payment-intent`, body)
      .then(res => unwrapApiResponse<BbpsBillPayment>(res));
  },

  confirmPayment(
    paymentId: string,
    options?: {
      mockCapture?: boolean;
      razorpayPaymentId?: string;
      razorpayOrderId?: string;
      razorpaySignature?: string;
    },
  ): Promise<BbpsBillPayment> {
    const mockCapture = options?.mockCapture ?? false;
    const body = {
      razorpayPaymentId: options?.razorpayPaymentId,
      razorpayOrderId: options?.razorpayOrderId,
      razorpaySignature: options?.razorpaySignature,
    };
    const params = mockCapture ? { mock: 'true' } : undefined;
    if (shouldUseDevDiscovery()) {
      return devAwarePost<unknown>(`/bill-payments/payments/${paymentId}/confirm`, body, params).then(
        unwrapEnvelope<BbpsBillPayment>,
      );
    }
    return apiClient
      .post(`/bill-payments/payments/${paymentId}/confirm`, body, { params })
      .then(res => unwrapApiResponse<BbpsBillPayment>(res));
  },

  getPayment(paymentId: string, poll = false): Promise<BbpsBillPayment> {
    const params = poll ? { poll: 'true' } : undefined;
    if (shouldUseDevDiscovery()) {
      return devAwareGet<unknown>(`/bill-payments/payments/${paymentId}`, params).then(
        unwrapEnvelope<BbpsBillPayment>,
      );
    }
    return apiClient
      .get(`/bill-payments/payments/${paymentId}`, { params })
      .then(res => unwrapApiResponse<BbpsBillPayment>(res));
  },

  listHistory(
    filter: 'all' | 'success' | 'pending' | 'failed' = 'all',
    page = 1,
    limit = 20,
  ): Promise<{ data: BbpsBillPayment[]; meta: Record<string, unknown> }> {
    const params = { filter, page, limit };
    if (shouldUseDevDiscovery()) {
      return devAwareGet<unknown>('/bill-payments/history', params).then(
        body => unwrapPaginatedBody<BbpsBillPayment[]>(body),
      );
    }
    return apiClient
      .get('/bill-payments/history', { params })
      .then(res =>
        unwrapPaginated<BbpsBillPayment[]>(res) as {
          data: BbpsBillPayment[];
          meta: Record<string, unknown>;
        },
      );
  },

  listRecentBillers(): Promise<RecentBiller[]> {
    if (shouldUseDevDiscovery()) {
      return devAwareGet<unknown>('/bill-payments/recent-billers').then(
        unwrapEnvelope<RecentBiller[]>,
      );
    }
    return apiClient
      .get('/bill-payments/recent-billers')
      .then(res => unwrapApiResponse<RecentBiller[]>(res));
  },

  listSavedBillers(): Promise<SavedBiller[]> {
    if (shouldUseDevDiscovery()) {
      return devAwareGet<unknown>('/bill-payments/saved-billers').then(
        unwrapEnvelope<SavedBiller[]>,
      );
    }
    return apiClient
      .get('/bill-payments/saved-billers')
      .then(res => unwrapApiResponse<SavedBiller[]>(res));
  },

  saveBiller(
    billerId: string,
    accountHolder: Record<string, string>,
    nickname?: string,
  ): Promise<unknown> {
    const body = { accountHolder, nickname };
    if (shouldUseDevDiscovery()) {
      return devAwarePost<unknown>(`/bill-payments/saved-billers/${billerId}`, body).then(
        unwrapEnvelope,
      );
    }
    return apiClient
      .post(`/bill-payments/saved-billers/${billerId}`, body)
      .then(res => unwrapApiResponse(res));
  },

  deleteSavedBiller(savedId: string): Promise<void> {
    if (shouldUseDevDiscovery()) {
      return devAwareDelete<unknown>(`/bill-payments/saved-billers/${savedId}`).then(
        () => undefined,
      );
    }
    return apiClient
      .delete(`/bill-payments/saved-billers/${savedId}`)
      .then(() => undefined);
  },
};
