import type { AppDispatch } from '@app/store';
import { loginSuccess } from '@features/auth/store/authSlice';
import {
  authApi,
  clearAuthTokens,
  setAuthTokens,
} from '@services/api';
import {
  ensureApiReachable,
  withTimeout,
} from '@services/api/bootstrapApi';
import { getBoolean, getString, setBoolean, StorageKeys } from '@services/storage';

export type BootstrapRoute = 'Main' | 'Auth' | 'Onboarding';

const AUTH_TIMEOUT_MS = 5000;

/** Decide first screen after splash — restores persisted login when tokens are valid. */
export async function resolveBootstrapRoute(
  dispatch: AppDispatch,
): Promise<BootstrapRoute> {
  if (__DEV__) {
    await ensureApiReachable(3000).catch(() => undefined);
  }

  const accessToken = getString(StorageKeys.AUTH_TOKEN);
  const refreshToken = getString(StorageKeys.REFRESH_TOKEN);

  if (accessToken && refreshToken) {
    try {
      const citizen = await withTimeout(
        authApi.getMe(),
        AUTH_TIMEOUT_MS,
        'Session check timed out',
      );
      dispatch(loginSuccess({ accessToken, refreshToken, citizen }));
      markOnboardingComplete();
      return 'Main';
    } catch {
      try {
        const tokens = await withTimeout(
          authApi.refreshTokens(refreshToken),
          AUTH_TIMEOUT_MS,
          'Token refresh timed out',
        );
        setAuthTokens(tokens.accessToken, tokens.refreshToken);
        const citizen = await withTimeout(
          authApi.getMe(),
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
