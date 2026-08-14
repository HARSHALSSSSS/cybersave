import { apiClient } from '@/services/api/client';
import { unwrapApiResponse } from '@/services/api/types';

export type ManualApplySession = {
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
  citizen?: {
    id: string;
    phone: string;
    firstName: string | null;
    lastName: string | null;
  };
};

export type ManualApplyListResponse = {
  data: ManualApplySession[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
};

export async function listManualApplySessions(page = 1, limit = 20) {
  const response = await apiClient.get('/admin/manual-apply/sessions', {
    params: { page, limit },
  });
  return unwrapApiResponse<ManualApplyListResponse>(response);
}

export const manualApplyApi = {
  listManualApplySessions,
};
