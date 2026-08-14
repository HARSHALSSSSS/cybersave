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

declare global {
  interface Window {
    Razorpay?: new (options: Record<string, unknown>) => {
      open: () => void;
      on: (event: string, handler: () => void) => void;
    };
  }
}

function loadRazorpayScript(): Promise<boolean> {
  if (window.Razorpay) return Promise.resolve(true);
  return new Promise(resolve => {
    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.async = true;
    script.onload = () => resolve(Boolean(window.Razorpay));
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
}

export async function openRazorpayCheckout(
  params: RazorpayCheckoutParams,
): Promise<RazorpaySuccess> {
  const loaded = await loadRazorpayScript();
  if (!loaded || !window.Razorpay) {
    throw new Error('Could not load Razorpay checkout');
  }

  return new Promise((resolve, reject) => {
    const rzp = new window.Razorpay!({
      key: params.keyId,
      order_id: params.orderId,
      amount: Math.round(params.amount * 100),
      currency: 'INR',
      name: params.name ?? 'Cybersave',
      description: params.description ?? 'BBPS Bill Payment',
      prefill: params.prefill,
      theme: { color: '#2563EB' },
      handler(response: RazorpaySuccess) {
        resolve(response);
      },
      modal: {
        ondismiss() {
          reject(new Error('Payment cancelled'));
        },
      },
    });
    rzp.open();
  });
}

export function isRazorpayUserCancelled(error: unknown): boolean {
  if (!error || typeof error !== 'object') return false;
  const message = String((error as Error).message ?? '').toLowerCase();
  return message.includes('cancel');
}
