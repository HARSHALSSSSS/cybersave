import React, { useMemo } from 'react';
import { Dimensions, Pressable, StyleSheet, Text, View } from 'react-native';
import { useTheme } from '@app/providers/ThemeProvider';
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
  variant?: 'grid' | 'certificate';
};

const SCREEN_WIDTH = Dimensions.get('window').width;

export const ServiceOptionCard: React.FC<ServiceOptionCardProps> = ({
  title,
  description,
  icon,
  iconColor,
  iconBg,
  processingDays,
  fee,
  onPress,
  variant = 'grid',
}) => {
  const { theme } = useTheme();

  const styles = useMemo(() => {
    const horizontalPadding = theme.spacing['2xl'] * 2;
    const gap = theme.spacing.md;
    const cardWidth = (SCREEN_WIDTH - horizontalPadding - gap) / 2;

    return StyleSheet.create({
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
    });
  }, [theme]);

  return (
    <Pressable
      style={({ pressed }) => [styles.card, pressed && { opacity: 0.92 }]}
      accessibilityRole="button"
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
