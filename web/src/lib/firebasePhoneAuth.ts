import { initializeApp, getApps, type FirebaseApp } from 'firebase/app';
import {
  getAuth,
  RecaptchaVerifier,
  signInWithPhoneNumber,
  type Auth,
  type ConfirmationResult,
} from 'firebase/auth';

export type FirebaseWebConfig = {
  apiKey: string;
  authDomain: string;
  projectId: string;
  appId: string;
  messagingSenderId: string;
};

let app: FirebaseApp | null = null;
let auth: Auth | null = null;
let recaptchaVerifier: RecaptchaVerifier | null = null;
let pendingConfirmation: ConfirmationResult | null = null;

const env = (key: string): string => String(import.meta.env[key] ?? '').trim();

export function readFirebaseWebConfig(): FirebaseWebConfig | null {
  const apiKey = env('VITE_FIREBASE_API_KEY');
  const authDomain = env('VITE_FIREBASE_AUTH_DOMAIN');
  const projectId = env('VITE_FIREBASE_PROJECT_ID');
  const appId = env('VITE_FIREBASE_APP_ID');
  const messagingSenderId = env('VITE_FIREBASE_MESSAGING_SENDER_ID');

  if (!apiKey || !authDomain || !projectId || !appId || !messagingSenderId) {
    return null;
  }
  if (!appId.includes(':web:')) {
    return null;
  }

  return { apiKey, authDomain, projectId, appId, messagingSenderId };
}

export function missingFirebaseWebConfigKeys(): string[] {
  const missing: string[] = [];
  if (!env('VITE_FIREBASE_API_KEY')) missing.push('VITE_FIREBASE_API_KEY');
  if (!env('VITE_FIREBASE_AUTH_DOMAIN')) missing.push('VITE_FIREBASE_AUTH_DOMAIN');
  if (!env('VITE_FIREBASE_PROJECT_ID')) missing.push('VITE_FIREBASE_PROJECT_ID');
  if (!env('VITE_FIREBASE_MESSAGING_SENDER_ID')) missing.push('VITE_FIREBASE_MESSAGING_SENDER_ID');
  const appId = env('VITE_FIREBASE_APP_ID');
  if (!appId || !appId.includes(':web:')) missing.push('VITE_FIREBASE_APP_ID (must be the Web app id, …:web:…)');
  return missing;
}

export function isFirebaseAuthEnabled(): boolean {
  if (import.meta.env.VITE_USE_FIREBASE_AUTH === 'false') return false;
  return readFirebaseWebConfig() !== null;
}

function getFirebaseAuth(): Auth {
  if (!auth) {
    const config = readFirebaseWebConfig();
    if (!config) {
      const missing = missingFirebaseWebConfigKeys().join(', ');
      throw new Error(
        missing
          ? `Firebase web is not configured. Add ${missing} in web/.env`
          : 'Firebase is not configured for web',
      );
    }
    app = getApps().length ? getApps()[0]! : initializeApp(config);
    auth = getAuth(app);
    if (import.meta.env.DEV && import.meta.env.VITE_FIREBASE_AUTH_TEST_MODE === 'true') {
      auth.settings.appVerificationDisabledForTesting = true;
    }
  }
  return auth;
}

/** Firebase phone auth rejects localhost as a hosted domain (official policy). */
export function isFirebasePhoneAuthBlockedHost(): boolean {
  if (typeof window === 'undefined') return false;
  const host = window.location.hostname.toLowerCase();
  return host === 'localhost' || host.endsWith('.localhost');
}

export function firebasePhoneAuthHostHint(): string | null {
  if (!isFirebasePhoneAuthBlockedHost()) return null;
  const port = window.location.port || '5174';
  return `Firebase phone auth does not work on localhost. Open http://127.0.0.1:${port} and add 127.0.0.1 under Firebase → Authentication → Settings → Authorized domains.`;
}

