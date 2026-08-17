import {
  openRazorpayCheckout,
  type RazorpayCheckoutParams,
  type RazorpaySuccess,
} from '@utils/razorpayCheckout';
import {
  openSimulatedRazorpayCheckout,
  showPaymentSuccessTick,
} from '@utils/razorpayCheckoutStore';

export function canUseLiveRazorpay(intent: {
  provider?: string;
  keyId?: string | null;
  orderId?: string | null;
}): boolean {
  const key = intent.keyId ?? '';
  const order = intent.orderId ?? '';
  return (
    key.startsWith('rzp_') &&
    Boolean(order) &&
    !order.startsWith('mock') &&
    intent.provider !== 'mock'
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
    const result = await openRazorpayCheckout({
      ...params,
      keyId: intent.keyId!,
      orderId: intent.orderId!,
    });
    await showPaymentSuccessTick();
    return result;
  }

  return openSimulatedRazorpayCheckout({
    ...params,
    keyId: params.keyId || 'test_key',
    orderId: params.orderId || `order_test_${Date.now()}`,
  });
}
