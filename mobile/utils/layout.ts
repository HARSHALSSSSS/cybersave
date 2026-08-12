import type { EdgeInsets } from 'react-native-safe-area-context';

import { spacing } from '@theme/spacing';

/** Keep in sync with `CustomTabBar.tsx` layout constants. */
export const TAB_BAR_CENTER_LIFT = 28;
export const TAB_BAR_MIN_HEIGHT = 68;
export const TAB_BAR_VERTICAL_PADDING = spacing.md * 2;
/** Gap between tab bar and screen bottom (see CustomTabBar wrapper). */
export const TAB_BAR_BOTTOM_OFFSET = spacing.xs;

/** Default large button height (`Button` size `lg`). */
export const FIXED_FOOTER_BUTTON_HEIGHT = 56;
export const FIXED_FOOTER_PADDING_TOP = spacing.md;

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

/** Bottom padding for scroll views on tab screens (no pinned footer). */
export function getScrollBottomPadding(
  insets: EdgeInsets,
  extra: number = spacing['2xl'],
): number {
  return getTabBarHeight(insets) + extra;
}

/** Bottom inset for pinned footers sitting above the tab bar. */
export function getTabFooterPadding(insets: EdgeInsets): number {
  return getTabBarHeight(insets) + spacing.lg;
}

/** Alias — nested tab stacks use the same tab-bar clearance as tab-root footers. */
export function getNestedStackFooterPadding(insets: EdgeInsets): number {
  return getTabFooterPadding(insets);
}

/** Bottom padding for full-screen stack screens (no tab bar). */
export function getScreenBottomPadding(
  insets: EdgeInsets,
  extra: number = spacing['2xl'],
): number {
  return insets.bottom + extra;
}

/** Visual height of a pinned footer bar (padding + primary button). */
export function getFixedFooterBarHeight(
  extraContentHeight: number = 0,
): number {
  return FIXED_FOOTER_PADDING_TOP + FIXED_FOOTER_BUTTON_HEIGHT + extraContentHeight;
}

/**
 * Scroll padding when the primary action scrolls with content (button inside ScrollView).
 * Ensures the last item clears the floating tab bar.
 */
export function getScrollPaddingWithInlineAction(
  insets: EdgeInsets,
  extra: number = spacing.lg,
): number {
  return getScrollBottomPadding(insets, extra);
}

/** Responsive grid column width for 2-up cards. */
export function getTwoColumnWidth(
  screenWidth: number,
  horizontalPadding: number,
  gap: number,
): number {
  return (screenWidth - horizontalPadding * 2 - gap) / 2;
}
