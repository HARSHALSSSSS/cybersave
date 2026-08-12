export interface PaginationMeta {
  page?: number;
  limit?: number;
  total?: number;
  totalPages?: number;
}

export function getTotalFromMeta(meta?: Record<string, unknown>): number {
  if (!meta) return 0;
  const total = meta.total;
  return typeof total === 'number' ? total : 0;
}
