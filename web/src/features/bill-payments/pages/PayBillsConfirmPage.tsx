import { Link, useNavigate, useParams } from 'react-router';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Lock } from 'lucide-react';
import { toast } from 'sonner';
import { Breadcrumbs } from '@/components/layout/Breadcrumbs';
import { PortalCard } from '@/components/ui/portal-primitives';
import { Button } from '@/components/ui/button';
import { LoadingBlock, EmptyState } from '@/components/ui/primitives';
import { useAuthStore } from '@/features/auth/store/auth.store';
import { extractErrorMessage } from '@/features/apply/utils/validation-errors';
import { isRazorpayUserCancelled } from '@/lib/razorpay';
import { collectRazorpayPayment, canUseLiveRazorpay } from '@/lib/razorpayExperience';
import { billPaymentsApi, billPaymentsQueryKeys } from '@/services/api';
import { formatCurrency } from '@/lib/utils';
import { getProfileDisplayName } from '@/lib/profile';

export function PayBillsConfirmPage() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { requestId = '' } = useParams();
  const citizen = useAuthStore(s => s.citizen);

  const { data: settings } = useQuery({
    queryKey: billPaymentsQueryKeys.settings(),
    queryFn: () => billPaymentsApi.getSettings(),
  });

  const { data: bill, isLoading } = useQuery({
    queryKey: billPaymentsQueryKeys.billRequest(requestId),
    queryFn: () => billPaymentsApi.getBillRequest(requestId),
    enabled: Boolean(requestId),
  });

  const convenienceFee = Number(settings?.convenienceFeeFlat ?? 5) || 5;
  const billAmount = Number(bill?.billAmount ?? 0);
  const total = billAmount + convenienceFee;

  const pay = useMutation({
    mutationFn: async () => {
      const intent = await billPaymentsApi.createPaymentIntent(requestId);
      const payable = Number(intent.totalAmount || total);
      const checkout = await collectRazorpayPayment(
        {
          keyId: intent.keyId ?? '',
          orderId: intent.orderId ?? '',
          amount: payable,
          name: 'Cybersave BBPS',
          description: bill?.biller.name ?? 'Bill payment',
          prefill: {
            contact: citizen?.phone,
            email: citizen?.email ?? undefined,
            name: getProfileDisplayName(citizen),
          },
        },
        intent,
      );

      return billPaymentsApi.confirmPayment(intent.id, {
        mockCapture: !canUseLiveRazorpay(intent),
        razorpayPaymentId: checkout.razorpay_payment_id,
        razorpayOrderId: checkout.razorpay_order_id,
        razorpaySignature: checkout.razorpay_signature,
      });
    },
    onSuccess: payment => {
      void queryClient.invalidateQueries({ queryKey: billPaymentsQueryKeys.all });
      navigate(`/pay-bills/receipt/${payment.id}`, { replace: true });
    },
    onError: (error: unknown) => {
      if (isRazorpayUserCancelled(error)) return;
      toast.error(extractErrorMessage(error, 'Payment failed'));
    },
  });

  if (isLoading) return <LoadingBlock className="h-96" />;
  if (!bill || bill.status !== 'success') {
    return <EmptyState title="Bill unavailable" description="Go back and fetch the bill again." />;
  }
  if (billAmount <= 0) {
    return <EmptyState title="Bill amount unavailable" description="Fetch the bill again and retry." />;
  }

  return (
    <div className="mx-auto max-w-lg space-y-6 pb-4">
      <Breadcrumbs items={[{ label: 'Pay Bills', to: '/pay-bills' }, { label: 'Confirm Payment' }]} />
      <PortalCard>
        <h1 className="font-display text-xl font-bold text-[#0A1629]">Confirm Payment</h1>
        <p className="mt-1 text-sm text-[#64748B]">{bill.biller.name}</p>
        {bill.customerName ? <p className="text-sm text-[#64748B]">{bill.customerName}</p> : null}
        <dl className="mt-6 space-y-3">
          <div className="flex justify-between text-sm">
            <dt className="text-[#64748B]">Bill Amount</dt>
            <dd>{formatCurrency(billAmount)}</dd>
          </div>
          <div className="flex justify-between text-sm">
            <dt className="text-[#64748B]">Convenience Fee</dt>
            <dd>{formatCurrency(convenienceFee)}</dd>
          </div>
          <div className="flex justify-between border-t border-[#F1F5F9] pt-3 text-base font-bold">
            <dt>Total</dt>
            <dd className="text-[#2563EB]">{formatCurrency(total)}</dd>
          </div>
        </dl>
        <Button
          size="lg"
          className="mt-6 w-full"
          disabled={pay.isPending}
          onClick={() => pay.mutate()}
        >
          {pay.isPending ? 'Processing… Do not refresh' : `Pay ${formatCurrency(total)}`}
        </Button>
        <p className="mt-4 flex items-center justify-center gap-2 text-xs text-[#94A3B8]">
          <Lock className="h-3.5 w-3.5" />
          Secured by Razorpay · BBPS
        </p>
        <Link to={`/pay-bills/bill/${requestId}`} className="mt-3 block text-center text-sm text-[#2563EB]">
          Back
        </Link>
      </PortalCard>
    </div>
  );
}
