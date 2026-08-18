import type { QueryClient } from '@tanstack/react-query';

let successTickTimer: ReturnType<typeof setTimeout> | null = null;

export type CheckoutRequest = {
  params: import('@utils/razorpayCheckout').RazorpayCheckoutParams;
  resolve: (value: import('@utils/razorpayCheckout').RazorpaySuccess) => void;
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

function clearSuccessTickTimer() {
  if (successTickTimer) {
    clearTimeout(successTickTimer);
    successTickTimer = null;
  }
}

/** Force-close checkout overlay — call after payment flow ends or on navigation. */
export function dismissRazorpayHost() {
  clearSuccessTickTimer();
  const state = store();
  if (state.checkoutRequest) {
    state.checkoutRequest.reject(new Error('Payment dismissed'));
  }
  state.checkoutRequest = null;
  state.successTick?.resolve();
  state.successTick = null;
  emit();
}

export function subscribeRazorpayHost(listener: () => void) {
  store().listeners.add(listener);
  return () => {
    store().listeners.delete(listener);
  };
}

export function getCheckoutRequest() {
  return store().checkoutRequest;
}

export function getSuccessTick() {
  return store().successTick;
}

export function openSimulatedRazorpayCheckout(
  params: CheckoutRequest['params'],
): Promise<import('@utils/razorpayCheckout').RazorpaySuccess> {
  return new Promise((resolve, reject) => {
    dismissRazorpayHost();
    store().checkoutRequest = { params, resolve, reject };
    emit();
  });
}

export function completeSimulatedCheckout(
  result: import('@utils/razorpayCheckout').RazorpaySuccess,
) {
  clearSuccessTickTimer();
  store().checkoutRequest?.resolve(result);
  store().checkoutRequest = null;
  store().successTick = null;
  emit();
}

export function cancelSimulatedCheckout() {
  dismissRazorpayHost();
}

export function showPaymentSuccessTick(durationMs = 160): Promise<void> {
  return new Promise(resolve => {
    clearSuccessTickTimer();
    const state = store();
    state.checkoutRequest = null;
    successTickTimer = setTimeout(() => {
      successTickTimer = null;
      state.successTick?.resolve();
      state.successTick = null;
      emit();
      resolve();
    }, durationMs);
    state.successTick = {
      resolve: () => {
        clearSuccessTickTimer();
        state.successTick = null;
        emit();
        resolve();
      },
    };
    emit();
  });
}
