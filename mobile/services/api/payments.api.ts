import { apiClient } from './client';
import { unwrapApiResponse } from './types';

export interface CitizenPayment {
  id: string;
  amount: number;
  currency: string;
  status: string;
  createdAt: string;
  applicationId: string;
  publicRef: string | null;
  serviceName: string;
}

export async function listCitizenPayments() {
  const response = await apiClient.get('/payments');
  return unwrapApiResponse<CitizenPayment[]>(response);
}

export const paymentsApi = {
  listCitizenPayments,
};

export const paymentsQueryKeys = {
  all: ['payments'] as const,
  list: () => [...paymentsQueryKeys.all, 'list'] as const,
};
