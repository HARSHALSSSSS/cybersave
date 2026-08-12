import React, { useMemo } from 'react';
import {
  StyleSheet,
  Text,
  TextInput,
  TextInputProps,
  View,
} from 'react-native';
import { useTheme } from '@app/providers/ThemeProvider';

export type InputProps = TextInputProps & {
  label?: string;
  error?: string;
  leftElement?: React.ReactNode;
  rightElement?: React.ReactNode;
};

export const Input: React.FC<InputProps> = ({
  label,
  error,
  leftElement,
  rightElement,
  style,
  ...props
}) => {
  const { theme } = useTheme();

  const styles = useMemo(
    () =>
      StyleSheet.create({
        wrapper: {
          gap: theme.spacing.sm,
        },
        label: {
          ...theme.typography.labelMedium,
          color: theme.colors.textPrimary,
        },
        container: {
          flexDirection: 'row',
          alignItems: 'center',
          borderWidth: 1.5,
          borderColor: error ? theme.colors.error : theme.colors.inputBorder,
          borderRadius: theme.radius.md,
          backgroundColor: theme.colors.inputBackground,
          paddingHorizontal: theme.spacing.lg,
          minHeight: 52,
        },
        input: {
          flex: 1,
          ...theme.typography.bodyLarge,
          color: theme.colors.textPrimary,
          paddingVertical: theme.spacing.md,
        },
        error: {
          ...theme.typography.bodySmall,
          color: theme.colors.error,
        },
        divider: {
          width: 1,
          height: 24,
          backgroundColor: theme.colors.border,
          marginHorizontal: theme.spacing.md,
        },
      }),
    [theme, error],
  );

  return (
    <View style={styles.wrapper}>
      {label ? <Text style={styles.label}>{label}</Text> : null}
      <View style={styles.container}>
        {leftElement}
        {leftElement ? <View style={styles.divider} /> : null}
        <TextInput
          placeholderTextColor={theme.colors.inputPlaceholder}
          style={[styles.input, style]}
          {...props}
        />
        {rightElement}
      </View>
      {error ? <Text style={styles.error}>{error}</Text> : null}
    </View>
  );
};
