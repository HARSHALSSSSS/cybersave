import {
  collectRazorpayPayment,
  isSimulatedRazorpayCheckout,
} from '@/lib/razorpayExperience';
import { isRazorpayUserCancelled } from '@/lib/razorpay';
import { showPaymentSuccessTick } from '@/lib/razorpayCheckoutStore';
import { applicationsApi } from '@/services/api/applications.api';

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
  if (intent.status === 'CAPTURED') {
    await showPaymentSuccessTick();
    return;
  }

  const checkout = await collectRazorpayPayment(
    {
      keyId: intent.keyId ?? '',
      orderId: intent.orderId ?? '',
      amount: Number(intent.amount) || amount,
      name: 'Cybersave',
      description: serviceName,
      prefill,
    },
    intent,
  );

  await applicationsApi.confirmApplicationPayment(applicationId, {
    paymentId: intent.paymentId,
    mockCapture: isSimulatedRazorpayCheckout(checkout),
    razorpayPaymentId: checkout.razorpay_payment_id,
    razorpayOrderId: checkout.razorpay_order_id,
    razorpaySignature: checkout.razorpay_signature,
  });
}

export { isRazorpayUserCancelled };
