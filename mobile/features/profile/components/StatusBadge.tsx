import React, { useMemo } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { useTheme } from '@app/providers/ThemeProvider';

type StatusBadgeProps = {
  label: string;
  variant?: 'verified' | 'linked';
};

export const StatusBadge: React.FC<StatusBadgeProps> = ({
  label,
  variant = 'verified',
}) => {
  const { theme } = useTheme();

  const styles = useMemo(
    () =>
      StyleSheet.create({
        badge: {
          paddingHorizontal: theme.spacing.sm,
          paddingVertical: theme.spacing.xxs,
          borderRadius: theme.radius.full,
          backgroundColor: variant === 'verified' ? '#DCFCE7' : '#DCFCE7',
        },
        text: {
          ...theme.typography.caption,
          letterSpacing: 0,
          fontSize: 10,
          fontWeight: '600',
          color: '#166534',
        },
      }),
    [theme, variant],
  );

  return (
    <View style={styles.badge}>
      <Text style={styles.text}>{label}</Text>
    </View>
  );
};
