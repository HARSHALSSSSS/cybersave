import { apiClient } from './client';
import { unwrapApiResponse } from './types';

export interface ManualApplySession {
  id: string;
  serviceName: string;
  stateCode: string | null;
  stateName: string | null;
  officialPortalUrl: string;
  platformFee: number;
  status: string;
  redirectedAt: string | null;
  confirmedAt: string | null;
  createdAt: string;
  paymentId: string | null;
  paymentStatus: string | null;
}

export interface ManualApplyPaymentIntent {
  paymentId: string;
  sessionId: string;
  providerRef: string | null;
  amount: number;
  currency: string;
  status: string;
  officialPortalUrl: string;
  platformFee: number;
}

function randomIdempotencyKey(): string {
  return `manual_${Date.now()}_${Math.random().toString(36).slice(2, 10)}`;
}

export async function createManualApplySession(subServiceId: string, stateCode?: string) {
  const response = await apiClient.post('/manual-apply/sessions', { subServiceId, stateCode });
  return unwrapApiResponse<ManualApplySession>(response);
}

export async function createManualApplyPaymentIntent(sessionId: string) {
  const response = await apiClient.post(`/manual-apply/sessions/${sessionId}/payment-intent`, {
    idempotencyKey: randomIdempotencyKey(),
  });
  return unwrapApiResponse<ManualApplyPaymentIntent>(response);
}

export async function confirmManualApplyPayment(sessionId: string) {
  const response = await apiClient.post(`/manual-apply/sessions/${sessionId}/confirm-payment`);
  return unwrapApiResponse<ManualApplySession>(response);
}

export async function markManualApplyRedirected(sessionId: string) {
  const response = await apiClient.post(`/manual-apply/sessions/${sessionId}/redirected`);
  return unwrapApiResponse<ManualApplySession>(response);
}

export async function confirmManualApplyApplied(sessionId: string) {
  const response = await apiClient.post(`/manual-apply/sessions/${sessionId}/confirm-applied`);
  return unwrapApiResponse<ManualApplySession>(response);
}

export async function listManualApplySessions() {
  const response = await apiClient.get('/manual-apply/sessions');
  return unwrapApiResponse<ManualApplySession[]>(response);
}

export const manualApplyApi = {
  createSession: createManualApplySession,
  createPaymentIntent: createManualApplyPaymentIntent,
  confirmPayment: confirmManualApplyPayment,
  markRedirected: markManualApplyRedirected,
  confirmApplied: confirmManualApplyApplied,
  listSessions: listManualApplySessions,
};

export const manualApplyQueryKeys = {
  all: ['manual-apply'] as const,
  sessions: () => [...manualApplyQueryKeys.all, 'sessions'] as const,
};
