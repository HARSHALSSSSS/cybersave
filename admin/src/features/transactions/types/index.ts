export type TransactionStatus = 'success' | 'pending' | 'failed';

export interface Transaction {
  id: string;
  shortId: string;
  applicationRef: string;
  citizenPhone: string;
  amount: number;
  currency: string;
  method: string;
  providerRef: string;
  status: TransactionStatus;
  createdAt: string;
}

export interface TransactionsStats {
  total: number;
  successful: number;
  pending: number;
  failed: number;
  totalVolume: number;
}