function useVisibleRecaptcha(): boolean {
  if (import.meta.env.VITE_FIREBASE_RECAPTCHA_VISIBLE === 'true') return true;
  if (import.meta.env.VITE_FIREBASE_RECAPTCHA_VISIBLE === 'false') return false;
  return import.meta.env.DEV;
}

function getRecaptchaVerifier(containerId: string): RecaptchaVerifier {
  if (recaptchaVerifier) {
    try {
      recaptchaVerifier.clear();
    } catch {
      // ignore stale verifier
    }
    recaptchaVerifier = null;
  }

  const container = document.getElementById(containerId);
  if (!container) {
    throw new Error(`reCAPTCHA container #${containerId} is missing from the page.`);
  }

  recaptchaVerifier = new RecaptchaVerifier(getFirebaseAuth(), containerId, {
    size: useVisibleRecaptcha() ? 'normal' : 'invisible',
    callback: () => {},
    'expired-callback': () => {
      resetFirebasePhoneSession();
    },
  });
  return recaptchaVerifier;
}

export async function sendFirebasePhoneOtp(phone: string, containerId = 'firebase-recaptcha') {
  const hostHint = firebasePhoneAuthHostHint();
  if (hostHint && import.meta.env.VITE_FIREBASE_AUTH_TEST_MODE !== 'true') {
    throw new Error(hostHint);
  }

  const normalized = phone.startsWith('+') ? phone : `+91${phone.replace(/\D/g, '').slice(-10)}`;
  const verifier = getRecaptchaVerifier(containerId);
  await verifier.render();
  pendingConfirmation = await signInWithPhoneNumber(getFirebaseAuth(), normalized, verifier);
}

export async function verifyFirebasePhoneOtp(code: string): Promise<string> {
  if (!pendingConfirmation) {
    throw new Error('No OTP session. Request a new code.');
  }
  const credential = await pendingConfirmation.confirm(code.trim());
  pendingConfirmation = null;
  return credential.user.getIdToken();
}

export function resetFirebasePhoneSession() {
  pendingConfirmation = null;
  if (recaptchaVerifier) {
    try {
      recaptchaVerifier.clear();
    } catch {
      // ignore
    }
    recaptchaVerifier = null;
  }
}

export function firebaseAuthErrorMessage(error: unknown, fallback: string): string {
  const code = typeof error === 'object' && error && 'code' in error ? String((error as { code: string }).code) : '';
  const message = error instanceof Error ? error.message : fallback;
  if (code.includes('billing-not-enabled')) {
    return 'Firebase Blaze billing is required for real SMS. Enable billing in Firebase Console → Upgrade, or use test phone numbers with VITE_FIREBASE_AUTH_TEST_MODE=true in web/.env.';
  }
  if (code.includes('too-many-requests')) return 'Too many OTP requests. Wait a few minutes and try again.';
  if (code.includes('invalid-verification-code')) return 'That OTP is incorrect. Check the SMS and try again.';
  if (code.includes('invalid-app-credential') || code.includes('app-not-authorized')) {
    const hostHint = firebasePhoneAuthHostHint();
    if (hostHint) return hostHint;
    return 'Firebase rejected this web app. Use http://127.0.0.1 (not localhost), add 127.0.0.1 to authorized domains, and use the Web app API key with HTTP referrer restrictions for 127.0.0.1:5174.';
  }
  if (code.includes('unauthorized-domain')) {
    return 'This domain is not authorized. Firebase Console → Authentication → Settings → Authorized domains → add localhost and 127.0.0.1.';
  }
  if (code.includes('captcha-check-failed') || message.toLowerCase().includes('recaptcha')) {
    return 'reCAPTCHA failed. Complete the checkbox if shown, ensure localhost is an authorized domain, and retry.';
  }
  if (code.includes('missing-client-identifier')) {
    return 'reCAPTCHA could not start. Refresh the page and try again.';
  }
  if (message.includes('VITE_FIREBASE_APP_ID')) return message;
  if (message.includes('reCAPTCHA container')) return message;
  return message || fallback;
}
