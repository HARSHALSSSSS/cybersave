export const BBPS_USER_ERRORS: Record<string, string> = {
  BILLER_NOT_FOUND: 'Unable to find this biller. Please try again.',
  INVALID_ACCOUNT: 'The account details look incorrect. Please verify and try again.',
  BILL_NOT_FOUND: 'No bill found for these details. Please check and try again.',
  BILLER_UNAVAILABLE: 'This biller is temporarily unavailable. Try again later.',
  PAYMENT_FAILED: 'We could not complete your bill payment. Please try again.',
  PAYMENT_PENDING:
    'Your payment is being confirmed. Please do not pay again.',
  SERVICE_UNAVAILABLE: 'Bill payment service is temporarily unavailable.',
  TIMEOUT: 'This is taking longer than expected. Please wait or try again.',
  VALIDATION_ERROR: 'Please check the entered details and try again.',
};

export function mapProviderErrorToUserCode(
  providerMessage?: string,
  httpStatus?: number,
): string {
  const msg = (providerMessage ?? '').toLowerCase();
  if (httpStatus === 408 || msg.includes('timeout')) return 'TIMEOUT';
  if (msg.includes('biller') && msg.includes('not found')) return 'BILLER_NOT_FOUND';
  if (msg.includes('invalid') && msg.includes('account')) return 'INVALID_ACCOUNT';
  if (msg.includes('no bill') || msg.includes('bill not')) return 'BILL_NOT_FOUND';
  if (msg.includes('unavailable')) return 'BILLER_UNAVAILABLE';
  if (httpStatus && httpStatus >= 500) return 'SERVICE_UNAVAILABLE';
  return 'SERVICE_UNAVAILABLE';
}

export function userMessageForCode(code: string): string {
  return BBPS_USER_ERRORS[code] ?? BBPS_USER_ERRORS.SERVICE_UNAVAILABLE;
}
