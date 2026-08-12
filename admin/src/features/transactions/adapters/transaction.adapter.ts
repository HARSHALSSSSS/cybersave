import { decimalToNumber, shortId } from '@/services/api/adapters';
import type { Transaction, TransactionsStats } from '../types';

interface BackendPayment {
  id: string;
  amount: unknown;
  currency?: string;
  status: string;
  provider?: string;
  providerRef?: string | null;
  createdAt: string;
  updatedAt: string;
  application?: { id: string; publicRef?: string | null };
  citizen?: { id: string; phone?: string };
}

function mapPaymentStatus(status: string): Transaction['status'] {
  if (status === 'CAPTURED') return 'success';
  if (status === 'FAILED' || status === 'CANCELLED') return 'failed';
  return 'pending';
}

export function mapTransaction(payment: BackendPayment): Transaction {
  return {
    id: payment.id,
    shortId: shortId(payment.id),
    applicationRef: payment.application?.publicRef ?? payment.application?.id ?? '—',
    citizenPhone: payment.citizen?.phone ?? '—',
    amount: decimalToNumber(payment.amount),
    currency: payment.currency ?? 'INR',
    method: payment.provider ?? 'Online',
    providerRef: payment.providerRef ?? '—',
    status: mapPaymentStatus(payment.status),
    createdAt: payment.createdAt,
  };
}

export function computeTransactionStats(transactions: Transaction[], total: number): TransactionsStats {
  return {
    total,
    successful: transactions.filter((t) => t.status === 'success').length,
    pending: transactions.filter((t) => t.status === 'pending').length,
    failed: transactions.filter((t) => t.status === 'failed').length,
    totalVolume: transactions.reduce((sum, t) => sum + (t.status === 'success' ? t.amount : 0), 0),
  };
}
