import React, { useCallback, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Linking,
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
import { FEATURED_STATES, getFeaturedState, getStateName } from '@constants/featuredStates';
import { useTheme } from '@app/providers/ThemeProvider';
import { useTwoColumnCardWidth } from '@/hooks/useTwoColumnCardWidth';
import { SearchBar } from '@components/SearchBar';
import { ChevronRightIcon } from '@components/icons';
import {
  CategoryBrowseCard,
  ServiceHubHeader,
  ServiceIcon,
} from '@features/services/components';
import {
  filterStateServices,
  groupStateServicesByCategory,
  servicesForState,
} from '@features/services/utils/stateServices';
import { getCatalogIconStyle } from '@features/services/utils/catalogHelpers';
import { navigateToSubServiceFromStack } from '@features/services/utils/navigateToService';
import { servicesApi, servicesQueryKeys } from '@services/api';
import { useTranslation } from '@/i18n';
import { getScrollBottomPadding } from '@utils/layout';

type Props = NativeStackScreenProps<ServicesStackParamList, 'StateServices'>;

export const StateServicesScreen: React.FC<Props> = ({ navigation, route }) => {
  const code = route.params.stateCode.toUpperCase();
  const state = getFeaturedState(code);
  const { theme } = useTheme();
  const insets = useSafeAreaInsets();
  const { t, format } = useTranslation();
  const [searchQuery, setSearchQuery] = useState('');
  const stateCardWidth = useTwoColumnCardWidth();

  const { data: catalog = [], isLoading, isError, refetch } = useQuery({
    queryKey: servicesQueryKeys.catalog(),
    queryFn: servicesApi.getServicesCatalog,
    staleTime: 1000 * 60 * 15,
    placeholderData: previous => previous ?? [],
  });

  const items = useMemo(() => servicesForState(catalog, code), [catalog, code]);
  const filtered = useMemo(
    () => filterStateServices(items, searchQuery),
    [items, searchQuery],
  );
  const byCategory = useMemo(
    () => groupStateServicesByCategory(filtered),
    [filtered],
  );
  const otherStates = FEATURED_STATES.filter(s => s.code !== code);

  const styles = useMemo(
    () =>
      StyleSheet.create({
        container: { flex: 1, backgroundColor: theme.colors.backgroundSecondary },
        hero: {
          marginHorizontal: theme.spacing['2xl'],
          marginTop: theme.spacing.md,
          borderRadius: theme.radius.xl,
          padding: theme.spacing['2xl'],
          backgroundColor: state?.bg ?? theme.colors.primaryLight,
          borderWidth: 1,
          borderColor: theme.colors.border,
        },
        heroTop: {
          flexDirection: 'row',
          alignItems: 'flex-start',
          justifyContent: 'space-between',
          gap: theme.spacing.md,
        },
        heroBadge: {
          width: 56,
          height: 56,
          borderRadius: theme.radius.xl,
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: state?.color ?? theme.colors.primary,
        },
        heroBadgeText: {
          ...theme.typography.labelLarge,
          color: theme.colors.textInverse,
          fontWeight: '800',
        },
        countBox: {
          minWidth: 88,
          borderRadius: theme.radius.lg,
          borderWidth: 1,
          borderColor: theme.colors.border,
          backgroundColor: theme.colors.surface,
          paddingHorizontal: theme.spacing.lg,
          paddingVertical: theme.spacing.md,
          alignItems: 'center',
        },
        countValue: {
          ...theme.typography.headingSmall,
          color: theme.colors.textPrimary,
        },
        countLabel: {
          ...theme.typography.caption,
          color: theme.colors.textSecondary,
          marginTop: 2,
        },
        heroTitle: {
          ...theme.typography.headingSmall,
          color: theme.colors.textPrimary,
          marginTop: theme.spacing.md,
        },
        heroSub: {
          ...theme.typography.bodySmall,
          color: theme.colors.textSecondary,
          marginTop: theme.spacing.xs,
          lineHeight: 20,
        },
        portalLink: {
          ...theme.typography.labelSmall,
          color: theme.colors.primary,
          fontWeight: '700',
          marginTop: theme.spacing.sm,
        },
        content: {
          flex: 1,
          backgroundColor: theme.colors.surface,
          borderTopLeftRadius: theme.radius['3xl'],
          borderTopRightRadius: theme.radius['3xl'],
          marginTop: theme.spacing.lg,
          paddingTop: theme.spacing['2xl'],
        },
        searchWrap: {
          paddingHorizontal: theme.spacing['2xl'],
          marginBottom: theme.spacing.lg,
        },
        section: {
          paddingHorizontal: theme.spacing['2xl'],
          marginBottom: theme.spacing['2xl'],
        },
        sectionHeader: {
          marginBottom: theme.spacing.md,
        },
        sectionTitle: {
          ...theme.typography.headingSmall,
          color: theme.colors.textPrimary,
        },
        sectionSubtitle: {
          ...theme.typography.bodySmall,
          color: theme.colors.textSecondary,
          marginTop: 2,
        },
        statesGrid: {
          flexDirection: 'row',
          flexWrap: 'wrap',
          gap: theme.spacing.md,
        },
        stateTile: {
          flexDirection: 'row',
          alignItems: 'center',
          gap: theme.spacing.sm,
          borderRadius: theme.radius.xl,
          borderWidth: 1,
          borderColor: theme.colors.border,
          backgroundColor: theme.colors.surface,
          padding: theme.spacing.md,
          ...theme.shadows.sm,
        },
        stateBadge: {
          width: 40,
          height: 40,
          borderRadius: theme.radius.lg,
          alignItems: 'center',
          justifyContent: 'center',
        },
        stateBadgeText: {
          ...theme.typography.labelSmall,
          color: theme.colors.textInverse,
          fontWeight: '800',
        },
        stateName: {
          ...theme.typography.labelMedium,
          color: theme.colors.textPrimary,
          fontWeight: '700',
        },
        statePortal: {
          ...theme.typography.caption,
          color: theme.colors.textSecondary,
        },
        categoryHeader: {
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: theme.spacing.md,
        },
        categoryTitleRow: {
          flexDirection: 'row',
          alignItems: 'center',
          gap: theme.spacing.sm,
          flex: 1,
        },
        categoryCount: {
          backgroundColor: theme.colors.backgroundSecondary,
          borderRadius: theme.radius.full,
          paddingHorizontal: theme.spacing.sm,
          paddingVertical: 2,
        },
        categoryCountText: {
          ...theme.typography.caption,
          color: theme.colors.textSecondary,
          fontWeight: '600',
        },
        viewCategory: {
          ...theme.typography.labelSmall,
          color: theme.colors.primary,
          fontWeight: '700',
        },
        serviceList: { gap: theme.spacing.md },
        center: { padding: theme.spacing['3xl'], alignItems: 'center' },
        emptyText: {
          ...theme.typography.bodyMedium,
          color: theme.colors.textSecondary,
          textAlign: 'center',
          lineHeight: 22,
        },
        footer: {
          marginHorizontal: theme.spacing['2xl'],
          marginBottom: getScrollBottomPadding(insets),
          borderRadius: theme.radius.xl,
          borderWidth: 1,
          borderColor: theme.colors.border,
          backgroundColor: theme.colors.backgroundSecondary,
          padding: theme.spacing.lg,
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: theme.spacing.md,
        },
        footerText: {
          ...theme.typography.bodySmall,
          color: theme.colors.textSecondary,
          flex: 1,
          lineHeight: 20,
        },
        footerButton: {
          borderRadius: theme.radius.lg,
          borderWidth: 1,
          borderColor: theme.colors.border,
          backgroundColor: theme.colors.surface,
          paddingHorizontal: theme.spacing.lg,
          paddingVertical: theme.spacing.sm,
        },
        footerButtonText: {
          ...theme.typography.labelSmall,
          color: theme.colors.textPrimary,
          fontWeight: '700',
        },
      }),
    [theme, insets, state],
  );

  const handleServicePress = useCallback(
    (mainId: string, sub: (typeof filtered)[number]['sub']) => {
      navigateToSubServiceFromStack(navigation, mainId, sub, {
        stateCode: code,
        stateName: state?.name ?? getStateName(code),
      });
    },
    [navigation, code, state?.name],
  );

  const openPortal = useCallback(() => {
    if (state && 'portalUrl' in state && state.portalUrl) {
      void Linking.openURL(state.portalUrl);
    }
  }, [state]);

  return (
    <View style={styles.container}>
      <ServiceHubHeader
        title={format(t.services.stateServicesTitle, {
          state: state?.name ?? getStateName(code),
        })}
        showBack
        onBack={() => navigation.goBack()}
      />

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.hero}>
          <View style={styles.heroTop}>
            <View style={styles.heroBadge}>
              <Text style={styles.heroBadgeText}>{code.slice(0, 2)}</Text>
            </View>
            <View style={styles.countBox}>
              <Text style={styles.countValue}>{items.length}</Text>
              <Text style={styles.countLabel}>{t.services.servicesAvailable}</Text>
            </View>
          </View>
          <Text style={styles.heroTitle}>{state?.name ?? getStateName(code)}</Text>
          <Text style={styles.heroSub}>
            {state
              ? `${state.tagline} · ${format(t.services.stateHeroHint, { state: state.name })}`
              : format(t.services.stateHeroFallback, { code })}
          </Text>
          {state?.portal && state.portalUrl ? (
            <Pressable onPress={openPortal}>
              <Text style={styles.portalLink}>{state.portal} ↗</Text>
            </Pressable>
          ) : null}
        </View>

        <View style={styles.searchWrap}>
          <SearchBar
            placeholder={format(t.services.searchStateServices, {
              state: state?.name ?? code,
            })}
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>

        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>{t.services.browseOtherStates}</Text>
            <Text style={styles.sectionSubtitle}>{t.services.browseOtherStatesHint}</Text>
          </View>
          <View style={styles.statesGrid}>
            {otherStates.map(s => (
              <Pressable
                key={s.code}
                style={[styles.stateTile, { width: stateCardWidth }]}
                onPress={() => navigation.replace('StateServices', { stateCode: s.code })}>
                <View style={[styles.stateBadge, { backgroundColor: s.color }]}>
                  <Text style={styles.stateBadgeText}>{s.code}</Text>
                </View>
                <View style={{ flex: 1, minWidth: 0 }}>
                  <Text style={styles.stateName} numberOfLines={1}>
                    {s.name}
                  </Text>
                  <Text style={styles.statePortal} numberOfLines={1}>
                    {s.portal}
                  </Text>
                </View>
                <ChevronRightIcon color={theme.colors.textSecondary} />
              </Pressable>
            ))}
          </View>
        </View>

        {isLoading && !catalog.length ? (
          <View style={styles.center}>
            <ActivityIndicator color={theme.colors.primary} />
          </View>
        ) : isError ? (
          <View style={styles.center}>
            <Pressable onPress={() => void refetch()}>
              <Text style={{ color: theme.colors.primary }}>{t.common.retry}</Text>
            </Pressable>
          </View>
        ) : filtered.length === 0 ? (
          <View style={[styles.section, styles.center]}>
            <Text style={styles.emptyText}>
              {items.length === 0 ? t.services.noStateServicesConfigured : t.services.noSearchResults}
            </Text>
          </View>
        ) : (
          Array.from(byCategory.entries()).map(([mainSlug, categoryItems]) => {
            const main = categoryItems[0].main;
            const iconStyle = getCatalogIconStyle(main.slug, 0);
            return (
              <View key={mainSlug} style={styles.section}>
                <View style={styles.categoryHeader}>
                  <View style={styles.categoryTitleRow}>
                    <ServiceIcon name={iconStyle.icon} color={iconStyle.iconColor} size={20} />
                    <Text style={styles.sectionTitle} numberOfLines={1}>
                      {main.name}
                    </Text>
                    <View style={styles.categoryCount}>
                      <Text style={styles.categoryCountText}>{categoryItems.length}</Text>
                    </View>
                  </View>
                  <Pressable onPress={() => navigation.navigate('ServiceHub', { categoryId: main.id })}>
                    <Text style={styles.viewCategory}>{t.services.viewCategory}</Text>
                  </Pressable>
                </View>
                <View style={styles.serviceList}>
                  {categoryItems.map(({ main: m, sub }, index) => {
                    const itemIcon = getCatalogIconStyle(m.slug, index);
                    return (
                      <CategoryBrowseCard
                        key={sub.id}
                        title={sub.displayName || sub.name}
                        description={sub.shortDescription ?? sub.description ?? m.name}
                        meta={sub.processingTime ?? t.services.asPerPortal}
                        icon={itemIcon.icon}
                        iconColor={itemIcon.iconColor}
                        iconBg={itemIcon.iconBg}
                        onPress={() => handleServicePress(m.id, sub)}
                      />
                    );
                  })}
                </View>
              </View>
            );
          })
        )}

        <View style={styles.footer}>
          <Text style={styles.footerText}>{t.services.stateFooterHint}</Text>
          <Pressable style={styles.footerButton} onPress={() => navigation.navigate('ServicesMain')}>
            <Text style={styles.footerButtonText}>{t.services.allServices}</Text>
          </Pressable>
        </View>
      </ScrollView>
    </View>
  );
};
