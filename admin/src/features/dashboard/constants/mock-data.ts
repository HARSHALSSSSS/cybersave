import {
  IndianRupee,
  FileText,
  Clock,
  CheckCircle2,
  XCircle,
  Building2,
  ShieldCheck,
  FileClock,
  CreditCard,
  AlertTriangle,
  MapPin,
} from 'lucide-react';
import type {
  ApplicationTrendPoint,
  CollectionsSummary,
  DashboardKpi,
  OperatorLogEntry,
  RecentApplication,
  RevenuePoint,
  ServiceShareSlice,
} from '../types';

export const DASHBOARD_KPIS: DashboardKpi[] = [
  {
    id: 'revenue-today',
    title: 'Revenue Today',
    value: '₹4,85,230',
    icon: IndianRupee,
    iconColor: '#2563EB',
    iconBg: '#EFF4FF',
    trend: { value: '+12.5%', direction: 'up' },
    description: 'vs. yesterday',
  },
  {
    id: 'applications-today',
    title: 'Applications Today',
    value: '1,247',
    icon: FileText,
    iconColor: '#7C3AED',
    iconBg: '#F3EEFF',
    description: 'Normal',
  },
  {
    id: 'pending',
    title: 'Pending',
    value: '342',
    icon: Clock,
    iconColor: '#D97706',
    iconBg: '#FEF6E7',
    description: 'High load',
  },
  {
    id: 'completed',
    title: 'Completed',
    value: '856',
    icon: CheckCircle2,
    iconColor: '#16A34A',
    iconBg: '#EAF9EF',
    description: '94% completion rate',
  },
  {
    id: 'rejected',
    title: 'Rejected',
    value: '49',
    icon: XCircle,
    iconColor: '#DC2626',
    iconBg: '#FDECEC',
    description: 'Manual review',
  },
  {
    id: 'active-centres',
    title: 'Active Centres',
    value: '2,847',
    icon: Building2,
    iconColor: '#0891B2',
    iconBg: '#E7F8FB',
    description: 'Live now',
  },
];

export const REVENUE_7_DAYS: RevenuePoint[] = [
  { label: 'Mon', revenue: 385000 },
  { label: 'Tue', revenue: 412000 },
  { label: 'Wed', revenue: 398000 },
  { label: 'Thu', revenue: 445000 },
  { label: 'Fri', revenue: 462000 },
  { label: 'Sat', revenue: 431000 },
  { label: 'Sun', revenue: 485230 },
];

export const REVENUE_30_DAYS: RevenuePoint[] = Array.from({ length: 30 }, (_, i) => {
  const base = 320000 + Math.sin(i / 3) * 60000 + i * 4200;
  return {
    label: `${i + 1}`,
    revenue: Math.round(base + (i % 5 === 0 ? 25000 : 0)),
  };
});

export const APPLICATION_TRENDS: ApplicationTrendPoint[] = [
  { label: 'Mon', completed: 720, pending: 210, rejected: 32 },
  { label: 'Tue', completed: 780, pending: 245, rejected: 28 },
  { label: 'Wed', completed: 690, pending: 260, rejected: 41 },
  { label: 'Thu', completed: 810, pending: 198, rejected: 35 },
  { label: 'Fri', completed: 845, pending: 312, rejected: 44 },
  { label: 'Sat', completed: 690, pending: 280, rejected: 38 },
  { label: 'Sun', completed: 856, pending: 342, rejected: 49 },
];

export const SERVICE_SHARE: ServiceShareSlice[] = [
  { name: 'Aadhaar Services', value: 35, color: '#2563EB' },
  { name: 'PAN Card', value: 22, color: '#7C3AED' },
  { name: 'Certificates', value: 18, color: '#0891B2' },
  { name: 'Banking', value: 15, color: '#D97706' },
  { name: 'Other', value: 10, color: '#94A3B8' },
];

export const COLLECTIONS_SUMMARY: CollectionsSummary = {
  total: 1240000,
  onlineAmount: 818400,
  cashAmount: 421600,
  onlinePercent: 66,
  cashPercent: 34,
};

export const OPERATOR_LOG_ICONS = {
  verification: ShieldCheck,
  application: FileClock,
  payment: CreditCard,
  alert: AlertTriangle,
  centre: MapPin,
};

export const OPERATOR_LOGS: OperatorLogEntry[] = [
  {
    id: 'log-1',
    type: 'verification',
    actorName: 'Amit Kumar',
    actorInitials: 'AK',
    message: 'Verified Aadhaar update for Priya Sharma',
    timestamp: '2 min ago',
  },
  {
    id: 'log-2',
    type: 'application',
    actorName: 'Sunita Rao',
    actorInitials: 'SR',
    message: 'Submitted new PAN card application APP-2026-8470',
    timestamp: '8 min ago',
  },
  {
    id: 'log-3',
    type: 'payment',
    actorName: 'Ravi Teja',
    actorInitials: 'RT',
    message: 'Collected ₹500 govt. fee for Birth Certificate request',
    timestamp: '14 min ago',
  },
  {
    id: 'log-4',
    type: 'alert',
    actorName: 'System',
    actorInitials: 'SY',
    message: 'SLA breach warning on APP-2026-8321 (Passport Renewal)',
    timestamp: '22 min ago',
  },
  {
    id: 'log-5',
    type: 'centre',
    actorName: 'Deepak Verma',
    actorInitials: 'DV',
    message: 'Opened new service centre in Warangal district',
    timestamp: '41 min ago',
  },
  {
    id: 'log-6',
    type: 'verification',
    actorName: 'Meena Iyer',
    actorInitials: 'MI',
    message: 'Rejected duplicate Aadhaar correction request',
    timestamp: '1 hr ago',
  },
];

export const RECENT_APPLICATIONS: RecentApplication[] = [
  {
    id: 'APP-2026-8471',
    applicantName: 'Priya Sharma',
    applicantInitials: 'PS',
    service: 'Aadhaar Address Update',
    status: 'processing',
    amount: 50,
    submittedAt: '2026-08-03T09:12:00',
  },
  {
    id: 'APP-2026-8470',
    applicantName: 'Rahul Verma',
    applicantInitials: 'RV',
    service: 'PAN Card - New',
    status: 'pending',
    amount: 107,
    submittedAt: '2026-08-03T08:54:00',
  },
  {
    id: 'APP-2026-8469',
    applicantName: 'Anjali Nair',
    applicantInitials: 'AN',
    service: 'Birth Certificate',
    status: 'completed',
    amount: 50,
    submittedAt: '2026-08-03T08:31:00',
  },
  {
    id: 'APP-2026-8468',
    applicantName: 'Suresh Reddy',
    applicantInitials: 'SR',
    service: 'Income Certificate',
    status: 'completed',
    amount: 30,
    submittedAt: '2026-08-03T08:02:00',
  },
  {
    id: 'APP-2026-8467',
    applicantName: 'Kavita Joshi',
    applicantInitials: 'KJ',
    service: 'Bank Account Opening',
    status: 'rejected',
    amount: 0,
    submittedAt: '2026-08-03T07:45:00',
  },
  {
    id: 'APP-2026-8466',
    applicantName: 'Manoj Kumar',
    applicantInitials: 'MK',
    service: 'Passport Renewal',
    status: 'processing',
    amount: 1500,
    submittedAt: '2026-08-03T07:20:00',
  },
];
