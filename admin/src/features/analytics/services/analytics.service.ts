import { apiClient } from '@/services/api/client';
import { unwrapApiResponse, unwrapPaginated } from '@/services/api/types';
import { getApplicationsStats } from '@/features/applications/services/applications.service';
import type {
  ActivityLogEntry,
  AnalyticsStats,
  CategoryBreakdownItem,
  DocumentActivityPoint,
  StatusDistributionItem,
} from '../types';

interface DocumentActivityRow {
  date: string;
  label: string;
  uploads: number;
}

export async function getAnalyticsStats(): Promise<AnalyticsStats> {
  const appStats = await getApplicationsStats();

  return {
    totalUploaded: appStats.total,
    totalUploadedTrend: { value: `${appStats.todayReceived} today`, direction: 'up' },
    verified: appStats.completedToday,
    verifiedTrend: { value: `${appStats.inProcessing} processing`, direction: 'neutral' },
    pendingReview: appStats.pendingReview,
    pendingReviewTrend: { value: `${appStats.inProcessing} in queue`, direction: 'neutral' },
    expired: 0,
  };
}

export async function getDocumentActivityTrends(): Promise<DocumentActivityPoint[]> {
  const response = await apiClient.get('/admin/dashboard/document-activity', { params: { days: 7 } });
  const rows = unwrapApiResponse<DocumentActivityRow[]>(response);
  return rows.map((row) => ({
    label: row.label,
    uploads: row.uploads,
    verifications: 0,
  }));
}

export async function getCategoryBreakdown(): Promise<CategoryBreakdownItem[]> {
  const stats = await getApplicationsStats();
  return [
    { category: 'Submitted', count: stats.todayReceived },
    { category: 'Pending Review', count: stats.pendingReview },
    { category: 'In Processing', count: stats.inProcessing },
    { category: 'Completed Today', count: stats.completedToday },
  ];
}

export async function getStatusDistribution(): Promise<StatusDistributionItem[]> {
  const stats = await getApplicationsStats();
  const total = stats.total || 1;
  return [
    {
      status: 'verified',
      label: 'Completed',
      value: Math.round((stats.completedToday / total) * 100) || 0,
      color: '#16A34A',
    },
    {
      status: 'pending',
      label: 'Pending',
      value: Math.round((stats.pendingReview / total) * 100) || 0,
      color: '#D97706',
    },
    {
      status: 'expired',
      label: 'Processing',
      value: Math.round((stats.inProcessing / total) * 100) || 0,
      color: '#2563EB',
    },
  ];
}

export async function getActivityLog(): Promise<ActivityLogEntry[]> {
  const response = await apiClient.get('/admin/audit-logs', { params: { page: 1, limit: 10 } });
  const { data } = unwrapPaginated<Array<{
    id: string;
    action: string;
    resourceType: string;
    createdAt: string;
    actorAdmin?: { email?: string; firstName?: string; lastName?: string };
  }>>(response);

  return data.map((row) => ({
    id: row.id,
    documentId: row.resourceType,
    name: row.action,
    category: row.resourceType,
    userName:
      [row.actorAdmin?.firstName, row.actorAdmin?.lastName].filter(Boolean).join(' ') ||
      row.actorAdmin?.email ||
      'Admin',
    userInitials: 'AD',
    uploadedAt: row.createdAt,
    status: 'verified' as const,
  }));
}

export const analyticsService = {
  getAnalyticsStats,
  getDocumentActivityTrends,
  getCategoryBreakdown,
  getStatusDistribution,
  getActivityLog,
};
