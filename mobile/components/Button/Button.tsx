import React, { useMemo } from 'react';
import {
  ActivityIndicator,
  Pressable,
  PressableProps,
  StyleSheet,
  Text,
  ViewStyle,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import { useTheme } from '@app/providers/ThemeProvider';

type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'outline';
type ButtonSize = 'sm' | 'md' | 'lg';

export type ButtonProps = Omit<PressableProps, 'children'> & {
  title: string;
  variant?: ButtonVariant;
  size?: ButtonSize;
  loading?: boolean;
  fullWidth?: boolean;
  gradient?: boolean;
};

export const Button: React.FC<ButtonProps> = ({
  title,
  variant = 'primary',
  size = 'lg',
  loading = false,
  fullWidth = true,
  gradient = true,
  disabled,
  style,
  ...props
}) => {
  const { theme } = useTheme();
  const isDisabled = disabled || loading;

  const styles = useMemo(
    () =>
      StyleSheet.create({
        container: {
          borderRadius: theme.radius.xl,
          overflow: 'hidden',
          opacity: isDisabled ? 0.6 : 1,
          alignSelf: fullWidth ? 'stretch' : 'flex-start',
          ...(variant === 'primary' ? theme.shadows.button : null),
        },
        gradient: {
          minHeight: size === 'sm' ? 44 : size === 'md' ? 48 : 56,
          paddingHorizontal: theme.spacing['2xl'],
          alignItems: 'center',
          justifyContent: 'center',
        },
        solid: {
          minHeight: size === 'sm' ? 44 : size === 'md' ? 48 : 56,
          paddingHorizontal: theme.spacing['2xl'],
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor:
            variant === 'ghost'
              ? 'transparent'
              : variant === 'secondary'
                ? theme.colors.backgroundSecondary
                : variant === 'outline'
                  ? 'transparent'
                  : theme.colors.primary,
          borderWidth: variant === 'outline' ? 1.5 : 0,
          borderColor: theme.colors.primary,
          borderRadius: theme.radius.xl,
        },
        text: {
          ...theme.typography.button,
          fontSize:
            size === 'sm'
              ? theme.typography.bodyMedium.fontSize
              : theme.typography.button.fontSize,
          color:
            variant === 'primary'
              ? theme.colors.textInverse
              : variant === 'outline' || variant === 'ghost'
                ? theme.colors.primary
                : theme.colors.textPrimary,
        },
      }),
    [theme, variant, size, isDisabled, fullWidth],
  );

  const content = loading ? (
    <ActivityIndicator
      color={
        variant === 'primary' ? theme.colors.textInverse : theme.colors.primary
      }
    />
  ) : (
    <Text style={styles.text}>{title}</Text>
  );

  if (variant === 'primary' && gradient) {
    return (
      <Pressable
        accessibilityRole="button"
        disabled={isDisabled}
        style={[styles.container, style as ViewStyle]}
        {...props}>
        {({ pressed }) => (
          <LinearGradient
            colors={[theme.colors.gradientStart, theme.colors.gradientEnd]}
            start={{ x: 0, y: 0.5 }}
            end={{ x: 1, y: 0.5 }}
            style={[styles.gradient, pressed && { opacity: 0.92 }]}>
            {content}
          </LinearGradient>
        )}
      </Pressable>
    );
  }

  return (
    <Pressable
      accessibilityRole="button"
      disabled={isDisabled}
      style={({ pressed }) => [
        styles.container,
        styles.solid,
        pressed && { opacity: 0.92 },
        style as ViewStyle,
      ]}
      {...props}>
      {content}
    </Pressable>
  );
};
