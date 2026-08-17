import { Link, useNavigate, useParams } from 'react-router';
import { useQuery } from '@tanstack/react-query';
import { Breadcrumbs } from '@/components/layout/Breadcrumbs';
import { PortalCard } from '@/components/ui/portal-primitives';
import { Button } from '@/components/ui/button';
import { LoadingBlock, EmptyState } from '@/components/ui/primitives';
import { billPaymentsApi, billPaymentsQueryKeys } from '@/services/api';
import { formatCurrency, formatDate } from '@/lib/utils';

export function PayBillsBillPage() {
  const navigate = useNavigate();
  const { requestId = '' } = useParams();

  const { data: bill, isLoading, isError, refetch } = useQuery({
    queryKey: billPaymentsQueryKeys.billRequest(requestId),
    queryFn: () => billPaymentsApi.getBillRequest(requestId, true),
    enabled: Boolean(requestId),
    refetchInterval: q => (q.state.data?.status === 'processing' ? 2000 : false),
  });

  if (isLoading) return <LoadingBlock className="h-96" />;
  if (isError || !bill) {
    return (
      <EmptyState
        title="Bill not found"
        action={
          <button type="button" className="text-sm font-semibold text-[#2563EB]" onClick={() => refetch()}>
            Retry
          </button>
        }
      />
    );
  }
  if (bill.status === 'processing') {
    return (
      <div className="flex min-h-[40vh] flex-col items-center justify-center gap-4">
        <LoadingBlock className="h-12 w-12 rounded-full" />
        <p className="text-sm text-[#64748B]">Fetching bill from {bill.biller.name}…</p>
        <p className="text-xs text-[#94A3B8]">Do not go back or fetch again.</p>
      </div>
    );
  }
  if (bill.status === 'failed') {
    return (
      <EmptyState
        title="Could not fetch bill"
        description={bill.errorMessage ?? 'Check your account details and try again.'}
        action={
          <Link to="/pay-bills" className="text-sm font-semibold text-[#2563EB]">
            Choose another biller
          </Link>
        }
      />
    );
  }

  const amount = bill.billAmount ?? 0;
  const breakdown = bill.breakdown as
    | Array<{ label?: string; name?: string; amount?: number }>
    | Record<string, number>
    | null;

  return (
    <div className="mx-auto max-w-lg space-y-6 pb-4">
      <Breadcrumbs items={[{ label: 'Pay Bills', to: '/pay-bills' }, { label: 'Bill Details' }]} />
      <PortalCard>
        <h1 className="font-display text-xl font-bold text-[#0A1629]">{bill.biller.name}</h1>
        {bill.customerName ? (
          <p className="mt-1 text-sm text-[#64748B]">{bill.customerName}</p>
        ) : null}
        <dl className="mt-6 space-y-3 border-t border-[#F1F5F9] pt-4">
          <div className="flex justify-between">
            <dt className="text-sm text-[#64748B]">Bill Amount</dt>
            <dd className="text-lg font-bold text-[#0A1629]">{formatCurrency(amount)}</dd>
          </div>
          {bill.dueDate ? (
            <div className="flex justify-between">
              <dt className="text-sm text-[#64748B]">Due Date</dt>
              <dd className="text-sm font-medium">{formatDate(bill.dueDate)}</dd>
            </div>
          ) : null}
          {bill.billNumber ? (
            <div className="flex justify-between">
              <dt className="text-sm text-[#64748B]">Bill Number</dt>
              <dd className="text-sm font-medium">{bill.billNumber}</dd>
            </div>
          ) : null}
        </dl>
        {breakdown ? (
          <div className="mt-4 space-y-2 border-t border-[#F1F5F9] pt-4">
            <p className="text-xs font-semibold uppercase tracking-wide text-[#94A3B8]">Breakdown</p>
            {Array.isArray(breakdown)
              ? breakdown.map((item, idx) => (
                  <div key={idx} className="flex justify-between text-sm">
                    <span className="text-[#64748B]">{item.label ?? item.name ?? 'Charge'}</span>
                    <span>{formatCurrency(Number(item.amount ?? 0))}</span>
                  </div>
                ))
              : Object.entries(breakdown).map(([key, value]) => (
                  <div key={key} className="flex justify-between text-sm">
                    <span className="text-[#64748B]">{key.replace(/_/g, ' ')}</span>
                    <span>{formatCurrency(Number(value))}</span>
                  </div>
                ))}
          </div>
        ) : null}
        <Button
          size="lg"
          className="mt-6 w-full"
          disabled={amount <= 0}
          onClick={() => navigate(`/pay-bills/confirm/${requestId}`)}
        >
          {amount > 0 ? `Proceed to Pay ${formatCurrency(amount)}` : 'Amount unavailable'}
        </Button>
        <Link to="/pay-bills" className="mt-3 block text-center text-sm text-[#2563EB]">
          Cancel
        </Link>
      </PortalCard>
    </div>
  );
}
