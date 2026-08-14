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
import { FEATURED_STATES, getFeaturedState, getStateName } from '@constants/featuredStates';
import { useTheme } from '@app/providers/ThemeProvider';
import { SearchBar } from '@components/SearchBar';
import { ServiceHubHeader, ServiceOptionCard } from '@features/services/components';
import {
  filterStateServices,
  servicesForState,
} from '@features/services/utils/stateServices';
import {
  formatServiceFee,
  getCatalogIconStyle,
} from '@features/services/utils/catalogHelpers';
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
  const { t } = useTranslation();
  const [searchQuery, setSearchQuery] = useState('');

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
        },
        heroBadge: {
          width: 48,
          height: 48,
          borderRadius: theme.radius.lg,
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: state?.color ?? theme.colors.primary,
        },
        heroBadgeText: {
          ...theme.typography.labelMedium,
          color: theme.colors.textInverse,
          fontWeight: '700',
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
        countPill: {
          marginTop: theme.spacing.md,
          alignSelf: 'flex-start',
          backgroundColor: theme.colors.surface,
          borderRadius: theme.radius.lg,
          paddingHorizontal: theme.spacing.lg,
          paddingVertical: theme.spacing.sm,
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
        sectionTitle: {
          ...theme.typography.labelMedium,
          color: theme.colors.textSecondary,
          paddingHorizontal: theme.spacing['2xl'],
          marginBottom: theme.spacing.sm,
          textTransform: 'uppercase',
        },
        statesRow: {
          paddingHorizontal: theme.spacing['2xl'],
          paddingBottom: theme.spacing.lg,
          flexDirection: 'row',
          flexWrap: 'wrap',
          gap: theme.spacing.sm,
        },
        stateChip: {
          paddingHorizontal: theme.spacing.md,
          paddingVertical: theme.spacing.sm,
          borderRadius: theme.radius.full,
          borderWidth: 1,
          borderColor: theme.colors.border,
        },
        grid: {
          flexDirection: 'row',
          flexWrap: 'wrap',
          paddingHorizontal: theme.spacing['2xl'],
          gap: theme.spacing.md,
          paddingBottom: getScrollBottomPadding(insets),
        },
        center: { padding: theme.spacing['3xl'], alignItems: 'center' },
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

  return (
    <View style={styles.container}>
      <ServiceHubHeader
        title={`${state?.name ?? getStateName(code)} Services`}
        showBack
        onBack={() => navigation.goBack()}
      />

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.hero}>
          <View style={styles.heroBadge}>
            <Text style={styles.heroBadgeText}>{code.slice(0, 2)}</Text>
          </View>
          <Text style={styles.heroTitle}>{state?.name ?? getStateName(code)}</Text>
          <Text style={styles.heroSub}>
            {state?.tagline ??
              `Government services configured for ${code}. Select a service to apply.`}
          </Text>
          <View style={styles.countPill}>
            <Text style={theme.typography.labelSmall}>
              {items.length} services available
            </Text>
          </View>
        </View>

        <View style={styles.searchWrap}>
          <SearchBar
            placeholder={`Search ${state?.name ?? code} services…`}
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>

        <Text style={styles.sectionTitle}>Other states</Text>
        <View style={styles.statesRow}>
          {FEATURED_STATES.filter(s => s.code !== code).map(s => (
            <Pressable
              key={s.code}
              style={styles.stateChip}
              onPress={() => navigation.replace('StateServices', { stateCode: s.code })}
            >
              <Text style={theme.typography.labelSmall}>{s.name}</Text>
            </Pressable>
          ))}
        </View>

        <Text style={styles.sectionTitle}>{t.common.availableServices}</Text>

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
          <View style={styles.center}>
            <Text style={theme.typography.bodyMedium}>
              No state-specific services found.
            </Text>
          </View>
        ) : (
          <View style={styles.grid}>
            {filtered.map(({ main, sub }) => {
              const iconStyle = getCatalogIconStyle(main.slug, 0);
              return (
                <ServiceOptionCard
                  key={sub.id}
                  title={sub.displayName || sub.name}
                  description={sub.shortDescription || sub.description || main.name}
                  fee={formatServiceFee(sub.baseFee, sub.currency)}
                  processingDays={sub.processingTime ?? undefined}
                  icon={iconStyle.icon}
                  iconColor={iconStyle.iconColor}
                  iconBg={iconStyle.iconBg}
                  variant="certificate"
                  onPress={() => handleServicePress(main.id, sub)}
                />
              );
            })}
          </View>
        )}
      </ScrollView>
    </View>
  );
};
