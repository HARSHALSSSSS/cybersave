import React, { useCallback, useEffect, useMemo } from 'react';
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useQuery } from '@tanstack/react-query';
import { ServicesStackParamList } from '@/types/navigation';
import { useTheme } from '@app/providers/ThemeProvider';
import { Button } from '@components/Button';
import { CheckCircleIcon, ShieldIcon } from '@components/icons';
import { ServiceHubHeader } from '@features/services/components';
import { goBackInServicesStack } from '@features/services/utils/navigateToService';
import { useRequireProfile } from '@features/profile/hooks/useRequireProfile';
import { servicesApi, servicesQueryKeys } from '@services/api';
import { useTranslation } from '@/i18n';
import { getScrollBottomPadding } from '@utils/layout';

type Props = NativeStackScreenProps<ServicesStackParamList, 'ServiceDetail'>;

export const ServiceDetailScreen: React.FC<Props> = ({ navigation, route }) => {
  const { categoryId, optionId, stateCode, stateName } = route.params;
  const { theme } = useTheme();
  const insets = useSafeAreaInsets();
  const { t, format } = useTranslation();

  const { data: config, isLoading, isError } = useQuery({
    queryKey: servicesQueryKeys.configuration(optionId, stateCode),
    queryFn: () => servicesApi.getSubServiceConfiguration(optionId, stateCode),
  });

  useEffect(() => {
    if (!config?.fulfillment?.requiresStateSelection || stateCode) return;
    const states = config.fulfillment.availableStates ?? [];
    if (states.length === 0) return;

    const displayName =
      config.overview?.displayName ?? config.subService.name;

    if (states.length === 1) {
      navigation.replace('ServiceDetail', {
        categoryId,
        optionId,
        stateCode: states[0].code,
        stateName: states[0].name,
      });
      return;
    }

    navigation.replace('StateSelect', {
      categoryId,
      optionId,
      optionName: displayName,
    });
  }, [categoryId, config, navigation, optionId, stateCode]);

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
        scrollContent: {
          paddingBottom: getScrollBottomPadding(insets, theme.spacing['3xl']),
        },
        hero: {
          borderRadius: theme.radius.xl,
          padding: theme.spacing.xl,
          marginBottom: theme.spacing.lg,
          flexDirection: 'row',
          alignItems: 'center',
          gap: theme.spacing.md,
        },
        heroTitle: {
          ...theme.typography.headingSmall,
          color: theme.colors.textInverse,
        },
        heroDesc: {
          ...theme.typography.bodyMedium,
          color: 'rgba(255,255,255,0.9)',
          marginTop: 4,
          flex: 1,
          lineHeight: 22,
        },
        stateBadge: {
          alignSelf: 'flex-start',
          backgroundColor: theme.colors.primaryMuted,
          paddingHorizontal: theme.spacing.md,
          paddingVertical: theme.spacing.xs,
          borderRadius: theme.radius.full,
          marginBottom: theme.spacing.md,
        },
        stateText: {
          ...theme.typography.labelSmall,
          color: theme.colors.primary,
        },
        card: {
          borderRadius: theme.radius.xl,
          borderWidth: 1,
          borderColor: theme.colors.border,
          padding: theme.spacing.xl,
          marginBottom: theme.spacing.md,
          backgroundColor: theme.colors.surface,
        },
        cardTitle: {
          ...theme.typography.labelLarge,
          color: theme.colors.textPrimary,
          marginBottom: theme.spacing.sm,
        },
        cardText: {
          ...theme.typography.bodyMedium,
          color: theme.colors.textSecondary,
          lineHeight: 22,
        },
        listItem: {
          flexDirection: 'row',
          alignItems: 'flex-start',
          gap: theme.spacing.sm,
          marginBottom: theme.spacing.sm,
        },
        listText: {
          flex: 1,
          ...theme.typography.bodyMedium,
          color: theme.colors.textSecondary,
          lineHeight: 22,
        },
        dot: {
          width: 6,
          height: 6,
          borderRadius: 3,
          backgroundColor: theme.colors.primary,
          marginTop: 8,
        },
        feeRow: {
          flexDirection: 'row',
          gap: theme.spacing.md,
          marginBottom: theme.spacing.lg,
        },
        feeCard: {
          flex: 1,
          borderRadius: theme.radius.xl,
          borderWidth: 1,
          borderColor: theme.colors.border,
          padding: theme.spacing.lg,
          backgroundColor: theme.colors.backgroundSecondary,
        },
        feeLabel: {
          ...theme.typography.bodySmall,
          color: theme.colors.textSecondary,
        },
        feeValue: {
          ...theme.typography.headingSmall,
          color: theme.colors.textPrimary,
          marginTop: 4,
        },
        ctaBlock: {
          gap: theme.spacing.md,
          marginTop: theme.spacing.md,
        },
        manualBtn: {
          paddingVertical: theme.spacing.lg,
          borderRadius: theme.radius.xl,
          borderWidth: 1.5,
          borderColor: theme.colors.border,
          alignItems: 'center',
          backgroundColor: theme.colors.backgroundSecondary,
        },
        manualTitle: {
          ...theme.typography.labelLarge,
          color: theme.colors.textPrimary,
          textAlign: 'center',
        },
        manualFee: {
          ...theme.typography.bodySmall,
          color: theme.colors.textSecondary,
          marginTop: 4,
        },
        center: {
          flex: 1,
          alignItems: 'center',
          justifyContent: 'center',
        },
      }),
    [theme, insets],
  );

  const { ensureProfile } = useRequireProfile();

  const handleAssisted = useCallback(() => {
    const returnTo = {
      tab: 'ServicesTab' as const,
      screen: 'ServiceDetail' as const,
      params: { categoryId, optionId, stateCode, stateName },
    };
    ensureProfile(() => {
      navigation.navigate('ApplyService', {
        categoryId,
        optionId,
        stateCode,
        stateName,
      });
    }, returnTo);
  }, [categoryId, ensureProfile, navigation, optionId, stateCode, stateName]);

  const handleManual = useCallback(() => {
    const returnTo = {
      tab: 'ServicesTab' as const,
      screen: 'ServiceDetail' as const,
      params: { categoryId, optionId, stateCode, stateName },
    };
    ensureProfile(() => {
      navigation.navigate('ManualApplyPayment', {
        categoryId,
        optionId,
        stateCode,
        stateName,
      });
    }, returnTo);
  }, [categoryId, ensureProfile, navigation, optionId, stateCode, stateName]);

  if (isLoading) {
    return (
      <View style={styles.container}>
        <ServiceHubHeader title={t.services.serviceDetails} showBack onBack={() => goBackInServicesStack(navigation)} />
        <View style={styles.center}>
          <ActivityIndicator color={theme.colors.primary} />
        </View>
      </View>
    );
  }

  if (isError || !config) {
    return (
      <View style={styles.container}>
        <ServiceHubHeader title={t.services.serviceDetails} showBack onBack={() => goBackInServicesStack(navigation)} />
        <View style={styles.center}>
          <Text style={styles.cardText}>{t.services.notFound}</Text>
        </View>
      </View>
    );
  }

  if (
    config.fulfillment?.requiresStateSelection &&
    !stateCode &&
    (config.fulfillment.availableStates?.length ?? 0) > 0
  ) {
    return (
      <View style={styles.container}>
        <ServiceHubHeader title={t.services.serviceDetails} showBack onBack={() => goBackInServicesStack(navigation)} />
        <View style={styles.center}>
          <ActivityIndicator color={theme.colors.primary} />
        </View>
      </View>
    );
  }

  if (
    config.fulfillment?.requiresStateSelection &&
    !stateCode &&
    (config.fulfillment.availableStates?.length ?? 0) === 0
  ) {
    return (
      <View style={styles.container}>
        <ServiceHubHeader title={t.services.serviceDetails} showBack onBack={() => goBackInServicesStack(navigation)} />
        <View style={styles.center}>
          <Text style={styles.cardText}>
            {t.common.notAvailableYet}
          </Text>
        </View>
      </View>
    );
  }

  const displayName = config.overview?.displayName ?? config.subService.name;
  const fulfillment = config.fulfillment;
  const assistedEnabled = fulfillment?.assistedEnabled !== false;
  const manualEnabled = fulfillment?.manualEnabled === true;
  const governmentFee = Number(config.pricing?.baseFee ?? 0);
  const platformFee = Number(config.pricing?.platformFee ?? fulfillment?.platformFee ?? 0);
  const totalAssisted = Number(config.pricing?.totalAmount ?? governmentFee + platformFee);
  const processingTime = config.overview?.processingTime ?? '—';
  const about =
    config.overview?.richDescription ??
    config.overview?.shortDescription ??
    t.services.defaultAbout;
  const instructions = config.instructions ?? config.overview?.instructions;
  const documents = config.documentRequirements.map(doc => doc.name);

  return (
    <View style={styles.container}>
      <ServiceHubHeader
        title={displayName}
        showBack
        onBack={() => goBackInServicesStack(navigation)}
      />

      <ScrollView
        style={styles.content}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}>
        {stateName ? (
          <View style={styles.stateBadge}>
            <Text style={styles.stateText}>{stateName}</Text>
          </View>
        ) : null}

        <LinearGradient
          colors={[theme.colors.gradientStart, theme.colors.gradientEnd]}
          style={styles.hero}>
          <View style={{ flex: 1 }}>
            <Text style={styles.heroTitle}>{displayName}</Text>
            <Text style={styles.heroDesc}>
              {config.overview?.shortDescription ?? config.subService.name}
            </Text>
          </View>
          <ShieldIcon color="#FFFFFF" size={36} />
        </LinearGradient>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>{t.services.aboutService}</Text>
          <Text style={styles.cardText}>{about}</Text>
        </View>

        {instructions ? (
          <View style={styles.card}>
            <Text style={styles.cardTitle}>{t.services.instructions}</Text>
            <View style={styles.listItem}>
              <CheckCircleIcon color="#10B981" size={18} />
              <Text style={styles.listText}>{instructions}</Text>
            </View>
          </View>
        ) : null}

        {documents.length > 0 && assistedEnabled ? (
          <View style={styles.card}>
            <Text style={styles.cardTitle}>{t.services.documentsRequired}</Text>
            {documents.map(item => (
              <View key={item} style={styles.listItem}>
                <View style={styles.dot} />
                <Text style={styles.listText}>{item}</Text>
              </View>
            ))}
          </View>
        ) : null}

        <View style={styles.feeRow}>
          {assistedEnabled ? (
            <>
              <View style={styles.feeCard}>
                <Text style={styles.feeLabel}>{t.services.governmentFee}</Text>
                <Text style={styles.feeValue}>
                  {governmentFee > 0 ? `₹${governmentFee}` : t.services.asPerPortal}
                </Text>
              </View>
              <View style={styles.feeCard}>
                <Text style={styles.feeLabel}>{t.services.cybersaveFee}</Text>
                <Text style={styles.feeValue}>
                  {platformFee > 0 ? `₹${platformFee}` : t.services.included}
                </Text>
              </View>
            </>
          ) : null}
          <View style={styles.feeCard}>
            <Text style={styles.feeLabel}>{t.services.processingTime}</Text>
            <Text style={styles.feeValue}>{processingTime}</Text>
          </View>
        </View>

        <View style={styles.ctaBlock}>
          {assistedEnabled ? (
            <Button
              title={format(t.services.assistedCtaWithPrice, {
                label: fulfillment?.assistedCtaLabel ?? t.services.getItDone,
                price: totalAssisted,
              })}
              onPress={handleAssisted}
            />
          ) : null}

          {manualEnabled ? (
            <Pressable style={styles.manualBtn} onPress={handleManual}>
              <Text style={styles.manualTitle}>
                {fulfillment?.manualCtaLabel ?? t.services.applyPortal}
              </Text>
              <Text style={styles.manualFee}>{t.services.manualFree}</Text>
            </Pressable>
          ) : null}
        </View>
      </ScrollView>
    </View>
  );
};
