import React, { useMemo, useState } from 'react';
import {
  FlatList,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useQuery } from '@tanstack/react-query';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useTheme } from '@app/providers/ThemeProvider';
import { useTranslation } from '@/i18n';
import { GradientScreenHeader } from '@features/profile/components';
import { formatBillDate, formatRupee } from '@features/bill-payments/components';
import { BillPaymentsStackParamList } from '@/types/navigation';
import { billPaymentsApi, billPaymentsQueryKeys } from '@services/api/billPayments.api';

type Props = NativeStackScreenProps<BillPaymentsStackParamList, 'BillPaymentHistory'>;

const FILTERS = ['all', 'success', 'pending', 'failed'] as const;

export const BillPaymentHistoryScreen: React.FC<Props> = ({ navigation }) => {
  const { theme } = useTheme();
  const insets = useSafeAreaInsets();
  const { t } = useTranslation();
  const [filter, setFilter] = useState<(typeof FILTERS)[number]>('all');

  const filterLabels: Record<(typeof FILTERS)[number], string> = {
    all: t.common.all,
    success: t.bills.filterSuccess,
    pending: t.bills.filterPending,
    failed: t.bills.filterFailed,
  };

  const { data } = useQuery({
    queryKey: billPaymentsQueryKeys.history(filter, 1),
    queryFn: () => billPaymentsApi.listHistory(filter, 1, 50),
  });

  const items = data?.data ?? [];

  const styles = useMemo(
    () =>
      StyleSheet.create({
        container: { flex: 1, backgroundColor: theme.colors.backgroundSecondary },
        content: {
          flex: 1,
          backgroundColor: theme.colors.surface,
          borderTopLeftRadius: theme.radius['3xl'],
          borderTopRightRadius: theme.radius['3xl'],
          marginTop: -theme.spacing.lg,
          paddingTop: theme.spacing.lg,
          paddingBottom: insets.bottom,
        },
        tabs: {
          flexDirection: 'row',
          paddingHorizontal: theme.spacing['2xl'],
          gap: theme.spacing.sm,
          marginBottom: theme.spacing.md,
        },
        tab: {
          paddingVertical: theme.spacing.xs,
          paddingHorizontal: theme.spacing.md,
          borderRadius: theme.radius.full,
          backgroundColor: theme.colors.backgroundSecondary,
        },
        tabActive: { backgroundColor: theme.colors.primary },
        tabText: { ...theme.typography.labelSmall, color: theme.colors.textSecondary },
        tabTextActive: { color: theme.colors.textInverse },
        card: {
          marginHorizontal: theme.spacing['2xl'],
          marginBottom: theme.spacing.sm,
          padding: theme.spacing.md,
          borderRadius: theme.radius.xl,
          backgroundColor: theme.colors.backgroundSecondary,
        },
        title: { ...theme.typography.bodyLarge, color: theme.colors.textPrimary },
        meta: { ...theme.typography.bodySmall, color: theme.colors.textSecondary, marginTop: 4 },
        status: { ...theme.typography.labelSmall, marginTop: 6 },
        empty: { padding: theme.spacing['3xl'], alignItems: 'center' },
      }),
    [theme, insets.bottom],
  );

  const statusColor = (status: string) => {
    if (status === 'success') return theme.colors.success;
    if (status === 'failed') return theme.colors.error;
    return theme.colors.warning;
  };

  return (
    <View style={styles.container}>
      <GradientScreenHeader
        title={t.bills.myBillPayments}
        showBack
        onBack={() => navigation.goBack()}
      />

      <View style={styles.content}>
        <View style={styles.tabs}>
          {FILTERS.map(f => (
            <Pressable
              key={f}
              style={[styles.tab, filter === f && styles.tabActive]}
              onPress={() => setFilter(f)}>
              <Text style={[styles.tabText, filter === f && styles.tabTextActive]}>
                {filterLabels[f]}
              </Text>
            </Pressable>
          ))}
        </View>

        <FlatList
          data={items}
          keyExtractor={item => item.id}
          ListEmptyComponent={
            <View style={styles.empty}>
              <Text style={styles.meta}>{t.bills.noPayments}</Text>
            </View>
          }
          renderItem={({ item }) => (
            <Pressable
              style={styles.card}
              onPress={() => navigation.navigate('PaymentResult', { paymentId: item.id })}>
              <Text style={styles.title}>
                {item.biller.name} · {formatRupee(item.totalAmount)}
              </Text>
              <Text style={styles.meta}>
                {item.accountMasked} • {formatBillDate(item.paidAt ?? item.createdAt)}
              </Text>
              <Text style={[styles.status, { color: statusColor(item.status) }]}>
                {item.status.toUpperCase()}
              </Text>
            </Pressable>
          )}
        />
      </View>
    </View>
  );
};
