import type { AxiosResponse } from 'axios';

export interface ApiEnvelope<T> {
  success: boolean;
  data: T;
  meta?: Record<string, unknown>;
}

export interface ApiErrorBody {
  success: false;
  error: {
    code?: string;
    message: string;
    details?: unknown;
  };
}

export function unwrapApiResponse<T>(response: AxiosResponse<ApiEnvelope<T>>): T {
  return response.data.data;
}

export function unwrapPaginated<T>(
  response: AxiosResponse<ApiEnvelope<T> | { data: T; meta: Record<string, unknown> }>,
): { data: T; meta?: Record<string, unknown> } {
  const body = response.data;
  if ('success' in body && body.success) {
    return { data: body.data, meta: body.meta };
  }
  return body as { data: T; meta?: Record<string, unknown> };
}
