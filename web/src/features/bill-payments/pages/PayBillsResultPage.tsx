import { Link, useParams } from 'react-router';
import { useQuery } from '@tanstack/react-query';
import { CheckCircle2, Clock3, XCircle } from 'lucide-react';
import { Breadcrumbs } from '@/components/layout/Breadcrumbs';
import { PortalCard } from '@/components/ui/portal-primitives';
import { Button } from '@/components/ui/button';
import { LoadingBlock, EmptyState } from '@/components/ui/primitives';
import { billPaymentsApi, billPaymentsQueryKeys } from '@/services/api';
import { formatCurrency, formatDate } from '@/lib/utils';

export function PayBillsResultPage() {
  const { paymentId = '' } = useParams();

  const { data: payment, isLoading, isError, refetch } = useQuery({
    queryKey: billPaymentsQueryKeys.payment(paymentId),
    queryFn: () => billPaymentsApi.getPayment(paymentId, true),
    enabled: Boolean(paymentId),
    refetchInterval: q => {
      const status = q.state.data?.status;
      if (status === 'processing' || status === 'pending') return 2000;
      return false;
    },
  });

  if (isLoading && !payment) return <LoadingBlock className="h-96" />;
  if (isError || !payment) {
    return (
      <EmptyState
        title="Receipt not found"
        action={
          <Link to="/pay-bills/history" className="text-sm font-semibold text-[#2563EB]">
            View history
          </Link>
        }
      />
    );
  }

  const isProcessing = payment.status === 'processing' || payment.status === 'pending';
  const isSuccess = payment.status === 'success';
  const isFailed = payment.status === 'failed';

  return (
    <div className="mx-auto max-w-lg space-y-6 pb-4">
      <Breadcrumbs items={[{ label: 'Pay Bills', to: '/pay-bills' }, { label: 'Receipt' }]} />
      <PortalCard className="text-center">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-[#F8FAFC]">
          {isSuccess ? <CheckCircle2 className="h-10 w-10 text-emerald-500" /> : null}
          {isProcessing ? <Clock3 className="h-10 w-10 text-amber-500" /> : null}
          {isFailed ? <XCircle className="h-10 w-10 text-red-500" /> : null}
        </div>
        <h1 className="mt-4 font-display text-xl font-bold text-[#0A1629]">
          {isSuccess ? 'Payment successful' : isFailed ? 'Payment failed' : 'Payment processing'}
        </h1>
        <p className="mt-2 text-sm text-[#64748B]">
          {isSuccess
            ? `Paid to ${payment.biller.name}`
            : isFailed
              ? payment.errorMessage ?? 'We could not complete this payment. Do not pay again until you check history.'
              : 'Please wait. Do not pay this bill again.'}
        </p>
        <p className="mt-4 text-3xl font-bold text-[#0A1629]">{formatCurrency(payment.totalAmount)}</p>

        <dl className="mt-6 space-y-3 border-t border-[#F1F5F9] pt-4 text-left text-sm">
          <div className="flex justify-between">
            <dt className="text-[#64748B]">Biller</dt>
            <dd>{payment.biller.name}</dd>
          </div>
          <div className="flex justify-between">
            <dt className="text-[#64748B]">Account</dt>
            <dd>{payment.accountMasked}</dd>
          </div>
          <div className="flex justify-between">
            <dt className="text-[#64748B]">Bill amount</dt>
            <dd>{formatCurrency(payment.billAmount)}</dd>
          </div>
          <div className="flex justify-between">
            <dt className="text-[#64748B]">Convenience fee</dt>
            <dd>{formatCurrency(payment.convenienceFee)}</dd>
          </div>
          {payment.paidAt ? (
            <div className="flex justify-between">
              <dt className="text-[#64748B]">Paid on</dt>
              <dd>{formatDate(payment.paidAt)}</dd>
            </div>
          ) : null}
          {payment.transactionId ? (
            <div className="flex justify-between gap-4">
              <dt className="text-[#64748B]">Transaction ID</dt>
              <dd className="break-all text-right">{payment.transactionId}</dd>
            </div>
          ) : null}
          {payment.bbpsReference ? (
            <div className="flex justify-between gap-4">
              <dt className="text-[#64748B]">BBPS reference</dt>
              <dd className="break-all text-right">{payment.bbpsReference}</dd>
            </div>
          ) : null}
        </dl>

        {isProcessing ? (
          <Button className="mt-6 w-full" variant="outline" onClick={() => refetch()}>
            Refresh status
          </Button>
        ) : null}
        <Link to="/pay-bills" className="mt-4 block">
          <Button className="w-full" variant={isSuccess ? 'primary' : 'outline'}>
            Done
          </Button>
        </Link>
        <Link to="/pay-bills/history" className="mt-3 block text-sm font-semibold text-[#2563EB]">
          View payment history
        </Link>
      </PortalCard>
    </div>
  );
}
