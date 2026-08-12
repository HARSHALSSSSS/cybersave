import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  FlatList,
  ListRenderItem,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { BottomTabNavigationProp } from '@react-navigation/bottom-tabs';
import { useQuery } from '@tanstack/react-query';
import { HomeStackParamList, MainTabParamList } from '@/types/navigation';
import { useTranslation, getSchemeFilters, getGovernmentSchemes } from '@/i18n';
import { useTheme } from '@app/providers/ThemeProvider';
import { SearchBar } from '@components/SearchBar';
import { BackIcon } from '@components/icons';
import { FilterChips } from '@features/services/components';
import { PromotionalBannerCard } from '@features/home/components/PromotionalBannerCard';
import { navigateToSubServiceById } from '@features/services/utils/navigateToService';
import {
  homeBannersApi,
  homeBannersQueryKeys,
  servicesApi,
  servicesQueryKeys,
  type MainServiceCatalogItem,
} from '@services/api';
import { getScrollBottomPadding } from '@utils/layout';

type Scheme = ReturnType<typeof getGovernmentSchemes>[number];
type SchemeFilter = 'All' | 'Agriculture' | 'Education' | 'Health' | 'Housing';

const SCHEME_SERVICE_HINTS: Record<string, string[]> = {
  '1': ['income-certificate', 'certificate'],
  '2': ['income-certificate', 'welfare', 'social'],
  '3': ['pm-awas', 'pmay', 'awas'],
  '4': ['pm-kisan', 'kisan'],
  '5': ['scholarship'],
};

function findCatalogService(
  catalogue: MainServiceCatalogItem[],
  hints: string[],
): { categoryId: string; optionId: string } | null {
  for (const main of catalogue) {
    for (const sub of main.subServices) {
      if (
        hints.some(
          hint => sub.slug.includes(hint) || main.slug.includes(hint),
        )
      ) {
        return { categoryId: main.id, optionId: sub.id };
      }
    }
  }
  return null;
}

type Props = NativeStackScreenProps<HomeStackParamList, 'GovernmentSchemes'>;

