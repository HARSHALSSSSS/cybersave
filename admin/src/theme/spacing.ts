/** Base spacing scale (rem) plus named layout dimensions. */

export const spacing = {
  0: '0px',
  px: '1px',
  0.5: '0.125rem',
  1: '0.25rem',
  1.5: '0.375rem',
  2: '0.5rem',
  2.5: '0.625rem',
  3: '0.75rem',
  3.5: '0.875rem',
  4: '1rem',
  5: '1.25rem',
  6: '1.5rem',
  7: '1.75rem',
  8: '2rem',
  10: '2.5rem',
  12: '3rem',
  16: '4rem',
  20: '5rem',
  24: '6rem',
} as const;

/** Named layout dimensions shared across shell components. */
export const layout = {
  sidebarWidth: '260px',
  sidebarCollapsedWidth: '76px',
  topHeaderHeight: '64px',
  contentMaxWidth: '1440px',
  pagePaddingX: '1.5rem',
  pagePaddingY: '1.5rem',
} as const;
