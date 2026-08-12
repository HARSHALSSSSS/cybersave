import React, { useMemo } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useTheme } from '@app/providers/ThemeProvider';
import { useTwoColumnCardWidth } from '@/hooks/useTwoColumnCardWidth';
import { ServiceIcon } from './ServiceIcon';

type ServiceGridCardProps = {
  label: string;
  icon: string;
  iconColor: string;
  iconBg: string;
  onPress: () => void;
};

export const ServiceGridCard: React.FC<ServiceGridCardProps> = ({
  label,
  icon,
  iconColor,
  iconBg,
  onPress,
}) => {
  const { theme } = useTheme();
  const cardWidth = useTwoColumnCardWidth();

  const styles = useMemo(
    () =>
      StyleSheet.create({
        card: {
          width: cardWidth,
          aspectRatio: 1,
          alignItems: 'center',
          justifyContent: 'center',
          paddingVertical: theme.spacing.lg,
          paddingHorizontal: theme.spacing.md,
          borderRadius: theme.radius.lg,
          borderWidth: 1,
          borderColor: theme.colors.border,
          backgroundColor: theme.colors.surface,
          ...theme.shadows.sm,
        },
        iconWrap: {
          width: 52,
          height: 52,
          borderRadius: theme.radius.full,
          alignItems: 'center',
          justifyContent: 'center',
          marginBottom: theme.spacing.sm,
        },
        label: {
          ...theme.typography.labelMedium,
          color: theme.colors.textPrimary,
          textAlign: 'center',
        },
      }),
    [cardWidth, theme],
  );

  return (
    <Pressable
      style={({ pressed }) => [styles.card, pressed && { opacity: 0.92 }]}
      accessibilityRole="button"
      onPress={onPress}>
      <View style={[styles.iconWrap, { backgroundColor: iconBg }]}>
        <ServiceIcon name={icon} color={iconColor} size={24} />
      </View>
      <Text style={styles.label} numberOfLines={2}>
        {label}
      </Text>
    </Pressable>
  );
};
