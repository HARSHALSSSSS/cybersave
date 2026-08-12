import React, { useMemo } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { useTheme } from '@app/providers/ThemeProvider';

type DetailRowProps = {
  label: string;
  value: string;
  valueColor?: string;
};

export const DetailRow: React.FC<DetailRowProps> = ({
  label,
  value,
  valueColor,
}) => {
  const { theme } = useTheme();

  const styles = useMemo(
    () =>
      StyleSheet.create({
        row: {
          flexDirection: 'row',
          justifyContent: 'space-between',
          alignItems: 'flex-start',
          marginBottom: theme.spacing.sm,
          gap: theme.spacing.md,
        },
        label: {
          ...theme.typography.bodySmall,
          color: theme.colors.textSecondary,
          flex: 1,
        },
        value: {
          ...theme.typography.labelMedium,
          color: theme.colors.textPrimary,
          textAlign: 'right',
          flex: 1,
        },
      }),
    [theme],
  );

  return (
    <View style={styles.row}>
      <Text style={styles.label}>{label}</Text>
      <Text style={[styles.value, valueColor ? { color: valueColor } : null]}>
        {value}
      </Text>
    </View>
  );
};

type DetailSectionProps = {
  title: string;
  children: React.ReactNode;
};

export const DetailSection: React.FC<DetailSectionProps> = ({
  title,
  children,
}) => {
  const { theme } = useTheme();

  const styles = useMemo(
    () =>
      StyleSheet.create({
        section: {
          borderRadius: theme.radius.lg,
          borderWidth: 1,
          borderColor: theme.colors.border,
          padding: theme.spacing.lg,
          marginBottom: theme.spacing.md,
        },
        title: {
          ...theme.typography.labelLarge,
          color: theme.colors.textPrimary,
          marginBottom: theme.spacing.md,
        },
      }),
    [theme],
  );

  return (
    <View style={styles.section}>
      <Text style={styles.title}>{title}</Text>
      {children}
    </View>
  );
};
