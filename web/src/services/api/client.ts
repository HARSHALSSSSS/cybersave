import axios, { type AxiosError, type InternalAxiosRequestConfig } from 'axios';
import { env } from '@/app/config/env';

const TOKEN_KEY = 'cybersave_citizen_token';
const REFRESH_KEY = 'cybersave_citizen_refresh';

export const apiClient = axios.create({
  baseURL: env.apiBaseUrl,
  /** Baseline for catalog/list calls; apply-flow writes use longer per-request timeouts. */
  timeout: 60_000,
  headers: {
    'Content-Type': 'application/json',
    Accept: 'application/json',
  },
});

export function getAccessToken(): string | null {
  return localStorage.getItem(TOKEN_KEY);
}

export function getRefreshToken(): string | null {
  return localStorage.getItem(REFRESH_KEY);
}

export function setAuthTokens(accessToken: string, refreshToken: string): void {
  localStorage.setItem(TOKEN_KEY, accessToken);
  localStorage.setItem(REFRESH_KEY, refreshToken);
}

export function clearAuthTokens(): void {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(REFRESH_KEY);
}

interface AuthTokens {
  accessToken: string;
  refreshToken: string;
}

let refreshPromise: Promise<string | null> | null = null;
let onSessionExpired: (() => void) | null = null;

export function setSessionExpiredHandler(handler: () => void): void {
  onSessionExpired = handler;
}

apiClient.interceptors.request.use(config => {
  const token = getAccessToken();
  if (token) {
    config.headers.set('Authorization', `Bearer ${token}`);
  }
  config.headers.set('Accept-Language', 'en');
  return config;
});

apiClient.interceptors.response.use(
  response => response,
  async (error: AxiosError) => {
    const original = error.config as InternalAxiosRequestConfig & { _retry?: boolean };
    if (error.response?.status !== 401 || !original || original._retry) {
      return Promise.reject(error);
    }

    const refreshToken = getRefreshToken();
    if (!refreshToken) {
      clearAuthTokens();
      onSessionExpired?.();
      return Promise.reject(error);
    }

    original._retry = true;

    if (!refreshPromise) {
      refreshPromise = axios
        .post<{ success: boolean; data: AuthTokens }>(
          `${env.apiBaseUrl}/auth/refresh`,
          { refreshToken },
        )
        .then(res => {
          const tokens = res.data.data;
          setAuthTokens(tokens.accessToken, tokens.refreshToken);
          return tokens.accessToken;
        })
        .catch(() => {
          clearAuthTokens();
          onSessionExpired?.();
          return null;
        })
        .finally(() => {
          refreshPromise = null;
        });
    }

    const newToken = await refreshPromise;
    if (!newToken) return Promise.reject(error);

    original.headers.set('Authorization', `Bearer ${newToken}`);
    return apiClient(original);
  },
);
