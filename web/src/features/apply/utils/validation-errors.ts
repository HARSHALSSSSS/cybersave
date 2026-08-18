import { env } from '@/app/config/env';

export type ValidationIssue = { field: string; message: string };

function apiHostIsLocal(): boolean {
  try {
    const host = new URL(env.apiBaseUrl).hostname;
    return host === 'localhost' || host === '127.0.0.1';
  } catch {
    return false;
  }
}

function networkFailureMessage(): string {
  if (apiHostIsLocal()) {
    return 'Cannot reach the server. Make sure the backend is running (npm start in backend).';
  }
  return 'Connection problem. Check your internet and try again.';
}

/** Pull field-level validation issues from a Nest/axios error response. */
export function extractValidationIssues(error: unknown): ValidationIssue[] {
  if (!error || typeof error !== 'object' || !('response' in error)) return [];

  const data = (error as {
    response?: {
      data?: {
        error?: {
          details?: { errors?: ValidationIssue[] | Record<string, string> };
          message?: string;
        };
        errors?: ValidationIssue[] | Record<string, string>;
      };
    };
  }).response?.data;

  const nested = data?.error?.details?.errors ?? data?.errors;
  if (Array.isArray(nested) && nested.length > 0) {
    return nested.filter((issue) => issue && typeof issue === 'object' && 'field' in issue);
  }
  if (nested && typeof nested === 'object') {
    return Object.entries(nested).map(([field, message]) => ({
      field,
      message: String(message),
    }));
  }

  return [];
}

export function extractErrorMessage(error: unknown, fallback: string): string {
  if (!error || typeof error !== 'object') return fallback;

  const axiosLike = error as {
    code?: string;
    response?: { status?: number; data?: { error?: { message?: string | string[] }; message?: string | string[] } };
  };

  if (!('response' in error)) {
    return networkFailureMessage();
  }

  const response = axiosLike.response;

  if (!response) {
    if (axiosLike.code === 'ECONNABORTED') {
      return 'Request timed out. Please try again.';
    }
    if (axiosLike.code === 'ERR_NETWORK') {
      return networkFailureMessage();
    }
    return fallback;
  }

  if (response.status === 401) return 'Please sign in again to continue.';

  const raw = response.data?.error?.message ?? response.data?.message;
  if (typeof raw === 'string' && raw.trim()) return raw;
  if (Array.isArray(raw) && typeof raw[0] === 'string') return raw[0];

  return fallback;
}

export function issuesToFieldErrors(issues: ValidationIssue[]): Record<string, string> {
  return Object.fromEntries(issues.map(issue => [issue.field, issue.message]));
}
