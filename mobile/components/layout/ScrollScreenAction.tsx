import React, { useMemo } from 'react';
import { StyleSheet, View, type ViewStyle } from 'react-native';

import { useTheme } from '@app/providers/ThemeProvider';

type ScrollScreenActionProps = {
  children: React.ReactNode;
  style?: ViewStyle;
};

/** Spacing wrapper for a primary CTA placed at the end of scroll content. */
export const ScrollScreenAction: React.FC<ScrollScreenActionProps> = ({
  children,
  style,
}) => {
  const { theme } = useTheme();

  const styles = useMemo(
    () =>
      StyleSheet.create({
        wrap: {
          marginTop: theme.spacing['2xl'],
        },
      }),
    [theme],
  );

  return <View style={[styles.wrap, style]}>{children}</View>;
};
