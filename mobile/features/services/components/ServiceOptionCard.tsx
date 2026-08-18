import React, { useMemo } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useTheme } from '@app/providers/ThemeProvider';
import { useTwoColumnCardWidth } from '@/hooks/useTwoColumnCardWidth';
import { ServiceIcon } from './ServiceIcon';

type ServiceOptionCardProps = {
  title: string;
  description: string;
  icon: string;
  iconColor: string;
  iconBg: string;
  processingDays?: string;
  fee?: string;
  onPress: () => void;
  onPressIn?: () => void;
  variant?: 'grid' | 'certificate';
};

export const ServiceOptionCard: React.FC<ServiceOptionCardProps> = ({
  title,
  description,
  icon,
  iconColor,
  iconBg,
  processingDays,
  fee,
  onPress,
  onPressIn,
  variant = 'grid',
}) => {
  const { theme } = useTheme();
  const cardWidth = useTwoColumnCardWidth();

  const styles = useMemo(
    () =>
      StyleSheet.create({
        card: {
          width: cardWidth,
          padding: theme.spacing.lg,
          borderRadius: theme.radius.lg,
          borderWidth: 1,
          borderColor: theme.colors.border,
          backgroundColor: theme.colors.surface,
          ...theme.shadows.sm,
        },
        iconWrap: {
          width: 44,
          height: 44,
          borderRadius: theme.radius.full,
          alignItems: 'center',
          justifyContent: 'center',
          alignSelf: 'center',
          marginBottom: theme.spacing.sm,
        },
        title: {
          ...theme.typography.labelMedium,
          color: theme.colors.textPrimary,
          textAlign: 'center',
        },
        description: {
          ...theme.typography.caption,
          letterSpacing: 0,
          color: theme.colors.textSecondary,
          textAlign: 'center',
          marginTop: 4,
          lineHeight: 16,
        },
        meta: {
          ...theme.typography.caption,
          letterSpacing: 0,
          color: theme.colors.textSecondary,
          textAlign: 'center',
          marginTop: theme.spacing.xs,
        },
      }),
    [cardWidth, theme],
  );

  return (
    <Pressable
      style={({ pressed }) => [styles.card, pressed && { opacity: 0.92 }]}
      accessibilityRole="button"
      onPressIn={onPressIn}
      onPress={onPress}>
      <View style={[styles.iconWrap, { backgroundColor: iconBg }]}>
        <ServiceIcon name={icon} color={iconColor} size={22} />
      </View>
      <Text style={styles.title} numberOfLines={2}>
        {title}
      </Text>
      {variant === 'grid' ? (
        <Text style={styles.description} numberOfLines={2}>
          {description}
        </Text>
      ) : (
        <>
          {processingDays ? (
            <Text style={styles.meta}>Processing: {processingDays}</Text>
          ) : null}
          {fee ? <Text style={styles.meta}>Est Fee: {fee}</Text> : null}
        </>
      )}
    </Pressable>
  );
};
