import React, { useMemo } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { useTheme } from '@app/providers/ThemeProvider';

type ToggleProps = {
  value: boolean;
  onValueChange: (value: boolean) => void;
};

export const Toggle: React.FC<ToggleProps> = ({ value, onValueChange }) => {
  const { theme } = useTheme();

  const styles = useMemo(
    () =>
      StyleSheet.create({
        track: {
          width: 48,
          height: 28,
          borderRadius: theme.radius.full,
          backgroundColor: value ? theme.colors.primary : theme.colors.border,
          padding: 2,
          justifyContent: 'center',
        },
        thumb: {
          width: 24,
          height: 24,
          borderRadius: theme.radius.full,
          backgroundColor: theme.colors.surface,
          alignSelf: value ? 'flex-end' : 'flex-start',
          ...theme.shadows.sm,
        },
      }),
    [theme, value],
  );

  return (
    <Pressable
      accessibilityRole="switch"
      accessibilityState={{ checked: value }}
      onPress={() => onValueChange(!value)}
      style={styles.track}>
      <View style={styles.thumb} />
    </Pressable>
  );
};
