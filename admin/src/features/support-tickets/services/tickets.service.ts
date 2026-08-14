import { apiClient } from '@/services/api/client';
import { unwrapApiResponse, unwrapPaginated } from '@/services/api/types';
import { getTotalFromMeta } from '@/services/api/pagination';
import {
  computeTicketStats,
  mapTicketDetail,
  mapTicketSummary,
} from '../adapters/ticket.adapter';
import type {
  ResolveTicketPayload,
  TicketCategory,
  TicketDetail,
  TicketPriority,
  TicketStatus,
  TicketSummary,
  TicketsStats,
} from '../types';

export interface GetTicketsParams {
  search?: string;
  category?: TicketCategory | 'all';
  status?: TicketStatus | 'all';
  priority?: TicketPriority | 'all';
  page?: number;
  pageSize?: number;
}

export interface GetTicketsResult {
  data: TicketSummary[];
  total: number;
  page: number;
  pageSize: number;
}

const STATUS_TO_BACKEND: Partial<Record<TicketStatus, string>> = {
  open: 'OPEN',
  in_progress: 'IN_PROGRESS',
  resolved: 'RESOLVED',
};

export async function getTicketsStats(): Promise<TicketsStats> {
  const result = await getTickets({ page: 1, pageSize: 50 });
  return computeTicketStats(result.data, result.total);
}

export async function getTickets(params: GetTicketsParams = {}): Promise<GetTicketsResult> {
  const { search = '', category = 'all', status = 'all', priority = 'all', page = 1, pageSize = 9 } = params;

  const response = await apiClient.get('/admin/support/tickets', {
    params: {
      page,
      limit: pageSize,
      status: status !== 'all' ? STATUS_TO_BACKEND[status] : undefined,
    },
  });
  const { data, meta } = unwrapPaginated<Parameters<typeof mapTicketSummary>[0][]>(response);

  let tickets = data.map(mapTicketSummary);

  if (search.trim()) {
    const query = search.trim().toLowerCase();
    tickets = tickets.filter(
      (ticket) =>
        ticket.subject.toLowerCase().includes(query) ||
        ticket.id.toLowerCase().includes(query) ||
        ticket.shortId.toLowerCase().includes(query) ||
        ticket.reporterName.toLowerCase().includes(query),
    );
  }
  if (category !== 'all') {
    tickets = tickets.filter((ticket) => ticket.category === category);
  }
  if (priority !== 'all') {
    tickets = tickets.filter((ticket) => ticket.priority === priority);
  }

  return { data: tickets, total: getTotalFromMeta(meta), page, pageSize };
}

export async function getTicketByParam(ticketParam: string): Promise<TicketDetail> {
  const response = await apiClient.get(`/admin/support/tickets/${ticketParam}`);
  const data = unwrapApiResponse<Parameters<typeof mapTicketDetail>[0]>(response);
  return mapTicketDetail(data);
}

export async function replyToTicket(ticketParam: string, content: string) {
  const response = await apiClient.post(`/admin/support/tickets/${ticketParam}/messages`, {
    content,
  });
  return unwrapApiResponse(response);
}

export async function resolveTicket(ticketParam: string, payload: ResolveTicketPayload): Promise<TicketDetail> {
  void payload;
  await apiClient.post(`/admin/support/tickets/${ticketParam}/resolve`);
  return getTicketByParam(ticketParam);
}

export const ticketsService = {
  getTicketsStats,
  getTickets,
  getTicketByParam,
  replyToTicket,
  resolveTicket,
};
