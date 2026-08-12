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

export const manualApplyApi = {
  createSession(subServiceId: string, stateCode?: string) {
    return apiClient
      .post('/manual-apply/sessions', { subServiceId, stateCode })
      .then(res => unwrapApiResponse<ManualApplySession>(res));
  },

  createPaymentIntent(sessionId: string) {
    return apiClient
      .post(`/manual-apply/sessions/${sessionId}/payment-intent`, {
        idempotencyKey: randomIdempotencyKey(),
      })
      .then(res => unwrapApiResponse<ManualApplyPaymentIntent>(res));
  },

  confirmPayment(sessionId: string) {
    return apiClient
      .post(`/manual-apply/sessions/${sessionId}/confirm-payment`)
      .then(res => unwrapApiResponse<ManualApplySession>(res));
  },

  markRedirected(sessionId: string) {
    return apiClient
      .post(`/manual-apply/sessions/${sessionId}/redirected`)
      .then(res => unwrapApiResponse<ManualApplySession>(res));
  },

  confirmApplied(sessionId: string) {
    return apiClient
      .post(`/manual-apply/sessions/${sessionId}/confirm-applied`)
      .then(res => unwrapApiResponse<ManualApplySession>(res));
  },

  listSessions() {
    return apiClient
      .get('/manual-apply/sessions')
      .then(res => unwrapApiResponse<ManualApplySession[]>(res));
  },
};

export const manualApplyQueryKeys = {
  all: ['manual-apply'] as const,
  sessions: () => [...manualApplyQueryKeys.all, 'sessions'] as const,
};
