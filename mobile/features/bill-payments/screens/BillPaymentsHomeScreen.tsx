import React, { useCallback, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Pressable,
  StyleSheet,
  Text,
  useWindowDimensions,
  View,
} from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useQuery } from '@tanstack/react-query';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useTheme } from '@app/providers/ThemeProvider';
import { useTranslation } from '@/i18n';
import { SearchBar } from '@components/SearchBar';
import { ChevronRightIcon } from '@components/icons';
import {
  CategoryIcon,
  formatRupee,
  getCategoryColors,
  billerInitial,
  BillPaymentScreenLayout,
} from '@features/bill-payments/components';
import { BillPaymentsStackParamList } from '@/types/navigation';
import { billPaymentsApi, billPaymentsQueryKeys } from '@services/api/billPayments.api';
import { getScreenBottomPadding, getTwoColumnWidth } from '@utils/layout';

type Props = NativeStackScreenProps<BillPaymentsStackParamList, 'BillPaymentsHome'>;

export const BillPaymentsHomeScreen: React.FC<Props> = ({ navigation }) => {
  const { theme } = useTheme();
  const insets = useSafeAreaInsets();
  const { width: screenWidth } = useWindowDimensions();
  const { t } = useTranslation();
  const [searchQuery, setSearchQuery] = useState('');
  const horizontalPad = theme.spacing['2xl'];
  const gridGap = theme.spacing.md;
  const popularCardWidth = getTwoColumnWidth(screenWidth, horizontalPad, gridGap);

  const {
    data: categories = [],
    isLoading: categoriesLoading,
    isError: categoriesError,
    refetch: refetchCategories,
  } = useQuery({
    queryKey: billPaymentsQueryKeys.categories(),
    queryFn: () => billPaymentsApi.listCategories(),
  });

  const { data: recentBillers = [] } = useQuery({
    queryKey: billPaymentsQueryKeys.recent(),
    queryFn: () => billPaymentsApi.listRecentBillers(),
  });

  const featured = useMemo(
    () => categories.filter(c => c.isFeatured).slice(0, 6),
    [categories],
  );

  const popular = featured.length > 0 ? featured : categories.slice(0, 6);

  const filteredCategories = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return categories;
    return categories.filter(
      cat =>
        cat.displayName.toLowerCase().includes(q) ||
        cat.providerCategory.toLowerCase().includes(q),
    );
  }, [categories, searchQuery]);

  const filteredPopular = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    const source = popular;
    if (!q) return source;
    return source.filter(
      cat =>
        cat.displayName.toLowerCase().includes(q) ||
        cat.providerCategory.toLowerCase().includes(q),
    );
  }, [popular, searchQuery]);

  const styles = useMemo(
    () =>
      StyleSheet.create({
        container: { flex: 1, backgroundColor: theme.colors.backgroundSecondary },
        scrollContent: {
          backgroundColor: theme.colors.surface,
          borderTopLeftRadius: theme.radius['3xl'],
          borderTopRightRadius: theme.radius['3xl'],
          marginTop: -theme.spacing.lg,
          paddingHorizontal: horizontalPad,
          paddingTop: theme.spacing['2xl'],
          paddingBottom: getScreenBottomPadding(insets, theme.spacing['3xl']),
        },
        subtitle: {
          ...theme.typography.bodyMedium,
          color: theme.colors.textSecondary,
          lineHeight: 22,
          marginBottom: theme.spacing.lg,
        },
        sectionTitle: {
          ...theme.typography.headingMedium,
          color: theme.colors.textPrimary,
          marginBottom: theme.spacing.lg,
          marginTop: theme.spacing['2xl'],
        },
        searchWrap: { marginBottom: theme.spacing.md },
        popularGrid: {
          flexDirection: 'row',
          flexWrap: 'wrap',
          gap: gridGap,
        },
        popularCard: {
          width: popularCardWidth,
          minHeight: 112,
          borderRadius: theme.radius.xl,
          padding: theme.spacing.lg,
          alignItems: 'center',
          justifyContent: 'center',
          gap: theme.spacing.sm,
          backgroundColor: theme.colors.backgroundSecondary,
          borderWidth: 1,
          borderColor: theme.colors.border,
        },
        popularIcon: {
          width: 48,
          height: 48,
          borderRadius: theme.radius.lg,
          alignItems: 'center',
          justifyContent: 'center',
        },
        popularLabel: {
          ...theme.typography.labelMedium,
          color: theme.colors.textPrimary,
          textAlign: 'center',
        },
        categoryRow: {
          flexDirection: 'row',
          alignItems: 'center',
          paddingVertical: theme.spacing.lg,
          borderBottomWidth: 1,
          borderBottomColor: theme.colors.borderLight,
        },
        categoryIcon: {
          width: 48,
          height: 48,
          borderRadius: theme.radius.lg,
          alignItems: 'center',
          justifyContent: 'center',
          marginRight: theme.spacing.lg,
        },
        categoryText: { flex: 1 },
        categoryName: {
          ...theme.typography.bodyLarge,
          color: theme.colors.textPrimary,
          fontWeight: '600',
        },
        recentCard: {
          padding: theme.spacing.lg,
          borderRadius: theme.radius.xl,
          backgroundColor: theme.colors.backgroundSecondary,
          marginBottom: theme.spacing.md,
          borderWidth: 1,
          borderColor: theme.colors.border,
        },
        recentTop: { flexDirection: 'row', alignItems: 'center', gap: theme.spacing.md },
        avatar: {
          width: 44,
          height: 44,
          borderRadius: theme.radius.lg,
          backgroundColor: theme.colors.primaryMuted,
          alignItems: 'center',
          justifyContent: 'center',
        },
        avatarText: {
          ...theme.typography.bodyLarge,
          color: theme.colors.primary,
          fontWeight: '700',
        },
        recentMeta: { ...theme.typography.bodySmall, color: theme.colors.textSecondary },
        payAgain: {
          marginTop: theme.spacing.md,
          alignSelf: 'flex-start',
          paddingVertical: theme.spacing.sm,
          paddingHorizontal: theme.spacing.lg,
          borderRadius: theme.radius.full,
          backgroundColor: theme.colors.primary,
        },
        payAgainText: { ...theme.typography.labelMedium, color: theme.colors.textInverse },
        linkRow: {
          flexDirection: 'row',
          justifyContent: 'space-between',
          marginTop: theme.spacing['2xl'],
          paddingTop: theme.spacing.lg,
        },
        link: { ...theme.typography.bodyMedium, color: theme.colors.primary, fontWeight: '600' },
        loading: { paddingVertical: theme.spacing['3xl'], alignItems: 'center' },
        errorBox: {
          padding: theme.spacing.lg,
          borderRadius: theme.radius.xl,
          backgroundColor: theme.colors.errorMuted ?? '#FEE2E2',
          marginBottom: theme.spacing.lg,
        },
        errorText: { ...theme.typography.bodyMedium, color: theme.colors.textPrimary },
        retryBtn: {
          marginTop: theme.spacing.md,
          alignSelf: 'flex-start',
          paddingVertical: theme.spacing.sm,
          paddingHorizontal: theme.spacing.lg,
          borderRadius: theme.radius.full,
          backgroundColor: theme.colors.primary,
        },
        retryText: { ...theme.typography.labelMedium, color: theme.colors.textInverse },
        emptyText: {
          ...theme.typography.bodyMedium,
          color: theme.colors.textSecondary,
          textAlign: 'center',
          paddingVertical: theme.spacing.xl,
        },
      }),
    [theme, insets.bottom, horizontalPad, gridGap, popularCardWidth],
  );

  const openCategory = useCallback(
    (category: string, categoryName: string) => {
      navigation.navigate('CategoryBillers', { category, categoryName });
    },
    [navigation],
  );

  const payAgain = useCallback(
    (billerId: string, accountHolder?: Record<string, string>) => {
      navigation.navigate('BillerForm', {
        billerId,
        accountHolder,
      });
    },
    [navigation],
  );

  return (
    <BillPaymentScreenLayout
      title={t.bills.title}
      showBack
      onBack={() => navigation.goBack()}
      rightAction={
        <Pressable onPress={() => navigation.navigate('BillPaymentHistory')}>
          <Text style={{ color: theme.colors.textInverse, ...theme.typography.bodySmall }}>
            {t.bills.history}
          </Text>
        </Pressable>
      }
      scroll>
      <Text style={styles.subtitle}>
        {t.bills.subtitle}
      </Text>

      {categoriesError ? (
        <View style={styles.errorBox}>
          <Text style={styles.errorText}>
            {t.bills.loadCategoriesError}
          </Text>
          <Pressable style={styles.retryBtn} onPress={() => refetchCategories()}>
            <Text style={styles.retryText}>{t.common.retry}</Text>
          </Pressable>
        </View>
      ) : null}

      <View style={styles.searchWrap}>
        <SearchBar
          placeholder={t.bills.searchBiller}
          value={searchQuery}
          onChangeText={setSearchQuery}
          returnKeyType="search"
        />
      </View>

      <Text style={[styles.sectionTitle, { marginTop: 0 }]}>{t.bills.popularCategories}</Text>
      {categoriesLoading ? (
        <View style={styles.loading}>
          <ActivityIndicator color={theme.colors.primary} />
        </View>
      ) : filteredPopular.length === 0 ? (
        <Text style={styles.emptyText}>
          {searchQuery.trim() ? t.bills.noCategoriesSearch : t.bills.noCategories}
        </Text>
      ) : (
        <View style={styles.popularGrid}>
          {filteredPopular.map(cat => {
            const colors = getCategoryColors(cat.providerCategory);
            return (
              <Pressable
                key={cat.id}
                style={styles.popularCard}
                onPress={() => openCategory(cat.providerCategory, cat.displayName)}>
                <View style={[styles.popularIcon, { backgroundColor: colors.bg }]}>
                  <CategoryIcon
                    icon={cat.icon ?? cat.providerCategory}
                    color={colors.color}
                    size={22}
                  />
                </View>
                <Text style={styles.popularLabel} numberOfLines={2}>
                  {cat.displayName}
                </Text>
              </Pressable>
            );
          })}
        </View>
      )}

      {recentBillers.length > 0 ? (
        <>
          <Text style={styles.sectionTitle}>{t.bills.recentBillers}</Text>
          {recentBillers.map(item => (
            <View key={`${item.billerId}-${item.accountMasked}`} style={styles.recentCard}>
              <View style={styles.recentTop}>
                <View style={styles.avatar}>
                  <Text style={styles.avatarText}>{billerInitial(item.billerName)}</Text>
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.categoryName}>{item.billerName}</Text>
                  <Text style={styles.recentMeta}>
                    {(item.category ?? 'bill').replace(/_/g, ' ')} • {item.accountMasked}
                  </Text>
                  {item.lastPaymentAmount ? (
                    <Text style={styles.recentMeta}>
                      {t.bills.lastPaid} {formatRupee(item.lastPaymentAmount)}
                    </Text>
                  ) : null}
                </View>
              </View>
              <Pressable style={styles.payAgain} onPress={() => payAgain(item.billerId, item.accountHolder)}>
                <Text style={styles.payAgainText}>{t.bills.payAgain}</Text>
              </Pressable>
            </View>
          ))}
        </>
      ) : null}

      <Text style={styles.sectionTitle}>{t.bills.allCategories}</Text>
      {filteredCategories.length === 0 && searchQuery.trim() ? (
        <Text style={styles.emptyText}>{t.bills.noCategoriesSearch}</Text>
      ) : null}
      {filteredCategories.map(cat => {
        const colors = getCategoryColors(cat.providerCategory);
        return (
          <Pressable
            key={cat.id}
            style={styles.categoryRow}
            onPress={() => openCategory(cat.providerCategory, cat.displayName)}>
            <View style={[styles.categoryIcon, { backgroundColor: colors.bg }]}>
              <CategoryIcon icon={cat.icon ?? cat.providerCategory} color={colors.color} />
            </View>
            <View style={styles.categoryText}>
              <Text style={styles.categoryName}>{cat.displayName}</Text>
            </View>
            <ChevronRightIcon color={theme.colors.textSecondary} />
          </Pressable>
        );
      })}

      <View style={styles.linkRow}>
        <Pressable onPress={() => navigation.navigate('SavedBillers')}>
          <Text style={styles.link}>{t.bills.myBillers}</Text>
        </Pressable>
        <Pressable onPress={() => navigation.navigate('BillPaymentHistory')}>
          <Text style={styles.link}>{t.bills.paymentHistory}</Text>
        </Pressable>
      </View>
    </BillPaymentScreenLayout>
  );
};
