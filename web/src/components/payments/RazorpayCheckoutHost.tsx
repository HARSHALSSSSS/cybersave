import { useLayoutEffect, useMemo, useState } from 'react';
import { createPortal } from 'react-dom';
import { Check, CreditCard, Landmark, Smartphone, Wallet, X } from 'lucide-react';
import {
  cancelSimulatedCheckout,
  completeSimulatedCheckout,
  getCheckoutRequest,
  getSuccessTick,
  subscribeRazorpayHost,
} from '@/lib/razorpayCheckoutStore';
import { cn } from '@/lib/utils';

type PayMethod = 'upi' | 'card' | 'netbanking' | 'wallet';

const METHODS: Array<{ id: PayMethod; label: string; hint: string; icon: typeof Smartphone }> = [
  { id: 'upi', label: 'UPI', hint: 'GPay, PhonePe, Paytm, BHIM', icon: Smartphone },
  { id: 'card', label: 'Cards', hint: 'Visa, Mastercard, RuPay', icon: CreditCard },
  { id: 'netbanking', label: 'Netbanking', hint: 'All major Indian banks', icon: Landmark },
  { id: 'wallet', label: 'Wallets', hint: 'PhonePe, Amazon Pay, Mobikwik', icon: Wallet },
];

function formatAmount(amount: number) {
  return `₹${amount.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

export function RazorpayCheckoutHost() {
  const [, setTick] = useState(0);
  useLayoutEffect(() => {
    const unsubscribe = subscribeRazorpayHost(() => setTick(n => n + 1));
    return () => {
      unsubscribe();
    };
  }, []);

  const request = getCheckoutRequest();
  const success = getSuccessTick();

  if (typeof document === 'undefined') return null;

  if (success) {
    return createPortal(
      <div className="fixed inset-0 z-[10050] flex items-center justify-center bg-slate-950/55 p-4">
        <div className="flex w-full max-w-sm flex-col items-center rounded-3xl bg-white px-8 py-12 shadow-2xl">
          <div className="flex h-24 w-24 items-center justify-center rounded-full bg-emerald-500 shadow-[0_0_0_12px_rgba(16,185,129,0.18)]">
            <Check className="h-12 w-12 text-white" strokeWidth={3} />
          </div>
          <p className="mt-6 text-xl font-bold text-slate-900">Payment Successful</p>
          <p className="mt-1 text-sm text-slate-500">Secured by Razorpay</p>
        </div>
      </div>,
      document.body,
    );
  }

  if (!request) return null;

  return createPortal(<CheckoutSheet />, document.body);
}

function CheckoutSheet() {
  const request = getCheckoutRequest();
  const [method, setMethod] = useState<PayMethod>('upi');
  const [upi, setUpi] = useState('success@razorpay');
  const [paying, setPaying] = useState(false);
  const [done, setDone] = useState(false);

  const params = request?.params;
  const amount = params?.amount ?? 0;

  const methodHint = useMemo(() => {
    if (method === 'upi') return 'Test UPI ID: success@razorpay';
    if (method === 'card') return 'Test card: 4111 1111 1111 1111';
    if (method === 'netbanking') return 'Test bank: HDFC / SBI / ICICI';
    return 'Test wallet: PhonePe / Paytm';
  }, [method]);

  if (!request || !params) return null;

  async function pay() {
    if (!params) return;
    setPaying(true);
    await new Promise(r => setTimeout(r, 450));
    setPaying(false);
    setDone(true);
    await new Promise(r => setTimeout(r, 650));
    completeSimulatedCheckout({
      razorpay_payment_id: `pay_test_${Date.now()}`,
      razorpay_order_id: params.orderId || `order_test_${Date.now()}`,
      razorpay_signature: `sig_test_${Date.now()}`,
    });
  }

  if (done) {
    return (
      <div className="fixed inset-0 z-[10050] flex items-center justify-center bg-slate-950/55 p-4">
        <div className="flex w-full max-w-sm flex-col items-center rounded-3xl bg-white px-8 py-12 shadow-2xl">
          <div className="flex h-24 w-24 items-center justify-center rounded-full bg-emerald-500 shadow-[0_0_0_12px_rgba(16,185,129,0.18)]">
            <Check className="h-12 w-12 text-white" strokeWidth={3} />
          </div>
          <p className="mt-6 text-xl font-bold text-slate-900">Payment Successful</p>
          <p className="mt-1 text-sm font-medium text-slate-500">{formatAmount(amount)}</p>
          <p className="mt-4 text-xs uppercase tracking-wider text-slate-400">Secured by Razorpay</p>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-[10050] flex items-end justify-center bg-slate-950/55 p-0 sm:items-center sm:p-4">
      <div className="w-full max-w-md overflow-hidden rounded-t-3xl bg-white shadow-2xl sm:rounded-3xl">
        <div className="flex items-center justify-between bg-[#0B2545] px-5 py-4 text-white">
          <div>
            <p className="text-[11px] uppercase tracking-widest text-blue-200">Razorpay Checkout</p>
            <p className="text-lg font-semibold">{params.name ?? 'Cybersave'}</p>
            <p className="text-xs text-blue-100">{params.description ?? 'Secure payment'}</p>
          </div>
          <div className="text-right">
            <p className="text-xs text-blue-200">Amount</p>
            <p className="text-xl font-bold">{formatAmount(amount)}</p>
          </div>
        </div>

        <div className="flex items-center justify-between border-b border-slate-100 px-5 py-2 text-xs text-slate-500">
          <span>Test Mode</span>
          <button
            type="button"
            className="rounded-full p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-700"
            onClick={cancelSimulatedCheckout}
            aria-label="Close checkout"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="space-y-2 px-4 py-4">
          {METHODS.map(item => {
            const Icon = item.icon;
            const active = method === item.id;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => setMethod(item.id)}
                className={cn(
                  'flex w-full items-center gap-3 rounded-2xl border px-3 py-3 text-left transition',
                  active
                    ? 'border-[#2B84EA] bg-blue-50'
                    : 'border-slate-200 bg-white hover:border-slate-300',
                )}
              >
                <span
                  className={cn(
                    'flex h-10 w-10 items-center justify-center rounded-xl',
                    active ? 'bg-[#2B84EA] text-white' : 'bg-slate-100 text-slate-600',
                  )}
                >
                  <Icon className="h-5 w-5" />
                </span>
                <span className="flex-1">
                  <span className="block text-sm font-semibold text-slate-900">{item.label}</span>
                  <span className="block text-xs text-slate-500">{item.hint}</span>
                </span>
                <span
                  className={cn(
                    'h-4 w-4 rounded-full border-2',
                    active ? 'border-[#2B84EA] bg-[#2B84EA]' : 'border-slate-300',
                  )}
                />
              </button>
            );
          })}
        </div>

        <div className="px-5 pb-2">
          {method === 'upi' ? (
            <label className="block text-xs font-medium text-slate-600">
              UPI ID
              <input
                value={upi}
                onChange={e => setUpi(e.target.value)}
                className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-[#2B84EA]"
              />
            </label>
          ) : null}
          <p className="mt-2 text-xs text-slate-500">{methodHint}</p>
        </div>

        <div className="px-5 pb-5 pt-2">
          <button
            type="button"
            disabled={paying}
            onClick={() => void pay()}
            className="w-full rounded-xl bg-[#2B84EA] py-3 text-sm font-semibold text-white shadow-sm hover:bg-[#1b73d9] disabled:opacity-70"
          >
            {paying ? 'Processing…' : `Pay ${formatAmount(amount)}`}
          </button>
          <p className="mt-3 text-center text-[11px] text-slate-400">
            100% Secure Payments · Powered by Razorpay
          </p>
        </div>
      </div>
    </div>
  );
}
