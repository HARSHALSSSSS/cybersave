export const palette = {
  // Brand blues
  navy900: '#0A1629',
  navy800: '#1A2B56',
  navy700: '#1A3066',
  navy600: '#1E3A8A',
  navy500: '#2E4E92',
  royal600: '#1E4BB5',
  royal500: '#2152FF',
  royal400: '#2563EB',
  royal300: '#2B59E1',
  royal200: '#2E5BFF',
  royal100: '#357AF6',
  cyan400: '#3BB2FF',
  sky300: '#A5C9FF',

  // Neutrals
  white: '#FFFFFF',
  gray50: '#F2F4F7',
  gray100: '#F3F4F6',
  gray200: '#E5E7EB',
  gray300: '#E0E0E0',
  gray400: '#D1D5DB',
  gray500: '#9CA3AF',
  gray600: '#7C8691',
  gray700: '#757575',
  gray800: '#6B7280',
  gray900: '#1F2937',
  black: '#000000',

  // Semantic
  success500: '#10B981',
  success600: '#059669',
  warning500: '#FF8C00',
  warning400: '#FFA500',
  error500: '#EF4444',

  // Accents
  saffron: '#FF9933',
  indiaGreen: '#138808',
  indiaWhite: '#FFFFFF',
  gold500: '#F59E0B',
  teal500: '#14B8A6',
} as const;

export const lightColors = {
  background: palette.white,
  backgroundSecondary: palette.gray50,
  surface: palette.white,
  surfaceElevated: palette.white,

  textPrimary: palette.navy900,
  textSecondary: palette.gray600,
  textTertiary: palette.gray800,
  textInverse: palette.white,
  textMuted: palette.gray700,

  primary: palette.royal400,
  primaryDark: palette.royal600,
  primaryLight: palette.cyan400,
  primaryMuted: palette.sky300,

  border: palette.gray200,
  borderFocus: palette.royal400,
  borderLight: palette.gray300,

  overlay: 'rgba(10, 22, 41, 0.45)',
  overlayLight: 'rgba(255, 255, 255, 0.12)',

  success: palette.success500,
  warning: palette.warning500,
  error: palette.error500,

  gradientStart: palette.royal600,
  gradientEnd: palette.royal400,
  gradientHeaderStart: '#1A3B8B',
  gradientHeaderEnd: '#357AF6',
  splashGradientTop: '#EEF2F8',
  splashGradientMid: '#3D5A9E',
  splashGradientBottom: '#0F1F4D',

  inputBackground: palette.white,
  inputBorder: palette.royal300,
  inputPlaceholder: palette.gray500,

  tabBar: palette.white,
  tabBarBorder: palette.gray200,
  indicator: palette.royal400,
  indicatorInactive: palette.gray400,

  cardShadow: 'rgba(26, 43, 86, 0.08)',
  badgeBackground: 'rgba(26, 48, 102, 0.85)',
} as const;

export const darkColors = {
  background: palette.navy900,
  backgroundSecondary: palette.navy800,
  surface: '#111827',
  surfaceElevated: '#1F2937',

  textPrimary: palette.white,
  textSecondary: palette.gray500,
  textTertiary: palette.gray400,
  textInverse: palette.navy900,
  textMuted: palette.gray600,

  primary: palette.royal200,
  primaryDark: palette.royal400,
  primaryLight: palette.cyan400,
  primaryMuted: palette.navy600,

  border: '#374151',
  borderFocus: palette.royal200,
  borderLight: '#4B5563',

  overlay: 'rgba(0, 0, 0, 0.6)',
  overlayLight: 'rgba(255, 255, 255, 0.08)',

  success: palette.success500,
  warning: palette.warning500,
  error: palette.error500,

  gradientStart: palette.navy600,
  gradientEnd: palette.royal400,
  gradientHeaderStart: palette.navy800,
  gradientHeaderEnd: palette.navy600,
  splashGradientTop: palette.navy800,
  splashGradientMid: palette.navy600,
  splashGradientBottom: palette.navy900,

  inputBackground: '#1F2937',
  inputBorder: palette.royal400,
  inputPlaceholder: palette.gray600,

  tabBar: palette.navy900,
  tabBarBorder: '#374151',
  indicator: palette.royal200,
  indicatorInactive: palette.gray700,

  cardShadow: 'rgba(0, 0, 0, 0.3)',
  badgeBackground: 'rgba(255, 255, 255, 0.1)',
} as const;

export type ThemeColors = typeof lightColors;
