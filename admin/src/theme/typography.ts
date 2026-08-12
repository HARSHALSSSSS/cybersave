/** Inter type scale used across the admin dashboard. */

export const fontFamily = {
  sans: [
    'Inter',
    'ui-sans-serif',
    'system-ui',
    '-apple-system',
    'Segoe UI',
    'Roboto',
    'Helvetica Neue',
    'Arial',
    'sans-serif',
  ],
  mono: [
    'ui-monospace',
    'SFMono-Regular',
    'Menlo',
    'Consolas',
    'Liberation Mono',
    'monospace',
  ],
} as const;

export type FontSizeToken = {
  size: string;
  lineHeight: string;
};

export const fontSize: Record<
  'xs' | 'sm' | 'base' | 'md' | 'lg' | 'xl' | '2xl' | '3xl' | '4xl',
  FontSizeToken
> = {
  xs: { size: '0.75rem', lineHeight: '1rem' },
  sm: { size: '0.8125rem', lineHeight: '1.25rem' },
  base: { size: '0.875rem', lineHeight: '1.375rem' },
  md: { size: '0.9375rem', lineHeight: '1.5rem' },
  lg: { size: '1rem', lineHeight: '1.5rem' },
  xl: { size: '1.125rem', lineHeight: '1.75rem' },
  '2xl': { size: '1.375rem', lineHeight: '1.875rem' },
  '3xl': { size: '1.75rem', lineHeight: '2.25rem' },
  '4xl': { size: '2.25rem', lineHeight: '2.75rem' },
};

export const fontWeight = {
  normal: 400,
  medium: 500,
  semibold: 600,
  bold: 700,
} as const;

export const letterSpacing = {
  tight: '-0.011em',
  normal: '0em',
  wide: '0.01em',
} as const;

export const typography = {
  fontFamily,
  fontSize,
  fontWeight,
  letterSpacing,
} as const;
