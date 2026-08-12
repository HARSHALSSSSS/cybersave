import React, { useMemo } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '@app/providers/ThemeProvider';
import { BackIcon } from '@components/icons';

type GradientScreenHeaderProps = {
  title: string;
  showBack?: boolean;
  onBack?: () => void;
  rightAction?: React.ReactNode;
};

export const GradientScreenHeader: React.FC<GradientScreenHeaderProps> = ({
  title,
  showBack = false,
  onBack,
  rightAction,
}) => {
  const { theme } = useTheme();
  const insets = useSafeAreaInsets();

  const styles = useMemo(
    () =>
      StyleSheet.create({
        gradient: {
          paddingTop: insets.top + theme.spacing.md,
          paddingHorizontal: theme.spacing['2xl'],
          paddingBottom: theme.spacing['3xl'],
          borderBottomLeftRadius: theme.radius['3xl'],
          borderBottomRightRadius: theme.radius['3xl'],
        },
        row: {
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'center',
          minHeight: 44,
        },
        backButton: {
          position: 'absolute',
          left: 0,
          width: 40,
          height: 40,
          borderRadius: theme.radius.md,
          backgroundColor: theme.colors.surface,
          alignItems: 'center',
          justifyContent: 'center',
        },
        rightAction: {
          position: 'absolute',
          right: 0,
        },
        title: {
          ...theme.typography.headingMedium,
          color: theme.colors.textInverse,
        },
      }),
    [theme, insets.top],
  );

  return (
    <LinearGradient
      colors={[theme.colors.gradientHeaderStart, theme.colors.gradientHeaderEnd]}
      style={styles.gradient}>
      <View style={styles.row}>
        {showBack ? (
          <Pressable
            style={styles.backButton}
            accessibilityRole="button"
            accessibilityLabel="Go back"
            onPress={onBack}>
            <BackIcon color={theme.colors.textPrimary} />
          </Pressable>
        ) : null}
        <Text style={styles.title}>{title}</Text>
        {rightAction ? (
          <View style={styles.rightAction}>{rightAction}</View>
        ) : null}
      </View>
    </LinearGradient>
  );
};
