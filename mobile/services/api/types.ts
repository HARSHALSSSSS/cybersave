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

/** Prefer the server's explanation over a generic "something went wrong". */
export function getApiErrorMessage(error: unknown, fallback: string): string {
  const data = (
    error as {
      response?: { data?: { error?: { message?: unknown }; message?: unknown } };
    }
  )?.response?.data;
  const raw = data?.error?.message ?? data?.message;
  if (typeof raw === 'string' && raw.trim()) return raw;
  if (Array.isArray(raw) && typeof raw[0] === 'string') return raw[0];
  if (error instanceof Error && error.message && error.message !== 'Network Error') {
    return error.message;
  }
  return fallback;
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
