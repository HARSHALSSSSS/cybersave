import { base, neutral, primary } from './colors';
import type { ThemeTokens } from './light';

/**
 * Semantic dark-theme tokens. These are mirrored 1:1 into the `.dark`
 * CSS variables in `src/styles/globals.css` — keep both in sync.
 */
export const darkTheme: ThemeTokens = {
  background: '#0B0F19',
  foreground: neutral[50],

  card: '#111623',
  cardForeground: neutral[50],

  popover: '#12172A',
  popoverForeground: neutral[50],

  border: '#232838',
  borderSubtle: '#171B26',
  input: '#232838',
  ring: primary[500],

  primary: primary[500],
  primaryHover: primary[600],
  primaryForeground: base.white,

  secondary: '#171B26',
  secondaryForeground: neutral[50],

  muted: '#171B26',
  mutedForeground: neutral[400],

  accent: '#152244',
  accentForeground: primary[300],

  destructive: '#EF4444',
  destructiveHover: '#DC2626',
  destructiveForeground: base.white,

  success: '#22C55E',
  successHover: '#16A34A',
  successForeground: base.white,
  successBg: '#0F2A1B',
  successBorder: '#1D4B31',
  successText: '#4ADE80',

  warning: '#F97316',
  warningHover: '#EA580C',
  warningForeground: base.white,
  warningBg: '#2B1A0A',
  warningBorder: '#5A3110',
  warningText: '#FB923C',

  danger: '#EF4444',
  dangerHover: '#DC2626',
  dangerForeground: base.white,
  dangerBg: '#2C1315',
  dangerBorder: '#5B2326',
  dangerText: '#F87171',

  info: '#0EA5E9',
  infoHover: '#0284C7',
  infoForeground: base.white,
  infoBg: '#0B2436',
  infoBorder: '#164E63',
  infoText: '#38BDF8',

  mutedStatus: '#6B7280',
  mutedStatusForeground: base.white,
  mutedStatusBg: '#1A1E29',
  mutedStatusBorder: '#2B303C',
  mutedStatusText: '#9CA3AF',

  sidebarBg: '#0D111C',
  sidebarBorder: '#1F2430',
  sidebarActiveBg: '#152244',
  sidebarActiveText: primary[300],
  sidebarActiveBorder: primary[500],

  scrollbarThumb: '#2B303C',
  scrollbarTrack: 'transparent',

  overlay: 'rgba(0, 0, 0, 0.6)',
};
