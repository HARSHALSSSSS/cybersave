import { fullName, initials, shortId } from '@/services/api/adapters';
import type {
  MessageRole,
  TicketDetail,
  TicketPriority,
  TicketStatus,
  TicketSummary,
  TicketsStats,
} from '../types';

interface BackendTicketListItem {
  id: string;
  subject: string;
  status: string;
  createdAt: string;
  updatedAt: string;
  citizen?: {
    id: string;
    phone?: string;
    email?: string | null;
    firstName?: string | null;
    lastName?: string | null;
  };
  messages?: Array<{ content: string; createdAt: string }>;
}

interface BackendTicketDetail extends BackendTicketListItem {
  messages: Array<{
    id: string;
    content: string;
    createdAt: string;
    senderType: string;
    senderId: string;
  }>;
}

function mapTicketStatus(status: string): TicketStatus {
  const map: Record<string, TicketStatus> = {
    OPEN: 'open',
    IN_PROGRESS: 'in_progress',
    RESOLVED: 'resolved',
    CLOSED: 'resolved',
  };
  return map[status] ?? 'open';
}

function inferPriority(subject: string): TicketPriority {
  const lower = subject.toLowerCase();
  if (lower.includes('urgent') || lower.includes('critical')) return 'critical';
  if (lower.includes('billing') || lower.includes('payment')) return 'high';
  if (lower.includes('account')) return 'medium';
  return 'low';
}

export function mapTicketSummary(ticket: BackendTicketListItem): TicketSummary {
  const reporterName = fullName(
    ticket.citizen?.firstName,
    ticket.citizen?.lastName,
    ticket.citizen?.phone ?? 'Citizen',
  );

  return {
    id: ticket.id,
    shortId: shortId(ticket.id),
    subject: ticket.subject,
    category: 'General Inquiry',
    priority: inferPriority(ticket.subject),
    status: mapTicketStatus(ticket.status),
    createdAt: ticket.createdAt,
    updatedAt: ticket.updatedAt,
    assignedTo: null,
    assignedToInitials: null,
    reporterName,
    reporterInitials: initials(ticket.citizen?.firstName, ticket.citizen?.lastName),
    reporterEmail: ticket.citizen?.email ?? ticket.citizen?.phone ?? '—',
  };
}

export function mapTicketDetail(ticket: BackendTicketDetail): TicketDetail {
  const summary = mapTicketSummary(ticket);
  const firstMessage = ticket.messages[0];

  return {
    ...summary,
    description: firstMessage?.content ?? ticket.subject,
    messages: ticket.messages.map((msg) => ({
      id: msg.id,
      author: msg.senderType === 'ADMIN' ? 'Support Agent' : summary.reporterName,
      authorInitials: msg.senderType === 'ADMIN' ? 'SA' : summary.reporterInitials,
      role: (msg.senderType === 'ADMIN' ? 'agent' : 'customer') as MessageRole,
      timestamp: msg.createdAt,
      body: msg.content,
    })),
    internalNotes: [],
  };
}

export function computeTicketStats(tickets: TicketSummary[], total: number): TicketsStats {
  return {
    total,
    open: tickets.filter((t) => t.status === 'open').length,
    inProgress: tickets.filter((t) => t.status === 'in_progress').length,
    resolved: tickets.filter((t) => t.status === 'resolved' || t.status === 'escalated').length,
  };
}
