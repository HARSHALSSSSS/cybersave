import RazorpayCheckout from 'react-native-razorpay';

export type RazorpaySuccess = {
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
  const result = await RazorpayCheckout.open({
    key: params.keyId,
    order_id: params.orderId,
    amount: Math.round(params.amount * 100),
    currency: 'INR',
    name: params.name ?? 'Cybersave',
    description: params.description ?? 'Payment',
    prefill: params.prefill,
    theme: { color: '#2563EB' },
  });

  return {
    razorpay_payment_id: result.razorpay_payment_id,
    razorpay_order_id: result.razorpay_order_id,
    razorpay_signature: result.razorpay_signature,
  };
}

export function isRazorpayUserCancelled(error: unknown): boolean {
  if (!error || typeof error !== 'object') return false;
  const code = (error as { code?: number }).code;
  const description = String((error as { description?: string }).description ?? '').toLowerCase();
  return code === 0 || description.includes('cancel');
}
