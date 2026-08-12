import React, { createContext, useCallback, useContext, useMemo, useState } from 'react';
import { useColorScheme } from 'react-native';
import { lightTheme, darkTheme } from '@theme/index';
import { lightTheme as LightThemeType } from '@theme/light';
import { darkTheme as DarkThemeType } from '@theme/dark';
import { ThemeMode } from '@/types/navigation';
import { getString, setString, StorageKeys } from '@services/storage';

export type AppTheme = typeof LightThemeType | typeof DarkThemeType;

type ThemeContextValue = {
  theme: AppTheme;
  themeMode: ThemeMode;
  setThemeMode: (mode: ThemeMode) => void;
  toggleTheme: () => void;
};

const ThemeContext = createContext<ThemeContextValue | undefined>(undefined);

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const systemScheme = useColorScheme();
  const [themeMode, setThemeModeState] = useState<ThemeMode>(
    () => (getString(StorageKeys.THEME_MODE) as ThemeMode) || 'light',
  );

  const setThemeMode = useCallback((mode: ThemeMode) => {
    setThemeModeState(mode);
    setString(StorageKeys.THEME_MODE, mode);
  }, []);

  const toggleTheme = useCallback(() => {
    setThemeMode(themeMode === 'dark' ? 'light' : 'dark');
  }, [themeMode, setThemeMode]);

  const theme = useMemo(() => {
    const resolvedMode =
      themeMode === 'system'
        ? systemScheme === 'dark'
          ? 'dark'
          : 'light'
        : themeMode;
    return resolvedMode === 'dark' ? darkTheme : lightTheme;
  }, [themeMode, systemScheme]);

  const value = useMemo(
    () => ({ theme, themeMode, setThemeMode, toggleTheme }),
    [theme, themeMode, setThemeMode, toggleTheme],
  );

  return (
    <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
  );
};

export const useTheme = (): ThemeContextValue => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within ThemeProvider');
  }
  return context;
};
