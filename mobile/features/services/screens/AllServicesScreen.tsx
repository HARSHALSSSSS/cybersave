import React, { useCallback, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useQuery } from '@tanstack/react-query';
import { ServicesStackParamList } from '@/types/navigation';
import { FEATURED_STATES } from '@constants/featuredStates';
import { useTheme } from '@app/providers/ThemeProvider';
import { useTwoColumnCardWidth } from '@/hooks/useTwoColumnCardWidth';
import { SearchBar } from '@components/SearchBar';
import { ChevronRightIcon } from '@components/icons';
import {
  CategoryBrowseCard,
  FilterChips,
  ServiceHubHeader,
} from '@features/services/components';
import {
  filterFlattenedServices,
  flattenCatalog,
  formatServiceFee,
  getCatalogIconStyle,
  popularCatalogServices,
} from '@features/services/utils/catalogHelpers';
import { countServicesForState } from '@features/services/utils/stateServices';
import { navigateToSubServiceFromStack } from '@features/services/utils/navigateToService';
import { servicesApi, servicesQueryKeys } from '@services/api';
import { useTranslation } from '@/i18n';
import { getScrollBottomPadding } from '@utils/layout';

type Props = NativeStackScreenProps<ServicesStackParamList, 'ServicesMain'>;

const ALL_FILTER = 'all';
const POPULAR_FILTER = 'popular';

