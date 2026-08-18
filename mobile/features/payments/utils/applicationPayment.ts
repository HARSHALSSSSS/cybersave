import { applicationsApi, type PaymentIntent } from '@services/api/applications.api';
import { isRazorpayUserCancelled } from '@utils/razorpayCheckout';
import {
  collectRazorpayPayment,
  isSimulatedRazorpayCheckout,
} from '@utils/razorpayExperience';
import { dismissRazorpayHost } from '@utils/razorpayCheckoutStore';
import { settlePayment } from '@utils/paymentResilience';
import { assertConfirmSucceeded } from '@features/payments/utils/applicationSubmit';

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
  prefetchedIntent?: PaymentIntent | null;
}): Promise<void> {
  const {
    applicationId,
    method,
    idempotencyKey,
    amount,
    serviceName,
    prefill,
    prefetchedIntent,
  } = params;

  if (method === 'wallet') {
    try {
      await settlePayment({
        confirm: async () => {
          const result = await applicationsApi.payWithWallet(applicationId, idempotencyKey);
          assertConfirmSucceeded(result);
          return result;
        },
        verify: () => applicationPaymentCaptured(applicationId),
      });
    } finally {
      dismissRazorpayHost();
    }
    return;
  }

  try {
    const intent =
      prefetchedIntent ??
      (await applicationsApi.createPaymentIntent(applicationId, idempotencyKey));
    if (intent.status === 'CAPTURED') {
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
  } finally {
    dismissRazorpayHost();
  }
}

export { isRazorpayUserCancelled };
