import React, { useCallback, useEffect, useMemo } from 'react';
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { CommonActions } from '@react-navigation/native';
import { BottomTabNavigationProp } from '@react-navigation/bottom-tabs';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { MainTabParamList, ServicesStackParamList } from '@/types/navigation';
import { useTheme } from '@app/providers/ThemeProvider';
import { Button } from '@components/Button';
import { CheckCircleIcon } from '@components/icons';
import {
  applicationsApi,
  applicationsQueryKeys,
} from '@services/api';
import {
  refreshApplicationsListQueries,
  syncSubmittedApplicationInCaches,
} from '@features/applications/utils/applicationListCache';
import { isApplicationAlreadySubmitted } from '@features/payments/utils/applicationSubmit';
import { useTranslation } from '@/i18n';
import { getScrollBottomPadding } from '@utils/layout';

type Props = NativeStackScreenProps<
  ServicesStackParamList,
  'ApplicationSuccess'
>;

export const ApplicationSuccessScreen: React.FC<Props> = ({
  navigation,
  route,
}) => {
  const { ref, applicationId } = route.params;
  const { theme } = useTheme();
  const insets = useSafeAreaInsets();
  const { t } = useTranslation();
  const queryClient = useQueryClient();

  const { data: application } = useQuery({
    queryKey: applicationsQueryKeys.detail(applicationId),
    queryFn: () => applicationsApi.getApplicationById(applicationId),
    staleTime: 30_000,
  });

  useEffect(() => {
    void queryClient.prefetchQuery({
      queryKey: applicationsQueryKeys.list('All'),
      queryFn: () => applicationsApi.listApplicationsForFilter('All'),
      staleTime: 30_000,
    });
  }, [queryClient]);

  useEffect(() => {
    if (!application || !isApplicationAlreadySubmitted(application.status)) return;
    syncSubmittedApplicationInCaches(queryClient, application);
    void refreshApplicationsListQueries(queryClient);
  }, [application, queryClient]);

  const styles = useMemo(
    () =>
      StyleSheet.create({
        gradient: {
          flex: 1,
          paddingTop: insets.top + theme.spacing['4xl'],
          paddingHorizontal: theme.spacing['2xl'],
        },
        scrollContent: {
          paddingBottom: getScrollBottomPadding(insets, theme.spacing['3xl']),
        },
        iconWrap: {
          alignSelf: 'center',
          width: 88,
          height: 88,
          borderRadius: theme.radius.full,
          backgroundColor: theme.colors.surface,
          alignItems: 'center',
          justifyContent: 'center',
          marginBottom: theme.spacing.xl,
          ...theme.shadows.lg,
        },
        title: {
          ...theme.typography.headingMedium,
          color: theme.colors.textInverse,
          textAlign: 'center',
          marginBottom: theme.spacing.sm,
        },
        subtitle: {
          ...theme.typography.bodyMedium,
          color: 'rgba(255,255,255,0.9)',
          textAlign: 'center',
          marginBottom: theme.spacing['2xl'],
          lineHeight: 22,
        },
        card: {
          backgroundColor: theme.colors.surface,
          borderRadius: theme.radius.lg,
          padding: theme.spacing.xl,
          marginBottom: theme.spacing.xl,
        },
        refLabel: {
          ...theme.typography.bodySmall,
          color: theme.colors.textSecondary,
        },
        refValue: {
          ...theme.typography.headingSmall,
          color: theme.colors.textPrimary,
          marginTop: 4,
          marginBottom: theme.spacing.lg,
        },
        divider: {
          borderBottomWidth: 1,
          borderStyle: 'dashed',
          borderColor: theme.colors.border,
          marginBottom: theme.spacing.lg,
        },
        row: {
          flexDirection: 'row',
          justifyContent: 'space-between',
          marginBottom: theme.spacing.md,
        },
        rowLabel: {
          ...theme.typography.bodySmall,
          color: theme.colors.textSecondary,
        },
        rowValue: {
          ...theme.typography.labelMedium,
          color: theme.colors.textPrimary,
          maxWidth: '55%',
          textAlign: 'right',
        },
        rowValueGreen: {
          color: '#10B981',
        },
        outlineBtn: {
          marginBottom: theme.spacing.md,
        },
        homeLink: {
          alignItems: 'center',
          paddingVertical: theme.spacing.lg,
        },
        homeText: {
          ...theme.typography.labelMedium,
          color: theme.colors.textInverse,
        },
      }),
    [theme, insets],
  );

  const handleTrack = useCallback(() => {
    const tabNav = navigation.getParent<
      BottomTabNavigationProp<MainTabParamList>
    >();
    tabNav?.navigate('ApplicationsTab', {
      screen: 'ApplicationDetail',
      params: { applicationId },
    });
  }, [applicationId, navigation]);

  const goHome = useCallback(() => {
    navigation.dispatch(
      CommonActions.reset({
        index: 0,
        routes: [{ name: 'ServicesMain' }],
      }),
    );
  }, [navigation]);

  const serviceName =
    application?.serviceVersion.overview?.displayName ??
    application?.serviceVersion.subService.name ??
    t.services.defaultGovernmentService;

  const submittedAt = application?.submittedAt
    ? new Date(application.submittedAt).toLocaleString('en-IN', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
        hour: 'numeric',
        minute: '2-digit',
      })
    : new Date().toLocaleString('en-IN');

  const processingTime =
    application?.serviceVersion.overview?.processingTime ?? t.services.defaultProcessingTime;

  return (
    <LinearGradient
      colors={[theme.colors.gradientHeaderStart, theme.colors.gradientHeaderEnd]}
      style={styles.gradient}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}>
        <View style={styles.iconWrap}>
          <CheckCircleIcon color={theme.colors.primary} size={44} />
        </View>

        <Text style={styles.title}>{t.services.applicationSubmitted}</Text>
        <Text style={styles.subtitle}>{t.services.applicationSubmittedSubtitle}</Text>

        <View style={styles.card}>
          <Text style={styles.refLabel}>{t.services.applicationReferenceNumber}</Text>
          <Text style={styles.refValue}>{ref}</Text>
          <View style={styles.divider} />

          <View style={styles.row}>
            <Text style={styles.rowLabel}>{t.services.serviceNameLabel}</Text>
            <Text style={styles.rowValue}>{serviceName}</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.rowLabel}>{t.services.dateOfSubmission}</Text>
            <Text style={styles.rowValue}>{submittedAt}</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.rowLabel}>{t.services.estCompletion}</Text>
            <Text style={[styles.rowValue, styles.rowValueGreen]}>
              {processingTime}
            </Text>
          </View>
        </View>

        <View style={styles.outlineBtn}>
          <Button
            title={t.services.trackApplication}
            variant="secondary"
            gradient={false}
            onPress={handleTrack}
          />
        </View>

        <Pressable style={styles.homeLink} accessibilityRole="button" onPress={goHome}>
          <Text style={styles.homeText}>{t.services.backToServices}</Text>
        </Pressable>
      </ScrollView>
    </LinearGradient>
  );
};
