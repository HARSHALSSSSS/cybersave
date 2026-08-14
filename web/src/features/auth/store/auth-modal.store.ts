import { create } from 'zustand';

export type AuthModalStep = 'login' | 'otp' | 'profile';

type AuthModalState = {
  open: boolean;
  step: AuthModalStep;
  phone: string;
  redirectTo: string | null;
  onSuccess: (() => void) | null;
  requireProfile: boolean;
  profileMandatory: boolean;
  openLogin: (options?: {
    redirectTo?: string;
    onSuccess?: () => void;
    requireProfile?: boolean;
    profileMandatory?: boolean;
  }) => void;
  openProfile: (options?: { onSuccess?: () => void; mandatory?: boolean }) => void;
  setStep: (step: AuthModalStep) => void;
  setPhone: (phone: string) => void;
  close: () => void;
  reset: () => void;
};

export const useAuthModalStore = create<AuthModalState>((set, get) => ({
  open: false,
  step: 'login',
  phone: '',
  redirectTo: null,
  onSuccess: null,
  requireProfile: true,
  profileMandatory: false,

  openLogin(options) {
    set({
      open: true,
      step: 'login',
      phone: '',
      redirectTo: options?.redirectTo ?? null,
      onSuccess: options?.onSuccess ?? null,
      requireProfile: options?.requireProfile ?? true,
      profileMandatory: options?.profileMandatory ?? false,
    });
  },

  openProfile(options) {
    set({
      open: true,
      step: 'profile',
      profileMandatory: options?.mandatory ?? true,
      onSuccess: options?.onSuccess ?? null,
      requireProfile: true,
    });
  },

  setStep(step) {
    set({ step });
  },

  setPhone(phone) {
    set({ phone });
  },

  close() {
    const { profileMandatory, step } = get();
    if (profileMandatory && step === 'profile') return;
    set({ open: false });
  },

  reset() {
    set({
      open: false,
      step: 'login',
      phone: '',
      redirectTo: null,
      onSuccess: null,
      requireProfile: true,
      profileMandatory: false,
    });
  },
}));
