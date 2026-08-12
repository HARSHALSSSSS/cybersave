import { create } from 'zustand';

import type { AdminProfile } from '../services/auth.service';
import * as authService from '../services/auth.service';

interface AuthState {
  user: AdminProfile | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  hydrate: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  isAuthenticated: false,
  isLoading: true,

  login: async (email, password) => {
    await authService.login({ email, password });
    const user = await authService.getMe();
    set({ user, isAuthenticated: true });
  },

  logout: async () => {
    await authService.logout();
    set({ user: null, isAuthenticated: false });
  },

  hydrate: async () => {
    const token = localStorage.getItem('cybersave_admin_token');
    if (!token) {
      set({ isLoading: false, isAuthenticated: false, user: null });
      return;
    }
    try {
      const user = await authService.getMe();
      set({ user, isAuthenticated: true, isLoading: false });
    } catch {
      await authService.logout();
      set({ user: null, isAuthenticated: false, isLoading: false });
    }
  },
}));
