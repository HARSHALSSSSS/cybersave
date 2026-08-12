import React, { useCallback, useMemo, useState } from 'react';
import {
  SectionList,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { WalletStackParamList } from '@/types/navigation';
import {
  DATE_RANGE_LABEL,
  formatCurrency,
  getWalletTransactions,
  navigateWalletTransaction,
  TransactionFilter,
  WalletTransaction,
} from '@constants/index';
import { useTranslation } from '@/i18n';
import { useTheme } from '@app/providers/ThemeProvider';
import { FilterChips } from '@features/services/components';
import {
  BackIcon,
  BillIcon,
  CalendarIcon,
  PlusIcon,
} from '@components/icons';

type Props = NativeStackScreenProps<WalletStackParamList, 'TransactionHistory'>;

type Section = { title: string; data: WalletTransaction[] };

export const TransactionHistoryScreen: React.FC<Props> = ({ navigation }) => {
  const { theme } = useTheme();
  const insets = useSafeAreaInsets();
  const { t } = useTranslation();
  const transactionFilters = useMemo(
    () => [t.common.all, t.wallet.filterCredits, t.wallet.filterDebits, t.wallet.filterRefunds],
    [t],
  );
  const filterMap = useMemo(
    (): Record<string, TransactionFilter> => ({
      [t.common.all]: 'All',
      [t.wallet.filterCredits]: 'Credits',
      [t.wallet.filterDebits]: 'Debits',
      [t.wallet.filterRefunds]: 'Refunds',
    }),
    [t],
  );
  const reverseFilterMap = useMemo(
    (): Record<TransactionFilter, string> => ({
      All: t.common.all,
      Credits: t.wallet.filterCredits,
      Debits: t.wallet.filterDebits,
      Refunds: t.wallet.filterRefunds,
    }),
    [t],
  );
  const [activeFilter, setActiveFilter] = useState<TransactionFilter>('All');

  const filtered = useMemo(() => {
    const all = getWalletTransactions();
    if (activeFilter === 'All') return all;
    if (activeFilter === 'Credits')
      return all.filter(tx => tx.type === 'credit');
    if (activeFilter === 'Debits')
      return all.filter(tx => tx.type === 'debit');
    return all.filter(tx => tx.type === 'refund');
  }, [activeFilter]);

  const sections = useMemo(() => {
    const groups = new Map<string, WalletTransaction[]>();
    filtered.forEach(tx => {
      const existing = groups.get(tx.dateGroup) ?? [];
      existing.push(tx);
      groups.set(tx.dateGroup, existing);
    });
    return Array.from(groups.entries()).map(([title, data]) => ({
      title,
      data,
    }));
  }, [filtered]);

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
          paddingBottom: theme.spacing['3xl'],
          borderBottomLeftRadius: theme.radius['3xl'],
          borderBottomRightRadius: theme.radius['3xl'],
        },
        headerRow: {
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
          borderRadius: theme.radius.md,
          backgroundColor: theme.colors.surface,
          alignItems: 'center',
          justifyContent: 'center',
        },
        calendarButton: {
          position: 'absolute',
          right: 0,
          width: 40,
          height: 40,
          borderRadius: theme.radius.md,
          backgroundColor: theme.colors.surface,
          alignItems: 'center',
          justifyContent: 'center',
        },
        headerTitle: {
          ...theme.typography.headingMedium,
          color: theme.colors.textInverse,
        },
        content: {
          flex: 1,
          backgroundColor: theme.colors.surface,
          borderTopLeftRadius: theme.radius['3xl'],
          borderTopRightRadius: theme.radius['3xl'],
          marginTop: -theme.spacing.lg,
          paddingTop: theme.spacing['2xl'],
        },
        dateRange: {
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginHorizontal: theme.spacing['2xl'],
          marginBottom: theme.spacing.lg,
          paddingHorizontal: theme.spacing.lg,
          paddingVertical: theme.spacing.md,
          borderRadius: theme.radius.lg,
          borderWidth: 1,
          borderColor: theme.colors.border,
          backgroundColor: theme.colors.surface,
        },
        dateRangeText: {
          ...theme.typography.bodyMedium,
          color: theme.colors.textSecondary,
        },
        sectionHeader: {
          ...theme.typography.caption,
          color: theme.colors.textSecondary,
          paddingHorizontal: theme.spacing['2xl'],
          paddingVertical: theme.spacing.md,
          letterSpacing: 0.8,
        },
        txCard: {
          flexDirection: 'row',
          alignItems: 'center',
          marginHorizontal: theme.spacing['2xl'],
          marginBottom: theme.spacing.md,
          padding: theme.spacing.lg,
          borderRadius: theme.radius.lg,
          borderWidth: 1,
          borderColor: theme.colors.border,
          backgroundColor: theme.colors.surface,
          gap: theme.spacing.md,
        },
        txIcon: {
          width: 44,
          height: 44,
          borderRadius: theme.radius.md,
          alignItems: 'center',
          justifyContent: 'center',
        },
        txContent: {
          flex: 1,
        },
        txTitle: {
          ...theme.typography.labelMedium,
          color: theme.colors.textPrimary,
        },
        txMeta: {
          ...theme.typography.bodySmall,
          color: theme.colors.textSecondary,
          marginTop: 2,
        },
        txAmount: {
          ...theme.typography.labelMedium,
          fontWeight: '700',
        },
        listContent: {
          paddingBottom: insets.bottom + theme.spacing['2xl'],
        },
      }),
    [theme, insets],
  );

  const handlePress = useCallback(
    (tx: WalletTransaction) => {
      navigateWalletTransaction(navigation, tx);
    },
    [navigation],
  );

  const renderItem = ({ item }: { item: WalletTransaction }) => {
    const isCredit = item.amount > 0;
    const iconBg = isCredit ? '#D1FAE5' : '#FEE2E2';
    const amountColor = isCredit ? '#059669' : '#EF4444';

    return (
      <Pressable
        style={styles.txCard}
        accessibilityRole="button"
        onPress={() => handlePress(item)}>
        <View style={[styles.txIcon, { backgroundColor: iconBg }]}>
          {isCredit ? (
            <PlusIcon color="#059669" size={20} />
          ) : (
            <BillIcon color="#EF4444" size={20} />
          )}
        </View>
        <View style={styles.txContent}>
          <Text style={styles.txTitle}>{item.title}</Text>
          <Text style={styles.txMeta}>
            {t.wallet.refPrefix}: {item.ref} • {item.time.includes(',') ? item.time.split(', ')[1] : item.time}
          </Text>
        </View>
        <Text style={[styles.txAmount, { color: amountColor }]}>
          {formatCurrency(item.amount)}
        </Text>
      </Pressable>
    );
  };

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={[theme.colors.gradientHeaderStart, theme.colors.gradientHeaderEnd]}
        style={styles.headerGradient}>
        <View style={styles.headerRow}>
          <Pressable
            style={styles.backButton}
            accessibilityRole="button"
            onPress={() => navigation.goBack()}>
            <BackIcon color={theme.colors.textPrimary} />
          </Pressable>
          <Text style={styles.headerTitle}>{t.wallet.transactionHistory}</Text>
          <Pressable style={styles.calendarButton} accessibilityRole="button">
            <CalendarIcon color={theme.colors.textPrimary} />
          </Pressable>
        </View>
      </LinearGradient>

      <View style={styles.content}>
        <View style={styles.dateRange}>
          <Text style={styles.dateRangeText}>{DATE_RANGE_LABEL}</Text>
          <CalendarIcon color={theme.colors.primary} />
        </View>

        <FilterChips
          filters={transactionFilters}
          active={reverseFilterMap[activeFilter]}
          onChange={label => setActiveFilter(filterMap[label] ?? 'All')}
        />

        <SectionList
          sections={sections}
          keyExtractor={item => item.id}
          renderItem={renderItem}
          renderSectionHeader={({ section: { title } }) => (
            <Text style={styles.sectionHeader}>{title}</Text>
          )}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.listContent}
        />
      </View>
    </View>
  );
};
