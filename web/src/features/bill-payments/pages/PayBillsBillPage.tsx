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

  const { data: bill, isLoading, isError } = useQuery({
    queryKey: billPaymentsQueryKeys.billRequest(requestId),
    queryFn: () => billPaymentsApi.getBillRequest(requestId, true),
    enabled: Boolean(requestId),
    refetchInterval: q => (q.state.data?.status === 'processing' ? 2000 : false),
  });

  if (isLoading) return <LoadingBlock className="h-96" />;
  if (isError || !bill) return <EmptyState title="Bill not found" />;
  if (bill.status === 'processing') {
    return (
      <div className="flex min-h-[40vh] flex-col items-center justify-center gap-4">
        <LoadingBlock className="h-12 w-12 rounded-full" />
        <p className="text-sm text-[#64748B]">Fetching bill from {bill.biller.name}…</p>
      </div>
    );
  }
  if (bill.status === 'failed') {
    return (
      <EmptyState
        title="Could not fetch bill"
        description={bill.errorMessage ?? 'Check your account details and try again.'}
      />
    );
  }

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
            <dd className="text-lg font-bold text-[#0A1629]">
              {formatCurrency(bill.billAmount ?? 0)}
            </dd>
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
        <Button
          size="lg"
          className="mt-6 w-full"
          onClick={() => navigate(`/pay-bills/confirm/${requestId}`)}
        >
          Proceed to Pay
        </Button>
        <Link to="/pay-bills" className="mt-3 block text-center text-sm text-[#2563EB]">
          Cancel
        </Link>
      </PortalCard>
    </div>
  );
}
