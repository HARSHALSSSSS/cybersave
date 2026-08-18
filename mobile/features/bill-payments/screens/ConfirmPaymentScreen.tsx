import React, { useEffect, useMemo } from 'react';
import { Alert, StyleSheet, Text, View } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useSelector } from 'react-redux';

import { useTheme } from '@app/providers/ThemeProvider';
import { useTranslation } from '@/i18n';
import type { RootState } from '@app/store';
import { Button } from '@components/Button';
import { LockSmallIcon } from '@components/icons';
import { formatRupee } from '@features/bill-payments/components';
import { BillPaymentScreenLayout } from '@features/bill-payments/components/BillPaymentScreenLayout';
import {
  BBPS_CATALOG_STALE_MS,
  prefetchBillPaymentIntent,
} from '@features/bill-payments/utils/billPaymentsPrefetch';
import { isRazorpayUserCancelled } from '@utils/razorpayCheckout';
import { dismissRazorpayHost } from '@utils/razorpayCheckoutStore';
import { collectRazorpayPayment, isSimulatedRazorpayCheckout } from '@utils/razorpayExperience';
import { settlePayment } from '@utils/paymentResilience';
import { BillPaymentsStackParamList } from '@/types/navigation';
import { billPaymentsApi, billPaymentsQueryKeys, getBillPaymentsErrorMessage } from '@services/api/billPayments.api';

type Props = NativeStackScreenProps<BillPaymentsStackParamList, 'ConfirmPayment'>;

export const ConfirmPaymentScreen: React.FC<Props> = ({ navigation, route }) => {
  const { requestId } = route.params;
  const { theme } = useTheme();
  const { t } = useTranslation();
  const queryClient = useQueryClient();
  const citizen = useSelector((state: RootState) => state.auth.citizen);

  const { data: settings } = useQuery({
    queryKey: billPaymentsQueryKeys.settings(),
    queryFn: () => billPaymentsApi.getSettings(),
    staleTime: BBPS_CATALOG_STALE_MS,
  });

  const { data: bill, isLoading, isError, refetch } = useQuery({
    queryKey: billPaymentsQueryKeys.billRequest(requestId),
    queryFn: () => billPaymentsApi.getBillRequest(requestId),
    retry: 2,
    placeholderData: previous => previous,
  });

  const billAmount = Number(bill?.billAmount ?? 0);

  useEffect(() => {
    if (!bill || bill.status !== 'success' || billAmount <= 0) return;
    void prefetchBillPaymentIntent(queryClient, requestId);
  }, [bill, billAmount, queryClient, requestId]);

  const convenienceFee = Number(settings?.convenienceFeeFlat ?? 5) || 5;

  const payMutation = useMutation({
    mutationFn: async () => {
      const cachedIntent = queryClient.getQueryData<Awaited<ReturnType<typeof billPaymentsApi.createPaymentIntent>>>(
        billPaymentsQueryKeys.paymentIntent(requestId),
      );
      const intent = cachedIntent ?? (await billPaymentsApi.createPaymentIntent(requestId));
      const payable = Number(intent.totalAmount || billAmount + convenienceFee);
      const checkout = await collectRazorpayPayment(
        {
          keyId: intent.keyId ?? '',
          orderId: intent.orderId ?? '',
          amount: payable,
          name: 'Cybersave BBPS',
          description: bill?.biller.name ?? 'Bill payment',
          prefill: {
            contact: citizen?.phone,
            email: citizen?.email ?? undefined,
            name: [citizen?.firstName, citizen?.lastName].filter(Boolean).join(' ') || undefined,
          },
        },
        intent,
      );

      await settlePayment({
        confirm: () =>
          billPaymentsApi.confirmPayment(intent.id, {
            mockCapture: isSimulatedRazorpayCheckout(checkout),
            razorpayPaymentId: checkout.razorpay_payment_id,
            razorpayOrderId: checkout.razorpay_order_id,
            razorpaySignature: checkout.razorpay_signature,
          }),
        verify: async () => {
          const payment = await billPaymentsApi.getPayment(intent.id, true);
          return payment.status === 'success' || payment.status === 'processing';
        },
      });

      // The receipt screen polls for the authoritative status.
      return intent.id;
    },
    onSuccess: paymentId => {
      dismissRazorpayHost();
      navigation.replace('PaymentResult', { paymentId });
    },
    onError: (error: unknown) => {
      dismissRazorpayHost();
      if (isRazorpayUserCancelled(error)) return;
      Alert.alert(
        t.bills.paymentFailed,
        getBillPaymentsErrorMessage(error, t.bills.couldNotComplete),
      );
    },
  });

  const styles = useMemo(
    () =>
      StyleSheet.create({
        row: {
          flexDirection: 'row',
          justifyContent: 'space-between',
          paddingVertical: theme.spacing.sm,
        },
        label: { ...theme.typography.bodyMedium, color: theme.colors.textSecondary },
        value: { ...theme.typography.bodyMedium, color: theme.colors.textPrimary },
        divider: {
          height: 1,
          backgroundColor: theme.colors.borderLight,
          marginVertical: theme.spacing.md,
        },
        totalLabel: { ...theme.typography.headingSmall, color: theme.colors.textPrimary },
        totalValue: { ...theme.typography.headingSmall, color: theme.colors.primary },
        secure: {
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'center',
          gap: theme.spacing.xs,
          marginTop: theme.spacing.lg,
        },
        secureText: { ...theme.typography.bodySmall, color: theme.colors.textSecondary },
      }),
    [theme],
  );

  const total = billAmount + convenienceFee;
  const canPay = billAmount > 0 && !payMutation.isPending;

  return (
    <BillPaymentScreenLayout
      title={t.bills.confirmPayment}
      showBack
      onBack={() => navigation.goBack()}
      loading={isLoading && !bill}
      error={isError}
      errorMessage={t.bills.loadPaymentError}
      onRetry={() => refetch()}
      scroll>
      {bill ? (
        <>
          <View style={styles.row}>
            <Text style={styles.label}>{t.bills.billerName}</Text>
            <Text style={styles.value}>{bill.biller.name}</Text>
          </View>
          {bill.customerName ? (
            <View style={styles.row}>
              <Text style={styles.label}>{t.bills.customer}</Text>
              <Text style={styles.value}>{bill.customerName}</Text>
            </View>
          ) : null}
          <View style={styles.row}>
            <Text style={styles.label}>{t.bills.billAmount}</Text>
            <Text style={styles.value}>{formatRupee(billAmount)}</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>{t.bills.convenienceFee}</Text>
            <Text style={styles.value}>{formatRupee(convenienceFee)}</Text>
          </View>

          <View style={styles.divider} />

          <View style={styles.row}>
            <Text style={styles.totalLabel}>{t.bills.totalPayable}</Text>
            <Text style={styles.totalValue}>{formatRupee(total)}</Text>
          </View>

          <View style={{ marginTop: theme.spacing['2xl'] }}>
            <Button
              title={t.bills.payNow.toUpperCase()}
              loading={payMutation.isPending}
              disabled={!canPay}
              onPress={() => payMutation.mutate()}
            />
          </View>

          <View style={styles.secure}>
            <LockSmallIcon color={theme.colors.textSecondary} />
            <Text style={styles.secureText}>{t.bills.securedRazorpay}</Text>
          </View>
        </>
      ) : null}
    </BillPaymentScreenLayout>
  );
};
