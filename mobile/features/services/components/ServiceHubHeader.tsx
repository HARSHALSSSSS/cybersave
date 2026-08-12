import React, { useMemo } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '@app/providers/ThemeProvider';
import { BackIcon } from '@components/icons';

type ServiceHubHeaderProps = {
  title: string;
  subtitle?: string;
  showBack?: boolean;
  onBack?: () => void;
  rightAction?: React.ReactNode;
  step?: number;
  totalSteps?: number;
};

export const ServiceHubHeader: React.FC<ServiceHubHeaderProps> = ({
  title,
  subtitle,
  showBack = false,
  onBack,
  rightAction,
  step,
  totalSteps,
}) => {
  const { theme } = useTheme();
  const insets = useSafeAreaInsets();
  const progress =
    step && totalSteps ? Math.min(100, (step / totalSteps) * 100) : 0;

  const styles = useMemo(
    () =>
      StyleSheet.create({
        gradient: {
          paddingTop: insets.top + theme.spacing.md,
          paddingHorizontal: theme.spacing['2xl'],
          paddingBottom: theme.spacing['2xl'],
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
          borderRadius: theme.radius.full,
          backgroundColor: theme.colors.surface,
          alignItems: 'center',
          justifyContent: 'center',
        },
        rightAction: {
          position: 'absolute',
          right: 0,
          width: 40,
          height: 40,
          borderRadius: theme.radius.full,
          backgroundColor: theme.colors.surface,
          alignItems: 'center',
          justifyContent: 'center',
        },
        titleWrap: {
          alignItems: 'center',
          maxWidth: '70%',
        },
        title: {
          ...theme.typography.headingMedium,
          color: theme.colors.textInverse,
          textAlign: 'center',
        },
        subtitle: {
          ...theme.typography.bodySmall,
          color: 'rgba(255,255,255,0.85)',
          marginTop: 2,
          textAlign: 'center',
        },
        stepText: {
          position: 'absolute',
          right: 0,
          ...theme.typography.labelSmall,
          color: theme.colors.textInverse,
        },
        progressTrack: {
          height: 4,
          backgroundColor: 'rgba(255,255,255,0.25)',
          borderRadius: theme.radius.full,
          marginTop: theme.spacing.md,
          overflow: 'hidden',
        },
        progressFill: {
          height: '100%',
          backgroundColor: theme.colors.surface,
          borderRadius: theme.radius.full,
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
        <View style={styles.titleWrap}>
          <Text style={styles.title}>{title}</Text>
          {subtitle ? <Text style={styles.subtitle}>{subtitle}</Text> : null}
        </View>
        {step && totalSteps ? (
          <Text style={styles.stepText}>
            Step {step}/{totalSteps}
          </Text>
        ) : rightAction ? (
          <View style={styles.rightAction}>{rightAction}</View>
        ) : null}
      </View>
      {step && totalSteps ? (
        <View style={styles.progressTrack}>
          <View style={[styles.progressFill, { width: `${progress}%` }]} />
        </View>
      ) : null}
    </LinearGradient>
  );
};
