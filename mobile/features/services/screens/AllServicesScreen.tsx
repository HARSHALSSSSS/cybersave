import React, { useCallback, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useQuery } from '@tanstack/react-query';
import { ServicesStackParamList } from '@/types/navigation';
import { SERVICE_FILTERS, ServiceFilter } from '@constants/index';
import { useTheme } from '@app/providers/ThemeProvider';
import {
  FilterChips,
  ServiceGridCard,
  ServiceHubHeader,
} from '@features/services/components';
import {
  filterCatalogByChip,
  getCatalogIconStyle,
} from '@features/services/utils/catalogHelpers';
import { servicesApi, servicesQueryKeys } from '@services/api';
import { useTranslation } from '@/i18n';
import { getScrollBottomPadding } from '@utils/layout';

type Props = NativeStackScreenProps<ServicesStackParamList, 'ServicesMain'>;

export const AllServicesScreen: React.FC<Props> = ({ navigation }) => {
  const { theme } = useTheme();
  const insets = useSafeAreaInsets();
  const { t } = useTranslation();
  const [activeFilter, setActiveFilter] = useState<ServiceFilter>('All');

  const { data: catalog = [], isLoading, isError, refetch } = useQuery({
    queryKey: servicesQueryKeys.catalog(),
    queryFn: servicesApi.getServicesCatalog,
  });

  const services = useMemo(
    () => filterCatalogByChip(catalog, activeFilter),
    [catalog, activeFilter],
  );

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
        },
        grid: {
          flexDirection: 'row',
          flexWrap: 'wrap',
          paddingHorizontal: theme.spacing['2xl'],
          gap: theme.spacing.md,
          paddingBottom: getScrollBottomPadding(insets),
        },
        center: {
          padding: theme.spacing['3xl'],
          alignItems: 'center',
        },
        message: {
          ...theme.typography.bodyMedium,
          color: theme.colors.textSecondary,
          textAlign: 'center',
        },
      }),
    [theme, insets],
  );

  const handleServicePress = useCallback(
    (categoryId: string) => {
      navigation.navigate('ServiceHub', { categoryId });
    },
    [navigation],
  );

  return (
    <View style={styles.container}>
      <ServiceHubHeader title={t.services.allServices} />

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <FilterChips
          filters={SERVICE_FILTERS}
          active={activeFilter}
          onChange={setActiveFilter}
        />

        {isLoading ? (
          <View style={styles.center}>
            <ActivityIndicator color={theme.colors.primary} />
          </View>
        ) : isError ? (
          <View style={styles.center}>
            <Text style={styles.message}>
              {t.services.loadError}{' '}
              <Text
                style={{ color: theme.colors.primary }}
                onPress={() => refetch()}>
                {t.common.retry}
              </Text>
            </Text>
          </View>
        ) : services.length === 0 ? (
          <View style={styles.center}>
            <Text style={styles.message}>{t.services.noServicesAvailable}</Text>
          </View>
        ) : (
          <View style={styles.grid}>
            {services.map((service, index) => {
              const iconStyle = getCatalogIconStyle(service.slug, index);
              return (
                <ServiceGridCard
                  key={service.id}
                  label={service.name}
                  icon={iconStyle.icon}
                  iconColor={iconStyle.iconColor}
                  iconBg={iconStyle.iconBg}
                  onPress={() => handleServicePress(service.id)}
                />
              );
            })}
          </View>
        )}
      </ScrollView>
    </View>
  );
};
