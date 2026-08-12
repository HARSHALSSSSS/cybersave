import React, { useMemo } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useTheme } from '@app/providers/ThemeProvider';
import { ChevronRightSmallIcon } from '@components/icons';

type ProfileMenuItemProps = {
  label: string;
  icon: React.ReactNode;
  onPress?: () => void;
};

export const ProfileMenuItem: React.FC<ProfileMenuItemProps> = ({
  label,
  icon,
  onPress,
}) => {
  const { theme } = useTheme();

  const styles = useMemo(
    () =>
      StyleSheet.create({
        item: {
          flexDirection: 'row',
          alignItems: 'center',
          backgroundColor: theme.colors.surface,
          borderRadius: theme.radius.lg,
          paddingVertical: theme.spacing.lg,
          paddingHorizontal: theme.spacing.lg,
          borderWidth: 1,
          borderColor: theme.colors.border,
          gap: theme.spacing.md,
        },
        iconWrap: {
          width: 36,
          height: 36,
          alignItems: 'center',
          justifyContent: 'center',
        },
        label: {
          flex: 1,
          ...theme.typography.labelMedium,
          color: theme.colors.textPrimary,
        },
      }),
    [theme],
  );

  return (
    <Pressable
      style={({ pressed }) => [styles.item, pressed && { opacity: 0.92 }]}
      accessibilityRole="button"
      onPress={onPress}>
      <View style={styles.iconWrap}>{icon}</View>
      <Text style={styles.label}>{label}</Text>
      <ChevronRightSmallIcon color={theme.colors.textSecondary} />
    </Pressable>
  );
};
