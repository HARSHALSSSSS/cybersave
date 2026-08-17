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
import { FEATURED_STATES, STATE_PREVIEW_COUNT, getFeaturedState, getStateName } from '@constants/featuredStates';
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
  const { t, format } = useTranslation();
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
  const stateSpecific = useMemo(
    () => filtered.filter(item => item.scope === 'state'),
    [filtered],
  );
  const national = useMemo(
    () => filtered.filter(item => item.scope === 'national'),
    [filtered],
  );
  const otherStates = FEATURED_STATES.filter(s => s.code !== code).slice(0, STATE_PREVIEW_COUNT);

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
        title={format(t.services.stateServicesTitle, {
          state: state?.name ?? getStateName(code),
        })}
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
              {format(t.services.stateServicesCount, { count: items.length })}
            </Text>
          </View>
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

        <View
          style={{
            paddingHorizontal: theme.spacing['2xl'],
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginBottom: theme.spacing.sm,
          }}>
          <Text style={[styles.sectionTitle, { paddingHorizontal: 0, marginBottom: 0 }]}>
            {t.services.otherStates}
          </Text>
          <Pressable onPress={() => navigation.navigate('AllStates')}>
            <Text style={{ ...theme.typography.labelMedium, color: theme.colors.primary, fontWeight: '700' }}>
              {t.home.viewAll}
            </Text>
          </Pressable>
        </View>
        <View style={styles.statesRow}>
          {otherStates.map(s => (
            <Pressable
              key={s.code}
              style={styles.stateChip}
              onPress={() => navigation.replace('StateServices', { stateCode: s.code })}
            >
              <Text style={theme.typography.labelSmall}>{s.name}</Text>
            </Pressable>
          ))}
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
          <View style={styles.center}>
            <Text style={theme.typography.bodyMedium}>{t.services.noStateServices}</Text>
          </View>
        ) : (
          <>
            {stateSpecific.length > 0 ? (
              <>
                <Text style={styles.sectionTitle}>{t.services.stateSpecificServices}</Text>
                <View style={styles.grid}>
                  {stateSpecific.map(({ main, sub }) => {
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
              </>
            ) : null}
            {national.length > 0 ? (
              <>
                <Text style={styles.sectionTitle}>{t.services.allIndiaServices}</Text>
                <View style={styles.grid}>
                  {national.map(({ main, sub }) => {
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
              </>
            ) : null}
          </>
        )}
      </ScrollView>
    </View>
  );
};
