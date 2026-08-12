import { NativeModules, Platform } from 'react-native';

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

export const ENV = {
  API_BASE_URL: __DEV__
    ? `http://${resolveDevApiHost()}:8000/api/v1`
    : 'https://api.cybersave.gov.in/api/v1',
  APP_ENV: __DEV__ ? 'development' : 'production',
  DEV_API_HOST: __DEV__ ? resolveDevApiHost() : null,
} as const;
