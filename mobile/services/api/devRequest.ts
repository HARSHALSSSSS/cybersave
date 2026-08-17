import axios, { type AxiosRequestConfig } from 'axios';

import { ENV, USE_HOSTED_API, shouldUseDevDiscovery } from '@app/config/env';
import { getString, setString, StorageKeys } from '@services/storage';
import {
  extractRequestError,
  findWorkingDevApiBase,
  getDevApiBaseUrls,
} from '@utils/apiDiscovery';
import { apiClient } from './client';

function authHeaders(): Record<string, string> {
  const token = getString(StorageKeys.AUTH_TOKEN);
  return {
    Accept: 'application/json',
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
}

function persistBase(baseURL: string) {
  apiClient.defaults.baseURL = baseURL;
  if (shouldUseDevDiscovery()) {
    setString(StorageKeys.API_BASE_URL, baseURL);
  }
}

function hostedTimeoutMs(): number {
  return USE_HOSTED_API ? 18_000 : 12_000;
}

/** Dev-only: find a reachable local API host. Hosted API always uses apiClient base URL. */
export async function devAwareRequest<T>(
  run: (baseURL: string, config: AxiosRequestConfig) => Promise<T>,
): Promise<T> {
  const baseURL = apiClient.defaults.baseURL ?? ENV.API_BASE_URL;

  if (!shouldUseDevDiscovery()) {
    return run(baseURL, { headers: authHeaders(), timeout: hostedTimeoutMs() });
  }

  const discovered = await findWorkingDevApiBase(4000);
  const bases = discovered
    ? [discovered, ...getDevApiBaseUrls().filter(url => url !== discovered)]
    : getDevApiBaseUrls();

  let lastError: unknown;
  for (const candidate of bases) {
    try {
      const result = await run(candidate, {
        headers: authHeaders(),
        timeout: 12_000,
      });
      persistBase(candidate);
      return result;
    } catch (error) {
      lastError = error;
    }
  }
  throw new Error(extractRequestError(lastError));
}

export async function devAwareGet<T>(path: string, params?: Record<string, unknown>): Promise<T> {
  return devAwareRequest((baseURL, config) =>
    axios.get(`${baseURL}${path}`, { ...config, params }).then(res => res.data),
  );
}

export async function devAwarePost<T>(
  path: string,
  body?: unknown,
  params?: Record<string, unknown>,
): Promise<T> {
  return devAwareRequest((baseURL, config) =>
    axios.post(`${baseURL}${path}`, body, { ...config, params }).then(res => res.data),
  );
}

export async function devAwarePatch<T>(
  path: string,
  body?: unknown,
): Promise<T> {
  return devAwareRequest((baseURL, config) =>
    axios.patch(`${baseURL}${path}`, body, config).then(res => res.data),
  );
}

export async function devAwareDelete<T>(path: string): Promise<T> {
  return devAwareRequest((baseURL, config) =>
    axios.delete(`${baseURL}${path}`, config).then(res => res.data),
  );
}
