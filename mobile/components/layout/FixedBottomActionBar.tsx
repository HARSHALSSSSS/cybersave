import React, { useMemo } from 'react';
import { StyleSheet, View, type ViewStyle } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useTheme } from '@app/providers/ThemeProvider';
import {
  getNestedStackFooterPadding,
  getScreenBottomPadding,
} from '@utils/layout';

type FixedBottomActionBarProps = {
  children: React.ReactNode;
  /** When true (default), reserve space for the floating tab bar. */
  aboveTabBar?: boolean;
  style?: ViewStyle;
};

/** Pinned bottom action area — sits above tab bar or device safe area. */
export const FixedBottomActionBar: React.FC<FixedBottomActionBarProps> = ({
  children,
  aboveTabBar = true,
  style,
}) => {
  const { theme } = useTheme();
  const insets = useSafeAreaInsets();

  const paddingBottom = aboveTabBar
    ? getNestedStackFooterPadding(insets)
    : getScreenBottomPadding(insets, theme.spacing.lg);

  const styles = useMemo(
    () =>
      StyleSheet.create({
        bar: {
          paddingHorizontal: theme.spacing['2xl'],
          paddingTop: theme.spacing.md,
          paddingBottom,
          backgroundColor: theme.colors.surface,
          borderTopWidth: 1,
          borderTopColor: theme.colors.border,
        },
      }),
    [theme, paddingBottom],
  );

  return <View style={[styles.bar, style]}>{children}</View>;
};
