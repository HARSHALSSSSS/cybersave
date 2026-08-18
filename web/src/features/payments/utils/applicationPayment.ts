import {
  collectRazorpayPayment,
  isSimulatedRazorpayCheckout,
} from '@/lib/razorpayExperience';
import { isRazorpayUserCancelled } from '@/lib/razorpay';
import { showPaymentSuccessTick } from '@/lib/razorpayCheckoutStore';
import { assertConfirmSucceeded } from '@/features/payments/utils/applicationSubmit';
import { settlePayment } from '@/lib/paymentResilience';
import { applicationsApi } from '@/services/api/applications.api';

export type PaymentMethod = 'razorpay' | 'wallet';

async function applicationPaymentCaptured(applicationId: string): Promise<boolean> {
  const application = await applicationsApi.getApplicationById(applicationId);
  return application.payment?.status === 'CAPTURED';
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
    await settlePayment({
      confirm: async () => {
        const result = await applicationsApi.payWithWallet(applicationId, idempotencyKey);
        assertConfirmSucceeded(result);
        return result;
      },
      verify: () => applicationPaymentCaptured(applicationId),
    });
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

  await settlePayment({
    confirm: async () => {
      const result = await applicationsApi.confirmApplicationPayment(applicationId, {
        paymentId: intent.paymentId,
        mockCapture: isSimulatedRazorpayCheckout(checkout),
        razorpayPaymentId: checkout.razorpay_payment_id,
        razorpayOrderId: checkout.razorpay_order_id,
        razorpaySignature: checkout.razorpay_signature,
      });
      assertConfirmSucceeded(result);
      return result;
    },
    verify: () => applicationPaymentCaptured(applicationId),
  });
}

export { isRazorpayUserCancelled };
