export type TrendDirection = 'up' | 'down' | 'neutral';

export interface AnalyticsTrend {
  value: string;
  direction: TrendDirection;
}

export interface AnalyticsStats {
  totalUploaded: number;
  totalUploadedTrend: AnalyticsTrend;
  verified: number;
  verifiedTrend: AnalyticsTrend;
  pendingReview: number;
  pendingReviewTrend: AnalyticsTrend;
  expired: number;
}

export interface DocumentActivityPoint {
  label: string;
  uploads: number;
  verifications: number;
}

export interface CategoryBreakdownItem {
  category: string;
  count: number;
}

export type DocumentStatus = 'verified' | 'pending' | 'expired';

export interface StatusDistributionItem {
  status: DocumentStatus;
  label: string;
  value: number;
  color: string;
}

export interface ActivityLogEntry {
  id: string;
  documentId: string;
  name: string;
  category: string;
  userName: string;
  userInitials: string;
  uploadedAt: string;
  status: DocumentStatus;
}
