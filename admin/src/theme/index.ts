export * from './colors';
export * from './typography';
export * from './spacing';
export * from './radius';
export * from './shadows';
export * from './animations';
export * from './breakpoints';
export { lightTheme } from './light';
export type { ThemeTokens } from './light';
export { darkTheme } from './dark';

import { darkTheme } from './dark';
import { lightTheme } from './light';

export type ThemeMode = 'light' | 'dark';

export const themes = {
  light: lightTheme,
  dark: darkTheme,
} as const;

export function getTheme(mode: ThemeMode) {
  return themes[mode];
}
