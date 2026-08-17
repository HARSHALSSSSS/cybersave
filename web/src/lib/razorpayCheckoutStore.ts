import type { RazorpayCheckoutParams, RazorpaySuccess } from '@/lib/razorpay';

export type CheckoutRequest = {
  params: RazorpayCheckoutParams;
  resolve: (value: RazorpaySuccess) => void;
  reject: (error: Error) => void;
};

let checkoutRequest: CheckoutRequest | null = null;
let successTick: { resolve: () => void } | null = null;
const listeners = new Set<() => void>();

function emit() {
  listeners.forEach(listener => listener());
}

export function subscribeRazorpayHost(listener: () => void) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

export function getCheckoutRequest() {
  return checkoutRequest;
}

export function getSuccessTick() {
  return successTick;
}

export function openSimulatedRazorpayCheckout(
  params: RazorpayCheckoutParams,
): Promise<RazorpaySuccess> {
  return new Promise((resolve, reject) => {
    checkoutRequest = { params, resolve, reject };
    emit();
  });
}

export function completeSimulatedCheckout(result: RazorpaySuccess) {
  checkoutRequest?.resolve(result);
  checkoutRequest = null;
  emit();
}

export function cancelSimulatedCheckout() {
  checkoutRequest?.reject(new Error('Payment cancelled'));
  checkoutRequest = null;
  emit();
}

export function showPaymentSuccessTick(durationMs = 1100): Promise<void> {
  return new Promise(resolve => {
    successTick = {
      resolve: () => {
        successTick = null;
        emit();
        resolve();
      },
    };
    emit();
    window.setTimeout(() => successTick?.resolve(), durationMs);
  });
}
