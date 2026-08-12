import { apiClient } from '@/services/api/client';
import { unwrapApiResponse, unwrapPaginated } from '@/services/api/types';

export interface BbpsDashboardStats {
  totalTransactions: number;
  todayTransactions: number;
  successful: number;
  pending: number;
  failed: number;
  totalAmount: number;
}

export interface BbpsCategoryRow {
  id: string;
  providerCategory: string;
  displayName: string;
  icon: string | null;
  description: string | null;
  appStatus: string;
  displayOrder: number;
  isFeatured: boolean;
  _count?: { billers: number };
}

export interface BbpsBillerRow {
  id: string;
  name: string;
  aliasName: string | null;
  providerCategory: string;
  providerStatus: string;
  isVisible: boolean;
  isFeatured: boolean;
  state: string | null;
  city: string | null;
  lastSyncedAt: string | null;
  category?: { displayName: string };
}

export interface BbpsTransactionRow {
  id: string;
  status: string;
  billAmount: string | number;
  totalAmount: string | number;
  convenienceFee: string | number;
  accountHolderMasked: string;
  createdAt: string;
  updatedAt: string;
  razorpayPaymentId: string | null;
  razorpayBillPaymentId: string | null;
  biller: { name: string; providerCategory: string };
  citizen: { id: string; phone: string; firstName: string | null; lastName: string | null };
}

export interface BbpsIntegrationStatus {
  provider: string;
  service: string;
  activeProvider: string;
  environment: string;
  connection: string;
  lastSuccessfulApiCall: string | null;
  lastBillerSync: string | null;
  lastSyncStatus: string | null;
  apiHealth: string;
  catalogue: { categories: number; billers: number };
}

export async function getBillPaymentsDashboard(): Promise<BbpsDashboardStats> {
  const res = await apiClient.get('/admin/bill-payments/dashboard');
  return unwrapApiResponse<BbpsDashboardStats>(res);
}

export async function listBillPaymentCategories(): Promise<BbpsCategoryRow[]> {
  const res = await apiClient.get('/admin/bill-payments/categories');
  return unwrapApiResponse<BbpsCategoryRow[]>(res);
}

export async function updateBillPaymentCategory(
  id: string,
  data: Partial<Pick<BbpsCategoryRow, 'displayName' | 'icon' | 'description' | 'appStatus' | 'displayOrder' | 'isFeatured'>>,
) {
  const res = await apiClient.patch(`/admin/bill-payments/categories/${id}`, data);
  return unwrapApiResponse(res);
}

export async function listBillPaymentBillers(params: {
  category?: string;
  search?: string;
  page?: number;
  limit?: number;
}) {
  const res = await apiClient.get('/admin/bill-payments/billers', { params });
  return unwrapPaginated<BbpsBillerRow[]>(res);
}

export async function updateBillPaymentBiller(
  id: string,
  data: Partial<{
    isVisible: boolean;
    isFeatured: boolean;
    displayOrder: number;
    internalAlias: string;
    internalDescription: string;
  }>,
) {
  const res = await apiClient.patch(`/admin/bill-payments/billers/${id}`, data);
  return unwrapApiResponse(res);
}

export async function listBillPaymentTransactions(params: {
  status?: string;
  category?: string;
  search?: string;
  page?: number;
  limit?: number;
}) {
  const res = await apiClient.get('/admin/bill-payments/transactions', { params });
  return unwrapPaginated<BbpsTransactionRow[]>(res);
}

export interface BbpsTransactionDetail extends BbpsTransactionRow {
  paidAt: string | null;
  razorpayOrderId: string | null;
  errorMessage: string | null;
  billRequest: {
    billDetails: Record<string, unknown> | null;
  } | null;
}

export async function getBillPaymentTransaction(id: string): Promise<BbpsTransactionDetail> {
  const res = await apiClient.get(`/admin/bill-payments/transactions/${id}`);
  return unwrapApiResponse<BbpsTransactionDetail>(res);
}

export async function getBillPaymentsIntegrationStatus(): Promise<BbpsIntegrationStatus> {
  const res = await apiClient.get('/admin/bill-payments/integration/status');
  return unwrapApiResponse<BbpsIntegrationStatus>(res);
}

export async function triggerBillPaymentsSync() {
  const res = await apiClient.post('/admin/bill-payments/sync');
  return unwrapApiResponse(res);
}

export const billPaymentsService = {
  getBillPaymentsDashboard,
  listBillPaymentCategories,
  updateBillPaymentCategory,
  listBillPaymentBillers,
  updateBillPaymentBiller,
  listBillPaymentTransactions,
  getBillPaymentTransaction,
  getBillPaymentsIntegrationStatus,
  triggerBillPaymentsSync,
};
