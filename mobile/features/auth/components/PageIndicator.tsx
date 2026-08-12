import React, { useMemo } from 'react';
import { StyleSheet, View } from 'react-native';
import { useTheme } from '@app/providers/ThemeProvider';

type PageIndicatorProps = {
  count: number;
  activeIndex: number;
};

export const PageIndicator: React.FC<PageIndicatorProps> = ({
  count,
  activeIndex,
}) => {
  const { theme } = useTheme();

  const styles = useMemo(
    () =>
      StyleSheet.create({
        container: {
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'center',
          gap: theme.spacing.sm,
        },
        dot: {
          width: 8,
          height: 8,
          borderRadius: theme.radius.full,
          backgroundColor: theme.colors.indicatorInactive,
        },
        active: {
          width: 28,
          height: 8,
          borderRadius: theme.radius.full,
          backgroundColor: theme.colors.indicator,
        },
      }),
    [theme],
  );

  return (
    <View style={styles.container}>
      {Array.from({ length: count }).map((_, index) => (
        <View
          key={index}
          style={index === activeIndex ? styles.active : styles.dot}
        />
      ))}
    </View>
  );
};
