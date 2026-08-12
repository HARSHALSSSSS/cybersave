type RazorpaySuccess = {
  razorpay_payment_id: string;
  razorpay_order_id: string;
  razorpay_signature: string;
};

export type RazorpayCheckoutParams = {
  keyId: string;
  orderId: string;
  amount: number;
  name?: string;
  description?: string;
  prefill?: {
    contact?: string;
    email?: string;
    name?: string;
  };
};

export async function openRazorpayCheckout(
  params: RazorpayCheckoutParams,
): Promise<RazorpaySuccess> {
  const RazorpayCheckout = require('react-native-razorpay').default as {
    open: (options: Record<string, unknown>) => Promise<RazorpaySuccess>;
  };

  return RazorpayCheckout.open({
    key: params.keyId,
    order_id: params.orderId,
    amount: Math.round(params.amount * 100),
    currency: 'INR',
    name: params.name ?? 'Cybersave',
    description: params.description ?? 'BBPS Bill Payment',
    prefill: params.prefill,
    theme: { color: '#2563EB' },
  });
}

export function isRazorpayUserCancelled(error: unknown): boolean {
  if (!error || typeof error !== 'object') return false;
  const code = (error as { code?: number }).code;
  const description = String((error as { description?: string }).description ?? '');
  return code === 0 || description.toLowerCase().includes('cancel');
}
