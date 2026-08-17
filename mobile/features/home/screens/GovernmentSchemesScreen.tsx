import React, { useCallback, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  Linking,
  ListRenderItem,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useQuery } from '@tanstack/react-query';
import { SchemeStackParamList } from '@/types/navigation';
import { useTranslation } from '@/i18n';
import { useTheme } from '@app/providers/ThemeProvider';
import { SearchBar } from '@components/SearchBar';
import { FilterChips, ServiceHubHeader } from '@features/services/components';
import { PromotionalBannerCard } from '@features/home/components/PromotionalBannerCard';
import {
  homeBannersApi,
  homeBannersQueryKeys,
  schemesApi,
  schemesQueryKeys,
  type GovernmentScheme,
} from '@services/api';
import { getScrollBottomPadding } from '@utils/layout';

type Props = NativeStackScreenProps<SchemeStackParamList, 'GovernmentSchemes'>;

export const GovernmentSchemesScreen: React.FC<Props> = ({ navigation }) => {
  const { theme } = useTheme();
  const insets = useSafeAreaInsets();
  const { t } = useTranslation();
  const [activeFilter, setActiveFilter] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');

  const {
    data: schemes = [],
    isLoading,
    isError,
    refetch,
  } = useQuery({
    queryKey: schemesQueryKeys.list(),
    queryFn: () => schemesApi.getGovernmentSchemes(),
  });

  const { data: schemeBanners = [] } = useQuery({
    queryKey: homeBannersQueryKeys.list('schemes'),
    queryFn: () => homeBannersApi.getHomeBanners('schemes'),
    staleTime: 1000 * 60 * 10,
  });

  const filters = useMemo(
    () => ['All', ...Array.from(new Set(schemes.map(scheme => scheme.category)))],
    [schemes],
  );

  const filtered = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    return schemes.filter(scheme => {
      const matchesCategory = activeFilter === 'All' || scheme.category === activeFilter;
      const hay = `${scheme.name} ${scheme.ministry ?? ''} ${scheme.description} ${scheme.whoCanApply}`.toLowerCase();
      return matchesCategory && (!query || hay.includes(query));
    });
  }, [activeFilter, schemes, searchQuery]);

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
          paddingHorizontal: theme.spacing['2xl'],
          paddingTop: theme.spacing['2xl'],
        },
        searchWrapper: { marginBottom: theme.spacing.md },
        bannerBlock: { marginBottom: theme.spacing.lg, gap: theme.spacing.md },
        schemeCard: {
          backgroundColor: theme.colors.surface,
          borderRadius: theme.radius.xl,
          padding: theme.spacing.xl,
          marginBottom: theme.spacing.md,
          borderWidth: 1,
          borderColor: theme.colors.border,
        },
        categoryBadge: {
          alignSelf: 'flex-start',
          backgroundColor: '#EFF6FF',
          borderRadius: theme.radius.full,
          paddingHorizontal: theme.spacing.md,
          paddingVertical: 3,
          marginBottom: theme.spacing.sm,
        },
        categoryBadgeText: {
          ...theme.typography.caption,
          color: theme.colors.primary,
          fontWeight: '800',
          letterSpacing: 0.4,
          textTransform: 'uppercase',
        },
        schemeTitle: {
          ...theme.typography.headingSmall,
          color: theme.colors.textPrimary,
        },
        schemeMinistry: {
          ...theme.typography.bodySmall,
          color: theme.colors.textSecondary,
          marginTop: theme.spacing.xxs,
          fontWeight: '600',
        },
        schemeDesc: {
          ...theme.typography.bodySmall,
          color: theme.colors.textSecondary,
          marginTop: theme.spacing.md,
          lineHeight: 20,
          backgroundColor: theme.colors.backgroundSecondary,
          borderRadius: theme.radius.md,
          padding: theme.spacing.md,
        },
        whoCan: {
          ...theme.typography.bodySmall,
          color: theme.colors.textSecondary,
          marginTop: theme.spacing.md,
        },
        whoCanLabel: {
          fontWeight: '700',
          color: theme.colors.textPrimary,
        },
        actions: {
          flexDirection: 'row',
          flexWrap: 'wrap',
          gap: theme.spacing.sm,
          marginTop: theme.spacing.lg,
        },
        detailsButton: {
          paddingHorizontal: theme.spacing.lg,
          paddingVertical: theme.spacing.sm,
          borderRadius: theme.radius.md,
          borderWidth: 1,
          borderColor: theme.colors.primary,
          backgroundColor: theme.colors.surface,
        },
        detailsText: {
          ...theme.typography.labelSmall,
          color: theme.colors.primary,
          fontWeight: '700',
        },
        applyButton: {
          paddingHorizontal: theme.spacing.lg,
          paddingVertical: theme.spacing.sm,
          borderRadius: theme.radius.md,
          backgroundColor: theme.colors.primary,
        },
        applyText: {
          ...theme.typography.labelSmall,
          color: theme.colors.textInverse,
          fontWeight: '700',
        },
        listContent: {
          paddingBottom: getScrollBottomPadding(insets),
        },
        empty: {
          ...theme.typography.bodyMedium,
          color: theme.colors.textSecondary,
          textAlign: 'center',
          marginTop: theme.spacing['3xl'],
        },
        retry: {
          color: theme.colors.primary,
          fontWeight: '700',
        },
      }),
    [theme, insets],
  );

  const openPortal = useCallback((url: string) => {
    void Linking.openURL(url);
  }, []);

  const renderItem: ListRenderItem<GovernmentScheme> = useCallback(
    ({ item }) => (
      <View style={styles.schemeCard}>
        <View style={styles.categoryBadge}>
          <Text style={styles.categoryBadgeText}>{item.category}</Text>
        </View>
        <Text style={styles.schemeTitle}>{item.name}</Text>
        {item.ministry ? <Text style={styles.schemeMinistry}>{item.ministry}</Text> : null}
        <Text style={styles.schemeDesc}>{item.description}</Text>
        <Text style={styles.whoCan}>
          <Text style={styles.whoCanLabel}>{t.home.whoCanApply}: </Text>
          {item.whoCanApply}
        </Text>
        <View style={styles.actions}>
          <Pressable
            style={styles.detailsButton}
            onPress={() => navigation.navigate('SchemeDetail', { schemeId: item.slug })}>
            <Text style={styles.detailsText}>{t.home.viewDetails}</Text>
          </Pressable>
          <Pressable style={styles.applyButton} onPress={() => openPortal(item.officialPortalUrl)}>
            <Text style={styles.applyText}>{item.officialPortalLabel || t.home.officialPortal}</Text>
          </Pressable>
        </View>
      </View>
    ),
    [navigation, openPortal, styles, t.home.officialPortal, t.home.viewDetails, t.home.whoCanApply],
  );

  return (
    <View style={styles.container}>
      <ServiceHubHeader
        title={t.home.schemesTitle}
        subtitle={t.home.schemesSubtitle}
        showBack
        onBack={() => navigation.goBack()}
      />

      <View style={styles.content}>
        <FlatList
          style={{ flex: 1 }}
          data={filtered}
          renderItem={renderItem}
          keyExtractor={item => item.id}
          ListHeaderComponent={
            <>
              {schemeBanners.length > 0 ? (
                <View style={styles.bannerBlock}>
                  {schemeBanners.map(banner => (
                    <PromotionalBannerCard key={banner.id} banner={banner} onPress={() => undefined} />
                  ))}
                </View>
              ) : null}
              <View style={styles.searchWrapper}>
                <SearchBar
                  placeholder={t.home.searchSchemes}
                  value={searchQuery}
                  onChangeText={setSearchQuery}
                  returnKeyType="search"
                />
              </View>
              {filters.length > 1 ? (
                <FilterChips
                  filters={filters.map(item => (item === 'All' ? t.home.filterAll : item))}
                  active={activeFilter === 'All' ? t.home.filterAll : activeFilter}
                  onChange={label =>
                    setActiveFilter(label === t.home.filterAll ? 'All' : label)
                  }
                />
              ) : null}
            </>
          }
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
          contentContainerStyle={styles.listContent}
          ListEmptyComponent={
            isLoading ? (
              <ActivityIndicator color={theme.colors.primary} style={{ marginTop: theme.spacing['3xl'] }} />
            ) : (
              <Text style={styles.empty}>
                {isError ? (
                  <>
                    {t.home.schemesLoadError}{' '}
                    <Text style={styles.retry} onPress={() => void refetch()}>
                      {t.common.retry}
                    </Text>
                  </>
                ) : searchQuery.trim() ? (
                  t.services.noSearchResults
                ) : (
                  t.home.noSchemes
                )}
              </Text>
            )
          }
        />
      </View>
    </View>
  );
};
