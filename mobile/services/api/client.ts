import axios from 'axios';
import type { AxiosError, InternalAxiosRequestConfig } from 'axios';

import { API_CONFIG } from '@app/config/api';
import { ENV, USE_HOSTED_API, shouldUseDevDiscovery } from '@app/config/env';
import { getString, remove, setString, StorageKeys } from '@services/storage';
import type { AuthTokens } from './auth.api';

export const apiClient = axios.create(API_CONFIG);

if (USE_HOSTED_API) {
  apiClient.defaults.baseURL = ENV.API_BASE_URL;
}

const savedDevBase =
  shouldUseDevDiscovery() ? getString(StorageKeys.API_BASE_URL) : undefined;
if (savedDevBase) {
  try {
    const savedHost = new URL(savedDevBase).hostname;
    const envHost = new URL(ENV.API_BASE_URL).hostname;
    const staleEmulatorHost = savedHost === '10.0.2.2' && envHost !== '10.0.2.2';
    const staleUsbHost =
      (savedHost === '127.0.0.1' || savedHost === 'localhost') &&
      envHost !== '127.0.0.1' &&
      envHost !== 'localhost';
    if (!staleEmulatorHost && !staleUsbHost) {
      apiClient.defaults.baseURL = savedDevBase;
    }
  } catch {
    apiClient.defaults.baseURL = ENV.API_BASE_URL;
  }
} else if (shouldUseDevDiscovery()) {
  apiClient.defaults.baseURL = ENV.API_BASE_URL;
}

if (__DEV__) {
  // Help diagnose device ↔ API connectivity during local development
  // eslint-disable-next-line no-console
  console.log(`[API] baseURL = ${ENV.API_BASE_URL}`);
}

const RETRYABLE_STATUSES = new Set([502, 503, 504]);
const MAX_TRANSIENT_RETRIES = 2;

function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

function getApiBaseUrl(): string {
  return apiClient.defaults.baseURL ?? API_CONFIG.baseURL;
}

let refreshPromise: Promise<string | null> | null = null;

async function refreshAccessToken(refreshToken: string): Promise<AuthTokens | null> {
  try {
    const response = await axios.post<{ success: boolean; data: AuthTokens }>(
      `${getApiBaseUrl()}/auth/refresh`,
      { refreshToken },
      { headers: API_CONFIG.headers, timeout: API_CONFIG.timeout },
    );
    return response.data.data;
  } catch {
    return null;
  }
}

apiClient.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token = getString(StorageKeys.AUTH_TOKEN);
    if (token) {
      config.headers.set('Authorization', `Bearer ${token}`);
    }
    const language = getString(StorageKeys.LANGUAGE) ?? 'en';
    config.headers.set('Accept-Language', language);
    // Let axios set multipart boundary for React Native FormData uploads.
    if (typeof FormData !== 'undefined' && config.data instanceof FormData) {
      config.headers.delete('Content-Type');
    }
    return config;
  },
  (error: AxiosError) => Promise.reject(error),
);

apiClient.interceptors.response.use(
  response => response,
  async (error: AxiosError) => {
    const original = error.config as InternalAxiosRequestConfig & {
      _retry?: boolean;
      _transientRetryCount?: number;
    };
    if (!original) {
      return Promise.reject(error);
    }

    if (error.response?.status === 401 && !original._retry) {
      const refreshToken = getString(StorageKeys.REFRESH_TOKEN);
      if (!refreshToken) {
        return Promise.reject(error);
      }

      original._retry = true;

      if (!refreshPromise) {
        refreshPromise = refreshAccessToken(refreshToken)
          .then(tokens => {
            if (!tokens) {
              clearAuthTokens();
              return null;
            }
            setAuthTokens(tokens.accessToken, tokens.refreshToken);
            return tokens.accessToken;
          })
          .finally(() => {
            refreshPromise = null;
          });
      }

      const newToken = await refreshPromise;
      if (!newToken) {
        return Promise.reject(error);
      }

      original.headers.set('Authorization', `Bearer ${newToken}`);
      return apiClient(original);
    }

    const status = error.response?.status;
    const transientRetryCount = original._transientRetryCount ?? 0;
    const isTransient =
      USE_HOSTED_API &&
      transientRetryCount < MAX_TRANSIENT_RETRIES &&
      (RETRYABLE_STATUSES.has(status ?? 0) ||
        error.code === 'ECONNABORTED' ||
        (!error.response && Boolean(error.code)));

    if (isTransient) {
      original._transientRetryCount = transientRetryCount + 1;
      await sleep(1000 * (transientRetryCount + 1));
      return apiClient(original);
    }

    return Promise.reject(error);
  },
);

export function setAuthTokens(accessToken: string, refreshToken: string): void {
  setString(StorageKeys.AUTH_TOKEN, accessToken);
  setString(StorageKeys.REFRESH_TOKEN, refreshToken);
}

export function clearAuthTokens(): void {
  remove(StorageKeys.AUTH_TOKEN);
  remove(StorageKeys.REFRESH_TOKEN);
}

export function getRefreshToken(): string | undefined {
  return getString(StorageKeys.REFRESH_TOKEN);
}
