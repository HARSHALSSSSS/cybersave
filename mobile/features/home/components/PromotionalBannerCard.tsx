import React, { useMemo } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import LinearGradient from 'react-native-linear-gradient';

import { Badge } from '@components/Badge';
import { ChevronRightIcon } from '@components/icons';
import type { HomeBanner } from '@services/api/homeBanners.api';
import { useTheme } from '@app/providers/ThemeProvider';

type Props = {
  banner: HomeBanner;
  onPress: () => void;
};

export const PromotionalBannerCard: React.FC<Props> = ({ banner, onPress }) => {
  const { theme } = useTheme();

  const colors = useMemo(() => {
    if (banner.gradientMiddle) {
      return [banner.gradientStart, banner.gradientMiddle, banner.gradientEnd];
    }
    return [banner.gradientStart, banner.gradientEnd];
  }, [banner.gradientEnd, banner.gradientMiddle, banner.gradientStart]);

  const styles = useMemo(
    () =>
      StyleSheet.create({
        card: {
          borderRadius: theme.radius['2xl'],
          padding: theme.spacing['2xl'],
          minHeight: 180,
          justifyContent: 'space-between',
          ...theme.shadows.lg,
        },
        title: {
          ...theme.typography.headingMedium,
          color: theme.colors.textInverse,
          marginTop: theme.spacing.md,
          marginBottom: theme.spacing.sm,
        },
        desc: {
          ...theme.typography.bodyMedium,
          color: 'rgba(255,255,255,0.85)',
          lineHeight: 22,
        },
        cta: {
          flexDirection: 'row',
          alignItems: 'center',
          gap: theme.spacing.xs,
          marginTop: theme.spacing.lg,
        },
        ctaText: {
          ...theme.typography.labelLarge,
          color: theme.colors.textInverse,
        },
      }),
    [theme],
  );

  return (
    <Pressable accessibilityRole="button" onPress={onPress}>
      <LinearGradient
        colors={colors}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.card}>
        <View>
          {banner.tag ? <Badge label={banner.tag} size="sm" /> : null}
          <Text style={styles.title}>{banner.title}</Text>
          {banner.description ? (
            <Text style={styles.desc}>{banner.description}</Text>
          ) : null}
        </View>
        <View style={styles.cta}>
          <Text style={styles.ctaText}>{banner.ctaLabel}</Text>
          <ChevronRightIcon />
        </View>
      </LinearGradient>
    </Pressable>
  );
};
