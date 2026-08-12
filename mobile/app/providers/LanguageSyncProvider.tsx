import React, { useEffect, useRef } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { useSelector } from 'react-redux';
import type { RootState } from '@app/store';

/** Refetch API-backed content when language changes so localized admin data updates instantly. */
export const LanguageSyncProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const locale = useSelector((state: RootState) => state.auth.language);
  const queryClient = useQueryClient();
  const prevLocale = useRef(locale);

  useEffect(() => {
    if (prevLocale.current === locale) return;
    prevLocale.current = locale;
    void queryClient.invalidateQueries();
  }, [locale, queryClient]);

  return <>{children}</>;
};
