import { apiClient } from '@/services/api/client';
import { unwrapPaginated } from '@/services/api/types';
import { getTotalFromMeta } from '@/services/api/pagination';
import { computeTransactionStats, mapTransaction } from '../adapters/transaction.adapter';
import type { Transaction, TransactionsStats } from '../types';

export interface GetTransactionsParams {
  page?: number;
  pageSize?: number;
}

export interface GetTransactionsResult {
  data: Transaction[];
  total: number;
  page: number;
  pageSize: number;
}

export async function getTransactionsStats(): Promise<TransactionsStats> {
  const result = await getTransactions({ page: 1, pageSize: 50 });
  return computeTransactionStats(result.data, result.total);
}

export async function getTransactions(params: GetTransactionsParams = {}): Promise<GetTransactionsResult> {
  const { page = 1, pageSize = 10 } = params;

  const response = await apiClient.get('/admin/payments', { params: { page, limit: pageSize } });
  const { data, meta } = unwrapPaginated<Parameters<typeof mapTransaction>[0][]>(response);

  return {
    data: data.map(mapTransaction),
    total: getTotalFromMeta(meta),
    page,
    pageSize,
  };
}

export const transactionsService = {
  getTransactionsStats,
  getTransactions,
};
