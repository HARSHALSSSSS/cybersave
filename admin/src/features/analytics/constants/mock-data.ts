import type {
  ActivityLogEntry,
  AnalyticsStats,
  CategoryBreakdownItem,
  DocumentActivityPoint,
  StatusDistributionItem,
} from '../types';

export const ANALYTICS_STATS: AnalyticsStats = {
  totalUploaded: 156,
  totalUploadedTrend: { value: '+12%', direction: 'up' },
  verified: 98,
  verifiedTrend: { value: '+4.2%', direction: 'up' },
  pendingReview: 23,
  pendingReviewTrend: { value: '-1.5%', direction: 'down' },
  expired: 12,
};

export const DOCUMENT_ACTIVITY_TRENDS: DocumentActivityPoint[] = [
  { label: 'Jan', uploads: 62, verifications: 48 },
  { label: 'Feb', uploads: 78, verifications: 58 },
  { label: 'Mar', uploads: 70, verifications: 62 },
  { label: 'Apr', uploads: 95, verifications: 71 },
  { label: 'May', uploads: 108, verifications: 84 },
  { label: 'Jun', uploads: 124, verifications: 92 },
  { label: 'Jul', uploads: 118, verifications: 96 },
  { label: 'Aug', uploads: 140, verifications: 104 },
  { label: 'Sep', uploads: 156, verifications: 98 },
];

export const CATEGORY_BREAKDOWN: CategoryBreakdownItem[] = [
  { category: 'Identity', count: 64 },
  { category: 'Taxation', count: 42 },
  { category: 'Transport', count: 28 },
  { category: 'Travel', count: 18 },
  { category: 'Residence', count: 12 },
];

export const STATUS_DISTRIBUTION: StatusDistributionItem[] = [
  { status: 'verified', label: 'Verified', value: 98, color: '#16A34A' },
  { status: 'pending', label: 'Pending', value: 23, color: '#F97316' },
  { status: 'expired', label: 'Expired', value: 12, color: '#DC2626' },
];

export const ACTIVITY_LOG: ActivityLogEntry[] = [
  {
    id: 'LOG-1',
    documentId: 'DOC-9081',
    name: 'Aadhaar Card.pdf',
    category: 'Identity',
    userName: 'Priya Sharma',
    userInitials: 'PS',
    uploadedAt: '2026-08-06T09:12:00',
    status: 'verified',
  },
  {
    id: 'LOG-2',
    documentId: 'DOC-9080',
    name: 'PAN Card.jpg',
    category: 'Taxation',
    userName: 'Rahul Verma',
    userInitials: 'RV',
    uploadedAt: '2026-08-06T08:44:00',
    status: 'pending',
  },
  {
    id: 'LOG-3',
    documentId: 'DOC-9079',
    name: 'Driving Licence.pdf',
    category: 'Transport',
    userName: 'Anjali Nair',
    userInitials: 'AN',
    uploadedAt: '2026-08-05T17:20:00',
    status: 'verified',
  },
  {
    id: 'LOG-4',
    documentId: 'DOC-9078',
    name: 'Passport.pdf',
    category: 'Travel',
    userName: 'Suresh Reddy',
    userInitials: 'SR',
    uploadedAt: '2026-08-05T15:05:00',
    status: 'expired',
  },
  {
    id: 'LOG-5',
    documentId: 'DOC-9077',
    name: 'Electricity Bill.pdf',
    category: 'Residence',
    userName: 'Kavita Joshi',
    userInitials: 'KJ',
    uploadedAt: '2026-08-05T11:30:00',
    status: 'verified',
  },
  {
    id: 'LOG-6',
    documentId: 'DOC-9076',
    name: 'Income Tax Return.pdf',
    category: 'Taxation',
    userName: 'Manoj Kumar',
    userInitials: 'MK',
    uploadedAt: '2026-08-04T14:52:00',
    status: 'pending',
  },
  {
    id: 'LOG-7',
    documentId: 'DOC-9075',
    name: 'Voter ID.jpg',
    category: 'Identity',
    userName: 'Deepika Rao',
    userInitials: 'DR',
    uploadedAt: '2026-08-04T10:18:00',
    status: 'verified',
  },
];
