import { apiClient } from '@/services/api/client';
import { unwrapApiResponse, unwrapPaginated } from '@/services/api/types';
import { getTotalFromMeta } from '@/services/api/pagination';
import {
  buildPipelineStages,
  mapApplicationDetail,
  mapApplicationSummary,
} from '../adapters/application.adapter';
import type {
  ApplicationCategory,
  ApplicationDetail,
  ApplicationPriority,
  ApplicationStatus,
  ApplicationSummary,
  ApplicationsStats,
  PipelineStage,
} from '../types';

export interface GetApplicationsParams {
  category?: ApplicationCategory | 'All Applications';
  status?: ApplicationStatus | 'all';
  priority?: ApplicationPriority | 'all';
  assigned?: string | 'all';
  search?: string;
  page?: number;
  pageSize?: number;
}

export interface GetApplicationsResult {
  data: ApplicationSummary[];
  total: number;
  page: number;
  pageSize: number;
}

const STATUS_TO_BACKEND: Partial<Record<ApplicationStatus, string>> = {
  submitted: 'SUBMITTED',
  under_review: 'UNDER_REVIEW',
  processing: 'PROCESSING',
  approved: 'APPROVED',
  completed: 'COMPLETED',
  rejected: 'REJECTED',
};

export async function getApplicationsStats(): Promise<ApplicationsStats> {
  const response = await apiClient.get('/admin/applications', { params: { page: 1, limit: 100 } });
  const { data, meta } = unwrapPaginated<Parameters<typeof mapApplicationSummary>[0][]>(response);
  const items = data.map(mapApplicationSummary);
  const today = new Date().toDateString();

  return {
    total: getTotalFromMeta(meta),
    todayReceived: items.filter((a) => new Date(a.submittedAt).toDateString() === today).length,
    pendingReview: items.filter((a) => a.status === 'under_review' || a.status === 'submitted').length,
    inProcessing: items.filter((a) => a.status === 'processing').length,
    completedToday: items.filter(
      (a) => a.status === 'completed' && new Date(a.submittedAt).toDateString() === today,
    ).length,
  };
}

export async function getPipelineStages(): Promise<PipelineStage[]> {
  const response = await apiClient.get('/admin/applications', { params: { page: 1, limit: 200 } });
  const { data } = unwrapPaginated<Parameters<typeof mapApplicationSummary>[0][]>(response);
  return buildPipelineStages(data);
}

export async function getApplications(params: GetApplicationsParams = {}): Promise<GetApplicationsResult> {
  const { status = 'all', page = 1, pageSize = 10, search } = params;

  const response = await apiClient.get('/admin/applications', {
    params: {
      page,
      limit: pageSize,
      status: status !== 'all' ? STATUS_TO_BACKEND[status] : undefined,
      search: search?.trim() || undefined,
    },
  });
  const { data, meta } = unwrapPaginated<Parameters<typeof mapApplicationSummary>[0][]>(response);

  let items = data.map(mapApplicationSummary);

  if (params.category && params.category !== 'All Applications') {
    items = items.filter((a) => a.category === params.category);
  }
  if (params.priority && params.priority !== 'all') {
    items = items.filter((a) => a.priority === params.priority);
  }
  if (params.assigned && params.assigned !== 'all') {
    items = items.filter((a) => a.assignedOperator === params.assigned);
  }

  return {
    data: items,
    total: getTotalFromMeta(meta),
    page,
    pageSize,
  };
}

export async function getApplicationById(applicationId: string): Promise<ApplicationDetail> {
  const response = await apiClient.get(`/admin/applications/${applicationId}`);
  const data = unwrapApiResponse<Parameters<typeof mapApplicationDetail>[0]>(response);
  return mapApplicationDetail(data);
}

export async function assignApplicationOperator(applicationId: string, operatorId: string) {
  const response = await apiClient.post(`/admin/applications/${applicationId}/assign`, { operatorId });
  return unwrapApiResponse(response);
}

export async function addApplicationNote(applicationId: string, content: string) {
  const response = await apiClient.post(`/admin/applications/${applicationId}/notes`, { content });
  return unwrapApiResponse(response);
}

export async function executeApplicationTransition(
  applicationId: string,
  actionKey: string,
  options?: {
    comment?: string;
    instructions?: string;
    requiredFieldKeys?: string[];
    requiredDocumentIds?: string[];
  },
) {
  const response = await apiClient.post(`/admin/applications/${applicationId}/transitions`, {
    actionKey,
    comment: options?.comment,
    instructions: options?.instructions,
    requiredFieldKeys: options?.requiredFieldKeys,
    requiredDocumentIds: options?.requiredDocumentIds,
  });
  return unwrapApiResponse(response);
}

export async function requestCorrection(
  applicationId: string,
  payload: {
    reason: string;
    instructions?: string;
    requiredFieldKeys?: string[];
    requiredDocumentIds?: string[];
    deadline?: string;
  },
) {
  const response = await apiClient.post(`/admin/applications/${applicationId}/action-required`, payload);
  return unwrapApiResponse(response);
}

export async function getAvailableTransitions(applicationId: string) {
  const response = await apiClient.get(`/admin/applications/${applicationId}/transitions`);
  return unwrapApiResponse<{
    transitions: Array<{
      actionKey: string;
      label: string;
      toStepKey: string;
      toApplicationStatus: string;
      requiresComment?: boolean;
      requiresAssignment?: boolean;
      createsActionRequest?: boolean;
    }>;
  }>(response);
}

export async function getApplicationDocumentDownload(
  applicationId: string,
  documentId: string,
): Promise<{ downloadUrl: string }> {
  const response = await apiClient.get(
    `/admin/applications/${applicationId}/documents/${documentId}/download`,
  );
  return unwrapApiResponse<{ downloadUrl: string }>(response);
}

export const applicationsService = {
  getApplicationsStats,
  getPipelineStages,
  getApplications,
  getApplicationById,
  assignApplicationOperator,
  addApplicationNote,
  executeApplicationTransition,
  requestCorrection,
  getAvailableTransitions,
  getApplicationDocumentDownload,
};
