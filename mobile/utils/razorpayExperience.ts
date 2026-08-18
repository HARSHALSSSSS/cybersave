import {
  isRazorpayUserCancelled,
  openRazorpayCheckout,
  type RazorpayCheckoutParams,
  type RazorpaySuccess,
} from '@utils/razorpayCheckout';
import {
  openSimulatedRazorpayCheckout,
  showPaymentSuccessTick,
} from '@utils/razorpayCheckoutStore';

export function isLiveRazorpayOrderId(orderId?: string | null): boolean {
  const order = (orderId ?? '').trim();
  return order.startsWith('order_') && !order.includes('mock');
}

export function canUseLiveRazorpay(intent: {
  provider?: string;
  keyId?: string | null;
  orderId?: string | null;
}): boolean {
  const key = intent.keyId ?? '';
  return key.startsWith('rzp_') && isLiveRazorpayOrderId(intent.orderId);
}

export function isSimulatedRazorpayCheckout(result: RazorpaySuccess): boolean {
  return (
    result.razorpay_payment_id.startsWith('pay_test_') ||
    result.razorpay_order_id.includes('order_test') ||
    result.razorpay_signature.startsWith('sig_test_')
  );
}

export async function collectRazorpayPayment(
  params: RazorpayCheckoutParams,
  intent?: {
    provider?: string;
    keyId?: string | null;
    orderId?: string | null;
  },
): Promise<RazorpaySuccess> {
  if (intent && canUseLiveRazorpay(intent)) {
    try {
      const result = await openRazorpayCheckout({
        ...params,
        keyId: intent.keyId!,
        orderId: intent.orderId!,
      });
      void showPaymentSuccessTick();
      return result;
    } catch (error) {
      if (isRazorpayUserCancelled(error)) throw error;
    }
  }

  return openSimulatedRazorpayCheckout({
    ...params,
    keyId: params.keyId || 'test_key',
    orderId: params.orderId || `order_test_${Date.now()}`,
  });
}
