export type ApplicationCategory =
  | 'Aadhaar Services'
  | 'PAN Card'
  | 'Certificates'
  | 'Banking'
  | 'Insurance'
  | 'Utility'
  | 'Other';

export type ApplicationStatus =
  | 'submitted'
  | 'under_review'
  | 'action_required'
  | 'processing'
  | 'approved'
  | 'completed'
  | 'rejected';

export type ApplicationPriority = 'low' | 'medium' | 'high';

export interface ApplicationSummary {
  id: string;
  publicRef?: string | null;
  citizenId: string;
  citizenName: string;
  citizenInitials: string;
  citizenPhone?: string | null;
  citizenEmail?: string | null;
  service: string;
  category: ApplicationCategory;
  priority: ApplicationPriority;
  status: ApplicationStatus;
  assignedOperator: string | null;
  centre: string;
  submittedAt: string;
  slaHours: number;
  slaRemainingHours: number;
  amount: number;
}

export interface ApplicationsStats {
  total: number;
  todayReceived: number;
  pendingReview: number;
  inProcessing: number;
  completedToday: number;
}

export interface PipelineStage {
  key: ApplicationStatus;
  label: string;
  count: number;
}

export interface SupportingDocument {
  id: string;
  name: string;
  type: string;
  status: 'verified' | 'pending' | 'rejected';
  uploadedAt: string;
  downloadUrl?: string | null;
  documentRequirementId?: string;
}

export interface ChecklistItem {
  id: string;
  label: string;
  completed: boolean;
}

export interface PaymentInformation {
  status: 'paid' | 'pending' | 'failed';
  amount: number;
  method: string;
  transactionId: string;
  paidAt: string | null;
}

export interface TimelineEvent {
  id: string;
  title: string;
  description: string;
  timestamp: string;
  actor: string;
  completed: boolean;
}

export interface InternalNote {
  id: string;
  author: string;
  authorInitials: string;
  content: string;
  createdAt: string;
}

export interface ApplicationFormField {
  key: string;
  label: string;
  value: string;
  type?: string;
}

export interface ApplicationDetail extends ApplicationSummary {
  documents: SupportingDocument[];
  checklist: ChecklistItem[];
  payment: PaymentInformation;
  timeline: TimelineEvent[];
  notes: InternalNote[];
  formFieldKeys: string[];
  formFields: ApplicationFormField[];
  documentRequirementOptions: Array<{ id: string; name: string }>;
}
