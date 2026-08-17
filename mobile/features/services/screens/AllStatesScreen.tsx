import React, { useMemo, useState } from 'react';
import {
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
  const cardWidth = useTwoColumnCardWidth();

  const { data: catalog = [] } = useQuery({
    queryKey: servicesQueryKeys.catalog(),
    queryFn: servicesApi.getServicesCatalog,
    staleTime: 1000 * 60 * 15,
    placeholderData: previous => previous ?? [],
  });

  const states = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    if (!query) return FEATURED_STATES;
    return FEATURED_STATES.filter(
      item =>
        item.name.toLowerCase().includes(query) ||
        item.code.toLowerCase().includes(query) ||
        item.portal.toLowerCase().includes(query),
    );
  }, [searchQuery]);

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
          marginBottom: theme.spacing.md,
        },
        hint: {
          ...theme.typography.bodySmall,
          color: theme.colors.textSecondary,
          paddingHorizontal: theme.spacing['2xl'],
          marginBottom: theme.spacing.lg,
          lineHeight: 20,
        },
        grid: {
          flexDirection: 'row',
          flexWrap: 'wrap',
          paddingHorizontal: theme.spacing['2xl'],
          gap: theme.spacing.md,
          paddingBottom: getScrollBottomPadding(insets),
        },
        tile: {
          borderRadius: theme.radius.xl,
          padding: theme.spacing.lg,
          borderWidth: 1,
          borderColor: theme.colors.border,
          backgroundColor: theme.colors.surface,
          ...theme.shadows.sm,
        },
        accent: {
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          height: 4,
          borderTopLeftRadius: theme.radius.xl,
          borderTopRightRadius: theme.radius.xl,
        },
        row: {
          flexDirection: 'row',
          alignItems: 'center',
          gap: theme.spacing.sm,
        },
        badge: {
          width: 44,
          height: 44,
          borderRadius: theme.radius.lg,
          alignItems: 'center',
          justifyContent: 'center',
        },
        badgeText: {
          ...theme.typography.labelSmall,
          color: theme.colors.textInverse,
          fontWeight: '800',
        },
        body: { flex: 1, minWidth: 0 },
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
        tagline: {
          ...theme.typography.caption,
          color: theme.colors.textSecondary,
          marginTop: theme.spacing.sm,
          lineHeight: 16,
        },
        count: {
          ...theme.typography.caption,
          color: theme.colors.primary,
          fontWeight: '700',
          marginTop: theme.spacing.sm,
        },
        viewLink: {
          ...theme.typography.caption,
          color: theme.colors.primary,
          fontWeight: '700',
          marginTop: theme.spacing.xs,
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
        title={t.services.browseByState}
        subtitle={t.services.browseByStateHint}
        showBack
        onBack={() => navigation.goBack()}
      />

      <ScrollView
        style={styles.content}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}>
        <View style={styles.searchWrap}>
          <SearchBar
            placeholder={t.services.searchStates}
            value={searchQuery}
            onChangeText={setSearchQuery}
            returnKeyType="search"
          />
        </View>
        <Text style={styles.hint}>{t.services.browseByStateHint}</Text>

        {states.length === 0 ? (
          <View style={styles.center}>
            <Text style={styles.message}>{t.services.noSearchResults}</Text>
          </View>
        ) : (
          <View style={styles.grid}>
            {states.map(state => {
              const count = countServicesForState(catalog, state.code);
              return (
                <Pressable
                  key={state.code}
                  style={[styles.tile, { width: cardWidth, backgroundColor: state.bg }]}
                  onPress={() => navigation.navigate('StateServices', { stateCode: state.code })}>
                  <View style={[styles.accent, { backgroundColor: state.color }]} />
                  <View style={styles.row}>
                    <View style={[styles.badge, { backgroundColor: state.color }]}>
                      <Text style={styles.badgeText}>{state.code}</Text>
                    </View>
                    <View style={styles.body}>
                      <Text style={styles.name} numberOfLines={2}>
                        {state.name}
                      </Text>
                      <Text style={styles.portal} numberOfLines={1}>
                        {state.portal}
                      </Text>
                    </View>
                    <ChevronRightIcon color={theme.colors.textSecondary} />
                  </View>
                  <Text style={styles.tagline} numberOfLines={2}>
                    {state.tagline}
                  </Text>
                  <Text style={styles.count}>
                    {format(t.services.serviceCount, { count })}
                  </Text>
                  <Text style={styles.viewLink}>{t.services.viewStateServices}</Text>
                </Pressable>
              );
            })}
          </View>
        )}
      </ScrollView>
    </View>
  );
};
