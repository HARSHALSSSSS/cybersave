import React, { useCallback, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useSelector } from 'react-redux';
import { ServicesStackParamList } from '@/types/navigation';
import { useTheme } from '@app/providers/ThemeProvider';
import { Button } from '@components/Button';
import { TabStackScreenLayout } from '@components/layout';
import { LockSmallIcon, RadioSelectedIcon, RadioUnselectedIcon } from '@components/icons';
import { ServiceHubHeader } from '@features/services/components';
import { goBackInServicesStack } from '@features/services/utils/navigateToService';
import {
  isRazorpayUserCancelled,
  processApplicationPayment,
  type PaymentMethod,
} from '@features/payments/utils/applicationPayment';
import {
  applicationsApi,
  applicationsQueryKeys,
  servicesApi,
  servicesQueryKeys,
  walletApi,
  walletQueryKeys,
} from '@services/api';
import type { RootState } from '@app/store';
import { useTranslation } from '@/i18n';

type Props = NativeStackScreenProps<ServicesStackParamList, 'ServicePayment'>;

function randomIdempotencyKey(): string {
  return `pay_${Date.now()}_${Math.random().toString(36).slice(2, 10)}`;
}

export const ServicePaymentScreen: React.FC<Props> = ({ navigation, route }) => {
  const { categoryId, optionId, applicationId, stateCode } = route.params;
  const { theme } = useTheme();
  const { t, format } = useTranslation();
  const queryClient = useQueryClient();
  const citizen = useSelector((state: RootState) => state.auth.citizen);
  const [idempotencyKey] = useState(randomIdempotencyKey);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('razorpay');

  const { data: application, isLoading } = useQuery({
    queryKey: applicationsQueryKeys.detail(applicationId ?? ''),
    queryFn: () => applicationsApi.getApplicationById(applicationId!),
    enabled: Boolean(applicationId),
  });

  const { data: config } = useQuery({
    queryKey: servicesQueryKeys.configuration(optionId, stateCode),
    queryFn: () => servicesApi.getSubServiceConfiguration(optionId, stateCode),
  });

  const { data: wallet } = useQuery({
    queryKey: walletQueryKeys.summary(),
    queryFn: () => walletApi.getWalletSummary(),
  });

  const total = useMemo(() => {
    if (application?.pricingSnapshot?.totalAmount != null) {
      return Number(application.pricingSnapshot.totalAmount);
    }
    if (config?.pricing?.totalAmount != null) {
      return Number(config.pricing.totalAmount);
    }
    return 0;
  }, [application, config]);

  const walletBalance = wallet?.balance ?? 0;
  const walletCovers = walletBalance >= total && total > 0;

  const serviceName =
    application?.serviceVersion.overview?.displayName ??
    application?.serviceVersion.subService.name ??
    t.services.defaultService;

  const payMutation = useMutation({
    mutationFn: async () => {
      if (!applicationId) throw new Error('Missing application');
      await applicationsApi.validateApplication(applicationId);

      if (total <= 0) {
        return applicationsApi.submitApplication(applicationId);
      }

      if (paymentMethod === 'wallet' && !walletCovers) {
        throw new Error('INSUFFICIENT_WALLET');
      }

      await processApplicationPayment({
        applicationId,
        method: paymentMethod,
        idempotencyKey,
        amount: total,
        serviceName,
        prefill: {
          contact: citizen?.phone,
          email: citizen?.email ?? undefined,
          name: [citizen?.firstName, citizen?.lastName].filter(Boolean).join(' ') || undefined,
        },
      });

      return applicationsApi.submitApplication(applicationId);
    },
    onSuccess: result => {
      void queryClient.invalidateQueries({ queryKey: walletQueryKeys.summary() });
      navigation.replace('ApplicationSuccess', {
        categoryId,
        optionId,
        ref: result.publicRef ?? result.id.slice(0, 8).toUpperCase(),
        applicationId: result.id,
      });
    },
    onError: (error: unknown) => {
      if (isRazorpayUserCancelled(error)) return;
      if (error instanceof Error && error.message === 'INSUFFICIENT_WALLET') {
        Alert.alert(t.wallet.insufficientBalance, t.wallet.addMoneyHint);
        return;
      }
      Alert.alert(t.common.error, t.services.paymentFailed);
    },
  });

  const styles = useMemo(
    () =>
      StyleSheet.create({
        billCard: {
          flexDirection: 'row',
          justifyContent: 'space-between',
          alignItems: 'center',
          borderRadius: theme.radius['2xl'],
          borderWidth: 1,
          borderColor: theme.colors.border,
          padding: theme.spacing.lg,
          marginBottom: theme.spacing.lg,
          backgroundColor: theme.colors.surface,
          ...theme.shadows.sm,
        },
        billLabel: { ...theme.typography.bodySmall, color: theme.colors.textSecondary },
        billTitle: {
          ...theme.typography.labelMedium,
          color: theme.colors.textPrimary,
          marginTop: 2,
        },
        billAmount: { ...theme.typography.headingMedium, color: theme.colors.primary },
        sectionTitle: {
          ...theme.typography.labelMedium,
          color: theme.colors.textPrimary,
          marginBottom: theme.spacing.md,
        },
        methodCard: {
          flexDirection: 'row',
          alignItems: 'center',
          gap: theme.spacing.md,
          padding: theme.spacing.lg,
          borderRadius: theme.radius.xl,
          borderWidth: 1.5,
          borderColor: theme.colors.border,
          marginBottom: theme.spacing.md,
          backgroundColor: theme.colors.surface,
        },
        methodCardActive: {
          borderColor: theme.colors.primary,
          backgroundColor: theme.colors.primaryMuted,
        },
        methodCardDisabled: {
          opacity: 0.55,
        },
        methodIcon: {
          width: 44,
          height: 44,
          borderRadius: theme.radius.lg,
          backgroundColor: theme.colors.backgroundSecondary,
          alignItems: 'center',
          justifyContent: 'center',
        },
        methodBody: { flex: 1, minWidth: 0 },
        methodTitle: { ...theme.typography.labelMedium, color: theme.colors.textPrimary },
        methodSub: {
          ...theme.typography.bodySmall,
          color: theme.colors.textSecondary,
          marginTop: 2,
        },
        walletBalance: {
          ...theme.typography.caption,
          color: theme.colors.primary,
          fontWeight: '600',
          marginTop: 4,
        },
        walletLow: { color: '#B45309' },
        razorpayBadge: {
          alignSelf: 'flex-start',
          marginTop: theme.spacing.sm,
          paddingHorizontal: theme.spacing.sm,
          paddingVertical: 2,
          borderRadius: theme.radius.full,
          backgroundColor: '#EFF6FF',
        },
        razorpayBadgeText: {
          ...theme.typography.caption,
          color: '#2563EB',
          fontWeight: '600',
        },
        secure: {
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'center',
          gap: theme.spacing.xs,
          marginTop: theme.spacing.lg,
        },
        secureText: { ...theme.typography.bodySmall, color: theme.colors.success },
        center: {
          flex: 1,
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: theme.colors.backgroundSecondary,
        },
      }),
    [theme],
  );

  const handlePay = useCallback(() => {
    payMutation.mutate();
  }, [payMutation]);

  if (!applicationId) return null;

  if (isLoading && !application) {
    return (
      <View style={{ flex: 1, backgroundColor: theme.colors.backgroundSecondary }}>
        <ServiceHubHeader
          title={t.services.payment}
          showBack
          onBack={() => goBackInServicesStack(navigation)}
        />
        <View style={styles.center}>
          <ActivityIndicator color={theme.colors.primary} />
        </View>
      </View>
    );
  }

  const isFree = total <= 0;

  return (
    <TabStackScreenLayout
      header={
        <ServiceHubHeader
          title={isFree ? t.services.submitApp : t.services.payment}
          subtitle={t.services.secureGateway}
          showBack
          onBack={() => goBackInServicesStack(navigation)}
          step={4}
          totalSteps={5}
        />
      }
      footer={
        <Button
          title={
            isFree
              ? t.services.submitApp
              : format(t.services.payAndSubmit, { amount: total.toFixed(2) })
          }
          loading={payMutation.isPending}
          onPress={handlePay}
        />
      }>
      <View style={styles.billCard}>
        <View>
          <Text style={styles.billLabel}>{t.services.applicationLabel}</Text>
          <Text style={styles.billTitle}>{serviceName}</Text>
        </View>
        <Text style={styles.billAmount}>
          {isFree ? t.common.free : `₹${total.toFixed(2)}`}
        </Text>
      </View>

      {!isFree ? (
        <>
          <Text style={styles.sectionTitle}>{t.services.selectPaymentMethod}</Text>

          <Pressable
            style={[
              styles.methodCard,
              paymentMethod === 'razorpay' && styles.methodCardActive,
            ]}
            onPress={() => setPaymentMethod('razorpay')}>
            {paymentMethod === 'razorpay' ? (
              <RadioSelectedIcon color={theme.colors.primary} />
            ) : (
              <RadioUnselectedIcon />
            )}
            <View style={styles.methodIcon}>
              <Text style={{ fontSize: 18 }}>💳</Text>
            </View>
            <View style={styles.methodBody}>
              <Text style={styles.methodTitle}>{t.services.payViaRazorpay}</Text>
              <Text style={styles.methodSub}>{t.services.razorpayMethodsHint}</Text>
              <View style={styles.razorpayBadge}>
                <Text style={styles.razorpayBadgeText}>{t.services.securedRazorpay}</Text>
              </View>
            </View>
          </Pressable>

          <Pressable
            style={[
              styles.methodCard,
              paymentMethod === 'wallet' && walletCovers && styles.methodCardActive,
              !walletCovers && styles.methodCardDisabled,
            ]}
            disabled={!walletCovers}
            onPress={() => walletCovers && setPaymentMethod('wallet')}>
            {paymentMethod === 'wallet' && walletCovers ? (
              <RadioSelectedIcon color={theme.colors.primary} />
            ) : (
              <RadioUnselectedIcon />
            )}
            <View style={[styles.methodIcon, !walletCovers && { opacity: 0.6 }]}>
              <Text style={{ fontSize: 18 }}>👛</Text>
            </View>
            <View style={styles.methodBody}>
              <Text style={styles.methodTitle}>{t.wallet.cybersaveWallet}</Text>
              <Text style={styles.methodSub}>
                {walletCovers ? t.wallet.payFromBalance : t.wallet.insufficientForPayment}
              </Text>
              <Text style={[styles.walletBalance, !walletCovers && styles.walletLow]}>
                {t.wallet.availableBalance}: ₹{walletBalance.toFixed(2)}
              </Text>
            </View>
          </Pressable>
        </>
      ) : null}

      <View style={styles.secure}>
        <LockSmallIcon color={theme.colors.success} />
        <Text style={styles.secureText}>{t.services.sslSecured}</Text>
      </View>
    </TabStackScreenLayout>
  );
};
