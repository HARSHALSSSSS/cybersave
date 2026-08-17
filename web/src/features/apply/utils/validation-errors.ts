export type ValidationIssue = { field: string; message: string };

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

  if (!('response' in error)) {
    return 'Cannot reach the server. Make sure the backend is running (npm start in backend).';
  }

  const response = (error as {
    response?: { status?: number; data?: { error?: { message?: string | string[] }; message?: string | string[] } };
  }).response;

  if (!response) {
    return 'Cannot reach the server. Make sure the backend is running (npm start in backend).';
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
