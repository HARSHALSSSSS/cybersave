import {
  Building2,
  CheckCircle2,
  Clock,
  FileText,
  IndianRupee,
  XCircle,
} from 'lucide-react';

import { decimalToNumber, fullName, initials } from '@/services/api/adapters';
import type {
  ApplicationTrendPoint,
  CollectionsSummary,
  DashboardKpi,
  OperatorLogEntry,
  RecentApplication,
  RevenuePoint,
  ServiceShareSlice,
} from '../types';
import type { ApplicationStatus as DashboardApplicationStatus } from '../types';

export interface DashboardSummaryResponse {
  totalApplications: number;
  pendingApplications: number;
  completedApplications: number;
  totalRevenue: string;
  recentApplications: BackendRecentApplication[];
}

interface BackendRecentApplication {
  id: string;
  publicRef?: string | null;
  status: string;
  submittedAt?: string | null;
  createdAt: string;
  citizen?: { firstName?: string | null; lastName?: string | null; phone?: string };
  serviceVersion?: {
    overview?: { displayName?: string | null };
    subService?: { name?: string };
  };
  payment?: { amount?: unknown; status?: string };
  pricingSnapshot?: { totalAmount?: unknown };
}

function mapApplicationStatus(status: string): DashboardApplicationStatus {
  switch (status) {
    case 'COMPLETED':
    case 'APPROVED':
      return 'completed';
    case 'REJECTED':
    case 'CANCELLED':
      return 'rejected';
    case 'PROCESSING':
    case 'UNDER_REVIEW':
      return 'processing';
    default:
      return 'pending';
  }
}

export function mapSummaryToKpis(summary: DashboardSummaryResponse): DashboardKpi[] {
  const revenue = decimalToNumber(summary.totalRevenue);
  return [
    {
      id: 'total-revenue',
      title: 'Total Revenue',
      value: `₹${revenue.toLocaleString('en-IN')}`,
      icon: IndianRupee,
      iconColor: '#2563EB',
      iconBg: '#EFF4FF',
      description: 'Captured payments',
    },
    {
      id: 'total-applications',
      title: 'Total Applications',
      value: summary.totalApplications.toLocaleString('en-IN'),
      icon: FileText,
      iconColor: '#7C3AED',
      iconBg: '#F3EEFF',
      description: 'All time',
    },
    {
      id: 'pending',
      title: 'Pending',
      value: summary.pendingApplications.toLocaleString('en-IN'),
      icon: Clock,
      iconColor: '#D97706',
      iconBg: '#FEF6E7',
      description: 'Awaiting action',
    },
    {
      id: 'completed',
      title: 'Completed',
      value: summary.completedApplications.toLocaleString('en-IN'),
      icon: CheckCircle2,
      iconColor: '#16A34A',
      iconBg: '#EAF9EF',
      description: 'Successfully processed',
    },
    {
      id: 'rejected',
      title: 'Rejected',
      value: '—',
      icon: XCircle,
      iconColor: '#DC2626',
      iconBg: '#FDECEC',
      description: 'Not available from API',
    },
    {
      id: 'active-centres',
      title: 'Active Centres',
      value: '—',
      icon: Building2,
      iconColor: '#0891B2',
      iconBg: '#E7F8FB',
      description: 'Not available from API',
    },
  ];
}

export function mapRecentApplication(app: BackendRecentApplication): RecentApplication {
  const citizenName = fullName(app.citizen?.firstName, app.citizen?.lastName, app.citizen?.phone ?? 'Citizen');
  const serviceName =
    app.serviceVersion?.overview?.displayName ??
    app.serviceVersion?.subService?.name ??
    'Service';

  return {
    id: app.id,
    publicRef: app.publicRef ?? null,
    applicantName: citizenName,
    applicantInitials: initials(app.citizen?.firstName, app.citizen?.lastName),
    service: serviceName,
    status: mapApplicationStatus(app.status),
    amount: decimalToNumber(app.payment?.amount ?? app.pricingSnapshot?.totalAmount),
    submittedAt: app.submittedAt ?? app.createdAt,
  };
}

export function emptyRevenuePoints(): RevenuePoint[] {
  return [];
}

export function emptyApplicationTrends(): ApplicationTrendPoint[] {
  return [];
}

export function emptyServiceShare(): ServiceShareSlice[] {
  return [];
}

export function emptyCollectionsSummary(): CollectionsSummary {
  return {
    total: 0,
    onlineAmount: 0,
    cashAmount: 0,
    onlinePercent: 0,
    cashPercent: 0,
  };
}

export function emptyOperatorLogs(): OperatorLogEntry[] {
  return [];
}
