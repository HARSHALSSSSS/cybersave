import axios, { type AxiosRequestConfig } from 'axios';

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
  if (__DEV__) {
    setString(StorageKeys.API_BASE_URL, baseURL);
  }
}

/** Dev-only: find a reachable API host, then run the request against it. */
export async function devAwareRequest<T>(
  run: (baseURL: string, config: AxiosRequestConfig) => Promise<T>,
): Promise<T> {
  if (!__DEV__) {
    return run(apiClient.defaults.baseURL!, { headers: authHeaders() });
  }

  const discovered = await findWorkingDevApiBase(4000);
  const bases = discovered
    ? [discovered, ...getDevApiBaseUrls().filter(url => url !== discovered)]
    : getDevApiBaseUrls();

  let lastError: unknown;
  for (const baseURL of bases) {
    try {
      const result = await run(baseURL, { headers: authHeaders(), timeout: 12000 });
      persistBase(baseURL);
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
