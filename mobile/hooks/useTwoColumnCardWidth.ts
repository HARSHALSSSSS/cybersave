import { useMemo } from 'react';
import { useWindowDimensions } from 'react-native';

import { useTheme } from '@app/providers/ThemeProvider';
import { getTwoColumnWidth } from '@utils/layout';

/** Responsive width for a 2-column grid card inside standard screen padding. */
export function useTwoColumnCardWidth(extraHorizontalPadding = 0): number {
  const { width } = useWindowDimensions();
  const { theme } = useTheme();
  const horizontalPadding = theme.spacing['2xl'] + extraHorizontalPadding;

  return useMemo(
    () => getTwoColumnWidth(width, horizontalPadding, theme.spacing.md),
    [horizontalPadding, theme.spacing.md, width],
  );
}
