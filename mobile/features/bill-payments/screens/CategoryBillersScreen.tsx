import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useQuery, useQueryClient } from '@tanstack/react-query';

import { useTheme } from '@app/providers/ThemeProvider';
import { useTranslation } from '@/i18n';
import { SearchBar } from '@components/SearchBar';
import { ChevronRightIcon } from '@components/icons';
import { billerInitial } from '@features/bill-payments/components';
import { BillPaymentScreenLayout } from '@features/bill-payments/components/BillPaymentScreenLayout';
import { BillPaymentsStackParamList } from '@/types/navigation';
import { billPaymentsApi, billPaymentsQueryKeys } from '@services/api/billPayments.api';
import {
  BBPS_CATALOG_STALE_MS,
  prefetchBillerDetail,
} from '@features/bill-payments/utils/billPaymentsPrefetch';

type Props = NativeStackScreenProps<BillPaymentsStackParamList, 'CategoryBillers'>;

export const CategoryBillersScreen: React.FC<Props> = ({ navigation, route }) => {
  const { category, categoryName } = route.params;
  const { theme } = useTheme();
  const { t, format } = useTranslation();
  const queryClient = useQueryClient();
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const safeCategoryName = categoryName ?? t.bills.billerName;

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(search.trim()), 150);
    return () => clearTimeout(timer);
  }, [search]);

  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: billPaymentsQueryKeys.billers(category, debouncedSearch),
    queryFn: () =>
      billPaymentsApi.listBillers({
        category,
        search: debouncedSearch || undefined,
        limit: 100,
      }),
    retry: 2,
    staleTime: BBPS_CATALOG_STALE_MS,
    placeholderData: previous => previous,
  });

  const billers = data?.data ?? [];

  const styles = useMemo(
    () =>
      StyleSheet.create({
        subtitle: {
          ...theme.typography.bodyMedium,
          color: theme.colors.textSecondary,
          marginBottom: theme.spacing.lg,
        },
        row: {
          flexDirection: 'row',
          alignItems: 'center',
          paddingVertical: theme.spacing.md,
          borderBottomWidth: 1,
          borderBottomColor: theme.colors.borderLight,
        },
        avatar: {
          width: 44,
          height: 44,
          borderRadius: theme.radius.lg,
          backgroundColor: theme.colors.primaryMuted,
          alignItems: 'center',
          justifyContent: 'center',
          marginRight: theme.spacing.md,
        },
        avatarText: { ...theme.typography.headingSmall, color: theme.colors.primary },
        info: { flex: 1 },
        name: { ...theme.typography.bodyLarge, color: theme.colors.textPrimary },
        alias: { ...theme.typography.bodySmall, color: theme.colors.textSecondary },
        empty: {
          paddingVertical: theme.spacing['3xl'],
          alignItems: 'center',
        },
        emptyText: { ...theme.typography.bodyMedium, color: theme.colors.textSecondary },
        list: { flex: 1 },
      }),
    [theme],
  );

  const renderItem = useCallback(
    ({ item }: { item: (typeof billers)[number] }) => (
      <Pressable
        style={styles.row}
        onPressIn={() => void prefetchBillerDetail(queryClient, item.id)}
        onPress={() =>
          navigation.navigate('BillerForm', { billerId: item.id, billerName: item.name })
        }>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>{billerInitial(item.name)}</Text>
        </View>
        <View style={styles.info}>
          <Text style={styles.name}>{item.name}</Text>
          {item.aliasName ? <Text style={styles.alias}>{item.aliasName}</Text> : null}
        </View>
        <ChevronRightIcon color={theme.colors.textSecondary} />
      </Pressable>
    ),
    [navigation, queryClient, styles, theme.colors.textSecondary],
  );

  return (
    <BillPaymentScreenLayout
      title={format(t.bills.categoryBillPayment, { category: safeCategoryName })}
      showBack
      onBack={() => navigation.goBack()}
      scroll={false}
      loading={isLoading}
      error={isError}
      errorMessage={t.bills.loadBillersError}
      onRetry={() => refetch()}>
      <View style={{ flex: 1 }}>
        <Text style={styles.subtitle}>
          {format(t.bills.selectProvider, { category: safeCategoryName.toLowerCase() })}
        </Text>
        <SearchBar
          placeholder={format(t.bills.searchProvider, { category: safeCategoryName.toLowerCase() })}
          value={search}
          onChangeText={setSearch}
        />

        <FlatList
          style={styles.list}
          data={billers}
          keyExtractor={item => item.id}
          renderItem={renderItem}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={
            <View style={styles.empty}>
              <Text style={styles.emptyText}>{t.bills.noBillersFound}</Text>
            </View>
          }
          contentContainerStyle={{ paddingTop: theme.spacing.lg, paddingBottom: theme.spacing.lg }}
        />
      </View>
    </BillPaymentScreenLayout>
  );
};
