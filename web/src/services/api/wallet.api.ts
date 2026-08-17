import { apiClient } from './client';
import { unwrapApiResponse } from './types';

export interface WalletTransaction {
  id: string;
  type: 'TOPUP' | 'DEBIT' | 'REFUND';
  amount: number;
  balanceAfter: number;
  referenceType?: string | null;
  referenceId?: string | null;
  description?: string | null;
  createdAt: string;
}

export interface WalletSummary {
  balance: number;
  currency: string;
  provider: string;
  keyId: string;
  transactions: WalletTransaction[];
}

export interface WalletTopUpIntent {
  id: string;
  amount: string;
  currency: string;
  status: string;
  orderId?: string | null;
  keyId: string;
  provider: string;
  idempotencyKey: string;
}

export async function getWalletSummary() {
  const response = await apiClient.get('/wallet');
  return unwrapApiResponse<WalletSummary>(response);
}

export async function createWalletTopUpIntent(amount: number, idempotencyKey: string) {
  const response = await apiClient.post('/wallet/top-up-intent', { amount, idempotencyKey });
  return unwrapApiResponse<WalletTopUpIntent>(response);
}

export async function confirmWalletTopUp(
  topUpId: string,
  payload: {
    mockCapture?: boolean;
    razorpayPaymentId?: string;
    razorpayOrderId?: string;
    razorpaySignature?: string;
  },
) {
  const response = await apiClient.post(`/wallet/top-ups/${topUpId}/confirm`, payload);
  return unwrapApiResponse<{ id: string; amount: string; status: string; success: boolean }>(
    response,
  );
}

export const walletApi = {
  getWalletSummary,
  createWalletTopUpIntent,
  confirmWalletTopUp,
};

export const walletQueryKeys = {
  all: ['wallet'] as const,
  summary: () => [...walletQueryKeys.all, 'summary'] as const,
};
