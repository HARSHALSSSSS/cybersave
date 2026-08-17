import { walletApi } from '@services/api/wallet.api';
import {
  isRazorpayUserCancelled,
  openRazorpayCheckout,
  shouldUseMockRazorpay,
} from '@utils/razorpayCheckout';

export async function processWalletTopUp(params: {
  amount: number;
  idempotencyKey: string;
  prefill?: { contact?: string; email?: string; name?: string };
}): Promise<void> {
  const intent = await walletApi.createWalletTopUpIntent(params.amount, params.idempotencyKey);

  if (shouldUseMockRazorpay(intent)) {
    await walletApi.confirmWalletTopUp(intent.id, { mockCapture: true });
    return;
  }

  const checkout = await openRazorpayCheckout({
    keyId: intent.keyId,
    orderId: intent.orderId!,
    amount: params.amount,
    name: 'Cybersave Wallet',
    description: 'Wallet recharge',
    prefill: params.prefill,
  });

  await walletApi.confirmWalletTopUp(intent.id, {
    mockCapture: false,
    razorpayPaymentId: checkout.razorpay_payment_id,
    razorpayOrderId: checkout.razorpay_order_id,
    razorpaySignature: checkout.razorpay_signature,
  });
}

export { isRazorpayUserCancelled };
