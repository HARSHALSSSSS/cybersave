import React, { useCallback, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
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
import { useTheme } from '@app/providers/ThemeProvider';
import { SearchBar } from '@components/SearchBar';
import {
  InfoBanner,
  ServiceHelpButton,
  ServiceHubHeader,
  ServiceOptionCard,
} from '@features/services/components';
import { goBackInServicesStack } from '@features/services/utils/navigateToService';
import {
  formatServiceFee,
  getCatalogIconStyle,
  isCertificateHub,
} from '@features/services/utils/catalogHelpers';
import { navigateToSubServiceFromStack } from '@features/services/utils/navigateToService';
import { servicesApi, servicesQueryKeys } from '@services/api';
import { useTranslation } from '@/i18n';
import { getScrollBottomPadding } from '@utils/layout';

type Props = NativeStackScreenProps<ServicesStackParamList, 'ServiceHub'>;

export const ServiceHubScreen: React.FC<Props> = ({ navigation, route }) => {
  const { categoryId } = route.params;
  const { theme } = useTheme();
  const insets = useSafeAreaInsets();
  const { t, format } = useTranslation();
  const [searchQuery, setSearchQuery] = useState('');

  const { data: catalog = [], isLoading } = useQuery({
    queryKey: servicesQueryKeys.catalog(),
    queryFn: servicesApi.getServicesCatalog,
  });

  const category = catalog.find(item => item.id === categoryId);
  const categoryIndex = catalog.findIndex(item => item.id === categoryId);

  const options = useMemo(() => {
    const all = category?.subServices ?? [];
    if (!searchQuery.trim()) return all;
    const q = searchQuery.toLowerCase();
    return all.filter(
      o =>
        o.displayName.toLowerCase().includes(q) ||
        o.name.toLowerCase().includes(q) ||
        (o.shortDescription?.toLowerCase().includes(q) ?? false),
    );
  }, [category, searchQuery]);

  const iconStyle = getCatalogIconStyle(category?.slug ?? '', categoryIndex);

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
          paddingTop: theme.spacing['2xl'],
          paddingHorizontal: theme.spacing['2xl'],
        },
        searchWrap: {
          marginBottom: theme.spacing.lg,
        },
        sectionTitle: {
          ...theme.typography.headingSmall,
          color: theme.colors.textPrimary,
          marginBottom: theme.spacing.md,
        },
        grid: {
          flexDirection: 'row',
          flexWrap: 'wrap',
          gap: theme.spacing.md,
          paddingBottom: getScrollBottomPadding(insets),
        },
        helpBtn: {
          width: 40,
          height: 40,
          alignItems: 'center',
          justifyContent: 'center',
        },
        center: {
          padding: theme.spacing['3xl'],
          alignItems: 'center',
        },
      }),
    [theme, insets],
  );

  const handleOptionPress = useCallback(
    (option: (typeof options)[number]) => {
      navigateToSubServiceFromStack(navigation, categoryId, option);
    },
    [categoryId, navigation],
  );

  if (isLoading) {
    return (
      <View style={[styles.container, styles.center]}>
        <ActivityIndicator color={theme.colors.primary} />
      </View>
    );
  }

  if (!category) {
    return (
      <View style={styles.container}>
        <ServiceHubHeader
          title={t.common.governmentServices}
          subtitle={t.common.error}
          showBack
          onBack={() => goBackInServicesStack(navigation)}
        />
        <View style={[styles.center, { flex: 1, justifyContent: 'center' }]}>
          <Text style={{ color: theme.colors.textSecondary, textAlign: 'center' }}>
            {t.common.noData}
          </Text>
        </View>
      </View>
    );
  }

  const isCertificates = isCertificateHub(
    category.slug,
    category.subServices.length,
  );

  return (
    <View style={styles.container}>
      <ServiceHubHeader
        title={category.name}
        subtitle={category.description ?? t.common.governmentServices}
        showBack
        onBack={() => goBackInServicesStack(navigation)}
        rightAction={
          <Pressable
            style={styles.helpBtn}
            accessibilityRole="button"
            onPress={() =>
              Alert.alert(
                t.common.help,
                format(t.home.helpWithCategory, { category: category.name }),
              )
            }>
            <ServiceHelpButton />
          </Pressable>
        }
      />

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {category.description ? (
          <InfoBanner text={category.description} type="info" />
        ) : null}

        <View style={styles.searchWrap}>
          <SearchBar
            placeholder={
              isCertificates
                ? t.services.searchCertificates
                : t.home.search
            }
            value={searchQuery}
            onChangeText={setSearchQuery}
            returnKeyType="search"
          />
        </View>

        <Text style={styles.sectionTitle}>
          {isCertificates ? t.common.popularCertificates : t.common.availableServices}
        </Text>

        <View style={styles.grid}>
          {options.length === 0 ? (
            <Text
              style={{
                ...theme.typography.bodyMedium,
                color: theme.colors.textSecondary,
                textAlign: 'center',
                width: '100%',
                paddingVertical: theme.spacing['3xl'],
              }}>
              {searchQuery.trim()
                ? t.services.noSearchResults
                : t.services.noServicesAvailable}
            </Text>
          ) : (
            options.map(option => (
              <ServiceOptionCard
                key={option.id}
                title={option.displayName}
                description={option.shortDescription ?? option.description ?? ''}
                icon={iconStyle.icon}
                iconColor={iconStyle.iconColor}
                iconBg={iconStyle.iconBg}
                processingDays={option.processingTime ?? undefined}
                fee={formatServiceFee(option.baseFee, option.currency)}
                variant={isCertificates ? 'certificate' : 'grid'}
                onPress={() => handleOptionPress(option)}
              />
            ))
          )}
        </View>
      </ScrollView>
    </View>
  );
};
