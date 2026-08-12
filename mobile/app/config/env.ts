import { NativeModules, Platform } from 'react-native';

/** Hosted Render API — used for testing production backend from admin/mobile */
export const HOSTED_API_BASE_URL =
  'https://cybersave-l972.onrender.com/api/v1';

/**
 * true  → mobile talks to Render (Metro dev + release builds)
 * false → mobile talks to local backend (localhost / LAN / emulator)
 */
export const USE_HOSTED_API = true;

/**
 * If auto-detect fails on your phone, set your PC's Wi‑Fi IP here (e.g. '192.168.1.42').
 * Leave null to auto-detect from Metro / use adb reverse.
 */
const DEV_API_HOST_OVERRIDE: string | null = null;

/**
 * Resolve the machine host the device can reach in development.
 * - Emulator: 10.0.2.2
 * - Physical device (Metro over LAN): Metro script host IP
 * - Physical device (USB + adb reverse): 127.0.0.1
 */
function resolveDevApiHost(): string {
  if (DEV_API_HOST_OVERRIDE) {
    return DEV_API_HOST_OVERRIDE;
  }

  try {
    const scriptURL = NativeModules.SourceCode?.scriptURL as string | undefined;
    if (scriptURL) {
      const { hostname } = new URL(scriptURL);
      if (hostname === '10.0.2.2') {
        return '10.0.2.2';
      }
      if (
        hostname &&
        hostname !== 'localhost' &&
        hostname !== '127.0.0.1'
      ) {
        return hostname;
      }
    }
  } catch {
    // fall through
  }

  if (Platform.OS === 'android') {
    return '10.0.2.2';
  }
  return 'localhost';
}

function resolveApiBaseUrl(): string {
  if (USE_HOSTED_API) {
    return HOSTED_API_BASE_URL;
  }
  if (__DEV__) {
    return `http://${resolveDevApiHost()}:8000/api/v1`;
  }
  return HOSTED_API_BASE_URL;
}

export const ENV = {
  API_BASE_URL: resolveApiBaseUrl(),
  APP_ENV: USE_HOSTED_API ? 'production' : __DEV__ ? 'development' : 'production',
  DEV_API_HOST: __DEV__ && !USE_HOSTED_API ? resolveDevApiHost() : null,
} as const;

/** Metro dev builds that should probe localhost/LAN instead of the hosted API. */
export function shouldUseDevDiscovery(): boolean {
  return __DEV__ && !USE_HOSTED_API;
}
