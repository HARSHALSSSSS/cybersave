export type TicketStatus = 'open' | 'in_progress' | 'resolved' | 'escalated';

export type TicketPriority = 'low' | 'medium' | 'high' | 'critical';

export type TicketCategory =
  | 'Technical'
  | 'Billing'
  | 'Account'
  | 'Document Verification'
  | 'General Inquiry';

export interface TicketSummary {
  id: string;
  shortId: string;
  subject: string;
  category: TicketCategory;
  priority: TicketPriority;
  status: TicketStatus;
  createdAt: string;
  updatedAt: string;
  assignedTo: string | null;
  assignedToInitials: string | null;
  reporterName: string;
  reporterInitials: string;
  reporterEmail: string;
}

export interface TicketsStats {
  total: number;
  open: number;
  inProgress: number;
  resolved: number;
}

export type MessageRole = 'customer' | 'agent';

export interface TicketMessage {
  id: string;
  author: string;
  authorInitials: string;
  role: MessageRole;
  timestamp: string;
  body: string;
}

export interface TicketInternalNote {
  id: string;
  author: string;
  authorInitials: string;
  content: string;
  createdAt: string;
}

export interface TicketDetail extends TicketSummary {
  description: string;
  messages: TicketMessage[];
  internalNotes: TicketInternalNote[];
}

export interface ResolveTicketPayload {
  resolutionSummary: string;
  resolutionCategory: string;
  rootCause: string;
  resolutionDays: number;
  resolutionHours: number;
  tags: string[];
  notifyReporter: boolean;
  satisfactionSurvey: boolean;
}
