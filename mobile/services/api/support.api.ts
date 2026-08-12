import { shouldUseDevDiscovery } from '@app/config/env';
import { apiClient } from './client';
import { devAwareGet, devAwarePost } from './devRequest';
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

function unwrapEnvelope<T>(body: unknown): T {
  if (
    body &&
    typeof body === 'object' &&
    'success' in body &&
    (body as { success: boolean }).success
  ) {
    return (body as { data: T }).data;
  }
  return body as T;
}

function unwrapPaginatedBody<T>(body: unknown): { data: T; meta: Record<string, unknown> } {
  if (body && typeof body === 'object' && 'success' in body) {
    const envelope = body as { success: boolean; data: T; meta?: Record<string, unknown> };
    return { data: envelope.data, meta: envelope.meta ?? {} };
  }
  return body as { data: T; meta: Record<string, unknown> };
}

export async function createTicket(subject: string, content: string) {
  if (shouldUseDevDiscovery()) {
    return devAwarePost<unknown>('/support/tickets', { subject, content }).then(
      unwrapEnvelope<SupportTicket>,
    );
  }
  const response = await apiClient.post('/support/tickets', { subject, content });
  return unwrapApiResponse<SupportTicket>(response);
}

export async function listTickets(page = 1, limit = 20) {
  const params = { page, limit };
  if (shouldUseDevDiscovery()) {
    return devAwareGet<unknown>('/support/tickets', params).then(
      body => unwrapPaginatedBody<SupportTicket[]>(body),
    );
  }
  const response = await apiClient.get('/support/tickets', { params });
  return unwrapPaginated<SupportTicket[]>(response);
}

export async function getTicket(ticketId: string) {
  if (shouldUseDevDiscovery()) {
    return devAwareGet<unknown>(`/support/tickets/${ticketId}`).then(
      unwrapEnvelope<SupportTicket>,
    );
  }
  const response = await apiClient.get(`/support/tickets/${ticketId}`);
  return unwrapApiResponse<SupportTicket>(response);
}

export async function addTicketMessage(ticketId: string, content: string) {
  if (shouldUseDevDiscovery()) {
    return devAwarePost<unknown>(`/support/tickets/${ticketId}/messages`, { content }).then(
      unwrapEnvelope<TicketMessage>,
    );
  }
  const response = await apiClient.post(`/support/tickets/${ticketId}/messages`, { content });
  return unwrapApiResponse<TicketMessage>(response);
}

export async function submitFeedback(params: {
  rating: number;
  tag: string;
  feedback: string;
}) {
  const subject = `[App Feedback] ${params.tag} — ${params.rating} star${params.rating === 1 ? '' : 's'}`;
  const content = [
    `Rating: ${params.rating}/5`,
    `Category: ${params.tag}`,
    '',
    params.feedback.trim() || '(No written feedback provided)',
  ].join('\n');
  return createTicket(subject, content);
}

export const supportApi = {
  createTicket,
  listTickets,
  getTicket,
  addTicketMessage,
  submitFeedback,
};

export const supportQueryKeys = {
  all: ['support'] as const,
  tickets: (page: number) => [...supportQueryKeys.all, 'tickets', page] as const,
  ticket: (id: string) => [...supportQueryKeys.all, 'ticket', id] as const,
};
