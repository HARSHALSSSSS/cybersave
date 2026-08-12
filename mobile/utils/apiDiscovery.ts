import axios from 'axios';
import { Platform } from 'react-native';

import { ENV } from '@app/config/env';
import { getString, StorageKeys } from '@services/storage';

const DEV_PORT = 8000;
const API_PREFIX = '/api/v1';

function baseUrlForHost(host: string): string {
  return `http://${host}:${DEV_PORT}${API_PREFIX}`;
}

/** Hosts to try, ordered by likelihood for the current dev setup. */
export function getDevApiBaseUrls(): string[] {
  const hosts: string[] = [];

  const addHost = (host: string | null | undefined) => {
    if (!host || host === '0.0.0.0') return;
    if (!hosts.includes(host)) hosts.push(host);
  };

  // Metro bundler host (LAN IP when phone and PC share Wi‑Fi)
  addHost(ENV.DEV_API_HOST);

  if (Platform.OS === 'android') {
    addHost('10.0.2.2'); // Android emulator → host machine
    addHost('127.0.0.1'); // USB + adb reverse tcp:8000 tcp:8000
  } else {
    addHost('localhost');
    addHost('127.0.0.1');
  }

  const saved = getString(StorageKeys.API_BASE_URL);
  if (saved) {
    try {
      addHost(new URL(saved).hostname);
    } catch {
      // ignore bad saved URL
    }
  }

  return hosts.map(baseUrlForHost);
}

export function formatDevConnectivityHint(): string {
  if (Platform.OS === 'android') {
    return (
      'Start backend (npm run start:dev in backend/), then run:\n' +
      'adb reverse tcp:8000 tcp:8000\n' +
      'Or use the same Wi‑Fi and ensure Metro shows your PC IP.'
    );
  }
  return 'Start backend: cd backend && npm run start:dev';
}

export async function findWorkingDevApiBase(
  timeoutMs = 3000,
): Promise<string | null> {
  const bases = getDevApiBaseUrls();
  const attempts = bases.map(baseURL =>
    axios
      .get(`${baseURL}/health`, {
        timeout: timeoutMs,
        headers: { Accept: 'application/json' },
      })
      .then(() => baseURL)
      .catch(() => Promise.reject(new Error(baseURL))),
  );

  try {
    return await Promise.any(attempts);
  } catch {
    return null;
  }
}

export function extractRequestError(error: unknown): string {
  if (error && typeof error === 'object') {
    const axiosErr = error as {
      code?: string;
      message?: string;
      response?: { data?: { error?: { message?: string } }; status?: number };
    };
    if (axiosErr.response?.data?.error?.message) {
      return axiosErr.response.data.error.message;
    }
    if (axiosErr.response?.status === 429) {
      return 'Too many OTP requests. Wait a minute and try again.';
    }
    if (
      axiosErr.code === 'ERR_NETWORK' ||
      axiosErr.code === 'ECONNABORTED' ||
      axiosErr.message === 'Network Error'
    ) {
      return `Cannot reach API server. ${formatDevConnectivityHint()}`;
    }
    if (axiosErr.message) {
      return axiosErr.message;
    }
  }
  return formatDevConnectivityHint();
}
