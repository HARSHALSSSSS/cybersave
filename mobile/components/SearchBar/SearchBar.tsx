import React, { useMemo } from 'react';
import {
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  TextInputProps,
  View,
} from 'react-native';
import { useTheme } from '@app/providers/ThemeProvider';
import { SearchIcon } from '@components/icons';

type SearchBarProps = Omit<TextInputProps, 'style'> & {
  onPress?: () => void;
  editable?: boolean;
};

export const SearchBar: React.FC<SearchBarProps> = ({
  placeholder = 'Search services...',
  onPress,
  editable = true,
  value,
  onChangeText,
  ...props
}) => {
  const { theme } = useTheme();

  const styles = useMemo(
    () =>
      StyleSheet.create({
        container: {
          flexDirection: 'row',
          alignItems: 'center',
          backgroundColor: theme.colors.surface,
          borderRadius: theme.radius.lg,
          paddingHorizontal: theme.spacing.lg,
          minHeight: 52,
          gap: theme.spacing.md,
          ...theme.shadows.card,
        },
        input: {
          flex: 1,
          ...theme.typography.bodyMedium,
          color: theme.colors.textPrimary,
          paddingVertical: theme.spacing.md,
        },
      }),
    [theme],
  );

  if (onPress && !editable) {
    return (
      <Pressable
        accessibilityRole="search"
        onPress={onPress}
        style={styles.container}>
        <SearchIcon color={theme.colors.textSecondary} />
        <Text style={[styles.input, { color: theme.colors.inputPlaceholder }]}>
          {placeholder}
        </Text>
      </Pressable>
    );
  }

  return (
    <View style={styles.container}>
      <SearchIcon color={theme.colors.textSecondary} />
      <TextInput
        placeholder={placeholder}
        placeholderTextColor={theme.colors.inputPlaceholder}
        style={styles.input}
        value={value}
        onChangeText={onChangeText}
        editable={editable}
        {...props}
      />
    </View>
  );
};
