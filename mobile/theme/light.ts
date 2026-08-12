import { lightColors } from './colors';
import { spacing } from './spacing';
import { typography } from './typography';
import { radius } from './radius';
import { shadows } from './shadows';
import { elevation } from './elevation';
import { animations } from './animations';

export const lightTheme = {
  colors: lightColors,
  spacing,
  typography,
  radius,
  shadows,
  elevation,
  animations,
  isDark: false,
} as const;
