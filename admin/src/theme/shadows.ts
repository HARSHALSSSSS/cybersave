/** Elevation system — soft, low-opacity shadows for a light, airy UI. */

export const shadows = {
  xs: '0 1px 2px 0 rgba(16, 24, 40, 0.05)',
  sm: '0 1px 3px 0 rgba(16, 24, 40, 0.08), 0 1px 2px -1px rgba(16, 24, 40, 0.06)',
  card: '0 1px 2px 0 rgba(16, 24, 40, 0.04), 0 1px 3px 0 rgba(16, 24, 40, 0.06)',
  md: '0 4px 8px -2px rgba(16, 24, 40, 0.08), 0 2px 4px -2px rgba(16, 24, 40, 0.05)',
  lg: '0 12px 16px -4px rgba(16, 24, 40, 0.08), 0 4px 6px -2px rgba(16, 24, 40, 0.04)',
  dropdown:
    '0 8px 16px -4px rgba(16, 24, 40, 0.10), 0 2px 6px -2px rgba(16, 24, 40, 0.06)',
  modal:
    '0 20px 24px -4px rgba(16, 24, 40, 0.10), 0 8px 8px -4px rgba(16, 24, 40, 0.04)',
  focusRing: '0 0 0 3px rgba(37, 99, 235, 0.16)',
} as const;
