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
import { getBoolean, getString, setBoolean, StorageKeys } from '@services/storage';

export type BootstrapRoute = 'Main' | 'Auth' | 'Onboarding';

const AUTH_TIMEOUT_MS = USE_HOSTED_API ? 25000 : 5000;
const HOSTED_WARMUP_MS = 45000;

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

/** Decide first screen after splash — restores persisted login when tokens are valid. */
export async function resolveBootstrapRoute(
  dispatch: AppDispatch,
): Promise<BootstrapRoute> {
  if (shouldUseDevDiscovery()) {
    await ensureApiReachable(3000).catch(() => undefined);
  } else if (USE_HOSTED_API) {
    await ensureApiReachable(HOSTED_WARMUP_MS).catch(() => undefined);
  }

  const accessToken = getString(StorageKeys.AUTH_TOKEN);
  const refreshToken = getString(StorageKeys.REFRESH_TOKEN);

  if (accessToken && refreshToken) {
    try {
      const citizen = await withHostedRetry(
        () => authApi.getMe(),
        AUTH_TIMEOUT_MS,
        'Session check timed out',
      );
      dispatch(loginSuccess({ accessToken, refreshToken, citizen }));
      markOnboardingComplete();
      return 'Main';
    } catch {
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
        return 'Main';
      } catch {
        clearAuthTokens();
      }
    }
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
