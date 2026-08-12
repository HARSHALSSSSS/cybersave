import React, { useMemo } from 'react';
import { StyleSheet, Text, View, ViewProps } from 'react-native';
import { useTheme } from '@app/providers/ThemeProvider';

type BadgeProps = ViewProps & {
  label: string;
  backgroundColor?: string;
  textColor?: string;
  size?: 'sm' | 'md';
};

export const Badge: React.FC<BadgeProps> = ({
  label,
  backgroundColor,
  textColor,
  size = 'md',
  style,
  ...props
}) => {
  const { theme } = useTheme();

  const styles = useMemo(
    () =>
      StyleSheet.create({
        badge: {
          alignSelf: 'flex-start',
          paddingHorizontal: size === 'sm' ? theme.spacing.sm : theme.spacing.md,
          paddingVertical: size === 'sm' ? theme.spacing.xxs : theme.spacing.xs,
          borderRadius: theme.radius.full,
          backgroundColor: backgroundColor ?? 'rgba(255,255,255,0.2)',
        },
        text: {
          ...(size === 'sm' ? theme.typography.caption : theme.typography.labelSmall),
          color: textColor ?? theme.colors.textInverse,
          letterSpacing: size === 'sm' ? 1 : 0,
        },
      }),
    [theme, backgroundColor, textColor, size],
  );

  return (
    <View style={[styles.badge, style]} {...props}>
      <Text style={styles.text}>{label}</Text>
    </View>
  );
};
