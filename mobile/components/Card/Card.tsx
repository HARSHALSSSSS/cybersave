import React, { useMemo } from 'react';
import { StyleSheet, View, ViewProps } from 'react-native';
import { useTheme } from '@app/providers/ThemeProvider';

type CardProps = ViewProps & {
  elevated?: boolean;
};

export const Card: React.FC<CardProps> = ({
  elevated = true,
  style,
  children,
  ...props
}) => {
  const { theme } = useTheme();

  const styles = useMemo(
    () =>
      StyleSheet.create({
        card: {
          backgroundColor: theme.colors.surface,
          borderRadius: theme.radius['2xl'],
          padding: theme.spacing['2xl'],
          ...(elevated ? theme.shadows.card : {}),
        },
      }),
    [theme, elevated],
  );

  return (
    <View style={[styles.card, style]} {...props}>
      {children}
    </View>
  );
};
