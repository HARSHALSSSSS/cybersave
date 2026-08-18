import type { RazorpayCheckoutParams, RazorpaySuccess } from '@utils/razorpayCheckout';

export type CheckoutRequest = {
  params: RazorpayCheckoutParams;
  resolve: (value: RazorpaySuccess) => void;
  reject: (error: Error) => void;
};

type HostState = {
  checkoutRequest: CheckoutRequest | null;
  successTick: { resolve: () => void } | null;
  listeners: Set<() => void>;
};

const g = globalThis as typeof globalThis & { __cybersaveRazorpayHost?: HostState };

function store(): HostState {
  if (!g.__cybersaveRazorpayHost) {
    g.__cybersaveRazorpayHost = {
      checkoutRequest: null,
      successTick: null,
      listeners: new Set(),
    };
  }
  return g.__cybersaveRazorpayHost;
}

function emit() {
  store().listeners.forEach(listener => listener());
}

export function subscribeRazorpayHost(listener: () => void) {
  store().listeners.add(listener);
  return () => store().listeners.delete(listener);
}

export function getCheckoutRequest() {
  return store().checkoutRequest;
}

export function getSuccessTick() {
  return store().successTick;
}

export function openSimulatedRazorpayCheckout(
  params: RazorpayCheckoutParams,
): Promise<RazorpaySuccess> {
  return new Promise((resolve, reject) => {
    store().checkoutRequest = { params, resolve, reject };
    emit();
  });
}

export function completeSimulatedCheckout(result: RazorpaySuccess) {
  store().checkoutRequest?.resolve(result);
  store().checkoutRequest = null;
  emit();
}

export function cancelSimulatedCheckout() {
  store().checkoutRequest?.reject(new Error('Payment cancelled'));
  store().checkoutRequest = null;
  emit();
}

export function showPaymentSuccessTick(durationMs = 800): Promise<void> {
  return new Promise(resolve => {
    const timer = setTimeout(() => {
      store().successTick?.resolve();
    }, durationMs);
    store().successTick = {
      resolve: () => {
        clearTimeout(timer);
        store().successTick = null;
        emit();
        resolve();
      },
    };
    emit();
  });
}
