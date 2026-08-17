import { apiClient } from './client';
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
  errorCode?: string | null;
  errorMessage?: string | null;
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

export interface BbpsSettings {
  provider: string;
  convenienceFeeFlat: number;
}

export type BillPaymentHistoryItem = BbpsBillPayment;

export interface RecentBiller {
  billerId: string;
  billerName: string;
  category: string;
  logoUrl: string | null;
  accountMasked: string;
  accountHolder?: Record<string, string>;
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

function randomIdempotencyKey() {
  return `bbps_${Date.now()}_${Math.random().toString(36).slice(2, 10)}`;
}

export async function getBillPaymentSettings() {
  const response = await apiClient.get('/bill-payments/settings');
  return unwrapApiResponse<BbpsSettings>(response);
}

export async function listBillPaymentCategories() {
  const response = await apiClient.get('/bill-payments/categories');
  return unwrapApiResponse<BbpsCategory[]>(response);
}

export async function listBillers(params: {
  category: string;
  search?: string;
  page?: number;
  limit?: number;
}) {
  const response = await apiClient.get(
    `/bill-payments/categories/${encodeURIComponent(params.category)}/billers`,
    { params: { search: params.search, page: params.page, limit: params.limit } },
  );
  return unwrapPaginated<BbpsBillerSummary[]>(response);
}

export async function getBiller(billerId: string) {
  const response = await apiClient.get(`/bill-payments/billers/${billerId}`);
  return unwrapApiResponse<BbpsBillerDetail>(response);
}

export async function createBillRequest(billerId: string, accountHolder: Record<string, string>) {
  const response = await apiClient.post(`/bill-payments/billers/${billerId}/bill-requests`, {
    accountHolder,
  });
  return unwrapApiResponse<BbpsBillRequest>(response);
}

export async function getBillRequest(requestId: string, poll = false) {
  const response = await apiClient.get(`/bill-payments/bill-requests/${requestId}`, {
    params: poll ? { poll: 'true' } : undefined,
  });
  return unwrapApiResponse<BbpsBillRequest>(response);
}

export async function createBillPaymentIntent(billRequestId: string) {
  const response = await apiClient.post(
    `/bill-payments/bill-requests/${billRequestId}/payment-intent`,
    { idempotencyKey: randomIdempotencyKey() },
  );
  return unwrapApiResponse<BbpsBillPayment>(response);
}

export async function confirmBillPayment(
  paymentId: string,
  options?: {
    mockCapture?: boolean;
    razorpayPaymentId?: string;
    razorpayOrderId?: string;
    razorpaySignature?: string;
  },
) {
  const response = await apiClient.post(
    `/bill-payments/payments/${paymentId}/confirm`,
    {
      razorpayPaymentId: options?.razorpayPaymentId,
      razorpayOrderId: options?.razorpayOrderId,
      razorpaySignature: options?.razorpaySignature,
    },
    { params: options?.mockCapture ? { mock: 'true' } : undefined },
  );
  return unwrapApiResponse<BbpsBillPayment>(response);
}

export async function getBillPayment(paymentId: string, poll = false) {
  const response = await apiClient.get(`/bill-payments/payments/${paymentId}`, {
    params: poll ? { poll: 'true' } : undefined,
  });
  return unwrapApiResponse<BbpsBillPayment>(response);
}

export async function getBillPaymentHistory(params?: {
  filter?: 'all' | 'success' | 'pending' | 'failed';
  page?: number;
  limit?: number;
}) {
  const response = await apiClient.get('/bill-payments/history', { params });
  return unwrapPaginated<BillPaymentHistoryItem[]>(response);
}

export async function listRecentBillers() {
  const response = await apiClient.get('/bill-payments/recent-billers');
  return unwrapApiResponse<RecentBiller[]>(response);
}

export async function listSavedBillers() {
  const response = await apiClient.get('/bill-payments/saved-billers');
  return unwrapApiResponse<SavedBiller[]>(response);
}

export async function saveBiller(
  billerId: string,
  accountHolder: Record<string, string>,
  nickname?: string,
) {
  const response = await apiClient.post(`/bill-payments/saved-billers/${billerId}`, {
    accountHolder,
    nickname,
  });
  return unwrapApiResponse<SavedBiller>(response);
}

export const billPaymentsApi = {
  getSettings: getBillPaymentSettings,
  listCategories: listBillPaymentCategories,
  listBillers,
  getBiller,
  createBillRequest,
  getBillRequest,
  createPaymentIntent: createBillPaymentIntent,
  confirmPayment: confirmBillPayment,
  getPayment: getBillPayment,
  getBillPaymentHistory,
  listRecentBillers,
  listSavedBillers,
  saveBiller,
};

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
