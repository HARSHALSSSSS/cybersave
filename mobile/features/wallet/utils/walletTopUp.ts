import { walletApi } from '@services/api/wallet.api';
import { isRazorpayUserCancelled } from '@utils/razorpayCheckout';
import { canUseLiveRazorpay, collectRazorpayPayment } from '@utils/razorpayExperience';

export async function processWalletTopUp(params: {
  amount: number;
  idempotencyKey: string;
  prefill?: { contact?: string; email?: string; name?: string };
}): Promise<void> {
  const intent = await walletApi.createWalletTopUpIntent(params.amount, params.idempotencyKey);

  const checkout = await collectRazorpayPayment(
    {
      keyId: intent.keyId,
      orderId: intent.orderId ?? '',
      amount: params.amount,
      name: 'Cybersave Wallet',
      description: 'Wallet recharge',
      prefill: params.prefill,
    },
    intent,
  );

  await walletApi.confirmWalletTopUp(intent.id, {
    mockCapture: !canUseLiveRazorpay(intent),
    razorpayPaymentId: checkout.razorpay_payment_id,
    razorpayOrderId: checkout.razorpay_order_id,
    razorpaySignature: checkout.razorpay_signature,
  });
}

export { isRazorpayUserCancelled };
