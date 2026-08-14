export interface ApiEnvelope<T> {
  success: boolean;
  data: T;
  meta?: Record<string, unknown>;
}

export interface PaginatedMeta {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export function unwrapApiResponse<T>(response: { data: ApiEnvelope<T> }): T {
  return response.data.data;
}

export function unwrapPaginated<T>(response: {
  data: ApiEnvelope<T> & { meta?: PaginatedMeta };
}): { data: T; meta?: PaginatedMeta } {
  return { data: response.data.data, meta: response.data.meta };
}
