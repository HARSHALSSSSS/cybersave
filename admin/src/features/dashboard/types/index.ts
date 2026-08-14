import type { LucideIcon } from 'lucide-react';

export type TrendDirection = 'up' | 'down' | 'neutral';

export interface DashboardKpi {
  id: string;
  title: string;
  value: string;
  icon: LucideIcon;
  iconColor: string;
  iconBg: string;
  trend?: {
    value: string;
    direction: TrendDirection;
  };
  description: string;
}

export interface RevenuePoint {
  label: string;
  revenue: number;
}

export interface ApplicationTrendPoint {
  label: string;
  completed: number;
  pending: number;
  rejected: number;
}

export interface ServiceShareSlice {
  name: string;
  value: number;
  color: string;
}

export interface CollectionsSummary {
  total: number;
  onlineAmount: number;
  cashAmount: number;
  onlinePercent: number;
  cashPercent: number;
}

export type OperatorLogType = 'verification' | 'application' | 'payment' | 'alert' | 'centre';

export interface OperatorLogEntry {
  id: string;
  type: OperatorLogType;
  actorName: string;
  actorInitials: string;
  message: string;
  timestamp: string;
}

export type ApplicationStatus = 'completed' | 'pending' | 'processing' | 'rejected';

export interface RecentApplication {
  id: string;
  publicRef?: string | null;
  applicantName: string;
  applicantInitials: string;
  service: string;
  status: ApplicationStatus;
  amount: number;
  submittedAt: string;
}
