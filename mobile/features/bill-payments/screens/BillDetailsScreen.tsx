import React, { useMemo } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useQuery } from '@tanstack/react-query';

import { useTheme } from '@app/providers/ThemeProvider';
import { useTranslation } from '@/i18n';
import { Button } from '@components/Button';
import { formatBillDate, formatRupee } from '@features/bill-payments/components';
import { BillPaymentScreenLayout } from '@features/bill-payments/components/BillPaymentScreenLayout';
import { BillPaymentsStackParamList } from '@/types/navigation';
import { billPaymentsApi, billPaymentsQueryKeys } from '@services/api/billPayments.api';

type Props = NativeStackScreenProps<BillPaymentsStackParamList, 'BillDetails'>;

function DetailRow({ label, value }: { label: string; value: string }) {
  const { theme } = useTheme();
  return (
    <View style={{ flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 8 }}>
      <Text style={{ ...theme.typography.bodyMedium, color: theme.colors.textSecondary }}>{label}</Text>
      <Text style={{ ...theme.typography.bodyMedium, color: theme.colors.textPrimary, maxWidth: '55%', textAlign: 'right' }}>
        {value}
      </Text>
    </View>
  );
}

export const BillDetailsScreen: React.FC<Props> = ({ navigation, route }) => {
  const { requestId } = route.params;
  const { theme } = useTheme();
  const { t } = useTranslation();

  const { data: bill, isLoading, isError, refetch } = useQuery({
    queryKey: billPaymentsQueryKeys.billRequest(requestId),
    queryFn: () => billPaymentsApi.getBillRequest(requestId),
    retry: 2,
  });

  const details = (bill?.billDetails ?? {}) as Record<string, unknown>;
  const breakdown = (bill?.breakdown ?? details.breakdown) as
    | Array<{ label?: string; name?: string; amount?: number }>
    | Record<string, number>
    | null;

  const styles = useMemo(
    () =>
      StyleSheet.create({
        amountCard: {
          backgroundColor: theme.colors.backgroundSecondary,
          borderRadius: theme.radius.xl,
          padding: theme.spacing.lg,
          marginBottom: theme.spacing.lg,
          alignItems: 'center',
        },
        amountLabel: { ...theme.typography.bodySmall, color: theme.colors.textSecondary },
        amountValue: {
          ...theme.typography.headingLarge,
          color: theme.colors.textPrimary,
          marginTop: theme.spacing.xs,
        },
        sectionTitle: {
          ...theme.typography.headingSmall,
          color: theme.colors.textPrimary,
          marginBottom: theme.spacing.sm,
          marginTop: theme.spacing.md,
        },
        breakdownRow: {
          flexDirection: 'row',
          justifyContent: 'space-between',
          paddingVertical: 6,
        },
      }),
    [theme],
  );

  const renderBreakdown = () => {
    if (!breakdown) return null;
    if (Array.isArray(breakdown)) {
      return breakdown.map((item, idx) => (
        <View key={idx} style={styles.breakdownRow}>
          <Text style={{ color: theme.colors.textSecondary }}>
            {item.label ?? item.name ?? t.bills.charge}
          </Text>
          <Text style={{ color: theme.colors.textPrimary }}>
            {formatRupee(Number(item.amount ?? 0))}
          </Text>
        </View>
      ));
    }
    return Object.entries(breakdown).map(([key, value]) => (
      <View key={key} style={styles.breakdownRow}>
        <Text style={{ color: theme.colors.textSecondary }}>
          {key.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase())}
        </Text>
        <Text style={{ color: theme.colors.textPrimary }}>{formatRupee(Number(value))}</Text>
      </View>
    ));
  };

  const accountMasked =
    Object.values(bill?.accountHolderData ?? {})
      .find(v => typeof v === 'string' && v.trim())
      ?.replace(/.(?=.{4})/g, '•') ?? '—';

  return (
    <BillPaymentScreenLayout
      title={t.bills.billDetails}
      showBack
      onBack={() => navigation.goBack()}
      loading={isLoading || (!bill && !isError)}
      error={isError}
      errorMessage={t.bills.loadBillError}
      onRetry={() => refetch()}
      scroll>
      {bill ? (
        <>
          <View style={styles.amountCard}>
            <Text style={styles.amountLabel}>{t.bills.amountDue}</Text>
            <Text style={styles.amountValue}>{formatRupee(bill.billAmount ?? 0)}</Text>
          </View>

          <DetailRow label={t.bills.billerName} value={bill.biller.name} />
          {bill.customerName ? <DetailRow label={t.bills.customerName} value={bill.customerName} /> : null}
          <DetailRow label={t.bills.account} value={accountMasked} />
          {bill.dueDate ? <DetailRow label={t.bills.dueDate} value={formatBillDate(bill.dueDate)} /> : null}
          {bill.billNumber ? <DetailRow label={t.bills.billNumber} value={bill.billNumber} /> : null}
          {details.bill_date ? (
            <DetailRow label={t.bills.billDate} value={String(details.bill_date)} />
          ) : null}
          {details.bill_period ? (
            <DetailRow label={t.bills.billPeriod} value={String(details.bill_period)} />
          ) : null}
          {details.minimum_amount_due != null ? (
            <DetailRow label={t.bills.minimumDue} value={formatRupee(Number(details.minimum_amount_due))} />
          ) : null}

          {breakdown ? (
            <>
              <Text style={styles.sectionTitle}>{t.bills.amountBreakdown}</Text>
              {renderBreakdown()}
            </>
          ) : null}

          <View style={{ marginTop: theme.spacing['2xl'] }}>
            <Button
              title={`${t.bills.payNow.toUpperCase()} ${formatRupee(bill.billAmount ?? 0)}`}
              onPress={() => navigation.navigate('ConfirmPayment', { requestId })}
            />
          </View>
        </>
      ) : null}
    </BillPaymentScreenLayout>
  );
};
