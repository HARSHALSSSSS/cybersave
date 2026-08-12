import type {
  TicketCategory,
  TicketDetail,
  TicketInternalNote,
  TicketMessage,
  TicketPriority,
  TicketStatus,
  TicketSummary,
  TicketsStats,
} from '../types';

export const TICKETS_STATS: TicketsStats = {
  total: 234,
  open: 45,
  inProgress: 67,
  resolved: 122,
};

export const TICKET_CATEGORIES: TicketCategory[] = [
  'Technical',
  'Billing',
  'Account',
  'Document Verification',
  'General Inquiry',
];

export const TICKET_STATUSES: TicketStatus[] = ['open', 'in_progress', 'resolved', 'escalated'];

export const TICKET_PRIORITIES: TicketPriority[] = ['low', 'medium', 'high', 'critical'];

export const TICKETS: TicketSummary[] = [
  {
    id: 'TKT-2024-001',
    shortId: 'TK-0045',
    subject: 'Login Authentication Issue',
    category: 'Technical',
    priority: 'high',
    status: 'open',
    createdAt: '2026-07-28T09:15:00',
    updatedAt: '2026-08-06T11:40:00',
    assignedTo: 'Arjun Mehta',
    assignedToInitials: 'AM',
    reporterName: 'Rohan Kapoor',
    reporterInitials: 'RK',
    reporterEmail: 'rohan.kapoor@example.com',
  },
  {
    id: 'TKT-2024-002',
    shortId: 'TK-0046',
    subject: 'Unable to Download Tax Receipt',
    category: 'Billing',
    priority: 'medium',
    status: 'in_progress',
    createdAt: '2026-07-29T10:05:00',
    updatedAt: '2026-08-06T08:22:00',
    assignedTo: 'Sunita Rao',
    assignedToInitials: 'SR',
    reporterName: 'Meera Iyer',
    reporterInitials: 'MI',
    reporterEmail: 'meera.iyer@example.com',
  },
  {
    id: 'TKT-2024-003',
    shortId: 'TK-0047',
    subject: 'Aadhaar Document Rejected Without Reason',
    category: 'Document Verification',
    priority: 'critical',
    status: 'escalated',
    createdAt: '2026-07-25T14:30:00',
    updatedAt: '2026-08-05T17:10:00',
    assignedTo: 'Deepak Verma',
    assignedToInitials: 'DV',
    reporterName: 'Karan Malhotra',
    reporterInitials: 'KM',
    reporterEmail: 'karan.malhotra@example.com',
  },
  {
    id: 'TKT-2024-004',
    shortId: 'TK-0048',
    subject: 'Profile Details Not Updating',
    category: 'Account',
    priority: 'low',
    status: 'resolved',
    createdAt: '2026-07-20T08:50:00',
    updatedAt: '2026-07-24T12:00:00',
    assignedTo: 'Meena Iyer',
    assignedToInitials: 'MI',
    reporterName: 'Ananya Desai',
    reporterInitials: 'AD',
    reporterEmail: 'ananya.desai@example.com',
  },
  {
    id: 'TKT-2024-005',
    shortId: 'TK-0049',
    subject: 'Payment Deducted but Application Not Submitted',
    category: 'Billing',
    priority: 'critical',
    status: 'open',
    createdAt: '2026-08-01T16:10:00',
    updatedAt: '2026-08-06T09:05:00',
    assignedTo: null,
    assignedToInitials: null,
    reporterName: 'Vikram Singh',
    reporterInitials: 'VS',
    reporterEmail: 'vikram.singh@example.com',
  },
  {
    id: 'TKT-2024-006',
    shortId: 'TK-0050',
    subject: 'Request for Bulk Data Export',
    category: 'General Inquiry',
    priority: 'low',
    status: 'in_progress',
    createdAt: '2026-08-02T11:25:00',
    updatedAt: '2026-08-05T13:48:00',
    assignedTo: 'Amit Kumar',
    assignedToInitials: 'AK',
    reporterName: 'Priya Sharma',
    reporterInitials: 'PS',
    reporterEmail: 'priya.sharma@example.com',
  },
  {
    id: 'TKT-2024-007',
    shortId: 'TK-0051',
    subject: 'OTP Not Received on Registered Mobile',
    category: 'Technical',
    priority: 'medium',
    status: 'open',
    createdAt: '2026-08-03T07:40:00',
    updatedAt: '2026-08-06T10:12:00',
    assignedTo: 'Ravi Teja',
    assignedToInitials: 'RT',
    reporterName: 'Suresh Reddy',
    reporterInitials: 'SR',
    reporterEmail: 'suresh.reddy@example.com',
  },
  {
    id: 'TKT-2024-008',
    shortId: 'TK-0052',
    subject: 'Certificate PDF Shows Corrupted File',
    category: 'Document Verification',
    priority: 'high',
    status: 'resolved',
    createdAt: '2026-07-18T09:00:00',
    updatedAt: '2026-07-22T15:30:00',
    assignedTo: 'Sunita Rao',
    assignedToInitials: 'SR',
    reporterName: 'Kavita Joshi',
    reporterInitials: 'KJ',
    reporterEmail: 'kavita.joshi@example.com',
  },
  {
    id: 'TKT-2024-009',
    shortId: 'TK-0053',
    subject: 'Refund Not Credited for Cancelled Application',
    category: 'Billing',
    priority: 'high',
    status: 'in_progress',
    createdAt: '2026-07-30T13:15:00',
    updatedAt: '2026-08-06T07:55:00',
    assignedTo: 'Deepak Verma',
    assignedToInitials: 'DV',
    reporterName: 'Manoj Kumar',
    reporterInitials: 'MK',
    reporterEmail: 'manoj.kumar@example.com',
  },
];

