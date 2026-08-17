import { applicationsApi } from '@services/api/applications.api';
import { isRazorpayUserCancelled } from '@utils/razorpayCheckout';
import { canUseLiveRazorpay, collectRazorpayPayment } from '@utils/razorpayExperience';

export type PaymentMethod = 'razorpay' | 'wallet';

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

  const checkout = await collectRazorpayPayment(
    {
      keyId: intent.keyId ?? '',
      orderId: intent.orderId ?? '',
      amount,
      name: 'Cybersave',
      description: serviceName,
      prefill,
    },
    intent,
  );

  await applicationsApi.confirmApplicationPayment(applicationId, {
    paymentId: intent.paymentId,
    mockCapture: !canUseLiveRazorpay(intent),
    razorpayPaymentId: checkout.razorpay_payment_id,
    razorpayOrderId: checkout.razorpay_order_id,
    razorpaySignature: checkout.razorpay_signature,
  });
}

export { isRazorpayUserCancelled };
