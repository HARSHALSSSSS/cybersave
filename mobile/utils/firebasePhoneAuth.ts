import auth, { FirebaseAuthTypes } from '@react-native-firebase/auth';

import { USE_FIREBASE_AUTH } from '@app/config/firebase';

let pendingConfirmation: FirebaseAuthTypes.ConfirmationResult | null = null;

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
  const confirmation = await auth().signInWithPhoneNumber(normalized);
  pendingConfirmation = confirmation;
  return confirmation;
}

export async function verifyFirebasePhoneOtp(code: string): Promise<string> {
  if (!pendingConfirmation) {
    throw new Error('No OTP session. Request a new code.');
  }
  const credential = await pendingConfirmation.confirm(code.trim());
  pendingConfirmation = null;
  return credential.user.getIdToken();
}
