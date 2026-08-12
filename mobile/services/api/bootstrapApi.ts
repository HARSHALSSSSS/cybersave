import axios from 'axios';

import { ENV, USE_HOSTED_API, shouldUseDevDiscovery } from '@app/config/env';
import { findWorkingDevApiBase, getDevApiBaseUrls } from '@utils/apiDiscovery';
import { getString, setString, StorageKeys } from '@services/storage';
import { apiClient } from './client';

const HEALTH_PATH = '/health';

function normalizeBaseUrl(url: string): string {
  return url.replace(/\/+$/, '');
}

async function pingBase(baseURL: string, timeoutMs: number): Promise<boolean> {
  try {
    await axios.get(`${normalizeBaseUrl(baseURL)}${HEALTH_PATH}`, {
      timeout: timeoutMs,
      headers: { Accept: 'application/json' },
    });
    return true;
  } catch {
    return false;
  }
}

/** Saved emulator/USB hosts break when switching to a physical device on Wi‑Fi. */
function savedBaseLooksStale(saved: string): boolean {
  try {
    const savedHost = new URL(saved).hostname;
    const envHost = new URL(ENV.API_BASE_URL).hostname;
    if (savedHost === '10.0.2.2' && envHost !== '10.0.2.2') return true;
    if (
      (savedHost === '127.0.0.1' || savedHost === 'localhost') &&
      envHost !== '127.0.0.1' &&
      envHost !== 'localhost'
    ) {
      return true;
    }
  } catch {
    return true;
  }
  return false;
}

function persistBase(baseURL: string): string {
  const normalized = normalizeBaseUrl(baseURL);
  apiClient.defaults.baseURL = normalized;
  if (__DEV__) {
    setString(StorageKeys.API_BASE_URL, normalized);
  }
  return normalized;
}

/**
 * Ensure the API client points at a reachable host before auth/bootstrap calls.
 * Fast-fails in dev when the backend is down instead of hanging on a bad saved URL.
 */
export async function ensureApiReachable(timeoutMs = 3500): Promise<string | null> {
  if (!shouldUseDevDiscovery()) {
    const hostedTimeout = USE_HOSTED_API ? Math.max(timeoutMs, 60000) : timeoutMs;
    const base = ENV.API_BASE_URL;
    if (await pingBase(base, hostedTimeout)) {
      return persistBase(base);
    }
    apiClient.defaults.baseURL = base;
    return base;
  }

  const saved =
    apiClient.defaults.baseURL ?? getString(StorageKeys.API_BASE_URL) ?? ENV.API_BASE_URL;

  if (saved && !savedBaseLooksStale(saved) && (await pingBase(saved, timeoutMs))) {
    return persistBase(saved);
  }

  const discovered = await findWorkingDevApiBase(timeoutMs);
  if (discovered) {
    return persistBase(discovered);
  }

  for (const candidate of getDevApiBaseUrls()) {
    if (candidate === saved) continue;
    if (await pingBase(candidate, timeoutMs)) {
      return persistBase(candidate);
    }
  }

  apiClient.defaults.baseURL = ENV.API_BASE_URL;
  return null;
}

export function withTimeout<T>(
  promise: Promise<T>,
  ms: number,
  message = 'Request timed out',
): Promise<T> {
  return new Promise<T>((resolve, reject) => {
    const timer = setTimeout(() => reject(new Error(message)), ms);
    promise
      .then(value => {
        clearTimeout(timer);
        resolve(value);
      })
      .catch(error => {
        clearTimeout(timer);
        reject(error);
      });
  });
}