export function findTicketByParam(param: string): TicketSummary | undefined {
  const normalized = param.trim().toLowerCase();
  return TICKETS.find(
    (ticket) => ticket.id.toLowerCase() === normalized || ticket.shortId.toLowerCase() === normalized,
  );
}

const DEFAULT_DESCRIPTION =
  'Reporter is unable to complete the reported action. Full details are captured in the conversation thread below.';

const TICKET_ONE_MESSAGES: TicketMessage[] = [
  {
    id: 'MSG-1',
    author: 'Rohan Kapoor',
    authorInitials: 'RK',
    role: 'customer',
    timestamp: '2026-07-28T09:15:00',
    body: "I've been trying to log in since this morning but keep getting a \"502 Bad Gateway\" error right after choosing to sign in with Google. It worked fine yesterday. Can someone look into this urgently? I need to submit a time-sensitive application.",
  },
  {
    id: 'MSG-2',
    author: 'Arjun Mehta',
    authorInitials: 'AM',
    role: 'agent',
    timestamp: '2026-07-28T10:02:00',
    body: "Hi Rohan, thanks for flagging this. We're seeing intermittent 502 errors from the Google OAuth callback for a subset of users. Could you share the exact time you saw the error and the browser/device you're using so I can cross-check the logs?",
  },
  {
    id: 'MSG-3',
    author: 'Rohan Kapoor',
    authorInitials: 'RK',
    role: 'customer',
    timestamp: '2026-07-28T10:18:00',
    body: "Sure — it happened around 9:10 AM IST. I'm using Chrome on Windows 11. I tried again just now (10:15 AM) and got the same error twice in a row.",
  },
  {
    id: 'MSG-4',
    author: 'Arjun Mehta',
    authorInitials: 'AM',
    role: 'agent',
    timestamp: '2026-07-28T11:05:00',
    body: "Thanks, that matches what we're seeing on our end — the OAuth callback service is timing out for a portion of requests. I've escalated this to our backend infra team and flagged it as high priority. I'll keep you posted as soon as we have an update or a workaround.",
  },
];

const TICKET_ONE_NOTES: TicketInternalNote[] = [
  {
    id: 'NOTE-1',
    author: 'Arjun Mehta',
    authorInitials: 'AM',
    content: 'Confirmed 502s correlate with a spike in latency from the Google OAuth callback service starting ~09:00 IST. Escalated to backend infra team for investigation.',
    createdAt: '2026-07-28T11:10:00',
  },
  {
    id: 'NOTE-2',
    author: 'Backend Infra Team',
    authorInitials: 'BI',
    content: 'Root cause appears to be connection pool exhaustion on the OAuth proxy layer. Rolling out a config fix; monitoring error rates closely.',
    createdAt: '2026-07-28T14:35:00',
  },
];

const DEFAULT_MESSAGES = (ticket: TicketSummary): TicketMessage[] => [
  {
    id: `${ticket.id}-MSG-1`,
    author: ticket.reporterName,
    authorInitials: ticket.reporterInitials,
    role: 'customer',
    timestamp: ticket.createdAt,
    body: DEFAULT_DESCRIPTION,
  },
  {
    id: `${ticket.id}-MSG-2`,
    author: ticket.assignedTo ?? 'Support Team',
    authorInitials: ticket.assignedToInitials ?? 'ST',
    role: 'agent',
    timestamp: ticket.updatedAt,
    body: "Thanks for reaching out. We're looking into this and will get back to you shortly with an update.",
  },
];

const DEFAULT_NOTES = (ticket: TicketSummary): TicketInternalNote[] => [
  {
    id: `${ticket.id}-NOTE-1`,
    author: ticket.assignedTo ?? 'Support Team',
    authorInitials: ticket.assignedToInitials ?? 'ST',
    content: 'Triaged and under review. Will update once more information is available.',
    createdAt: ticket.updatedAt,
  },
];

export function buildTicketExtras(ticket: TicketSummary): Pick<TicketDetail, 'description' | 'messages' | 'internalNotes'> {
  if (ticket.id === 'TKT-2024-001') {
    return {
      description:
        'Multiple users are reporting intermittent 502 Bad Gateway errors when authenticating via Google OAuth. The issue appears to be affecting the login flow for citizens trying to access their applications.',
      messages: TICKET_ONE_MESSAGES,
      internalNotes: TICKET_ONE_NOTES,
    };
  }
  return {
    description: DEFAULT_DESCRIPTION,
    messages: DEFAULT_MESSAGES(ticket),
    internalNotes: DEFAULT_NOTES(ticket),
  };
}

export const RESOLUTION_CATEGORIES = [
  'Bug Fix',
  'Configuration Change',
  'User Education',
  'Workaround Applied',
  'Duplicate / No Action',
];

export const ROOT_CAUSES = [
  'Third-Party Service Outage',
  'Configuration Error',
  'User Error',
  'Software Bug',
  'Infrastructure Issue',
];

export const DEFAULT_INTERNAL_TAGS = ['OAuth', 'Google SSO', '502-error'];