export const GovernmentSchemesScreen: React.FC<Props> = ({ navigation }) => {
  const { theme } = useTheme();
  const insets = useSafeAreaInsets();
  const { t } = useTranslation();
  const schemes = useMemo(() => getGovernmentSchemes(t), [t]);
  const schemeFilters = useMemo(() => getSchemeFilters(t), [t]);
  const filterKeyMap = useMemo(() => {
    const keys: SchemeFilter[] = [
      'All',
      'Agriculture',
      'Education',
      'Health',
      'Housing',
    ];
    return Object.fromEntries(
      schemeFilters.map((label, index) => [label, keys[index]]),
    ) as Record<string, SchemeFilter>;
  }, [schemeFilters]);
  const [activeFilter, setActiveFilter] = useState(schemeFilters[0]);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    setActiveFilter(schemeFilters[0]);
  }, [schemeFilters]);

  const { data: schemeBanners = [] } = useQuery({
    queryKey: homeBannersQueryKeys.list('schemes'),
    queryFn: () => homeBannersApi.getHomeBanners('schemes'),
  });

  const { data: homeBanners = [] } = useQuery({
    queryKey: homeBannersQueryKeys.list('home'),
    queryFn: () => homeBannersApi.getHomeBanners('home'),
  });

  const { data: catalogue = [] } = useQuery({
    queryKey: servicesQueryKeys.catalog(),
    queryFn: servicesApi.getServicesCatalog,
  });

  const linkedBanners = schemeBanners.length > 0 ? schemeBanners : homeBanners;

  const goToServiceDetail = useCallback(
    (categoryId: string, optionId: string) => {
      navigateToSubServiceById(
        navigation.getParent<BottomTabNavigationProp<MainTabParamList>>(),
        catalogue,
        categoryId,
        optionId,
      );
    },
    [catalogue, navigation],
  );

  const filtered = useMemo(() => {
    let results = [...schemes];
    const filterKey = filterKeyMap[activeFilter] ?? 'All';
    if (filterKey !== 'All') {
      results = results.filter(s => s.category === filterKey);
    }
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      results = results.filter(
        s =>
          s.title.toLowerCase().includes(q) ||
          s.ministry.toLowerCase().includes(q) ||
          s.description.toLowerCase().includes(q),
      );
    }
    return results;
  }, [activeFilter, filterKeyMap, schemes, searchQuery]);

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
          borderRadius: theme.radius.full,
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
        searchWrapper: {
          paddingHorizontal: theme.spacing['2xl'],
          marginBottom: theme.spacing.lg,
        },
        bannerSection: {
          paddingHorizontal: theme.spacing['2xl'],
          gap: theme.spacing.md,
          marginBottom: theme.spacing.lg,
        },
        sectionLabel: {
          ...theme.typography.labelLarge,
          color: theme.colors.textPrimary,
          paddingHorizontal: theme.spacing['2xl'],
          marginBottom: theme.spacing.sm,
        },
        schemeCard: {
          backgroundColor: theme.colors.surface,
          borderRadius: theme.radius['2xl'],
          padding: theme.spacing['2xl'],
          marginHorizontal: theme.spacing['2xl'],
          marginBottom: theme.spacing.md,
          borderWidth: 1,
          borderColor: theme.colors.border,
          ...theme.shadows.card,
        },
        schemeTitle: {
          ...theme.typography.labelLarge,
          color: theme.colors.textPrimary,
        },
        schemeMinistry: {
          ...theme.typography.bodySmall,
          color: theme.colors.textSecondary,
          marginTop: theme.spacing.xxs,
        },
        schemeDesc: {
          ...theme.typography.bodySmall,
          color: theme.colors.textSecondary,
          marginTop: theme.spacing.md,
          lineHeight: 20,
        },
        schemeFooter: {
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginTop: theme.spacing.lg,
        },
        eligibilityBadge: {
          paddingHorizontal: theme.spacing.md,
          paddingVertical: theme.spacing.xs,
          borderRadius: theme.radius.full,
        },
        eligibilityText: {
          ...theme.typography.caption,
          letterSpacing: 0,
          fontSize: 11,
          fontWeight: '600',
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
        },
        listContent: {
          paddingBottom: getScrollBottomPadding(insets),
        },
      }),
    [theme, insets],
  );

  const handleSchemePress = useCallback(
    (schemeId: string) => {
      const hints = SCHEME_SERVICE_HINTS[schemeId];
      if (hints?.length && catalogue.length > 0) {
        const match = findCatalogService(catalogue, hints);
        if (match) {
          goToServiceDetail(match.categoryId, match.optionId);
          return;
        }
      }
      navigation
        .getParent<BottomTabNavigationProp<MainTabParamList>>()
        ?.navigate('ServicesTab', { screen: 'ServicesMain' });
    },
    [catalogue, goToServiceDetail, navigation],
  );

  const renderItem: ListRenderItem<Scheme> = useCallback(
    ({ item }) => (
      <View style={styles.schemeCard}>
        <Text style={styles.schemeTitle}>{item.title}</Text>
        <Text style={styles.schemeMinistry}>{item.ministry}</Text>
        <Text style={styles.schemeDesc}>{item.description}</Text>
        <View style={styles.schemeFooter}>
          <View
            style={[
              styles.eligibilityBadge,
              { backgroundColor: item.eligibilityBg },
            ]}>
            <Text
              style={[styles.eligibilityText, { color: item.eligibilityColor }]}>
              {item.eligibility}
            </Text>
          </View>
          <Pressable
            style={styles.applyButton}
            accessibilityRole="button"
            onPress={() => handleSchemePress(item.id)}>
            <Text style={styles.applyText}>{t.common.learnMore}</Text>
          </Pressable>
        </View>
      </View>
    ),
    [handleSchemePress, styles, t.common.learnMore],
  );

  const listHeader = useMemo(
    () => (
      <>
        <View style={styles.searchWrapper}>
          <SearchBar
            placeholder={t.home.searchSchemes}
            value={searchQuery}
            onChangeText={setSearchQuery}
            returnKeyType="search"
          />
        </View>

        <FilterChips
          filters={schemeFilters}
          active={activeFilter}
          onChange={setActiveFilter}
        />

        {linkedBanners.length > 0 ? (
          <>
            <Text style={styles.sectionLabel}>{t.home.featuredSchemes}</Text>
            <View style={styles.bannerSection}>
              {linkedBanners.map(banner => (
                <PromotionalBannerCard
                  key={banner.id}
                  banner={banner}
                  onPress={() =>
                    goToServiceDetail(banner.mainServiceId, banner.subServiceId)
                  }
                />
              ))}
            </View>
            <Text style={styles.sectionLabel}>{t.home.allSchemes}</Text>
          </>
        ) : null}
      </>
    ),
    [
      activeFilter,
      goToServiceDetail,
      linkedBanners,
      schemeFilters,
      searchQuery,
      styles.bannerSection,
      styles.searchWrapper,
      styles.sectionLabel,
      t.home.allSchemes,
      t.home.featuredSchemes,
      t.home.searchSchemes,
    ],
  );

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={[theme.colors.gradientHeaderStart, theme.colors.gradientHeaderEnd]}
        style={styles.headerGradient}>
        <View style={styles.headerRow}>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={t.accessibility.goBack}
            onPress={() => navigation.goBack()}
            style={styles.backButton}>
            <BackIcon color={theme.colors.textPrimary} />
          </Pressable>
          <Text style={styles.headerTitle}>{t.home.schemesTitle}</Text>
        </View>
      </LinearGradient>

      <View style={styles.content}>
        <FlatList
          style={{ flex: 1 }}
          data={filtered}
          renderItem={renderItem}
          keyExtractor={item => item.id}
          ListHeaderComponent={listHeader}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
          contentContainerStyle={styles.listContent}
          ListEmptyComponent={
            <Text
              style={{
                ...theme.typography.bodyMedium,
                color: theme.colors.textSecondary,
                textAlign: 'center',
                marginTop: theme.spacing['3xl'],
                paddingHorizontal: theme.spacing['2xl'],
              }}>
              {searchQuery.trim()
                ? t.services.noSearchResults
                : t.home.noServices}
            </Text>
          }
        />
      </View>
    </View>
  );
};
