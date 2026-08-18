import {
  applicationsApi,
  type ApplicationDetail,
  type BackendApplicationStatus,
} from '@/services/api/applications.api';
import { PaymentSettledError, isRetriablePaymentError } from '@/lib/paymentResilience';

const POST_SUBMIT_STATUSES: BackendApplicationStatus[] = [
  'SUBMITTED',
  'UNDER_REVIEW',
  'PROCESSING',
  'ACTION_REQUIRED',
  'APPROVED',
  'COMPLETED',
  'REJECTED',
];

const SUBMIT_RETRY_ATTEMPTS = 12;
const SUBMIT_WAIT_MS = 1000;
const SUBMIT_WAIT_MS_FAST = 350;
const SUBMIT_MAX_WALL_MS = 120_000;

function delay(ms: number): Promise<void> {
  return new Promise(resolve => {
    setTimeout(resolve, ms);
  });
}

export function isApplicationAlreadySubmitted(status: string): boolean {
  return POST_SUBMIT_STATUSES.includes(status as BackendApplicationStatus);
}

function applicationTotal(app: ApplicationDetail): number {
  if (app.pricingSnapshot?.totalAmount != null) {
    return Number(app.pricingSnapshot.totalAmount);
  }
  return 0;
}

function isApplicationReadyToSubmit(app: ApplicationDetail): boolean {
  const total = applicationTotal(app);
  if (total <= 0) return true;
  return app.status === 'PAYMENT_PENDING' && app.payment?.status === 'CAPTURED';
}

async function nudgeApplicationToPaymentPending(applicationId: string): Promise<void> {
  try {
    await applicationsApi.validateApplication(applicationId);
  } catch {
    // Validation may fail while the server is still settling payment; keep polling.
  }
}

function submitErrorMessage(error: unknown): string {
  if (!error || typeof error !== 'object') return '';
  const data = (error as { response?: { data?: { message?: unknown; error?: { message?: unknown } } } })
    .response?.data;
  const raw = data?.error?.message ?? data?.message;
  if (typeof raw === 'string') return raw.toLowerCase();
  if (Array.isArray(raw) && typeof raw[0] === 'string') return raw[0].toLowerCase();
  if (error instanceof Error) return error.message.toLowerCase();
  return '';
}

function isRetriableSubmitError(error: unknown): boolean {
  if (isRetriablePaymentError(error)) return true;
  const message = submitErrorMessage(error);
  return (
    message.includes('payment must be captured') ||
    message.includes('payment_pending') ||
    message.includes('reach payment_pending') ||
    message.includes('still processing')
  );
}

/** Human-readable server reason, so a stuck submit is diagnosable instead of a generic error. */
export function describeSubmitFailure(error: unknown): string | null {
  if (!error) return null;
  const cause = (error as { cause?: unknown }).cause ?? error;
  const data = (
    cause as {
      response?: { data?: { error?: { message?: unknown }; message?: unknown } };
    }
  )?.response?.data;
  const raw = data?.error?.message ?? data?.message;
  if (typeof raw === 'string' && raw.trim()) return raw;
  if (Array.isArray(raw) && typeof raw[0] === 'string') return raw[0];
  if (cause instanceof Error && cause.message) return cause.message;
  return null;
}

function assertConfirmSucceeded(result: { success?: boolean } | null | undefined): void {
  if (result && result.success === false) {
    throw new Error('Payment could not be confirmed on the server');
  }
}

export { assertConfirmSucceeded };

export async function submitApplicationAfterPayment(
  applicationId: string,
  settledMessage: string,
  options?: { fast?: boolean },
): Promise<ApplicationDetail> {
  let lastError: unknown;
  const startedAt = Date.now();
  const fast = options?.fast === true;
  const waitMs = fast ? SUBMIT_WAIT_MS_FAST : SUBMIT_WAIT_MS;
  const maxAttempts = fast ? 10 : SUBMIT_RETRY_ATTEMPTS;

  if (fast) {
    try {
      return await applicationsApi.submitApplication(applicationId);
    } catch (error) {
      if (!isRetriableSubmitError(error)) {
        throw new PaymentSettledError(settledMessage, error);
      }
      lastError = error;
    }
  }

  for (let attempt = 0; attempt < maxAttempts; attempt += 1) {
    if (Date.now() - startedAt > SUBMIT_MAX_WALL_MS) {
      lastError = new Error('Submit timed out while waiting for the server.');
      break;
    }

    const app = await applicationsApi.getApplicationById(applicationId);

    if (isApplicationAlreadySubmitted(app.status)) {
      return app;
    }

    if (
      applicationTotal(app) > 0 &&
      app.payment?.status === 'CAPTURED' &&
      app.status !== 'PAYMENT_PENDING'
    ) {
      await nudgeApplicationToPaymentPending(applicationId);
      if (attempt < maxAttempts - 1) {
        await delay(waitMs);
        continue;
      }
    }

    // On the last attempt fall through to submit anyway, so the citizen sees the
    // real server reason instead of a generic "still being recorded" message.
    if (!isApplicationReadyToSubmit(app) && attempt < maxAttempts - 1) {
      await delay(waitMs);
      continue;
    }

    try {
      return await applicationsApi.submitApplication(applicationId);
    } catch (error) {
      lastError = error;
      if (isRetriableSubmitError(error) && attempt < maxAttempts - 1) {
        await delay(Math.min(waitMs * (attempt + 1), fast ? 2000 : 4000));
        continue;
      }
      break;
    }
  }

  throw new PaymentSettledError(settledMessage, lastError);
}
