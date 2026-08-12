import { ENV, USE_HOSTED_API } from './env';

export const API_CONFIG = {
  baseURL: ENV.API_BASE_URL,
  timeout: USE_HOSTED_API ? 60000 : 15000,
  headers: {
    'Content-Type': 'application/json',
    Accept: 'application/json',
  },
} as const;
