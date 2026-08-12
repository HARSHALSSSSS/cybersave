import React, { useMemo } from 'react';
import { Alert, Pressable, ScrollView, Share, StyleSheet, Text, View } from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { WalletStackParamList } from '@/types/navigation';
import { getTransactionDetails } from '@constants/index';
import { useTranslation } from '@/i18n';
import { useTheme } from '@app/providers/ThemeProvider';
import {
  BackIcon,
  CheckCircleIcon,
  DownloadIcon,
  ShareIcon,
} from '@components/icons';

type Props = NativeStackScreenProps<
  WalletStackParamList,
  'TransactionDetails'
>;

export const TransactionDetailsScreen: React.FC<Props> = ({
  navigation,
  route,
}) => {
  const { theme } = useTheme();
  const insets = useSafeAreaInsets();
  const { t } = useTranslation();
  const details = useMemo(
    () => getTransactionDetails(route.params.transactionId),
    [route.params.transactionId],
  );

  const detailFields = useMemo(
    () =>
      [
        { label: t.wallet.transactionIdLabel, value: details.txnId },
        { label: t.wallet.dateTimeLabel, value: details.dateTime },
        { label: t.wallet.paymentMethodLabel, value: details.paymentMethod },
        details.category
          ? { label: t.wallet.serviceCategoryLabel, value: details.category }
          : null,
        details.beneficiary
          ? { label: t.wallet.beneficiaryLabel, value: details.beneficiary }
          : null,
      ].filter(Boolean) as Array<{ label: string; value: string }>,
    [t, details],
  );

  const handleShare = () => {
    void Share.share({
      message: `${details.title}\n${t.wallet.refPrefix}: ${details.ref}\n${t.wallet.transactionIdLabel}: ${details.txnId}\n₹${details.amount.toFixed(2)}`,
    });
  };

  const handleDownload = () => {
    Alert.alert(t.wallet.downloadReceipt, t.wallet.receiptShared);
  };

  const styles = useMemo(
    () =>
      StyleSheet.create({
        container: {
          flex: 1,
          backgroundColor: theme.colors.backgroundSecondary,
        },
        headerGradient: {
          paddingTop: insets.top + theme.spacing.md,
          paddingHorizontal: theme.spacing['2xl'],
          paddingBottom: theme.spacing['4xl'],
          borderBottomLeftRadius: theme.radius['3xl'],
          borderBottomRightRadius: theme.radius['3xl'],
        },
        headerRow: {
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'center',
          minHeight: 44,
        },
        iconButton: {
          position: 'absolute',
          width: 40,
          height: 40,
          borderRadius: theme.radius.full,
          backgroundColor: theme.colors.surface,
          alignItems: 'center',
          justifyContent: 'center',
        },
        backButton: {
          left: 0,
        },
        shareButton: {
          right: 0,
        },
        headerTitle: {
          ...theme.typography.headingMedium,
          color: theme.colors.textInverse,
        },
        scroll: {
          flex: 1,
          marginTop: -theme.spacing['2xl'],
          paddingHorizontal: theme.spacing['2xl'],
        },
        statusCard: {
          backgroundColor: theme.colors.surface,
          borderRadius: theme.radius.xl,
          padding: theme.spacing['2xl'],
          alignItems: 'center',
          marginBottom: theme.spacing.lg,
          ...theme.shadows.card,
        },
        statusText: {
          ...theme.typography.bodyMedium,
          color: theme.colors.textSecondary,
          marginTop: theme.spacing.md,
        },
        title: {
          ...theme.typography.labelLarge,
          color: theme.colors.textPrimary,
          marginTop: theme.spacing.sm,
          textAlign: 'center',
        },
        amount: {
          fontSize: 36,
          fontWeight: '700',
          color: theme.colors.textPrimary,
          marginTop: theme.spacing.sm,
        },
        refBadge: {
          marginTop: theme.spacing.md,
          paddingHorizontal: theme.spacing.lg,
          paddingVertical: theme.spacing.xs,
          borderRadius: theme.radius.full,
          backgroundColor: '#D1FAE5',
        },
        refText: {
          ...theme.typography.labelSmall,
          color: '#059669',
          fontWeight: '600',
        },
        detailsCard: {
          backgroundColor: theme.colors.surface,
          borderRadius: theme.radius.xl,
          padding: theme.spacing['2xl'],
          marginBottom: theme.spacing['2xl'],
          ...theme.shadows.card,
        },
        detailRow: {
          paddingVertical: theme.spacing.md,
          borderBottomWidth: 1,
          borderBottomColor: theme.colors.border,
        },
        detailRowLast: {
          borderBottomWidth: 0,
        },
        detailLabel: {
          ...theme.typography.bodySmall,
          color: theme.colors.textSecondary,
          marginBottom: theme.spacing.xxs,
        },
        detailValue: {
          ...theme.typography.labelMedium,
          color: theme.colors.textPrimary,
        },
        downloadButton: {
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'center',
          gap: theme.spacing.sm,
          backgroundColor: theme.colors.surface,
          borderRadius: theme.radius.lg,
          paddingVertical: theme.spacing.lg,
          borderWidth: 1,
          borderColor: theme.colors.border,
          marginBottom: insets.bottom + theme.spacing['2xl'],
        },
        downloadText: {
          ...theme.typography.labelLarge,
          color: theme.colors.primary,
        },
      }),
    [theme, insets],
  );

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={[theme.colors.gradientHeaderStart, theme.colors.gradientHeaderEnd]}
        style={styles.headerGradient}>
        <View style={styles.headerRow}>
          <Pressable
            style={[styles.iconButton, styles.backButton]}
            accessibilityRole="button"
            onPress={() => navigation.goBack()}>
            <BackIcon color={theme.colors.textPrimary} />
          </Pressable>
          <Text style={styles.headerTitle}>{t.wallet.transactionDetails}</Text>
          <Pressable
            style={[styles.iconButton, styles.shareButton]}
            accessibilityRole="button"
            onPress={handleShare}>
            <ShareIcon color={theme.colors.textPrimary} />
          </Pressable>
        </View>
      </LinearGradient>

      <ScrollView
        style={styles.scroll}
        showsVerticalScrollIndicator={false}>
        <View style={styles.statusCard}>
          <CheckCircleIcon color="#10B981" size={56} />
          <Text style={styles.statusText}>{t.wallet.paymentSuccessful}</Text>
          <Text style={styles.title}>{details.title}</Text>
          <Text style={styles.amount}>
            ₹{details.amount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
          </Text>
          <View style={styles.refBadge}>
            <Text style={styles.refText}>{t.wallet.refPrefix}: {details.ref}</Text>
          </View>
        </View>

        <View style={styles.detailsCard}>
          {detailFields.map((field, index) => (
            <View
              key={field.label}
              style={[
                styles.detailRow,
                index === detailFields.length - 1 && styles.detailRowLast,
              ]}>
              <Text style={styles.detailLabel}>{field.label}</Text>
              <Text style={styles.detailValue}>{field.value}</Text>
            </View>
          ))}
        </View>

        <Pressable
          style={styles.downloadButton}
          accessibilityRole="button"
          onPress={handleDownload}>
          <DownloadIcon color={theme.colors.primary} />
          <Text style={styles.downloadText}>{t.wallet.downloadReceipt}</Text>
        </Pressable>
      </ScrollView>
    </View>
  );
};
