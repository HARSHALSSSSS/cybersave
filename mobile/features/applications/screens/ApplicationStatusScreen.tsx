import React, { useMemo } from 'react';
import { ActivityIndicator, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useQuery } from '@tanstack/react-query';
import { ApplicationsStackParamList } from '@/types/navigation';
import { useTranslation } from '@/i18n';
import { useTheme } from '@app/providers/ThemeProvider';
import { Button } from '@components/Button';
import { GradientScreenHeader } from '@features/profile/components/GradientScreenHeader';
import {
  ApplicationStatusBanner,
  StatusTimeline,
} from '@features/applications/components';
import {
  applicationsApi,
  applicationsQueryKeys,
  mapApplicationDetail,
} from '@services/api';
import { getScrollBottomPadding } from '@utils/layout';

type Props = NativeStackScreenProps<
  ApplicationsStackParamList,
  'ApplicationStatus'
>;

export const ApplicationStatusScreen: React.FC<Props> = ({
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

  const application = useMemo(
    () => (data ? mapApplicationDetail(data) : null),
    [data],
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
          paddingHorizontal: theme.spacing['2xl'],
          paddingTop: theme.spacing['2xl'],
        },
        card: {
          borderRadius: theme.radius.lg,
          borderWidth: 1,
          borderColor: theme.colors.border,
          padding: theme.spacing.lg,
          marginBottom: theme.spacing.lg,
        },
        actions: {
          marginBottom: getScrollBottomPadding(insets),
        },
        center: {
          flex: 1,
          alignItems: 'center',
          justifyContent: 'center',
          padding: theme.spacing['3xl'],
        },
        message: {
          ...theme.typography.bodyMedium,
          color: theme.colors.textSecondary,
        },
      }),
    [theme, insets],
  );

  if (isLoading) {
    return (
      <View style={styles.container}>
        <GradientScreenHeader
          title={t.applications.applicationStatus}
          showBack
          onBack={() => navigation.goBack()}
        />
        <View style={styles.center}>
          <ActivityIndicator color={theme.colors.primary} />
        </View>
      </View>
    );
  }

  if (isError || !application?.timeline) {
    return (
      <View style={styles.container}>
        <GradientScreenHeader
          title={t.applications.applicationStatus}
          showBack
          onBack={() => navigation.goBack()}
        />
        <View style={styles.center}>
          <Text style={styles.message}>{t.common.error}</Text>
        </View>
      </View>
    );
  }

  const showCorrections =
    application.backendStatus === 'ACTION_REQUIRED' &&
    Boolean(application.openActionRequest);

  return (
    <View style={styles.container}>
      <GradientScreenHeader
        title={t.applications.applicationStatus}
        showBack
        onBack={() => navigation.goBack()}
      />

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <ApplicationStatusBanner application={application} />

        <View style={styles.card}>
          <StatusTimeline steps={application.timeline} />
        </View>

        {showCorrections ? (
          <View style={styles.actions}>
            <Button
              title={t.applications.submitCorrections}
              onPress={() =>
                navigation.navigate('SubmitCorrections', { applicationId })
              }
            />
          </View>
        ) : (
          <View style={{ marginBottom: getScrollBottomPadding(insets) }} />
        )}
      </ScrollView>
    </View>
  );
};
