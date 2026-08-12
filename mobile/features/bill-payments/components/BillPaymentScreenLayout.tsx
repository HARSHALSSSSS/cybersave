import React, { useMemo } from 'react';
import {
  ActivityIndicator,
  ScrollView,
  StyleSheet,
  Text,
  View,
  type ViewStyle,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useTheme } from '@app/providers/ThemeProvider';
import { useTranslation } from '@/i18n';
import { Button } from '@components/Button';
import { GradientScreenHeader } from '@features/profile/components';
import { getScrollBottomPadding } from '@utils/layout';

type BillPaymentScreenLayoutProps = {
  title: string;
  showBack?: boolean;
  onBack?: () => void;
  rightAction?: React.ReactNode;
  children: React.ReactNode;
  loading?: boolean;
  error?: boolean;
  errorMessage?: string;
  onRetry?: () => void;
  scroll?: boolean;
  bodyStyle?: ViewStyle;
};

/** Shared shell for BBPS screens — avoids nested-stack blank renders and ScrollView flex bugs. */
export const BillPaymentScreenLayout: React.FC<BillPaymentScreenLayoutProps> = ({
  title,
  showBack = false,
  onBack,
  rightAction,
  children,
  loading = false,
  error = false,
  errorMessage,
  onRetry,
  scroll = true,
  bodyStyle,
}) => {
  const { theme } = useTheme();
  const insets = useSafeAreaInsets();
  const { t } = useTranslation();
  const resolvedErrorMessage = errorMessage ?? t.common.error;

  const styles = useMemo(
    () =>
      StyleSheet.create({
        root: { flex: 1, backgroundColor: theme.colors.backgroundSecondary },
        body: {
          flex: 1,
          backgroundColor: theme.colors.surface,
          borderTopLeftRadius: theme.radius['3xl'],
          borderTopRightRadius: theme.radius['3xl'],
          marginTop: -theme.spacing.lg,
        },
        scrollContent: {
          flexGrow: 1,
          paddingHorizontal: theme.spacing['2xl'],
          paddingTop: theme.spacing['2xl'],
          paddingBottom: getScrollBottomPadding(insets),
        },
        staticContent: {
          flex: 1,
          paddingHorizontal: theme.spacing['2xl'],
          paddingTop: theme.spacing['2xl'],
          paddingBottom: getScrollBottomPadding(insets, theme.spacing.lg),
        },
        centerBox: {
          flex: 1,
          alignItems: 'center',
          justifyContent: 'center',
          padding: theme.spacing['2xl'],
        },
        errorText: {
          ...theme.typography.bodyMedium,
          color: theme.colors.textSecondary,
          textAlign: 'center',
          marginBottom: theme.spacing.lg,
        },
      }),
    [theme, insets.bottom],
  );

  const bodyContent =
    loading || error ? (
      <View style={styles.centerBox}>
        {error ? (
          <>
            <Text style={styles.errorText}>{resolvedErrorMessage}</Text>
            {onRetry ? <Button title={t.common.retry} onPress={onRetry} /> : null}
          </>
        ) : (
          <ActivityIndicator color={theme.colors.primary} size="large" />
        )}
      </View>
    ) : scroll ? (
      <ScrollView
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}>
        {children}
      </ScrollView>
    ) : (
      <View style={[styles.staticContent, bodyStyle]}>{children}</View>
    );

  return (
    <View style={styles.root}>
      <GradientScreenHeader
        title={title}
        showBack={showBack}
        onBack={onBack}
        rightAction={rightAction}
      />
      <View style={styles.body}>{bodyContent}</View>
    </View>
  );
};
