import { authApi } from '@services/api';

export type OtpAuthMode = 'backend';

export function isFirebaseAuthEnabled(): boolean {
  return false;
}

export function clearPendingFirebaseConfirmation() {
  // Firebase phone auth disabled — backend WhatsApp OTP only.
}

/** Request login OTP via backend (delivered on WhatsApp in production). */
export async function requestLoginOtp(phone: string): Promise<{
  mode: OtpAuthMode;
  devCode?: string;
}> {
  const data = await authApi.requestOtp(phone);
  return { mode: 'backend', devCode: data.devCode };
}

export async function resendLoginOtp(phone: string): Promise<{
  mode: OtpAuthMode;
  devCode?: string;
}> {
  return requestLoginOtp(phone);
}

export async function verifyLoginOtp(phone: string, code: string, _mode: OtpAuthMode) {
  return authApi.verifyOtp(phone, code);
}
