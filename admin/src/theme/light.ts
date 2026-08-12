import { base, danger, info, muted, neutral, primary, success, warning } from './colors';

/**
 * Semantic light-theme tokens. These are mirrored 1:1 into the `:root`
 * CSS variables in `src/styles/globals.css` — keep both in sync.
 */
const lightThemeValues = {
  background: '#F8F9FB',
  foreground: neutral[900],

  card: base.white,
  cardForeground: neutral[900],

  popover: base.white,
  popoverForeground: neutral[900],

  border: neutral[200],
  borderSubtle: neutral[100],
  input: neutral[200],
  ring: primary[600],

  primary: primary[600],
  primaryHover: primary[700],
  primaryForeground: base.white,

  secondary: neutral[100],
  secondaryForeground: neutral[900],

  muted: neutral[100],
  mutedForeground: neutral[500],

  accent: primary[50],
  accentForeground: primary[700],

  destructive: danger[600],
  destructiveHover: danger[700],
  destructiveForeground: base.white,

  success: success[600],
  successHover: success[700],
  successForeground: base.white,
  successBg: success[50],
  successBorder: success[200],
  successText: success[700],

  warning: warning[500],
  warningHover: warning[600],
  warningForeground: base.white,
  warningBg: warning[50],
  warningBorder: warning[200],
  warningText: warning[700],

  danger: danger[600],
  dangerHover: danger[700],
  dangerForeground: base.white,
  dangerBg: danger[50],
  dangerBorder: danger[200],
  dangerText: danger[700],

  info: info[500],
  infoHover: info[600],
  infoForeground: base.white,
  infoBg: info[50],
  infoBorder: info[200],
  infoText: info[700],

  mutedStatus: muted[500],
  mutedStatusForeground: base.white,
  mutedStatusBg: muted[50],
  mutedStatusBorder: muted[200],
  mutedStatusText: muted[700],

  sidebarBg: base.white,
  sidebarBorder: neutral[200],
  sidebarActiveBg: primary[50],
  sidebarActiveText: primary[700],
  sidebarActiveBorder: primary[600],

  scrollbarThumb: neutral[300],
  scrollbarTrack: 'transparent',

  overlay: 'rgba(15, 23, 42, 0.45)',
} as const;

export type ThemeTokens = Record<keyof typeof lightThemeValues, string>;

export const lightTheme: ThemeTokens = lightThemeValues;
