import React, { useCallback, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  ListRenderItem,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { BottomTabNavigationProp } from '@react-navigation/bottom-tabs';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useQuery } from '@tanstack/react-query';
import {
  ApplicationsStackParamList,
  MainTabParamList,
} from '@/types/navigation';
import { ApplicationFilter, ApplicationRecord } from '@constants/index';
import { getApplicationFilters, useTranslation } from '@/i18n';
import { useTheme } from '@app/providers/ThemeProvider';
import { SearchBar } from '@components/SearchBar';
import { GradientScreenHeader } from '@features/profile/components/GradientScreenHeader';
import { ApplicationCard } from '@features/applications/components';
import { FilterChips } from '@features/services/components';
import {
  applicationsApi,
  applicationsQueryKeys,
  clientFilterApplications,
  mapApplicationListItem,
} from '@services/api';
import type { BackendApplicationStatus } from '@services/api';
import { getScrollBottomPadding } from '@utils/layout';

type Props = NativeStackScreenProps<ApplicationsStackParamList, 'ApplicationsMain'>;

type ApplicationListRecord = ApplicationRecord & {
  backendStatus?: BackendApplicationStatus | string;
};

const FILTER_KEYS: ApplicationFilter[] = ['All', 'Pending', 'Approved', 'Rejected'];

const RESUME_DRAFT_STATUSES = new Set([
  'DRAFT',
  'FORM_IN_PROGRESS',
  'DOCUMENTS_PENDING',
  'PAYMENT_PENDING',
]);

export const MyApplicationsScreen: React.FC<Props> = ({ navigation }) => {
  const { theme } = useTheme();
  const insets = useSafeAreaInsets();
  const { t } = useTranslation();
  const [activeFilter, setActiveFilter] = useState<ApplicationFilter>('All');
  const [searchQuery, setSearchQuery] = useState('');

  const filterLabels = useMemo(() => getApplicationFilters(t).slice(0, 4), [t]);
  const activeFilterLabel = useMemo(() => {
    const index = FILTER_KEYS.indexOf(activeFilter);
    return filterLabels[index] ?? filterLabels[0];
  }, [activeFilter, filterLabels]);

  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: applicationsQueryKeys.list(activeFilter),
    queryFn: () => applicationsApi.listApplicationsForFilter(activeFilter),
  });

  const applications = useMemo(() => {
    const items = clientFilterApplications(
      data?.data ?? [],
      activeFilter,
      searchQuery,
    );
    return items.map(item => ({
      ...mapApplicationListItem(item),
      backendStatus: item.status,
    }));
  }, [activeFilter, data?.data, searchQuery]);

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
        searchWrap: {
          paddingHorizontal: theme.spacing['2xl'],
          marginBottom: theme.spacing.md,
        },
        list: {
          paddingHorizontal: theme.spacing['2xl'],
          paddingBottom: getScrollBottomPadding(insets),
        },
        empty: {
          ...theme.typography.bodyMedium,
          color: theme.colors.textSecondary,
          textAlign: 'center',
          marginTop: theme.spacing['4xl'],
        },
        center: {
          padding: theme.spacing['3xl'],
          alignItems: 'center',
        },
      }),
    [theme, insets],
  );

  const navigateForApplication = useCallback(
    (app: ApplicationListRecord) => {
      if (app.backendStatus === 'ACTION_REQUIRED') {
        navigation.navigate('ApplicationDetail', { applicationId: app.id });
        return;
      }

      switch (app.status) {
        case 'in_progress': {
          if (
            app.backendStatus &&
            RESUME_DRAFT_STATUSES.has(String(app.backendStatus)) &&
            app.categoryId &&
            app.optionId
          ) {
            const tabNav = navigation.getParent<
              BottomTabNavigationProp<MainTabParamList>
            >();
            if (tabNav) {
              tabNav.navigate('ServicesTab', {
                screen: 'ApplyService',
                params: {
                  categoryId: app.categoryId,
                  optionId: app.optionId,
                  applicationId: app.id,
                },
              });
            } else {
              navigation.navigate('ApplicationDetail', {
                applicationId: app.id,
              });
            }
          } else {
            navigation.navigate('ApplicationStatus', {
              applicationId: app.id,
            });
          }
          break;
        }
        case 'rejected':
          navigation.navigate('ApplicationRejected', {
            applicationId: app.id,
          });
          break;
        case 'approved':
          navigation.navigate('ViewCertificate', {
            applicationId: app.id,
          });
          break;
        case 'pending':
        default:
          navigation.navigate('ApplicationDetail', {
            applicationId: app.id,
          });
          break;
      }
    },
    [navigation],
  );

  const renderItem: ListRenderItem<ApplicationListRecord> = useCallback(
    ({ item }) => (
      <ApplicationCard
        application={item}
        onPress={() => navigateForApplication(item)}
        onDownload={
          item.status === 'approved'
            ? () =>
                navigation.navigate('ViewCertificate', {
                  applicationId: item.id,
                })
            : undefined
        }
      />
    ),
    [navigateForApplication, navigation],
  );

  return (
    <View style={styles.container}>
      <GradientScreenHeader title={t.applications.title} />

      <View style={styles.content}>
        <View style={styles.searchWrap}>
          <SearchBar
            placeholder={t.applications.search}
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>

        <FilterChips
          filters={filterLabels}
          active={activeFilterLabel}
          onChange={label => {
            const index = filterLabels.indexOf(label);
            if (index >= 0) setActiveFilter(FILTER_KEYS[index]);
          }}
        />

        {isLoading ? (
          <View style={styles.center}>
            <ActivityIndicator color={theme.colors.primary} />
          </View>
        ) : isError ? (
          <View style={styles.center}>
            <Text style={styles.empty}>
              {t.common.error}{' '}
              <Text
                style={{ color: theme.colors.primary }}
                onPress={() => refetch()}>
                {t.common.retry}
              </Text>
            </Text>
          </View>
        ) : (
          <FlatList
            style={{ flex: 1 }}
            data={applications}
            renderItem={renderItem}
            keyExtractor={item => item.id}
            contentContainerStyle={styles.list}
            showsVerticalScrollIndicator={false}
            ListEmptyComponent={
              <Text style={styles.empty}>{t.applications.empty}</Text>
            }
          />
        )}
      </View>
    </View>
  );
};
