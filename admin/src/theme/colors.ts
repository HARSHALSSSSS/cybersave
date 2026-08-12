/**
 * Raw color palette — the single source of truth for every color used in the
 * Cybersave admin dashboard. Semantic mappings (light/dark) live in
 * `light.ts` / `dark.ts` and are mirrored into CSS variables in
 * `src/styles/globals.css`.
 *
 * Primary blue is calibrated to the Figma spec (~#2563EB / #2F61C9).
 */

export type ColorShade =
  | 50
  | 100
  | 200
  | 300
  | 400
  | 500
  | 600
  | 700
  | 800
  | 900
  | 950;

export type ColorScale = Record<ColorShade, string>;

/** Brand primary — Figma: #2563EB (base) / #2F61C9 (hover/pressed). */
export const primary: ColorScale = {
  50: '#EEF4FF',
  100: '#DBE6FE',
  200: '#BFD3FE',
  300: '#93B4FD',
  400: '#608BFA',
  500: '#3B6EF0',
  600: '#2563EB',
  700: '#2F61C9',
  800: '#1D3F91',
  900: '#1B3572',
  950: '#101F42',
};

/** Neutral / gray scale used for text, borders and surfaces. */
export const neutral: ColorScale & { 25: string } = {
  25: '#FCFCFD',
  50: '#F8F9FB',
  100: '#F1F2F4',
  200: '#E5E7EB',
  300: '#D1D5DB',
  400: '#9CA3AF',
  500: '#6B7280',
  600: '#4B5563',
  700: '#374151',
  800: '#1F2937',
  900: '#111827',
  950: '#0B0F19',
};

export type StatusScale = {
  50: string;
  100: string;
  200: string;
  400: string;
  500: string;
  600: string;
  700: string;
};

/** Success — green. */
export const success: StatusScale = {
  50: '#ECFDF3',
  100: '#D1FAE5',
  200: '#A7F3D0',
  400: '#4ADE80',
  500: '#22C55E',
  600: '#16A34A',
  700: '#15803D',
};

/** Warning / pending — orange. */
export const warning: StatusScale = {
  50: '#FFF7ED',
  100: '#FFEDD5',
  200: '#FDBA74',
  400: '#FB923C',
  500: '#F97316',
  600: '#EA580C',
  700: '#C2410C',
};

/** Danger / rejected / blocked — red. */
export const danger: StatusScale = {
  50: '#FEF2F2',
  100: '#FEE2E2',
  200: '#FECACA',
  400: '#F87171',
  500: '#EF4444',
  600: '#DC2626',
  700: '#B91C1C',
};

/** Info / review — blue (distinct from brand primary). */
export const info: StatusScale = {
  50: '#F0F9FF',
  100: '#E0F2FE',
  200: '#BAE6FD',
  400: '#38BDF8',
  500: '#0EA5E9',
  600: '#0284C7',
  700: '#0369A1',
};

/** Muted / unverified — neutral gray badge tone. */
export const muted: StatusScale = {
  50: '#F9FAFB',
  100: '#F3F4F6',
  200: '#E5E7EB',
  400: '#9CA3AF',
  500: '#6B7280',
  600: '#4B5563',
  700: '#374151',
};

export const base = {
  white: '#FFFFFF',
  black: '#0A0A0A',
} as const;

export const colors = {
  primary,
  neutral,
  success,
  warning,
  danger,
  info,
  muted,
  base,
} as const;
