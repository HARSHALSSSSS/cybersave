import axios from 'axios';
import type { AxiosError, InternalAxiosRequestConfig } from 'axios';

import { env } from '@/app/config/env';

export const AUTH_TOKEN_STORAGE_KEY = 'cybersave_admin_token';

export const apiClient = axios.create({
  baseURL: env.apiBaseUrl,
  timeout: env.apiBaseUrl.includes('onrender.com') ? 60_000 : 15_000,
  headers: {
    'Content-Type': 'application/json',
  },
});

apiClient.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    // TODO: replace with real auth/session integration.
    const token = localStorage.getItem(AUTH_TOKEN_STORAGE_KEY);
    if (token) {
      config.headers.set('Authorization', `Bearer ${token}`);
    }
    return config;
  },
  (error: AxiosError) => Promise.reject(error),
);

apiClient.interceptors.response.use(
  (response) => response,
  (error: AxiosError) => {
    const status = error.response?.status;
    const url = error.config?.url ?? '';
    const isPublicAuth =
      url.includes('/admin/auth/login') || url.includes('/admin/auth/refresh');

    if (status === 401 && !isPublicAuth) {
      localStorage.removeItem(AUTH_TOKEN_STORAGE_KEY);
      localStorage.removeItem('cybersave_admin_refresh_token');
      if (!window.location.pathname.startsWith('/login')) {
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  },
);
