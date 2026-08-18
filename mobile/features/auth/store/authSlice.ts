import { PayloadAction, createSlice } from '@reduxjs/toolkit';

import type { CitizenProfile } from '@services/api';
import { clearAuthTokens, setAuthTokens } from '@services/api';
import {
  cacheCitizenProfile,
  clearCachedCitizenProfile,
} from '@features/auth/utils/sessionCache';

type AuthState = {
  isAuthenticated: boolean;
  accessToken: string | null;
  refreshToken: string | null;
  citizen: CitizenProfile | null;
  phone: string | null;
  language: string;
};

const initialState: AuthState = {
  isAuthenticated: false,
  accessToken: null,
  refreshToken: null,
  citizen: null,
  phone: null,
  language: 'en',
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setPhone: (state, action: PayloadAction<string>) => {
      state.phone = action.payload;
    },
    setLanguage: (state, action: PayloadAction<string>) => {
      state.language = action.payload;
    },
    loginSuccess: (
      state,
      action: PayloadAction<{
        accessToken: string;
        refreshToken: string;
        citizen: CitizenProfile;
      }>,
    ) => {
      state.isAuthenticated = true;
      state.accessToken = action.payload.accessToken;
      state.refreshToken = action.payload.refreshToken;
      state.citizen = action.payload.citizen;
      setAuthTokens(action.payload.accessToken, action.payload.refreshToken);
      cacheCitizenProfile(action.payload.citizen);
    },
    setCitizen: (state, action: PayloadAction<CitizenProfile>) => {
      state.citizen = action.payload;
      cacheCitizenProfile(action.payload);
    },
    logout: state => {
      state.isAuthenticated = false;
      state.accessToken = null;
      state.refreshToken = null;
      state.citizen = null;
      state.phone = null;
      clearAuthTokens();
      clearCachedCitizenProfile();
    },
  },
});

export const { setPhone, setLanguage, loginSuccess, setCitizen, logout } =
  authSlice.actions;
export default authSlice.reducer;
