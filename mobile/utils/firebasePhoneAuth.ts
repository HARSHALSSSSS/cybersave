import {
  getAuth,
  signInWithPhoneNumber,
  type FirebaseAuthTypes,
} from '@react-native-firebase/auth';

import { USE_FIREBASE_AUTH } from '@app/config/firebase';

let pendingConfirmation: FirebaseAuthTypes.ConfirmationResult | null = null;

export type OtpAuthMode = 'firebase' | 'backend';

export function isFirebaseAuthEnabled(): boolean {
  return USE_FIREBASE_AUTH;
}

export function setPendingFirebaseConfirmation(
  confirmation: FirebaseAuthTypes.ConfirmationResult | null,
) {
  pendingConfirmation = confirmation;
}

export function getPendingFirebaseConfirmation() {
  return pendingConfirmation;
}

export function clearPendingFirebaseConfirmation() {
  pendingConfirmation = null;
}

export async function sendFirebasePhoneOtp(phone: string) {
  if (!USE_FIREBASE_AUTH) {
    throw new Error('Firebase auth is disabled');
  }

  const normalized = phone.startsWith('+')
    ? phone
    : `+91${phone.replace(/\D/g, '').slice(-10)}`;

  const auth = getAuth();
  const confirmation = await signInWithPhoneNumber(auth, normalized);
  pendingConfirmation = confirmation;
  return confirmation;
}

export async function verifyFirebasePhoneOtp(code: string): Promise<string> {
  if (!pendingConfirmation) {
    throw new Error('No OTP session. Request a new code.');
  }
  const credential = await pendingConfirmation.confirm(code.trim());
  pendingConfirmation = null;
  const token = await credential.user.getIdToken();
  if (!token) {
    throw new Error('Could not verify OTP. Try again.');
  }
  return token;
}

/** Try Firebase SMS; fall back to backend OTP when native Firebase is unavailable. */
export async function requestLoginOtp(phone: string): Promise<{
  mode: OtpAuthMode;
  devCode?: string;
}> {
  if (isFirebaseAuthEnabled()) {
    try {
      await sendFirebasePhoneOtp(phone);
      return { mode: 'firebase' };
    } catch {
      clearPendingFirebaseConfirmation();
    }
  }

  const { authApi } = await import('@services/api');
  const data = await authApi.requestOtp(phone);
  return { mode: 'backend', devCode: data.devCode };
}

export async function resendLoginOtp(phone: string): Promise<OtpAuthMode> {
  const result = await requestLoginOtp(phone);
  return result.mode;
}

export async function verifyLoginOtp(
  phone: string,
  code: string,
  mode: OtpAuthMode,
) {
  const { authApi } = await import('@services/api');
  if (mode === 'firebase') {
    const idToken = await verifyFirebasePhoneOtp(code);
    return authApi.verifyFirebaseToken(idToken);
  }
  return authApi.verifyOtp(phone, code);
}
