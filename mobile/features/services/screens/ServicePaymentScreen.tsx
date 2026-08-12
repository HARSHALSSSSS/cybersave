import React, { useCallback, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useMutation, useQuery } from '@tanstack/react-query';
import { ServicesStackParamList } from '@/types/navigation';
import { useTheme } from '@app/providers/ThemeProvider';
import { Button } from '@components/Button';
import { LockSmallIcon } from '@components/icons';
import { ServiceHubHeader } from '@features/services/components';
import { goBackInServicesStack } from '@features/services/utils/navigateToService';
import { applicationsApi, applicationsQueryKeys, servicesApi, servicesQueryKeys } from '@services/api';
import { useTranslation } from '@/i18n';
import { getTabFooterPadding } from '@utils/layout';

type Props = NativeStackScreenProps<ServicesStackParamList, 'ServicePayment'>;

function randomIdempotencyKey(): string {
  return `pay_${Date.now()}_${Math.random().toString(36).slice(2, 10)}`;
}

export const ServicePaymentScreen: React.FC<Props> = ({
  navigation,
  route,
}) => {
  const { categoryId, optionId, applicationId, stateCode } = route.params;
  const { theme } = useTheme();
  const insets = useSafeAreaInsets();
  const { t, format } = useTranslation();
  const [idempotencyKey] = useState(randomIdempotencyKey);

  const { data: application, isLoading } = useQuery({
    queryKey: applicationsQueryKeys.detail(applicationId ?? ''),
    queryFn: () => applicationsApi.getApplicationById(applicationId!),
    enabled: Boolean(applicationId),
  });

  const { data: config } = useQuery({
    queryKey: servicesQueryKeys.configuration(optionId, stateCode),
    queryFn: () => servicesApi.getSubServiceConfiguration(optionId, stateCode),
  });

  const payMutation = useMutation({
    mutationFn: async () => {
      if (!applicationId) throw new Error('Missing application');
      await applicationsApi.validateApplication(applicationId);

      const total =
        application?.pricingSnapshot?.totalAmount != null
          ? Number(application.pricingSnapshot.totalAmount)
          : config?.pricing?.totalAmount != null
            ? Number(config.pricing.totalAmount)
            : 0;

      if (total <= 0) {
        return applicationsApi.submitApplication(applicationId);
      }

      const intent = await applicationsApi.createPaymentIntent(
        applicationId,
        idempotencyKey,
      );
      await applicationsApi.captureMockPayment(intent.paymentId);
      return applicationsApi.submitApplication(applicationId);
    },
    onSuccess: result => {
      navigation.replace('ApplicationSuccess', {
        categoryId,
        optionId,
        ref: result.publicRef ?? result.id.slice(0, 8).toUpperCase(),
        applicationId: result.id,
      });
    },
    onError: () => {
      Alert.alert(
        t.services.paymentFailed,
        t.services.paymentFailedMessage,
      );
    },
  });

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
        billCard: {
          flexDirection: 'row',
          justifyContent: 'space-between',
          alignItems: 'center',
          padding: theme.spacing.lg,
          borderRadius: theme.radius['2xl'],
          backgroundColor: theme.colors.backgroundSecondary,
          borderWidth: 1,
          borderColor: theme.colors.border,
          marginBottom: theme.spacing.lg,
          ...theme.shadows.sm,
        },
        billLabel: {
          ...theme.typography.bodySmall,
          color: theme.colors.textSecondary,
        },
        billTitle: {
          ...theme.typography.labelMedium,
          color: theme.colors.textPrimary,
          marginTop: 2,
        },
        billAmount: {
          ...theme.typography.headingMedium,
          color: theme.colors.primary,
        },
        note: {
          ...theme.typography.bodyMedium,
          color: theme.colors.textSecondary,
          marginBottom: theme.spacing.lg,
          lineHeight: 22,
        },
        secure: {
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'center',
          gap: theme.spacing.xs,
          marginVertical: theme.spacing.md,
        },
        secureText: {
          ...theme.typography.bodySmall,
          color: theme.colors.success,
        },
        footer: {
          paddingBottom: getTabFooterPadding(insets),
        },
        center: {
          flex: 1,
          alignItems: 'center',
          justifyContent: 'center',
        },
      }),
    [theme, insets],
  );

  const total = useMemo(() => {
    if (application?.pricingSnapshot?.totalAmount != null) {
      return Number(application.pricingSnapshot.totalAmount);
    }
    if (config?.pricing?.totalAmount != null) {
      return Number(config.pricing.totalAmount);
    }
    return 0;
  }, [application, config]);

  const serviceName =
    application?.serviceVersion.overview?.displayName ??
    application?.serviceVersion.subService.name ??
    t.services.defaultService;

  const handlePay = useCallback(() => {
    payMutation.mutate();
  }, [payMutation]);

  if (!applicationId) return null;

  if (isLoading || !application) {
    return (
      <View style={styles.container}>
        <ServiceHubHeader title={t.services.payment} showBack onBack={() => goBackInServicesStack(navigation)} />
        <View style={styles.center}>
          <ActivityIndicator color={theme.colors.primary} />
        </View>
      </View>
    );
  }

  const isFree = total <= 0;

  return (
    <View style={styles.container}>
      <ServiceHubHeader
        title={isFree ? t.services.submitApp : t.services.payment}
        subtitle={t.services.secureGateway}
        showBack
        onBack={() => goBackInServicesStack(navigation)}
        step={4}
        totalSteps={5}
      />

      <ScrollView
        style={styles.content}
        contentContainerStyle={styles.footer}
        showsVerticalScrollIndicator={false}>
        <View style={styles.billCard}>
          <View>
            <Text style={styles.billLabel}>{t.services.applicationLabel}</Text>
            <Text style={styles.billTitle}>{serviceName}</Text>
          </View>
          <Text style={styles.billAmount}>
            {isFree ? t.common.free : `₹${total.toFixed(2)}`}
          </Text>
        </View>

        <Text style={styles.note}>
          {isFree
            ? t.services.noPaymentRequired
            : t.services.mockPaymentNote}
        </Text>

        <View style={styles.secure}>
          <LockSmallIcon color={theme.colors.success} />
          <Text style={styles.secureText}>
            {t.services.sslSecured}
          </Text>
        </View>

        <Button
          title={
            isFree
              ? t.services.submitApp
              : format(t.services.payAndSubmit, { amount: total.toFixed(2) })
          }
          loading={payMutation.isPending}
          onPress={handlePay}
        />
      </ScrollView>
    </View>
  );
};
