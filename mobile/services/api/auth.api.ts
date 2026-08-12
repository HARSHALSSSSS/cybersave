import axios from 'axios';

import { USE_HOSTED_API } from '@app/config/env';
import { setString, StorageKeys } from '@services/storage';
import {
  extractRequestError,
  findWorkingDevApiBase,
  getDevApiBaseUrls,
} from '@utils/apiDiscovery';
import { normalizeCitizenPhone } from '@utils/phone';
import { apiClient } from './client';
import { unwrapApiResponse } from './types';

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
  tokenType: string;
}

export interface CitizenProfile {
  id: string;
  phone: string;
  email?: string | null;
  firstName?: string | null;
  lastName?: string | null;
  status?: string;
  createdAt?: string;
}

function normalizePhone(phone: string): string {
  return normalizeCitizenPhone(phone);
}

function persistWorkingBase(baseURL: string): void {
  apiClient.defaults.baseURL = baseURL;
  if (__DEV__) {
    setString(StorageKeys.API_BASE_URL, baseURL);
    // eslint-disable-next-line no-console
    console.log(`[API] connected ${baseURL}`);
  }
}

async function postAuth<T>(
  path: string,
  body: Record<string, unknown>,
): Promise<T> {
  if (!__DEV__ || USE_HOSTED_API) {
    const response = await apiClient.post(path, body);
    return unwrapApiResponse<T>(response);
  }

  let bases = getDevApiBaseUrls();
  const discovered = await findWorkingDevApiBase(4000);
  if (discovered) {
    bases = [discovered, ...bases.filter(url => url !== discovered)];
  }

  let lastError: unknown;
  for (const baseURL of bases) {
    try {
      const response = await axios.post(`${baseURL}${path}`, body, {
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
        },
        timeout: 10000,
      });
      persistWorkingBase(baseURL);
      return unwrapApiResponse<T>(response);
    } catch (error) {
      lastError = error;
      if (__DEV__) {
        // eslint-disable-next-line no-console
        console.warn(`[API] failed ${baseURL}${path}`, extractRequestError(error));
      }
    }
  }

  throw new Error(extractRequestError(lastError));
}

export async function requestOtp(phone: string) {
  return postAuth<{
    message: string;
    expiresAt: string;
    devCode?: string;
  }>('/auth/otp/request', {
    phone: normalizePhone(phone),
  });
}

export async function verifyOtp(phone: string, code: string) {
  return postAuth<AuthTokens>('/auth/otp/verify', {
    phone: normalizePhone(phone),
    code: code.trim(),
  });
}

export async function getMe() {
  const response = await apiClient.get('/auth/me');
  return unwrapApiResponse<CitizenProfile>(response);
}

export async function updateProfile(payload: {
  firstName?: string;
  lastName?: string;
  email?: string;
}) {
  const response = await apiClient.patch('/auth/me', payload);
  return unwrapApiResponse<CitizenProfile>(response);
}

export async function refreshTokens(refreshToken: string) {
  const response = await apiClient.post('/auth/refresh', { refreshToken });
  return unwrapApiResponse<AuthTokens>(response);
}

export const authApi = { requestOtp, verifyOtp, getMe, updateProfile, refreshTokens };
