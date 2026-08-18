/**
 * Razorpay charges the customer before our confirm call runs. A slow or dropped
 * confirm therefore must never be reported as a failed payment on its own: we
 * retry the (idempotent) confirm, then fall back to reading server-side status
 * before deciding anything failed.
 */

const DEFAULT_CONFIRM_ATTEMPTS = 3;
const DEFAULT_VERIFY_ATTEMPTS = 4;
const VERIFY_DELAY_MS = 450;

/** Payment went through but a later step (e.g. submit) failed. */
export class PaymentSettledError extends Error {
  readonly cause: unknown;

  constructor(message: string, cause: unknown) {
    super(message);
    this.name = 'PaymentSettledError';
    this.cause = cause;
  }
}

export function isPaymentSettledError(error: unknown): error is PaymentSettledError {
  return error instanceof PaymentSettledError;
}

function httpStatusOf(error: unknown): number | undefined {
  if (!error || typeof error !== 'object') return undefined;
  const response = (error as { response?: { status?: number } }).response;
  return typeof response?.status === 'number' ? response.status : undefined;
}

function errorCodeOf(error: unknown): string {
  if (!error || typeof error !== 'object') return '';
  return String((error as { code?: string }).code ?? '');
}

/** Timeouts, dropped connections and 5xx are worth retrying; 4xx are not. */
export function isRetriablePaymentError(error: unknown): boolean {
  const status = httpStatusOf(error);
  if (status != null) {
    if (status >= 500) return true;
    return status === 408 || status === 425 || status === 429;
  }
  const code = errorCodeOf(error);
  if (code === 'ECONNABORTED' || code === 'ETIMEDOUT' || code === 'ERR_NETWORK') return true;
  return code.length > 0;
}

function delay(ms: number): Promise<void> {
  return new Promise(resolve => {
    setTimeout(resolve, ms);
  });
}

/**
 * Settle a payment after the gateway has already collected money.
 *
 * `verify` should resolve true once the server reports the payment as captured.
 * Returns the confirm payload, or null when confirm never succeeded but
 * verification proved the payment landed anyway.
 */
export async function settlePayment<T>(params: {
  confirm: () => Promise<T>;
  verify?: () => Promise<boolean>;
  confirmAttempts?: number;
  verifyAttempts?: number;
}): Promise<T | null> {
  const {
    confirm,
    verify,
    confirmAttempts = DEFAULT_CONFIRM_ATTEMPTS,
    verifyAttempts = DEFAULT_VERIFY_ATTEMPTS,
  } = params;

  let lastError: unknown;

  for (let attempt = 0; attempt < confirmAttempts; attempt += 1) {
    try {
      return await confirm();
    } catch (error) {
      lastError = error;
      if (!isRetriablePaymentError(error)) break;
      if (attempt < confirmAttempts - 1) {
        await delay(Math.min(1000 * 2 ** attempt, 4000));
      }
    }
  }

  if (verify) {
    for (let attempt = 0; attempt < verifyAttempts; attempt += 1) {
      try {
        if (await verify()) return null;
      } catch {
        // Verification is best effort; keep polling until attempts run out.
      }
      if (attempt < verifyAttempts - 1) await delay(VERIFY_DELAY_MS);
    }
  }

  throw lastError;
}

/**
 * Run a post-payment step. If it fails, the money is already collected, so the
 * error is tagged to stop the UI from claiming the payment itself failed.
 */
export async function runAfterPayment<T>(
  step: () => Promise<T>,
  message: string,
): Promise<T> {
  try {
    return await step();
  } catch (error) {
    throw new PaymentSettledError(message, error);
  }
}
