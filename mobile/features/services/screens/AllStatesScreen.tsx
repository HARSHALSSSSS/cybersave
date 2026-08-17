import React, { useMemo, useState } from 'react';
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
import {
  FEATURED_STATES,
  getFeaturedState,
  getStateTheme,
} from '@constants/featuredStates';
import { useTheme } from '@app/providers/ThemeProvider';
import { SearchBar } from '@components/SearchBar';
import { ServiceHubHeader } from '@features/services/components';
import { countServicesForState } from '@features/services/utils/stateServices';
import { servicesApi, servicesQueryKeys } from '@services/api';
import { useTranslation } from '@/i18n';
import { getScrollBottomPadding } from '@utils/layout';

type Props = NativeStackScreenProps<ServicesStackParamList, 'AllStates'>;

export const AllStatesScreen: React.FC<Props> = ({ navigation }) => {
  const { theme } = useTheme();
  const insets = useSafeAreaInsets();
  const { t, format } = useTranslation();
  const [searchQuery, setSearchQuery] = useState('');

  const { data: catalog = [] } = useQuery({
    queryKey: servicesQueryKeys.catalog(),
    queryFn: servicesApi.getServicesCatalog,
    staleTime: 1000 * 60 * 15,
    placeholderData: previous => previous ?? [],
  });

  const { data: apiStates = [], isLoading, isError, refetch } = useQuery({
    queryKey: servicesQueryKeys.states(),
    queryFn: servicesApi.getIndianStates,
    staleTime: 1000 * 60 * 60,
  });

  const states = useMemo(() => {
    const featuredCodes = new Set<string>(FEATURED_STATES.map(item => item.code));
    const fromApi = (apiStates.length > 0 ? apiStates : FEATURED_STATES).map(item => ({
      code: item.code,
      name: item.name,
    }));
    const extraFeatured = FEATURED_STATES.filter(
      item => !fromApi.some(state => state.code === item.code),
    ).map(item => ({ code: item.code, name: item.name }));
    const merged = [...fromApi, ...extraFeatured];
    merged.sort((a, b) => {
      const aFeatured = featuredCodes.has(a.code);
      const bFeatured = featuredCodes.has(b.code);
      if (aFeatured && !bFeatured) return -1;
      if (!aFeatured && bFeatured) return 1;
      return a.name.localeCompare(b.name);
    });
    const query = searchQuery.trim().toLowerCase();
    if (!query) return merged;
    return merged.filter(
      item =>
        item.name.toLowerCase().includes(query) || item.code.toLowerCase().includes(query),
    );
  }, [apiStates, searchQuery]);

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
          paddingTop: theme.spacing['2xl'],
        },
        searchWrap: {
          paddingHorizontal: theme.spacing['2xl'],
          marginBottom: theme.spacing.lg,
        },
        hint: {
          ...theme.typography.bodySmall,
          color: theme.colors.textSecondary,
          paddingHorizontal: theme.spacing['2xl'],
          marginBottom: theme.spacing.md,
        },
        grid: {
          flexDirection: 'row',
          flexWrap: 'wrap',
          paddingHorizontal: theme.spacing['2xl'],
          gap: theme.spacing.md,
          paddingBottom: getScrollBottomPadding(insets),
        },
        tile: {
          width: '47.2%',
          borderRadius: theme.radius.xl,
          padding: theme.spacing.lg,
          borderWidth: 1,
          borderColor: theme.colors.border,
        },
        badge: {
          width: 40,
          height: 40,
          borderRadius: theme.radius.lg,
          alignItems: 'center',
          justifyContent: 'center',
          marginBottom: theme.spacing.sm,
        },
        badgeText: {
          ...theme.typography.labelSmall,
          color: theme.colors.textInverse,
          fontWeight: '800',
        },
        name: {
          ...theme.typography.bodyLarge,
          color: theme.colors.textPrimary,
          fontWeight: '700',
        },
        portal: {
          ...theme.typography.caption,
          color: theme.colors.textSecondary,
          marginTop: 2,
        },
        count: {
          ...theme.typography.caption,
          color: theme.colors.primary,
          fontWeight: '700',
          marginTop: theme.spacing.sm,
        },
        center: { padding: theme.spacing['3xl'], alignItems: 'center' },
        message: {
          ...theme.typography.bodyMedium,
          color: theme.colors.textSecondary,
          textAlign: 'center',
        },
      }),
    [theme, insets],
  );

  return (
    <View style={styles.container}>
      <ServiceHubHeader
        title={t.services.allStates}
        subtitle={t.services.allStatesHint}
        showBack
        onBack={() => navigation.goBack()}
      />

      <ScrollView style={styles.content} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
        <View style={styles.searchWrap}>
          <SearchBar
            placeholder={t.services.searchStates}
            value={searchQuery}
            onChangeText={setSearchQuery}
            returnKeyType="search"
          />
        </View>
        <Text style={styles.hint}>{t.services.browseByStateHint}</Text>

        {isLoading && apiStates.length === 0 ? (
          <View style={styles.center}>
            <ActivityIndicator color={theme.colors.primary} />
          </View>
        ) : isError && apiStates.length === 0 && states.length === 0 ? (
          <View style={styles.center}>
            <Text style={styles.message}>
              {t.services.loadError}{' '}
              <Text style={{ color: theme.colors.primary }} onPress={() => void refetch()}>
                {t.common.retry}
              </Text>
            </Text>
          </View>
        ) : states.length === 0 ? (
          <View style={styles.center}>
            <Text style={styles.message}>{t.services.noSearchResults}</Text>
          </View>
        ) : (
          <View style={styles.grid}>
            {states.map(state => {
              const themeColors = getStateTheme(state.code);
              const featured = getFeaturedState(state.code);
              const count = countServicesForState(catalog, state.code);
              return (
                <Pressable
                  key={state.code}
                  style={[styles.tile, { backgroundColor: themeColors.bg }]}
                  onPress={() => navigation.navigate('StateServices', { stateCode: state.code })}>
                  <View style={[styles.badge, { backgroundColor: themeColors.color }]}>
                    <Text style={styles.badgeText}>{state.code}</Text>
                  </View>
                  <Text style={styles.name} numberOfLines={2}>
                    {state.name}
                  </Text>
                  {featured?.portal ? (
                    <Text style={styles.portal} numberOfLines={1}>
                      {featured.portal}
                    </Text>
                  ) : null}
                  <Text style={styles.count}>
                    {format(t.services.serviceCount, { count })}
                  </Text>
                </Pressable>
              );
            })}
          </View>
        )}
      </ScrollView>
    </View>
  );
};
