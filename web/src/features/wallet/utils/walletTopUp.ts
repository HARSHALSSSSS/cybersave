import { collectRazorpayPayment, isSimulatedRazorpayCheckout } from '@/lib/razorpayExperience';
import { isRazorpayUserCancelled } from '@/lib/razorpay';
import { walletApi } from '@/services/api/wallet.api';
import { settlePayment } from '@/lib/paymentResilience';

async function topUpCredited(topUpId: string): Promise<boolean> {
  const summary = await walletApi.getWalletSummary();
  return summary.transactions.some(
    tx => tx.type === 'TOPUP' && tx.referenceId === topUpId,
  );
}

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
      amount: Number(intent.amount) || params.amount,
      name: 'Cybersave Wallet',
      description: 'Wallet recharge',
      prefill: params.prefill,
    },
    intent,
  );

  await settlePayment({
    confirm: () =>
      walletApi.confirmWalletTopUp(intent.id, {
        mockCapture: isSimulatedRazorpayCheckout(checkout),
        razorpayPaymentId: checkout.razorpay_payment_id,
        razorpayOrderId: checkout.razorpay_order_id,
        razorpaySignature: checkout.razorpay_signature,
      }),
    verify: () => topUpCredited(intent.id),
  });
}

export { isRazorpayUserCancelled };
