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
const SUBMIT_MAX_WALL_MS = 45_000;

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

function assertConfirmSucceeded(result: { success?: boolean } | null | undefined): void {
  if (result && result.success === false) {
    throw new Error('Payment could not be confirmed on the server');
  }
}

export { assertConfirmSucceeded };

export async function submitApplicationAfterPayment(
  applicationId: string,
  settledMessage: string,
): Promise<ApplicationDetail> {
  let lastError: unknown;
  const startedAt = Date.now();

  for (let attempt = 0; attempt < SUBMIT_RETRY_ATTEMPTS; attempt += 1) {
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
      if (attempt < SUBMIT_RETRY_ATTEMPTS - 1) {
        await delay(SUBMIT_WAIT_MS);
        continue;
      }
    }

    if (!isApplicationReadyToSubmit(app)) {
      if (attempt < SUBMIT_RETRY_ATTEMPTS - 1) {
        await delay(SUBMIT_WAIT_MS);
        continue;
      }
      lastError = new Error('Payment is still being recorded. Please try again in a moment.');
      break;
    }

    try {
      return await applicationsApi.submitApplication(applicationId);
    } catch (error) {
      lastError = error;
      if (isRetriableSubmitError(error) && attempt < SUBMIT_RETRY_ATTEMPTS - 1) {
        await delay(Math.min(SUBMIT_WAIT_MS * (attempt + 1), 4000));
        continue;
      }
      break;
    }
  }

  throw new PaymentSettledError(settledMessage, lastError);
}
