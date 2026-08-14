import React, { useCallback, useMemo } from 'react';
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
import { ApplicationsStackParamList } from '@/types/navigation';
import { ApplicationStatus, STATUS_COLORS } from '@constants/index';
import { useTranslation } from '@/i18n';
import { useTheme } from '@app/providers/ThemeProvider';
import { GradientScreenHeader } from '@features/profile/components/GradientScreenHeader';
import {
  DetailRow,
  DetailSection,
} from '@features/applications/components';
import { useSelector } from 'react-redux';
import type { RootState } from '@app/store';
import {
  applicationsApi,
  applicationsQueryKeys,
  mapApplicationDetail,
} from '@services/api';
import { getScrollBottomPadding } from '@utils/layout';

type Props = NativeStackScreenProps<
  ApplicationsStackParamList,
  'ApplicationDetail'
>;

export const ApplicationDetailScreen: React.FC<Props> = ({
  navigation,
  route,
}) => {
  const { applicationId } = route.params;
  const { theme } = useTheme();
  const insets = useSafeAreaInsets();
  const { t, format } = useTranslation();
  const citizenPhone = useSelector((state: RootState) => state.auth.citizen?.phone);

  const statusLabel = (status: ApplicationStatus) => {
    switch (status) {
      case 'in_progress':
        return t.applications.inProgress;
      case 'approved':
        return t.applications.approved;
      case 'rejected':
        return t.applications.rejected;
      case 'pending':
        return t.applications.pending;
    }
  };

  const { data, isLoading, isError } = useQuery({
    queryKey: applicationsQueryKeys.detail(applicationId),
    queryFn: () => applicationsApi.getApplicationById(applicationId),
  });

  const application = useMemo(
    () => (data ? mapApplicationDetail(data) : null),
    [data],
  );

  const handleDownload = useCallback(() => {
    if (!data || !application) return;

    if (
      application.status === 'approved' ||
      data.status === 'COMPLETED' ||
      data.status === 'APPROVED'
    ) {
      navigation.navigate('ViewCertificate', { applicationId });
      return;
    }

    if (data.payment?.status === 'CAPTURED') {
      Alert.alert(
        t.applications.paymentReceipt,
        format(t.applications.paymentReceiptMessage, {
          amount: Number(data.payment.amount).toFixed(2),
          ref: data.publicRef ?? application.ref,
        }),
      );
      return;
    }

    Alert.alert(t.applications.receiptUnavailable, t.applications.receiptUnavailableMessage);
  }, [application, applicationId, data, navigation, t]);

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
        summaryCard: {
          borderRadius: theme.radius.lg,
          borderWidth: 1,
          borderColor: theme.colors.border,
          padding: theme.spacing.lg,
          marginBottom: theme.spacing.md,
        },
        summaryTop: {
          flexDirection: 'row',
          justifyContent: 'space-between',
          alignItems: 'flex-start',
          gap: theme.spacing.md,
        },
        title: {
          ...theme.typography.labelLarge,
          color: theme.colors.textPrimary,
          flex: 1,
        },
        meta: {
          ...theme.typography.bodySmall,
          color: theme.colors.textSecondary,
          marginTop: 4,
        },
        badge: {
          paddingHorizontal: theme.spacing.md,
          paddingVertical: theme.spacing.xs,
          borderRadius: theme.radius.full,
          backgroundColor: '#DBEAFE',
        },
        badgeText: {
          ...theme.typography.labelSmall,
          fontWeight: '600',
        },
        receiptBtn: {
          paddingVertical: theme.spacing.lg,
          borderRadius: theme.radius.lg,
          borderWidth: 1,
          borderColor: theme.colors.border,
          alignItems: 'center',
          marginBottom: getScrollBottomPadding(insets),
        },
        receiptText: {
          ...theme.typography.labelLarge,
          color: theme.colors.textPrimary,
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
          title={t.applications.applicationDetails}
          showBack
          onBack={() => navigation.goBack()}
        />
        <View style={styles.center}>
          <ActivityIndicator color={theme.colors.primary} />
        </View>
      </View>
    );
  }

  if (isError || !application) {
    return (
      <View style={styles.container}>
        <GradientScreenHeader
          title={t.applications.applicationDetails}
          showBack
          onBack={() => navigation.goBack()}
        />
        <View style={styles.center}>
          <Text style={styles.message}>{t.common.noData}</Text>
        </View>
      </View>
    );
  }

  const statusColor = STATUS_COLORS[application.status];
  const label = statusLabel(application.status);

  return (
    <View style={styles.container}>
      <GradientScreenHeader
        title={t.applications.applicationDetails}
        showBack
        onBack={() => navigation.goBack()}
      />

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.summaryCard}>
          <View style={styles.summaryTop}>
            <View style={{ flex: 1 }}>
              <Text style={styles.title}>{application.title}</Text>
              <Text style={styles.meta}>
                {application.ref} • {application.submittedFull.split(',')[0]}
              </Text>
            </View>
            <View style={styles.badge}>
              <Text style={[styles.badgeText, { color: statusColor }]}>
                {label}
              </Text>
            </View>
          </View>
        </View>

        <DetailSection title={t.applications.applicantInfo}>
          <DetailRow label="Full Name" value={application.applicantName} />
          <DetailRow
            label="Phone Number"
            value={citizenPhone ?? application.phone}
          />
          {application.address ? (
            <DetailRow label="Address" value={application.address} />
          ) : null}
        </DetailSection>

        <DetailSection title={t.applications.processInfo}>
          <DetailRow label={t.applications.department} value={application.department} />
          {application.feePaid ? (
            <DetailRow
              label="Fee Paid"
              value={application.feePaid}
              valueColor="#10B981"
            />
          ) : null}
        </DetailSection>

        {application.backendStatus === 'ACTION_REQUIRED' &&
        application.openActionRequest ? (
          <View
            style={[
              styles.summaryCard,
              {
                borderColor: '#F59E0B',
                backgroundColor: '#FFFBEB',
                marginBottom: theme.spacing.md,
              },
            ]}>
            <Text style={[styles.title, { color: '#92400E' }]}>
              {t.applications.submitCorrections}
            </Text>
            <Text style={[styles.meta, { color: '#B45309' }]}>
              {application.openActionRequest.instructions ??
                application.openActionRequest.reason}
            </Text>
            {application.openActionRequest.deadline ? (
              <Text style={[styles.meta, { color: '#92400E', fontWeight: '600' }]}>
                Update by{' '}
                {new Date(application.openActionRequest.deadline).toLocaleDateString()}
              </Text>
            ) : null}
            <Pressable
              style={[
                styles.receiptBtn,
                {
                  backgroundColor: theme.colors.primary,
                  borderColor: theme.colors.primary,
                  marginBottom: 0,
                  marginTop: theme.spacing.md,
                },
              ]}
              accessibilityRole="button"
              onPress={() =>
                navigation.navigate('SubmitCorrections', { applicationId })
              }>
              <Text style={[styles.receiptText, { color: theme.colors.textInverse }]}>
                {t.applications.submitCorrections}
              </Text>
            </Pressable>
          </View>
        ) : null}

        <Pressable
          style={styles.receiptBtn}
          accessibilityRole="button"
          onPress={handleDownload}>
          <Text style={styles.receiptText}>
            {application?.status === 'approved'
              ? t.applications.viewCertificate
              : t.common.download}
          </Text>
        </Pressable>
      </ScrollView>
    </View>
  );
};
