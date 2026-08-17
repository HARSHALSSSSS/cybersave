import { useState } from 'react';
import { Link } from 'react-router';
import { useQuery } from '@tanstack/react-query';
import { Receipt } from 'lucide-react';
import { Breadcrumbs } from '@/components/layout/Breadcrumbs';
import { PortalCard } from '@/components/ui/portal-primitives';
import { LoadingBlock, EmptyState } from '@/components/ui/primitives';
import { billPaymentsApi, billPaymentsQueryKeys } from '@/services/api';
import { formatCurrency, formatDate } from '@/lib/utils';

const FILTERS = [
  { id: 'all', label: 'All' },
  { id: 'success', label: 'Success' },
  { id: 'pending', label: 'Pending' },
  { id: 'failed', label: 'Failed' },
] as const;

export function PayBillsHistoryPage() {
  const [filter, setFilter] = useState<(typeof FILTERS)[number]['id']>('all');

  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: billPaymentsQueryKeys.history(filter, 1),
    queryFn: () => billPaymentsApi.getBillPaymentHistory({ filter, page: 1, limit: 30 }),
  });

  const payments = data?.data ?? [];

  return (
    <div className="space-y-6 pb-4">
      <Breadcrumbs items={[{ label: 'Pay Bills', to: '/pay-bills' }, { label: 'History' }]} />
      <h1 className="font-display text-2xl font-bold text-[#0A1629]">Bill payment history</h1>

      <div className="flex flex-wrap gap-2">
        {FILTERS.map(item => (
          <button
            key={item.id}
            type="button"
            onClick={() => setFilter(item.id)}
            className={
              filter === item.id
                ? 'rounded-full bg-[#2563EB] px-4 py-2 text-sm font-medium text-white'
                : 'rounded-full bg-[#F1F5F9] px-4 py-2 text-sm font-medium text-[#475569]'
            }
          >
            {item.label}
          </button>
        ))}
      </div>

      {isError ? (
        <EmptyState
          title="Could not load history"
          action={
            <button type="button" className="text-sm font-semibold text-[#2563EB]" onClick={() => refetch()}>
              Retry
            </button>
          }
        />
      ) : isLoading ? (
        <LoadingBlock className="h-64" />
      ) : payments.length === 0 ? (
        <EmptyState title="No payments yet" description="Pay a bill to see it here." />
      ) : (
        <PortalCard padding="none" className="divide-y divide-[#F1F5F9]">
          {payments.map(tx => (
            <Link
              key={tx.id}
              to={`/pay-bills/receipt/${tx.id}`}
              className="flex flex-wrap items-center justify-between gap-3 p-4 hover:bg-[#F8FAFC]"
            >
              <div className="flex items-center gap-3">
                <Receipt className="h-5 w-5 text-[#2563EB]" />
                <div>
                  <p className="font-medium text-[#0A1629]">{tx.biller.name}</p>
                  <p className="text-xs text-[#94A3B8]">
                    {tx.accountMasked} · {formatDate(tx.createdAt)}
                  </p>
                </div>
              </div>
              <div className="text-right">
                <p className="font-semibold text-[#0A1629]">{formatCurrency(tx.totalAmount)}</p>
                <p
                  className={`text-xs capitalize ${
                    tx.status === 'success'
                      ? 'text-emerald-600'
                      : tx.status === 'failed'
                        ? 'text-red-600'
                        : 'text-amber-600'
                  }`}
                >
                  {tx.status}
                </p>
              </div>
            </Link>
          ))}
        </PortalCard>
      )}
    </div>
  );
}
