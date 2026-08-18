import React, { useCallback, useMemo } from 'react';
import {
  ActivityIndicator,
  ScrollView,
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
import { useTranslation } from '@/i18n';
import { useTheme } from '@app/providers/ThemeProvider';
import { Button } from '@components/Button';
import { GradientScreenHeader } from '@features/profile/components/GradientScreenHeader';
import {
  ApplicationStatusBanner,
  DetailRow,
  DetailSection,
} from '@features/applications/components';
import {
  applicationsApi,
  applicationsQueryKeys,
  mapApplicationDetail,
  servicesApi,
  servicesQueryKeys,
} from '@services/api';
import { navigateToSubServiceById } from '@features/services/utils/navigateToService';
import { getScrollBottomPadding, getTabFooterPadding } from '@utils/layout';

type Props = NativeStackScreenProps<
  ApplicationsStackParamList,
  'ApplicationRejected'
>;

export const ApplicationRejectedScreen: React.FC<Props> = ({
  navigation,
  route,
}) => {
  const { applicationId } = route.params;
  const { theme } = useTheme();
  const insets = useSafeAreaInsets();
  const { t } = useTranslation();

  const { data, isLoading, isError } = useQuery({
    queryKey: applicationsQueryKeys.detail(applicationId),
    queryFn: () => applicationsApi.getApplicationById(applicationId),
  });

  const { data: catalogue = [] } = useQuery({
    queryKey: servicesQueryKeys.catalog(),
    queryFn: servicesApi.getServicesCatalog,
  });

  const application = useMemo(
    () => (data ? mapApplicationDetail(data) : null),
    [data],
  );

  const rejectionReason = useMemo(() => {
    const rejected = data?.statusHistory?.find(h => h.toStatus === 'REJECTED');
    return rejected?.comment ?? t.applications.rejectionDefault;
  }, [data, t.applications.rejectionDefault]);

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
          paddingHorizontal: theme.spacing['2xl'],
          paddingTop: theme.spacing['2xl'],
        },
        reasonBox: {
          borderRadius: theme.radius.lg,
          borderWidth: 1,
          borderColor: '#FECACA',
          backgroundColor: '#FEF2F2',
          padding: theme.spacing.lg,
          marginBottom: theme.spacing.md,
        },
        reasonTitle: {
          ...theme.typography.labelLarge,
          color: '#991B1B',
          marginBottom: theme.spacing.sm,
        },
        reasonText: {
          ...theme.typography.bodyMedium,
          color: '#B91C1C',
          lineHeight: 22,
        },
        docRow: {
          flexDirection: 'row',
          alignItems: 'center',
          gap: theme.spacing.md,
        },
        docIcon: {
          width: 40,
          height: 40,
          borderRadius: theme.radius.md,
          backgroundColor: '#DBEAFE',
          alignItems: 'center',
          justifyContent: 'center',
        },
        docName: {
          ...theme.typography.labelMedium,
          color: theme.colors.textPrimary,
        },
        docSize: {
          ...theme.typography.bodySmall,
          color: theme.colors.textSecondary,
        },
        appealBtn: {
          marginTop: theme.spacing.md,
          marginBottom: getScrollBottomPadding(insets),
        },
      }),
    [theme, insets],
  );

  const handleReApply = useCallback(() => {
    if (!application?.categoryId || !application?.optionId) return;
    navigateToSubServiceById(
      navigation.getParent<BottomTabNavigationProp<MainTabParamList>>(),
      catalogue,
      application.categoryId,
      application.optionId,
    );
  }, [application, catalogue, navigation]);

  if (isLoading) {
    return (
      <View style={styles.container}>
        <GradientScreenHeader title={t.applications.applicationDetail} showBack onBack={() => navigation.goBack()} />
        <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
          <ActivityIndicator color={theme.colors.primary} />
        </View>
      </View>
    );
  }

  if (isError || !application) {
    return (
      <View style={styles.container}>
        <GradientScreenHeader
          title={t.applications.applicationDetail}
          showBack
          onBack={() => navigation.goBack()}
        />
        <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', padding: 24 }}>
          <Text style={{ color: theme.colors.textSecondary, textAlign: 'center' }}>
            {t.services.applicationNotFound}
          </Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <GradientScreenHeader
        title={t.applications.applicationDetail}
        showBack
        onBack={() => navigation.goBack()}
      />

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <ApplicationStatusBanner application={application} />

        <View style={styles.reasonBox}>
          <Text style={styles.reasonTitle}>{t.applications.rejectionReason}</Text>
          <Text style={styles.reasonText}>{rejectionReason}</Text>
        </View>

        <DetailSection title={t.common.summary}>
          <DetailRow label={t.applications.service} value={application.title} />
          <DetailRow
            label={t.applications.submittedDate}
            value={application.submittedFull.split(',')[0]}
          />
          <DetailRow label={t.applications.department} value={application.department} />
        </DetailSection>

        <Button title={t.applications.reApply} onPress={handleReApply} />

        <View style={styles.appealBtn}>
          <Button
            title={t.applications.appealRejection}
            variant="secondary"
            gradient={false}
            onPress={() => {}}
          />
        </View>
      </ScrollView>
    </View>
  );
};
