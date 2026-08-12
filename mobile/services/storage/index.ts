import { createMMKV } from 'react-native-mmkv';

export const storage = createMMKV({ id: 'cybersave-storage' });

export const StorageKeys = {
  THEME_MODE: 'theme_mode',
  LANGUAGE: 'language',
  ONBOARDING_COMPLETE: 'onboarding_complete',
  AUTH_TOKEN: 'auth_token',
  REFRESH_TOKEN: 'refresh_token',
  API_BASE_URL: 'api_base_url',
} as const;

export const getString = (key: string): string | undefined =>
  storage.getString(key);

export const setString = (key: string, value: string): void => {
  storage.set(key, value);
};

export const getBoolean = (key: string): boolean | undefined =>
  storage.getBoolean(key);

export const setBoolean = (key: string, value: boolean): void => {
  storage.set(key, value);
};

export const remove = (key: string): void => {
  storage.remove(key);
};
