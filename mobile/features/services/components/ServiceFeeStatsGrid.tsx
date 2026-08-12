import React, { useMemo } from 'react';
import { StyleSheet, Text, View, useWindowDimensions } from 'react-native';

import { useTheme } from '@app/providers/ThemeProvider';
import { useTwoColumnCardWidth } from '@hooks/useTwoColumnCardWidth';
import { getTwoColumnWidth } from '@utils/layout';

export type ServiceFeeStat = {
  key: string;
  label: string;
  value: string;
};

type ServiceFeeStatsGridProps = {
  stats: ServiceFeeStat[];
};

const COMPACT_BREAKPOINT = 360;

function resolveCardWidth(
  screenWidth: number,
  twoColumnWidth: number,
  index: number,
  total: number,
): number | '100%' {
  if (total === 1) return '100%';
  if (screenWidth < COMPACT_BREAKPOINT) return '100%';
  if (total === 3 && index === 2) return '100%';
  return twoColumnWidth;
}

/** Responsive fee / timing summary cards for service detail screens. */
export const ServiceFeeStatsGrid: React.FC<ServiceFeeStatsGridProps> = ({ stats }) => {
  const { theme } = useTheme();
  const { width: screenWidth } = useWindowDimensions();
  const twoColumnWidth = useTwoColumnCardWidth();
  const fullRowWidth = useMemo(
    () => getTwoColumnWidth(screenWidth, theme.spacing['2xl'], theme.spacing.md) * 2 + theme.spacing.md,
    [screenWidth, theme.spacing],
  );

  const styles = useMemo(
    () =>
      StyleSheet.create({
        grid: {
          flexDirection: 'row',
          flexWrap: 'wrap',
          gap: theme.spacing.md,
          marginBottom: theme.spacing.lg,
        },
        card: {
          borderRadius: theme.radius.xl,
          borderWidth: 1,
          borderColor: theme.colors.border,
          paddingHorizontal: theme.spacing.lg,
          paddingVertical: theme.spacing.md,
          backgroundColor: theme.colors.backgroundSecondary,
          minHeight: 76,
          justifyContent: 'center',
        },
        label: {
          ...theme.typography.labelSmall,
          color: theme.colors.textSecondary,
          lineHeight: 18,
        },
        value: {
          ...theme.typography.labelLarge,
          color: theme.colors.textPrimary,
          marginTop: theme.spacing.xs,
          lineHeight: 24,
          flexShrink: 1,
        },
      }),
    [theme],
  );

  if (stats.length === 0) return null;

  return (
    <View style={styles.grid}>
      {stats.map((stat, index) => {
        const cardWidth = resolveCardWidth(screenWidth, twoColumnWidth, index, stats.length);
        const widthStyle =
          cardWidth === '100%'
            ? { width: stats.length === 3 && index === 2 ? fullRowWidth : '100%' as const }
            : { width: cardWidth };

        return (
          <View key={stat.key} style={[styles.card, widthStyle]}>
            <Text style={styles.label} numberOfLines={2}>
              {stat.label}
            </Text>
            <Text style={styles.value} numberOfLines={2} adjustsFontSizeToFit minimumFontScale={0.85}>
              {stat.value}
            </Text>
          </View>
        );
      })}
    </View>
  );
};
