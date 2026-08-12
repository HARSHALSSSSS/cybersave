import React, { useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { setLanguage } from '@features/auth/store/authSlice';
import { getString, StorageKeys } from '@services/storage';

/** Hydrate saved language from MMKV into Redux on app start. */
export function LanguageBootstrap({ children }: { children: React.ReactNode }) {
  const dispatch = useDispatch();

  useEffect(() => {
    const saved = getString(StorageKeys.LANGUAGE);
    if (saved) {
      dispatch(setLanguage(saved));
    }
  }, [dispatch]);

  return children;
}
