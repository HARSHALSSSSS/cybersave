import React, { useMemo } from 'react';
import { Pressable, StyleSheet, Text, View, ViewProps } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import LinearGradient from 'react-native-linear-gradient';
import { useTheme } from '@app/providers/ThemeProvider';

type HeaderProps = ViewProps & {
  title?: string;
  subtitle?: string;
  showBack?: boolean;
  onBack?: () => void;
  rightAction?: React.ReactNode;
  variant?: 'gradient' | 'plain';
  centered?: boolean;
};

export const Header: React.FC<HeaderProps> = ({
  title,
  subtitle,
  showBack = false,
  onBack,
  rightAction,
  variant = 'gradient',
  centered = false,
  style,
  children,
  ...props
}) => {
  const { theme } = useTheme();
  const insets = useSafeAreaInsets();

  const styles = useMemo(
    () =>
      StyleSheet.create({
        gradient: {
          paddingTop: insets.top + theme.spacing.md,
          paddingBottom: theme.spacing['3xl'],
          paddingHorizontal: theme.spacing['2xl'],
        },
        plain: {
          paddingTop: insets.top + theme.spacing.sm,
          paddingBottom: theme.spacing.lg,
          paddingHorizontal: theme.spacing['2xl'],
          backgroundColor: theme.colors.background,
        },
        row: {
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: centered ? 'center' : 'flex-start',
          minHeight: 44,
        },
        backButton: {
          position: 'absolute',
          left: 0,
          zIndex: 1,
          width: 40,
          height: 40,
          alignItems: 'center',
          justifyContent: 'center',
        },
        backText: {
          fontSize: 28,
          color: theme.colors.textInverse,
          lineHeight: 32,
        },
        title: {
          ...theme.typography.headingMedium,
          color: theme.colors.textInverse,
          textAlign: centered ? 'center' : 'left',
        },
        subtitle: {
          ...theme.typography.bodyMedium,
          color: 'rgba(255,255,255,0.85)',
          marginTop: theme.spacing.sm,
        },
        rightAction: {
          position: 'absolute',
          right: 0,
        },
      }),
    [theme, insets.top, centered],
  );

  const content = (
    <>
      {showBack ? (
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Go back"
          onPress={onBack}
          style={styles.backButton}
          hitSlop={12}>
          <Text style={styles.backText}>‹</Text>
        </Pressable>
      ) : null}
      <View style={{ flex: 1 }}>
        {title ? <Text style={styles.title}>{title}</Text> : null}
        {subtitle ? <Text style={styles.subtitle}>{subtitle}</Text> : null}
        {children}
      </View>
      {rightAction ? (
        <View style={styles.rightAction}>{rightAction}</View>
      ) : null}
    </>
  );

  if (variant === 'gradient') {
    return (
      <LinearGradient
        colors={[theme.colors.gradientHeaderStart, theme.colors.gradientHeaderEnd]}
        style={[styles.gradient, style]}
        {...props}>
        <View style={styles.row}>{content}</View>
      </LinearGradient>
    );
  }

  return (
    <View style={[styles.plain, style]} {...props}>
      <View style={styles.row}>{content}</View>
    </View>
  );
};
