import { openRazorpayCheckout, isRazorpayUserCancelled } from '@/lib/razorpay';
import { applicationsApi } from '@/services/api/applications.api';

export type PaymentMethod = 'razorpay' | 'wallet';

export function shouldUseMockRazorpay(intent: {
  provider?: string;
  keyId?: string | null;
  orderId?: string | null;
}): boolean {
  return (
    import.meta.env.DEV ||
    intent.provider === 'mock' ||
    !intent.keyId ||
    !intent.orderId ||
    intent.keyId === 'mock_key'
  );
}

export async function processApplicationPayment(params: {
  applicationId: string;
  method: PaymentMethod;
  idempotencyKey: string;
  amount: number;
  serviceName: string;
  prefill?: { contact?: string; email?: string; name?: string };
}): Promise<void> {
  const { applicationId, method, idempotencyKey, amount, serviceName, prefill } = params;

  if (method === 'wallet') {
    await applicationsApi.payWithWallet(applicationId, idempotencyKey);
    return;
  }

  const intent = await applicationsApi.createPaymentIntent(applicationId, idempotencyKey);
  if (intent.status === 'CAPTURED') return;

  if (shouldUseMockRazorpay(intent)) {
    await applicationsApi.confirmApplicationPayment(applicationId, {
      paymentId: intent.paymentId,
      mockCapture: true,
    });
    return;
  }

  const checkout = await openRazorpayCheckout({
    keyId: intent.keyId!,
    orderId: intent.orderId!,
    amount,
    name: 'Cybersave',
    description: serviceName,
    prefill,
  });

  await applicationsApi.confirmApplicationPayment(applicationId, {
    paymentId: intent.paymentId,
    mockCapture: false,
    razorpayPaymentId: checkout.razorpay_payment_id,
    razorpayOrderId: checkout.razorpay_order_id,
    razorpaySignature: checkout.razorpay_signature,
  });
}

export { isRazorpayUserCancelled };
