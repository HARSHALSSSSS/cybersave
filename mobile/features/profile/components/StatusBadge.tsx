import React, { useMemo } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { useTheme } from '@app/providers/ThemeProvider';

type StatusBadgeProps = {
  label: string;
  variant?: 'verified' | 'linked' | 'incomplete' | 'progress';
};

export const StatusBadge: React.FC<StatusBadgeProps> = ({
  label,
  variant = 'verified',
}) => {
  const { theme } = useTheme();

  const palette = {
    verified: { bg: '#DCFCE7', text: '#166534' },
    linked: { bg: '#DBEAFE', text: '#1D4ED8' },
    incomplete: { bg: '#FEF3C7', text: '#B45309' },
    progress: { bg: theme.colors.primaryMuted, text: theme.colors.primary },
  }[variant];

  const styles = useMemo(
    () =>
      StyleSheet.create({
        badge: {
          paddingHorizontal: theme.spacing.sm,
          paddingVertical: theme.spacing.xxs,
          borderRadius: theme.radius.full,
          backgroundColor: palette.bg,
        },
        text: {
          ...theme.typography.caption,
          letterSpacing: 0,
          fontSize: 10,
          fontWeight: '600',
          color: palette.text,
        },
      }),
    [theme, palette.bg, palette.text],
  );

  return (
    <View style={styles.badge}>
      <Text style={styles.text}>{label}</Text>
    </View>
  );
};
