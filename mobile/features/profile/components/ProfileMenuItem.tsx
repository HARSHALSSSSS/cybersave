import React, { useMemo } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useTheme } from '@app/providers/ThemeProvider';
import { ChevronRightSmallIcon } from '@components/icons';

type ProfileMenuItemProps = {
  label: string;
  subtitle?: string;
  icon: React.ReactNode;
  onPress?: () => void;
};

export const ProfileMenuItem: React.FC<ProfileMenuItemProps> = ({
  label,
  subtitle,
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
          borderRadius: theme.radius.xl,
          paddingVertical: theme.spacing.lg,
          paddingHorizontal: theme.spacing.lg,
          borderWidth: 1,
          borderColor: theme.colors.border,
          gap: theme.spacing.md,
          ...theme.shadows.card,
        },
        iconWrap: {
          width: 44,
          height: 44,
          alignItems: 'center',
          justifyContent: 'center',
          borderRadius: theme.radius.lg,
          backgroundColor: theme.colors.primaryMuted,
        },
        textWrap: {
          flex: 1,
          minWidth: 0,
        },
        label: {
          ...theme.typography.labelMedium,
          color: theme.colors.textPrimary,
        },
        subtitle: {
          ...theme.typography.caption,
          color: theme.colors.textSecondary,
          marginTop: 2,
        },
      }),
    [theme],
  );

  return (
    <Pressable
      style={({ pressed }) => [styles.item, pressed && { opacity: 0.92, transform: [{ scale: 0.995 }] }]}
      accessibilityRole="button"
      onPress={onPress}>
      <View style={styles.iconWrap}>{icon}</View>
      <View style={styles.textWrap}>
        <Text style={styles.label}>{label}</Text>
        {subtitle ? (
          <Text style={styles.subtitle} numberOfLines={1}>
            {subtitle}
          </Text>
        ) : null}
      </View>
      <ChevronRightSmallIcon color={theme.colors.textSecondary} />
    </Pressable>
  );
};
