import type { AppDispatch } from '@app/store';
import { loginSuccess } from '@features/auth/store/authSlice';
import {
  authApi,
  clearAuthTokens,
  setAuthTokens,
} from '@services/api';
import { shouldUseDevDiscovery, USE_HOSTED_API } from '@app/config/env';
import {
  ensureApiReachable,
  withTimeout,
} from '@services/api/bootstrapApi';
import {
  clearCachedCitizenProfile,
  readCachedCitizenProfile,
} from '@features/auth/utils/sessionCache';
import { getBoolean, getString, setBoolean, StorageKeys } from '@services/storage';

export type BootstrapRoute = 'Main' | 'Auth' | 'Onboarding';

const AUTH_TIMEOUT_MS = USE_HOSTED_API ? 8000 : 5000;
const HOSTED_WARMUP_MS = 6000;

function clearSession(): void {
  clearAuthTokens();
  clearCachedCitizenProfile();
}

async function withHostedRetry<T>(
  action: () => Promise<T>,
  timeoutMs: number,
  message: string,
): Promise<T> {
  try {
    return await withTimeout(action(), timeoutMs, message);
  } catch (firstError) {
    if (!USE_HOSTED_API) {
      throw firstError;
    }
    await ensureApiReachable(HOSTED_WARMUP_MS).catch(() => undefined);
    return withTimeout(action(), timeoutMs, message);
  }
}

/** Refresh the persisted session in the background; returns false when it is dead. */
async function validateSession(dispatch: AppDispatch): Promise<boolean> {
  const accessToken = getString(StorageKeys.AUTH_TOKEN);
  const refreshToken = getString(StorageKeys.REFRESH_TOKEN);
  if (!accessToken || !refreshToken) return false;

  try {
    const citizen = await withHostedRetry(
      () => authApi.getMe(),
      AUTH_TIMEOUT_MS,
      'Session check timed out',
    );
    dispatch(loginSuccess({ accessToken, refreshToken, citizen }));
    markOnboardingComplete();
    return true;
  } catch {
    // Fall through to a token refresh before giving up on the session.
  }

  try {
    const tokens = await withHostedRetry(
      () => authApi.refreshTokens(refreshToken),
      AUTH_TIMEOUT_MS,
      'Token refresh timed out',
    );
    setAuthTokens(tokens.accessToken, tokens.refreshToken);
    const citizen = await withHostedRetry(
      () => authApi.getMe(),
      AUTH_TIMEOUT_MS,
      'Session check timed out',
    );
    dispatch(
      loginSuccess({
        accessToken: tokens.accessToken,
        refreshToken: tokens.refreshToken,
        citizen,
      }),
    );
    markOnboardingComplete();
    return true;
  } catch (error) {
    // Only sign the user out when the server actually rejected them. A flaky
    // network must not wipe a valid session and bounce them to login.
    if (isAuthRejection(error)) {
      clearSession();
      return false;
    }
    return true;
  }
}

function isAuthRejection(error: unknown): boolean {
  if (!error || typeof error !== 'object') return false;
  const status = (error as { response?: { status?: number } }).response?.status;
  return status === 401 || status === 403;
}

/**
 * Decide the first screen after splash.
 *
 * A returning user with cached credentials goes straight to Main and the
 * session is verified in the background, so cold start no longer waits on the
 * network. Only users without a usable cached profile pay for a round trip.
 */
export async function resolveBootstrapRoute(
  dispatch: AppDispatch,
): Promise<BootstrapRoute> {
  const cachedCitizen = readCachedCitizenProfile();
  const accessToken = getString(StorageKeys.AUTH_TOKEN);
  const refreshToken = getString(StorageKeys.REFRESH_TOKEN);

  if (accessToken && refreshToken && cachedCitizen) {
    dispatch(loginSuccess({ accessToken, refreshToken, citizen: cachedCitizen }));
    markOnboardingComplete();
    void ensureApiReachable(HOSTED_WARMUP_MS)
      .catch(() => undefined)
      .then(() => validateSession(dispatch))
      .catch(() => undefined);
    return 'Main';
  }

  if (shouldUseDevDiscovery()) {
    await ensureApiReachable(3000).catch(() => undefined);
  } else if (USE_HOSTED_API) {
    await ensureApiReachable(HOSTED_WARMUP_MS).catch(() => undefined);
  }

  if (accessToken && refreshToken) {
    if (await validateSession(dispatch)) return 'Main';
  }

  if (getBoolean(StorageKeys.ONBOARDING_COMPLETE)) {
    return 'Auth';
  }

  return 'Onboarding';
}

export function markOnboardingComplete(): void {
  setBoolean(StorageKeys.ONBOARDING_COMPLETE, true);
}

export function hasPersistedSession(): boolean {
  return Boolean(
    getString(StorageKeys.AUTH_TOKEN) && getString(StorageKeys.REFRESH_TOKEN),
  );
}
