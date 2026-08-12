import React, { useCallback, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  ListRenderItem,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { BottomTabNavigationProp } from '@react-navigation/bottom-tabs';
import { useQuery } from '@tanstack/react-query';
import { MainTabParamList, ServicesStackParamList } from '@/types/navigation';
import { useTheme } from '@app/providers/ThemeProvider';
import { SearchBar } from '@components/SearchBar';
import { ChevronRightIcon } from '@components/icons';
import { ServiceHubHeader } from '@features/services/components';
import {
  getCatalogIconStyle,
  searchCatalog,
  type CatalogSearchHit,
} from '@features/services/utils/catalogHelpers';
import { navigateToSubServiceById } from '@features/services/utils/navigateToService';
import { servicesApi, servicesQueryKeys } from '@services/api';
import { useTranslation } from '@/i18n';
import { getScrollBottomPadding } from '@utils/layout';

type Props = NativeStackScreenProps<ServicesStackParamList, 'ServiceSearch'>;

export const ServiceSearchScreen: React.FC<Props> = ({ navigation, route }) => {
  const initialQuery = route.params?.initialQuery ?? '';
  const { theme } = useTheme();
  const insets = useSafeAreaInsets();
  const { t } = useTranslation();
  const [searchQuery, setSearchQuery] = useState(initialQuery);

  const { data: catalog = [], isLoading } = useQuery({
    queryKey: servicesQueryKeys.catalog(),
    queryFn: servicesApi.getServicesCatalog,
  });

  const results = useMemo(
    () => searchCatalog(catalog, searchQuery),
    [catalog, searchQuery],
  );

  const styles = useMemo(
    () =>
      StyleSheet.create({
        container: {
          flex: 1,
          backgroundColor: theme.colors.backgroundSecondary,
        },
        body: {
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
          ...theme.typography.bodyMedium,
          color: theme.colors.textSecondary,
          textAlign: 'center',
          paddingHorizontal: theme.spacing['2xl'],
          marginTop: theme.spacing['4xl'],
        },
        list: {
          paddingHorizontal: theme.spacing['2xl'],
          paddingBottom: getScrollBottomPadding(insets),
        },
        row: {
          flexDirection: 'row',
          alignItems: 'center',
          gap: theme.spacing.md,
          paddingVertical: theme.spacing.lg,
          borderBottomWidth: 1,
          borderBottomColor: theme.colors.borderLight,
        },
        iconWrap: {
          width: 44,
          height: 44,
          borderRadius: theme.radius.full,
          alignItems: 'center',
          justifyContent: 'center',
          flexShrink: 0,
        },
        rowContent: {
          flex: 1,
          minWidth: 0,
        },
        title: {
          ...theme.typography.labelMedium,
          color: theme.colors.textPrimary,
        },
        category: {
          ...theme.typography.bodySmall,
          color: theme.colors.textSecondary,
          marginTop: 2,
        },
        desc: {
          ...theme.typography.caption,
          letterSpacing: 0,
          color: theme.colors.textSecondary,
          marginTop: 4,
        },
        center: {
          flex: 1,
          alignItems: 'center',
          justifyContent: 'center',
        },
      }),
    [theme, insets],
  );

  const handlePress = useCallback(
    (hit: CatalogSearchHit) => {
      navigateToSubServiceById(
        navigation.getParent<BottomTabNavigationProp<MainTabParamList>>(),
        catalog,
        hit.categoryId,
        hit.optionId,
      );
    },
    [catalog, navigation],
  );

  const renderItem: ListRenderItem<CatalogSearchHit> = useCallback(
    ({ item, index }) => {
      const iconStyle = getCatalogIconStyle(item.categorySlug, index);
      return (
        <Pressable
          style={styles.row}
          accessibilityRole="button"
          onPress={() => handlePress(item)}>
          <View style={[styles.iconWrap, { backgroundColor: iconStyle.iconBg }]}>
            <Text style={{ color: iconStyle.iconColor, fontWeight: '700' }}>
              {item.optionName.charAt(0)}
            </Text>
          </View>
          <View style={styles.rowContent}>
            <Text style={styles.title} numberOfLines={2}>
              {item.optionName}
            </Text>
            <Text style={styles.category} numberOfLines={1}>
              {item.categoryName}
            </Text>
            {item.description ? (
              <Text style={styles.desc} numberOfLines={2}>
                {item.description}
              </Text>
            ) : null}
          </View>
          <ChevronRightIcon color={theme.colors.textSecondary} />
        </Pressable>
      );
    },
    [handlePress, styles, theme.colors.textSecondary],
  );

  return (
    <View style={styles.container}>
      <ServiceHubHeader
        title={t.common.search}
        showBack
        onBack={() => navigation.goBack()}
      />

      <View style={styles.body}>
        <View style={styles.searchWrap}>
          <SearchBar
            placeholder={t.home.search}
            value={searchQuery}
            onChangeText={setSearchQuery}
            autoFocus
            returnKeyType="search"
          />
        </View>

        {isLoading ? (
          <View style={styles.center}>
            <ActivityIndicator color={theme.colors.primary} />
          </View>
        ) : searchQuery.trim().length === 0 ? (
          <Text style={styles.hint}>{t.services.searchHint}</Text>
        ) : results.length === 0 ? (
          <Text style={styles.hint}>{t.services.noSearchResults}</Text>
        ) : (
          <FlatList
            data={results}
            keyExtractor={item => `${item.categoryId}-${item.optionId}`}
            renderItem={renderItem}
            contentContainerStyle={styles.list}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
          />
        )}
      </View>
    </View>
  );
};
