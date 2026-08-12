import axios from 'axios';
import type { AxiosError, InternalAxiosRequestConfig } from 'axios';

import { API_CONFIG } from '@app/config/api';
import { ENV } from '@app/config/env';
import { getString, remove, setString, StorageKeys } from '@services/storage';
import type { AuthTokens } from './auth.api';

export const apiClient = axios.create(API_CONFIG);

const savedDevBase = __DEV__ ? getString(StorageKeys.API_BASE_URL) : undefined;
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
} else if (__DEV__) {
  apiClient.defaults.baseURL = ENV.API_BASE_URL;
}

if (__DEV__) {
  // Help diagnose device ↔ API connectivity during local development
  // eslint-disable-next-line no-console
  console.log(`[API] baseURL = ${ENV.API_BASE_URL}`);
}

let refreshPromise: Promise<string | null> | null = null;

async function refreshAccessToken(refreshToken: string): Promise<AuthTokens | null> {
  try {
    const response = await axios.post<{ success: boolean; data: AuthTokens }>(
      `${API_CONFIG.baseURL}/auth/refresh`,
      { refreshToken },
      { headers: API_CONFIG.headers },
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
    return config;
  },
  (error: AxiosError) => Promise.reject(error),
);

apiClient.interceptors.response.use(
  response => response,
  async (error: AxiosError) => {
    const original = error.config as InternalAxiosRequestConfig & { _retry?: boolean };
    if (error.response?.status !== 401 || !original || original._retry) {
      return Promise.reject(error);
    }

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
