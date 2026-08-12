import type { EdgeInsets } from 'react-native-safe-area-context';

import { spacing } from '@theme/spacing';

/** Keep in sync with `CustomTabBar.tsx` layout constants. */
export const TAB_BAR_CENTER_LIFT = 28;
export const TAB_BAR_MIN_HEIGHT = 68;
export const TAB_BAR_VERTICAL_PADDING = spacing.md * 2;
/** Gap between tab bar and screen bottom (see CustomTabBar wrapper). */
export const TAB_BAR_BOTTOM_OFFSET = spacing.xs;

/** Total height reserved by the floating bottom tab bar. */
export function getTabBarHeight(insets: EdgeInsets): number {
  return (
    TAB_BAR_CENTER_LIFT +
    TAB_BAR_MIN_HEIGHT +
    TAB_BAR_VERTICAL_PADDING +
    insets.bottom +
    TAB_BAR_BOTTOM_OFFSET
  );
}

/** Bottom padding for scroll views on tab screens so CTAs stay above the nav bar. */
export function getScrollBottomPadding(
  insets: EdgeInsets,
  extra: number = spacing['2xl'],
): number {
  return getTabBarHeight(insets) + extra;
}

/** Bottom padding for fixed footers on tab screens (footer + tab bar). */
export function getTabFooterPadding(insets: EdgeInsets): number {
  return getTabBarHeight(insets) + spacing.lg;
}

/** Bottom padding for fixed footers on stack screens inside the tab navigator. */
export function getNestedStackFooterPadding(insets: EdgeInsets): number {
  return (
    insets.bottom +
    TAB_BAR_BOTTOM_OFFSET +
    TAB_BAR_MIN_HEIGHT +
    TAB_BAR_VERTICAL_PADDING +
    spacing.lg
  );
}

/** Bottom padding for full-screen stack screens (no tab bar). */
export function getScreenBottomPadding(
  insets: EdgeInsets,
  extra: number = spacing['2xl'],
): number {
  return insets.bottom + extra;
}

/** Responsive grid column width for 2-up cards. */
export function getTwoColumnWidth(
  screenWidth: number,
  horizontalPadding: number,
  gap: number,
): number {
  return (screenWidth - horizontalPadding * 2 - gap) / 2;
}
