import type { ConfigService } from '@nestjs/config';

function envValue(
  config: ConfigService | undefined,
  configKey: string,
  envKey: string,
): string {
  return String(config?.get<string>(configKey) ?? process.env[envKey] ?? '').trim();
}

export function isLiveRazorpayOrderId(orderId?: string | null): boolean {
  const order = (orderId ?? '').trim();
  return order.startsWith('order_') && !order.includes('mock');
}

export function hasRazorpayKeys(config?: ConfigService): boolean {
  const keyId = envValue(config, 'payment.razorpayKeyId', 'RAZORPAY_KEY_ID');
  const secret = envValue(config, 'payment.razorpayKeySecret', 'RAZORPAY_KEY_SECRET');
  return keyId.startsWith('rzp_') && secret.length >= 8;
}

/** Use Standard Checkout whenever keys exist, even if PAYMENT_PROVIDER was left as mock. */
export function shouldUseRazorpayProvider(config?: ConfigService): boolean {
  if ((process.env.PAYMENT_FORCE_MOCK ?? '').toLowerCase() === 'true') {
    return false;
  }
  return hasRazorpayKeys(config);
}

export function publicRazorpayKeyId(config?: ConfigService): string {
  const keyId = envValue(config, 'payment.razorpayKeyId', 'RAZORPAY_KEY_ID');
  return keyId.startsWith('rzp_') ? keyId : 'mock_key';
}
