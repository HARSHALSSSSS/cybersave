import React, { useMemo } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useTheme } from '@app/providers/ThemeProvider';
import { Toggle } from '@components/Toggle';
import { ChevronRightSmallIcon } from '@components/icons';

type SettingsRowProps = {
  label: string;
  icon: React.ReactNode;
  value?: string;
  type: 'link' | 'toggle' | 'value' | 'danger';
  toggleValue?: boolean;
  onToggle?: (value: boolean) => void;
  onPress?: () => void;
  isLast?: boolean;
};

export const SettingsRow: React.FC<SettingsRowProps> = ({
  label,
  icon,
  value,
  type,
  toggleValue,
  onToggle,
  onPress,
  isLast,
}) => {
  const { theme } = useTheme();

  const styles = useMemo(
    () =>
      StyleSheet.create({
        row: {
          flexDirection: 'row',
          alignItems: 'center',
          paddingVertical: theme.spacing.lg,
          paddingHorizontal: theme.spacing.lg,
          borderBottomWidth: isLast ? 0 : 1,
          borderBottomColor: theme.colors.border,
          gap: theme.spacing.md,
        },
        iconWrap: {
          width: 28,
          alignItems: 'center',
        },
        label: {
          flex: 1,
          ...theme.typography.labelMedium,
          color: type === 'danger' ? '#EF4444' : theme.colors.textPrimary,
        },
        value: {
          ...theme.typography.bodySmall,
          color: theme.colors.textSecondary,
          marginRight: theme.spacing.xs,
        },
      }),
    [theme, type, isLast],
  );

  return (
    <Pressable
      style={({ pressed }) => [styles.row, pressed && type !== 'toggle' && { opacity: 0.92 }]}
      accessibilityRole={type === 'toggle' ? 'none' : 'button'}
      onPress={type === 'toggle' ? undefined : onPress}
      disabled={type === 'toggle'}>
      <View style={styles.iconWrap}>{icon}</View>
      <Text style={styles.label}>{label}</Text>
      {type === 'toggle' && onToggle !== undefined && toggleValue !== undefined ? (
        <Toggle value={toggleValue} onValueChange={onToggle} />
      ) : null}
      {type === 'value' || type === 'link' ? (
        <>
          {value ? <Text style={styles.value}>{value}</Text> : null}
          {type === 'link' ? (
            <ChevronRightSmallIcon color={theme.colors.textSecondary} />
          ) : null}
        </>
      ) : null}
      {type === 'danger' ? (
        <ChevronRightSmallIcon color="#EF4444" />
      ) : null}
    </Pressable>
  );
};
