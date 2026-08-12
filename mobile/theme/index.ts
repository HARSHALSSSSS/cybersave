export { palette, lightColors, darkColors } from './colors';
export type { ThemeColors } from './colors';
export { spacing } from './spacing';
export type { Spacing, SpacingKey } from './spacing';
export { typography, fontSize, fontWeight, fontFamily } from './typography';
export type { Typography } from './typography';
export { radius } from './radius';
export type { Radius } from './radius';
export { shadows } from './shadows';
export type { Shadows } from './shadows';
export { elevation } from './elevation';
export type { Elevation } from './elevation';
export { animations, duration, easing } from './animations';
export type { Animations } from './animations';
export { lightTheme } from './light';
export { darkTheme } from './dark';

export type AppTheme = typeof import('./light').lightTheme | typeof import('./dark').darkTheme;
