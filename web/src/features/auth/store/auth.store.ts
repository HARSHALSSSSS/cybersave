import { create } from 'zustand';
import axios from 'axios';
import { authApi, type CitizenProfile } from '@/services/api/auth.api';
import {
  clearAuthTokens,
  getAccessToken,
  getRefreshToken,
  setAuthTokens,
} from '@/services/api/client';

interface AuthState {
  citizen: CitizenProfile | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  pendingPhone: string | null;
  otpChannel: 'whatsapp' | 'sms' | null;
  hydrate: () => Promise<void>;
  requestOtp: (phone: string) => Promise<{ devCode?: string }>;
  verifyOtp: (phone: string, code: string) => Promise<void>;
  updateProfile: (payload: {
    firstName?: string;
    lastName?: string;
    email?: string;
  }) => Promise<void>;
  logout: () => Promise<void>;
  forceLogout: () => void;
  setPendingPhone: (phone: string | null) => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  citizen: null,
  isAuthenticated: false,
  isLoading: true,
  pendingPhone: null,
  otpChannel: null,

  async hydrate() {
    if (!getAccessToken()) {
      set({ citizen: null, isAuthenticated: false, isLoading: false });
      return;
    }
    const current = useAuthStore.getState();
    if (current.isAuthenticated && current.citizen) {
      set({ isLoading: false });
      return;
    }
    set({ isLoading: true });
    try {
      const citizen = await authApi.getMe();
      set({ citizen, isAuthenticated: true, isLoading: false });
    } catch (error) {
      const status = axios.isAxiosError(error) ? error.response?.status : undefined;
      if (status === 401 || status === 403) {
        clearAuthTokens();
        set({ citizen: null, isAuthenticated: false, isLoading: false });
        return;
      }
      set(state => ({
        isLoading: false,
        isAuthenticated: Boolean(getAccessToken()),
        citizen: state.citizen,
      }));
    }
  },

  async requestOtp(phone) {
    const result = await authApi.requestOtp(phone);
    try {
      const config = await authApi.getAuthConfig();
      set({
        pendingPhone: phone,
        otpChannel: config.otpChannel === 'whatsapp' ? 'whatsapp' : 'sms',
      });
    } catch {
      set({ pendingPhone: phone, otpChannel: 'whatsapp' });
    }
    return { devCode: result.devCode };
  },

  async verifyOtp(phone, code) {
    const tokens = await authApi.verifyOtp(phone, code);
    setAuthTokens(tokens.accessToken, tokens.refreshToken);
    const citizen = await authApi.getMe();
    set({
      citizen,
      isAuthenticated: true,
      pendingPhone: null,
      otpChannel: null,
      isLoading: false,
    });
  },

  async updateProfile(payload) {
    const citizen = await authApi.updateProfile(payload);
    set({ citizen });
  },

  async logout() {
    const refresh = getRefreshToken();
    if (refresh) await authApi.logout(refresh);
    clearAuthTokens();
    set({ citizen: null, isAuthenticated: false, pendingPhone: null, otpChannel: null });
  },

  forceLogout() {
    clearAuthTokens();
    set({
      citizen: null,
      isAuthenticated: false,
      pendingPhone: null,
      otpChannel: null,
      isLoading: false,
    });
  },

  setPendingPhone(phone) {
    set({ pendingPhone: phone });
  },
}));
