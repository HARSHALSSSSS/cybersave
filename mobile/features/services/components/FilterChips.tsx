import React, { useMemo } from 'react';
import { Pressable, ScrollView, StyleSheet, Text } from 'react-native';
import { useTheme } from '@app/providers/ThemeProvider';

type FilterChipsProps<T extends string> = {
  filters: readonly T[];
  active: T;
  onChange: (filter: T) => void;
};

export function FilterChips<T extends string>({
  filters,
  active,
  onChange,
}: FilterChipsProps<T>) {
  const { theme } = useTheme();

  const styles = useMemo(
    () =>
      StyleSheet.create({
        scroll: {
          marginBottom: theme.spacing.lg,
          flexGrow: 0,
        },
        content: {
          flexDirection: 'row',
          alignItems: 'center',
          paddingHorizontal: theme.spacing['2xl'],
          gap: theme.spacing.sm,
        },
        chip: {
          flexShrink: 0,
          paddingHorizontal: theme.spacing.lg,
          paddingVertical: theme.spacing.sm,
          borderRadius: theme.radius.full,
          borderWidth: 1,
          borderColor: theme.colors.border,
          backgroundColor: theme.colors.surface,
        },
        chipActive: {
          backgroundColor: theme.colors.primary,
          borderColor: theme.colors.primary,
        },
        chipText: {
          ...theme.typography.labelMedium,
          color: theme.colors.textPrimary,
          flexShrink: 1,
        },
        chipTextActive: {
          color: theme.colors.textInverse,
        },
      }),
    [theme],
  );

  return (
    <ScrollView
      horizontal
      nestedScrollEnabled
      showsHorizontalScrollIndicator={false}
      style={styles.scroll}
      contentContainerStyle={styles.content}>
      {filters.map(filter => {
        const isActive = filter === active;
        return (
          <Pressable
            key={filter}
            accessibilityRole="button"
            accessibilityState={{ selected: isActive }}
            onPress={() => onChange(filter)}
            style={[styles.chip, isActive && styles.chipActive]}>
            <Text style={[styles.chipText, isActive && styles.chipTextActive]}>
              {filter}
            </Text>
          </Pressable>
        );
      })}
    </ScrollView>
  );
}
