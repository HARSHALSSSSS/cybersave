import React, { useMemo } from 'react';
import { Alert, ScrollView, StyleSheet, Text, View } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useMutation, useQuery } from '@tanstack/react-query';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useTheme } from '@app/providers/ThemeProvider';
import { Button } from '@components/Button';
import { CheckCircleIcon } from '@components/icons';
import { ServiceHubHeader } from '@features/services/components';
import { goBackInServicesStack } from '@features/services/utils/navigateToService';
import { ServicesStackParamList } from '@/types/navigation';
import {
  manualApplyApi,
  servicesApi,
  servicesQueryKeys,
} from '@services/api';
import { useTranslation } from '@/i18n';
import { getScrollBottomPadding } from '@utils/layout';

type Props = NativeStackScreenProps<ServicesStackParamList, 'ManualApplyPayment'>;

export const ManualApplyPaymentScreen: React.FC<Props> = ({ navigation, route }) => {
  const { optionId, stateCode, stateName } = route.params;
  const { theme } = useTheme();
  const insets = useSafeAreaInsets();
  const { t } = useTranslation();

  const { data: config } = useQuery({
    queryKey: servicesQueryKeys.configuration(optionId, stateCode),
    queryFn: () => servicesApi.getSubServiceConfiguration(optionId, stateCode),
  });

  const startMutation = useMutation({
    mutationFn: async () => {
      const session = await manualApplyApi.createSession(optionId, stateCode);
      await manualApplyApi.markRedirected(session.id);
      return session;
    },
    onSuccess: session => {
      navigation.replace('ManualApplySuccess', {
        sessionId: session.id,
        officialPortalUrl: session.officialPortalUrl,
        serviceName: config?.overview?.displayName ?? t.services.defaultService,
      });
    },
    onError: () => {
      Alert.alert(t.services.unableToContinue, t.services.couldNotOpenPortal);
    },
  });

  const fulfillment = config?.fulfillment;
  const portalUrl = fulfillment?.officialPortalUrl;

  const styles = useMemo(
    () =>
      StyleSheet.create({
        container: { flex: 1, backgroundColor: theme.colors.backgroundSecondary },
        content: {
          flex: 1,
          backgroundColor: theme.colors.surface,
          borderTopLeftRadius: theme.radius['3xl'],
          borderTopRightRadius: theme.radius['3xl'],
          marginTop: -theme.spacing.lg,
          paddingHorizontal: theme.spacing['2xl'],
          paddingTop: theme.spacing['2xl'],
          paddingBottom: getScrollBottomPadding(insets, theme.spacing['3xl']),
        },
        iconWrap: {
          alignSelf: 'center',
          width: 72,
          height: 72,
          borderRadius: theme.radius.full,
          backgroundColor: '#ECFDF5',
          alignItems: 'center',
          justifyContent: 'center',
          marginBottom: theme.spacing.lg,
        },
        title: { ...theme.typography.headingSmall, color: theme.colors.textPrimary, textAlign: 'center' },
        subtitle: {
          ...theme.typography.bodyMedium,
          color: theme.colors.textSecondary,
          marginTop: theme.spacing.sm,
          marginBottom: theme.spacing.lg,
          textAlign: 'center',
          lineHeight: 22,
        },
        card: {
          backgroundColor: theme.colors.backgroundSecondary,
          borderRadius: theme.radius.xl,
          padding: theme.spacing.lg,
          marginBottom: theme.spacing.lg,
        },
        row: {
          flexDirection: 'row',
          justifyContent: 'space-between',
          paddingVertical: theme.spacing.xs,
          gap: theme.spacing.md,
        },
        label: { ...theme.typography.bodyMedium, color: theme.colors.textSecondary, flex: 1 },
        value: {
          ...theme.typography.bodyMedium,
          color: theme.colors.textPrimary,
          flex: 1.2,
          textAlign: 'right',
        },
        note: {
          ...theme.typography.bodySmall,
          color: theme.colors.textSecondary,
          textAlign: 'center',
          marginTop: theme.spacing.lg,
          lineHeight: 20,
        },
      }),
    [theme, insets.bottom],
  );

  return (
    <View style={styles.container}>
      <ServiceHubHeader title={t.services.applyOnPortal} showBack onBack={() => goBackInServicesStack(navigation)} />

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.iconWrap}>
          <CheckCircleIcon color="#10B981" size={36} />
        </View>

        <Text style={styles.title}>{t.services.applyPortal}</Text>
        <Text style={styles.subtitle}>{t.services.manualApplySubtitle}</Text>

        {stateName ? (
          <Text style={[styles.subtitle, { marginTop: 0 }]}>
            {t.services.stateLabel}: {stateName}
          </Text>
        ) : null}

        <View style={styles.card}>
          <View style={styles.row}>
            <Text style={styles.label}>{t.services.serviceLabel}</Text>
            <Text style={styles.value}>{config?.overview?.displayName}</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>{t.services.cybersaveFee}</Text>
            <Text style={[styles.value, { color: '#10B981', fontWeight: '700' }]}>{t.common.free}</Text>
          </View>
          {portalUrl ? (
            <View style={styles.row}>
              <Text style={styles.label}>{t.services.portalLabel}</Text>
              <Text style={styles.value} numberOfLines={2}>
                {t.services.officialGovernmentWebsite}
              </Text>
            </View>
          ) : null}
        </View>

        {fulfillment?.manualInstructions ? (
          <Text style={styles.subtitle}>{fulfillment.manualInstructions}</Text>
        ) : null}

        <Button
          title={t.services.continuePortal}
          loading={startMutation.isPending}
          onPress={() => startMutation.mutate()}
        />

        <Text style={styles.note}>{t.services.governmentPortalFeesNote}</Text>
      </ScrollView>
    </View>
  );
};
