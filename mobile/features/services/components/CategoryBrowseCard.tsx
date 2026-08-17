import React, { useMemo } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useTheme } from '@app/providers/ThemeProvider';
import { ChevronRightIcon } from '@components/icons';
import { ServiceIcon } from './ServiceIcon';

type CategoryBrowseCardProps = {
  title: string;
  description?: string | null;
  meta?: string;
  icon: string;
  iconColor: string;
  iconBg: string;
  onPress: () => void;
};

export const CategoryBrowseCard: React.FC<CategoryBrowseCardProps> = ({
  title,
  description,
  meta,
  icon,
  iconColor,
  iconBg,
  onPress,
}) => {
  const { theme } = useTheme();

  const styles = useMemo(
    () =>
      StyleSheet.create({
        card: {
          flexDirection: 'row',
          alignItems: 'center',
          gap: theme.spacing.md,
          padding: theme.spacing.lg,
          borderRadius: theme.radius.xl,
          borderWidth: 1,
          borderColor: theme.colors.border,
          backgroundColor: theme.colors.surface,
          ...theme.shadows.sm,
        },
        iconWrap: {
          width: 48,
          height: 48,
          borderRadius: theme.radius.lg,
          alignItems: 'center',
          justifyContent: 'center',
        },
        body: { flex: 1, minWidth: 0 },
        title: {
          ...theme.typography.bodyLarge,
          color: theme.colors.textPrimary,
          fontWeight: '700',
        },
        description: {
          ...theme.typography.bodySmall,
          color: theme.colors.textSecondary,
          marginTop: 2,
        },
        meta: {
          ...theme.typography.caption,
          color: theme.colors.primary,
          fontWeight: '700',
          marginTop: theme.spacing.xs,
        },
      }),
    [theme],
  );

  return (
    <Pressable
      style={({ pressed }) => [styles.card, pressed && { opacity: 0.92 }]}
      accessibilityRole="button"
      onPress={onPress}>
      <View style={[styles.iconWrap, { backgroundColor: iconBg }]}>
        <ServiceIcon name={icon} color={iconColor} size={22} />
      </View>
      <View style={styles.body}>
        <Text style={styles.title} numberOfLines={1}>
          {title}
        </Text>
        {description ? (
          <Text style={styles.description} numberOfLines={2}>
            {description}
          </Text>
        ) : null}
        {meta ? <Text style={styles.meta}>{meta}</Text> : null}
      </View>
      <ChevronRightIcon color={theme.colors.textSecondary} />
    </Pressable>
  );
};
