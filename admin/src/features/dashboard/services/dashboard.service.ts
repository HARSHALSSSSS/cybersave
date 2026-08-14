import { apiClient } from '@/services/api/client';
import { unwrapApiResponse } from '@/services/api/types';
import {
  mapRecentApplication,
  mapSummaryToKpis,
  type DashboardSummaryResponse,
} from '../adapters/dashboard.adapter';
import type {
  ApplicationTrendPoint,
  CollectionsSummary,
  DashboardKpi,
  OperatorLogEntry,
  OperatorLogType,
  RecentApplication,
  RevenuePoint,
  ServiceShareSlice,
} from '../types';

interface RevenueTrendRow {
  date: string;
  label: string;
  amount: number;
}

interface ApplicationTrendRow {
  date: string;
  label: string;
  submitted: number;
  processing: number;
  completed: number;
  rejected?: number;
}

interface ServiceShareRow {
  service: string;
  count: number;
  percent: number;
}

interface OperatorLogRow {
  id: string;
  action: string;
  resourceType: string;
  createdAt: string;
  operatorName: string;
}

function mapOperatorLogType(action: string, resourceType: string): OperatorLogType {
  if (action.includes('PAYMENT')) return 'payment';
  if (resourceType.toLowerCase().includes('application')) return 'application';
  if (action.includes('DOCUMENT') || resourceType.toLowerCase().includes('document')) {
    return 'verification';
  }
  if (action.includes('ALERT')) return 'alert';
  return 'centre';
}

async function getSummary(): Promise<DashboardSummaryResponse> {
  const response = await apiClient.get('/admin/dashboard/summary');
  return unwrapApiResponse<DashboardSummaryResponse>(response);
}

export async function getDashboardKpis(): Promise<DashboardKpi[]> {
  const summary = await getSummary();
  return mapSummaryToKpis(summary);
}

export async function getRevenueOverview(range: '7d' | '30d' = '7d'): Promise<RevenuePoint[]> {
  const days = range === '30d' ? 30 : 7;
  const response = await apiClient.get('/admin/dashboard/revenue-trends', { params: { days } });
  const rows = unwrapApiResponse<RevenueTrendRow[]>(response);
  return rows.map((row) => ({
    label: row.label,
    revenue: row.amount,
  }));
}

export async function getApplicationTrends(): Promise<ApplicationTrendPoint[]> {
  const response = await apiClient.get('/admin/dashboard/application-trends', { params: { days: 7 } });
  const rows = unwrapApiResponse<ApplicationTrendRow[]>(response);
  return rows.map((row) => ({
    label: row.label,
    completed: row.completed,
    pending: row.processing + row.submitted,
    rejected: row.rejected ?? 0,
  }));
}

export async function getServiceShare(): Promise<ServiceShareSlice[]> {
  const response = await apiClient.get('/admin/dashboard/service-share');
  const rows = unwrapApiResponse<ServiceShareRow[]>(response);
  const palette = ['#2563EB', '#7C3AED', '#16A34A', '#D97706', '#DC2626', '#0891B2'];
  return rows.map((row, index) => ({
    name: row.service,
    value: row.percent,
    color: palette[index % palette.length],
  }));
}

export async function getCollectionsSummary(): Promise<CollectionsSummary> {
  const summary = await getSummary();
  const total = Number(summary.totalRevenue) || 0;
  return {
    total,
    onlineAmount: total,
    cashAmount: 0,
    onlinePercent: total > 0 ? 100 : 0,
    cashPercent: 0,
  };
}

export async function getOperatorLogs(): Promise<OperatorLogEntry[]> {
  const response = await apiClient.get('/admin/dashboard/operator-logs');
  const rows = unwrapApiResponse<OperatorLogRow[]>(response);
  return rows.map((row) => ({
    id: row.id,
    type: mapOperatorLogType(row.action, row.resourceType),
    actorName: row.operatorName,
    actorInitials: row.operatorName
      .split(/\s+/)
      .map((part) => part[0])
      .join('')
      .slice(0, 2)
      .toUpperCase(),
    message: `${row.action.replace(/_/g, ' ').toLowerCase()} on ${row.resourceType}`,
    timestamp: new Date(row.createdAt).toLocaleString('en-IN'),
  }));
}

export async function getRecentApplications(): Promise<RecentApplication[]> {
  const summary = await getSummary();
  return (summary.recentApplications ?? []).map(mapRecentApplication);
}

export const dashboardService = {
  getDashboardKpis,
  getRevenueOverview,
  getApplicationTrends,
  getServiceShare,
  getCollectionsSummary,
  getOperatorLogs,
  getRecentApplications,
};
