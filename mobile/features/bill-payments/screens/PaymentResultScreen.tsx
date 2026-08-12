import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useQuery } from '@tanstack/react-query';

import { useTheme } from '@app/providers/ThemeProvider';
import { useTranslation } from '@/i18n';
import { Button } from '@components/Button';
import { formatBillDate, formatRupee } from '@features/bill-payments/components';
import { BillPaymentScreenLayout } from '@features/bill-payments/components/BillPaymentScreenLayout';
import { BillPaymentsStackParamList } from '@/types/navigation';
import { billPaymentsApi, billPaymentsQueryKeys } from '@services/api/billPayments.api';

type Props = NativeStackScreenProps<BillPaymentsStackParamList, 'PaymentResult'>;

export const PaymentResultScreen: React.FC<Props> = ({ navigation, route }) => {
  const { paymentId } = route.params;
  const { theme } = useTheme();
  const { t, format } = useTranslation();
  const [polling, setPolling] = useState(true);

  const { data: payment, refetch, isLoading } = useQuery({
    queryKey: billPaymentsQueryKeys.payment(paymentId),
    queryFn: () => billPaymentsApi.getPayment(paymentId, true),
    refetchInterval: query => {
      const status = query.state.data?.status;
      if (status === 'processing' || status === 'pending') return 2000;
      return false;
    },
  });

  useEffect(() => {
    if (payment?.status === 'success' || payment?.status === 'failed') {
      setPolling(false);
    }
  }, [payment?.status]);

  const styles = useMemo(
    () =>
      StyleSheet.create({
        center: { alignItems: 'center', paddingTop: theme.spacing.xl },
        iconCircle: {
          width: 72,
          height: 72,
          borderRadius: 36,
          alignItems: 'center',
          justifyContent: 'center',
          marginBottom: theme.spacing.lg,
        },
        iconText: { fontSize: 36 },
        title: { ...theme.typography.headingMedium, color: theme.colors.textPrimary, textAlign: 'center' },
        subtitle: {
          ...theme.typography.bodyMedium,
          color: theme.colors.textSecondary,
          textAlign: 'center',
          marginTop: theme.spacing.sm,
        },
        amount: {
          ...theme.typography.headingLarge,
          color: theme.colors.textPrimary,
          marginVertical: theme.spacing.lg,
        },
        detailCard: {
          width: '100%',
          backgroundColor: theme.colors.backgroundSecondary,
          borderRadius: theme.radius.xl,
          padding: theme.spacing.lg,
          marginTop: theme.spacing.lg,
        },
        detailRow: {
          flexDirection: 'row',
          justifyContent: 'space-between',
          paddingVertical: 6,
        },
        detailLabel: { ...theme.typography.bodySmall, color: theme.colors.textSecondary },
        detailValue: { ...theme.typography.bodySmall, color: theme.colors.textPrimary },
        actions: { width: '100%', marginTop: theme.spacing['2xl'], gap: theme.spacing.md },
        link: { ...theme.typography.bodyMedium, color: theme.colors.primary, textAlign: 'center' },
      }),
    [theme],
  );

  const goHome = useCallback(() => {
    navigation.popToTop();
  }, [navigation]);

  const isProcessing =
    isLoading ||
    !payment ||
    (polling && (payment.status === 'processing' || payment.status === 'pending'));

  if (isProcessing) {
    return (
      <BillPaymentScreenLayout title={t.bills.processingTitle} showBack onBack={() => navigation.goBack()} scroll>
        <View style={styles.center}>
          <ActivityIndicator size="large" color={theme.colors.primary} />
          <Text style={[styles.subtitle, { marginTop: theme.spacing.lg }]}>
            {payment?.status === 'pending'
              ? t.bills.paymentSubmitted
              : t.bills.processingPayment}
          </Text>
          <Text style={[styles.subtitle, { marginTop: theme.spacing.sm }]}>
            {t.bills.doNotPayAgain}
          </Text>
        </View>
      </BillPaymentScreenLayout>
    );
  }

  const isSuccess = payment.status === 'success';
  const isPending = payment.status === 'pending';
  const isFailed = payment.status === 'failed';

  const statusColor = isSuccess
    ? theme.colors.success
    : isPending
      ? theme.colors.warning
      : theme.colors.error;
  const statusBg = isSuccess ? '#ECFDF5' : isPending ? '#FEF3C7' : '#FEE2E2';
  const statusIcon = isSuccess ? '✓' : isPending ? '⏳' : '✕';
  const statusTitle = isSuccess
    ? t.bills.paymentSuccess
    : isPending
      ? t.bills.paymentProcessing
      : t.bills.paymentFailedTitle;

  return (
    <BillPaymentScreenLayout title={statusTitle} scroll>
      <View style={styles.center}>
        <View style={[styles.iconCircle, { backgroundColor: statusBg }]}>
          <Text style={[styles.iconText, { color: statusColor }]}>{statusIcon}</Text>
        </View>

        <Text style={styles.title}>
          {isSuccess
            ? format(t.bills.billPaid, { biller: payment.biller.name })
            : isPending
              ? t.bills.awaitingConfirmation
              : t.bills.couldNotComplete}
        </Text>

        <Text style={styles.amount}>{formatRupee(payment.totalAmount)}</Text>

        <View style={styles.detailCard}>
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>{t.bills.billerName}</Text>
            <Text style={styles.detailValue}>{payment.biller.name}</Text>
          </View>
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>{t.bills.account}</Text>
            <Text style={styles.detailValue}>{payment.accountMasked}</Text>
          </View>
          {payment.paidAt ? (
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>{t.bills.paymentDate}</Text>
              <Text style={styles.detailValue}>{formatBillDate(payment.paidAt)}</Text>
            </View>
          ) : null}
          {payment.transactionId ? (
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>{t.bills.transactionIdLabel}</Text>
              <Text style={styles.detailValue}>{payment.transactionId}</Text>
            </View>
          ) : null}
          {payment.bbpsReference ? (
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>{t.bills.bbpsReference}</Text>
              <Text style={styles.detailValue}>{payment.bbpsReference}</Text>
            </View>
          ) : null}
          {payment.billerReference ? (
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>{t.bills.billerReference}</Text>
              <Text style={styles.detailValue}>{payment.billerReference}</Text>
            </View>
          ) : null}
          {isFailed && payment.errorMessage ? (
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>{t.bills.reason}</Text>
              <Text style={[styles.detailValue, { flex: 1, textAlign: 'right' }]}>
                {payment.errorMessage}
              </Text>
            </View>
          ) : null}
        </View>

        <View style={styles.actions}>
          {isPending ? (
            <Button title={t.bills.refreshStatus} variant="outline" onPress={() => refetch()} />
          ) : null}
          {isFailed ? (
            <Button title={t.bills.tryAgain} onPress={() => navigation.pop(2)} />
          ) : null}
          <Button title={t.bills.done} onPress={goHome} variant={isSuccess ? 'primary' : 'outline'} />
          <Pressable onPress={() => navigation.navigate('BillPaymentHistory')}>
            <Text style={styles.link}>{t.bills.viewTransactionHistory}</Text>
          </Pressable>
        </View>
      </View>
    </BillPaymentScreenLayout>
  );
};