export const AllServicesScreen: React.FC<Props> = ({ navigation }) => {
  const { theme } = useTheme();
  const insets = useSafeAreaInsets();
  const { t, format } = useTranslation();
  const [activeFilter, setActiveFilter] = useState(ALL_FILTER);
  const [searchQuery, setSearchQuery] = useState('');
  const stateCardWidth = useTwoColumnCardWidth();

  const { data: catalog = [], isLoading, isError, refetch } = useQuery({
    queryKey: servicesQueryKeys.catalog(),
    queryFn: servicesApi.getServicesCatalog,
    staleTime: 1000 * 60 * 10,
  });

  const filterChips = useMemo(
    () => [
      { id: ALL_FILTER, label: t.common.all },
      { id: POPULAR_FILTER, label: t.home.popular },
      ...catalog.map(item => ({ id: item.id, label: item.name })),
    ],
    [catalog, t.common.all, t.home.popular],
  );

  const flattened = useMemo(() => flattenCatalog(catalog), [catalog]);

  const filteredServices = useMemo(() => {
    let items =
      activeFilter === ALL_FILTER
        ? flattened
        : activeFilter === POPULAR_FILTER
          ? popularCatalogServices(catalog)
          : flattenCatalog(catalog.filter(item => item.id === activeFilter));
    return filterFlattenedServices(items, searchQuery);
  }, [activeFilter, catalog, flattened, searchQuery]);

  const browsingHome = !searchQuery.trim() && activeFilter === ALL_FILTER;

  const styles = useMemo(
    () =>
      StyleSheet.create({
        container: {
          flex: 1,
          backgroundColor: theme.colors.backgroundSecondary,
        },
        content: {
          flex: 1,
          backgroundColor: theme.colors.surface,
          borderTopLeftRadius: theme.radius['3xl'],
          borderTopRightRadius: theme.radius['3xl'],
          marginTop: -theme.spacing.lg,
          paddingTop: theme.spacing.xl,
        },
        searchWrap: {
          paddingHorizontal: theme.spacing['2xl'],
          marginBottom: theme.spacing.sm,
        },
        section: {
          paddingHorizontal: theme.spacing['2xl'],
          marginBottom: theme.spacing['2xl'],
        },
        sectionHeader: {
          flexDirection: 'row',
          alignItems: 'flex-start',
          justifyContent: 'space-between',
          marginBottom: theme.spacing.md,
          gap: theme.spacing.md,
        },
        sectionTitle: {
          ...theme.typography.headingSmall,
          color: theme.colors.textPrimary,
        },
        sectionSubtitle: {
          ...theme.typography.bodySmall,
          color: theme.colors.textSecondary,
          marginTop: 2,
          lineHeight: 18,
        },
        viewAll: {
          ...theme.typography.labelMedium,
          color: theme.colors.primary,
          fontWeight: '700',
          paddingTop: 2,
        },
        statesGrid: {
          flexDirection: 'row',
          flexWrap: 'wrap',
          gap: theme.spacing.md,
        },
        stateCard: {
          borderRadius: theme.radius.xl,
          borderWidth: 1,
          borderColor: theme.colors.border,
          padding: theme.spacing.lg,
          backgroundColor: theme.colors.surface,
          ...theme.shadows.sm,
        },
        stateAccent: {
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          height: 4,
          borderTopLeftRadius: theme.radius.xl,
          borderTopRightRadius: theme.radius.xl,
        },
        stateRow: {
          flexDirection: 'row',
          alignItems: 'center',
          gap: theme.spacing.sm,
        },
        stateCode: {
          width: 44,
          height: 44,
          borderRadius: theme.radius.lg,
          alignItems: 'center',
          justifyContent: 'center',
        },
        stateCodeText: {
          ...theme.typography.labelSmall,
          color: theme.colors.textInverse,
          fontWeight: '800',
        },
        stateBody: { flex: 1, minWidth: 0 },
        stateName: {
          ...theme.typography.labelMedium,
          color: theme.colors.textPrimary,
          fontWeight: '700',
        },
        statePortal: {
          ...theme.typography.caption,
          color: theme.colors.textSecondary,
          marginTop: 2,
        },
        stateTagline: {
          ...theme.typography.caption,
          color: theme.colors.textSecondary,
          marginTop: theme.spacing.sm,
          lineHeight: 16,
        },
        stateMeta: {
          ...theme.typography.caption,
          color: theme.colors.primary,
          fontWeight: '700',
          marginTop: theme.spacing.xs,
        },
        categoryList: { gap: theme.spacing.md },
        center: {
          padding: theme.spacing['3xl'],
          alignItems: 'center',
        },
        message: {
          ...theme.typography.bodyMedium,
          color: theme.colors.textSecondary,
          textAlign: 'center',
          lineHeight: 22,
        },
        resultCount: {
          ...theme.typography.bodySmall,
          color: theme.colors.textSecondary,
          marginBottom: theme.spacing.md,
        },
      }),
    [theme],
  );

  const openCategory = useCallback(
    (categoryId: string) => {
      navigation.navigate('ServiceHub', { categoryId });
    },
    [navigation],
  );

  const openSubService = useCallback(
    (categoryId: string, sub: (typeof flattened)[number]['sub']) => {
      navigateToSubServiceFromStack(navigation, categoryId, sub);
    },
    [navigation],
  );

  const activeChipLabel =
    filterChips.find(chip => chip.id === activeFilter)?.label ?? t.common.all;

  return (
    <View style={styles.container}>
      <ServiceHubHeader
        title={t.services.allServices}
        subtitle={t.services.browseSubtitle}
      />

      <ScrollView
        style={styles.content}
        contentContainerStyle={{ paddingBottom: getScrollBottomPadding(insets) }}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}>
        <View style={styles.searchWrap}>
          <SearchBar
            placeholder={t.services.searchPlaceholder}
            value={searchQuery}
            onChangeText={setSearchQuery}
            returnKeyType="search"
          />
        </View>

        {filterChips.length > 0 ? (
          <FilterChips
            filters={filterChips.map(chip => chip.label)}
            active={activeChipLabel}
            onChange={label => {
              const match = filterChips.find(chip => chip.label === label);
              setActiveFilter(match?.id ?? ALL_FILTER);
            }}
          />
        ) : null}

        {isLoading ? (
          <View style={styles.center}>
            <ActivityIndicator color={theme.colors.primary} />
          </View>
        ) : isError ? (
          <View style={styles.center}>
            <Text style={styles.message}>
              {t.services.loadError}{' '}
              <Text style={{ color: theme.colors.primary }} onPress={() => refetch()}>
                {t.common.retry}
              </Text>
            </Text>
          </View>
        ) : browsingHome ? (
          <>
            <View style={styles.section}>
              <View style={styles.sectionHeader}>
                <View style={{ flex: 1 }}>
                  <Text style={styles.sectionTitle}>{t.services.browseByState}</Text>
                  <Text style={styles.sectionSubtitle}>{t.services.browseByStateHint}</Text>
                </View>
                <Pressable onPress={() => navigation.navigate('AllStates')}>
                  <Text style={styles.viewAll}>{t.home.viewAll}</Text>
                </Pressable>
              </View>
              <View style={styles.statesGrid}>
                {FEATURED_STATES.map(state => {
                  const count = countServicesForState(catalog, state.code);
                  return (
                    <Pressable
                      key={state.code}
                      style={[
                        styles.stateCard,
                        { width: stateCardWidth, backgroundColor: state.bg },
                      ]}
                      onPress={() =>
                        navigation.navigate('StateServices', { stateCode: state.code })
                      }>
                      <View style={[styles.stateAccent, { backgroundColor: state.color }]} />
                      <View style={styles.stateRow}>
                        <View style={[styles.stateCode, { backgroundColor: state.color }]}>
                          <Text style={styles.stateCodeText}>{state.code}</Text>
                        </View>
                        <View style={styles.stateBody}>
                          <Text style={styles.stateName} numberOfLines={1}>
                            {state.name}
                          </Text>
                          <Text style={styles.statePortal} numberOfLines={1}>
                            {state.portal}
                          </Text>
                        </View>
                        <ChevronRightIcon color={theme.colors.textSecondary} />
                      </View>
                      <Text style={styles.stateTagline} numberOfLines={2}>
                        {state.tagline}
                      </Text>
                      <Text style={styles.stateMeta}>
                        {format(t.services.serviceCount, { count })}
                      </Text>
                    </Pressable>
                  );
                })}
              </View>
            </View>

            <View style={styles.section}>
              <View style={styles.sectionHeader}>
                <View style={{ flex: 1 }}>
                  <Text style={styles.sectionTitle}>{t.services.browseByCategory}</Text>
                  <Text style={styles.sectionSubtitle}>{t.services.browseByCategoryHint}</Text>
                </View>
              </View>
              {catalog.length === 0 ? (
                <Text style={styles.message}>{t.services.noServicesAvailable}</Text>
              ) : (
                <View style={styles.categoryList}>
                  {catalog.map((service, index) => {
                    const iconStyle = getCatalogIconStyle(service.slug, index);
                    return (
                      <CategoryBrowseCard
                        key={service.id}
                        title={service.name}
                        description={service.description}
                        meta={format(t.services.serviceCount, {
                          count: service.subServices.length,
                        })}
                        icon={iconStyle.icon}
                        iconColor={iconStyle.iconColor}
                        iconBg={iconStyle.iconBg}
                        onPress={() => openCategory(service.id)}
                      />
                    );
                  })}
                </View>
              )}
            </View>
          </>
        ) : (
          <View style={styles.section}>
            <Text style={styles.resultCount}>
              {format(t.services.resultsCount, { count: filteredServices.length })}
            </Text>
            {filteredServices.length === 0 ? (
              <Text style={styles.message}>
                {searchQuery.trim()
                  ? t.services.noSearchResults
                  : t.services.noServicesAvailable}
              </Text>
            ) : (
              <View style={styles.categoryList}>
                {filteredServices.map(({ main, sub }, index) => {
                  const iconStyle = getCatalogIconStyle(main.slug, index);
                  return (
                    <CategoryBrowseCard
                      key={sub.id}
                      title={sub.displayName}
                      description={sub.shortDescription ?? sub.description ?? main.name}
                      meta={formatServiceFee(sub.baseFee, sub.currency)}
                      icon={iconStyle.icon}
                      iconColor={iconStyle.iconColor}
                      iconBg={iconStyle.iconBg}
                      onPress={() => openSubService(main.id, sub)}
                    />
                  );
                })}
              </View>
            )}
          </View>
        )}
      </ScrollView>
    </View>
  );
};
