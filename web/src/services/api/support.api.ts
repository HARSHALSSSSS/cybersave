import { apiClient } from './client';
import { unwrapApiResponse, unwrapPaginated } from './types';

export interface TicketMessage {
  id: string;
  senderType: string;
  senderId: string;
  content: string;
  createdAt: string;
}

export interface SupportTicket {
  id: string;
  subject: string;
  status: string;
  createdAt: string;
  updatedAt: string;
  messages?: TicketMessage[];
}

export async function createTicket(subject: string, content: string) {
  const response = await apiClient.post('/support/tickets', { subject, content });
  return unwrapApiResponse<SupportTicket>(response);
}

export async function listTickets(page = 1, limit = 20) {
  const response = await apiClient.get('/support/tickets', { params: { page, limit } });
  return unwrapPaginated<SupportTicket[]>(response);
}

export async function getTicket(ticketId: string) {
  const response = await apiClient.get(`/support/tickets/${ticketId}`);
  return unwrapApiResponse<SupportTicket>(response);
}

export async function addTicketMessage(ticketId: string, content: string) {
  const response = await apiClient.post(`/support/tickets/${ticketId}/messages`, { content });
  return unwrapApiResponse<TicketMessage>(response);
}

export const supportApi = {
  createTicket,
  listTickets,
  getTicket,
  addTicketMessage,
};

export const supportQueryKeys = {
  all: ['support'] as const,
  tickets: (page: number) => [...supportQueryKeys.all, 'tickets', page] as const,
  ticket: (id: string) => [...supportQueryKeys.all, 'ticket', id] as const,
};
