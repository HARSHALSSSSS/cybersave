import React, { useCallback, useMemo } from 'react';
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useQuery } from '@tanstack/react-query';
import { ServicesStackParamList } from '@/types/navigation';
import { useTheme } from '@app/providers/ThemeProvider';
import { Button } from '@components/Button';
import { FileDocIcon } from '@components/icons';
import { ServiceHubHeader } from '@features/services/components';
import { goBackInServicesStack } from '@features/services/utils/navigateToService';
import { applicationsApi, applicationsQueryKeys, servicesApi, servicesQueryKeys } from '@services/api';
import { useTranslation } from '@/i18n';
import { getTabFooterPadding } from '@utils/layout';

type Props = NativeStackScreenProps<
  ServicesStackParamList,
  'ReviewApplication'
>;

export const ReviewApplicationScreen: React.FC<Props> = ({
  navigation,
  route,
}) => {
  const { categoryId, optionId, applicationId, stateCode, stateName } =
    route.params;
  const { theme } = useTheme();
  const insets = useSafeAreaInsets();
  const { t } = useTranslation();

  const { data: application, isLoading } = useQuery({
    queryKey: applicationsQueryKeys.detail(applicationId ?? ''),
    queryFn: () => applicationsApi.getApplicationById(applicationId!),
    enabled: Boolean(applicationId),
  });

  const { data: config } = useQuery({
    queryKey: servicesQueryKeys.configuration(optionId, stateCode),
    queryFn: () => servicesApi.getSubServiceConfiguration(optionId, stateCode),
  });

  const totalAmount = useMemo(() => {
    if (application?.pricingSnapshot?.totalAmount != null) {
      return Number(application.pricingSnapshot.totalAmount);
    }
    if (config?.pricing?.totalAmount != null) {
      return Number(config.pricing.totalAmount);
    }
    return 0;
  }, [application, config]);

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
        pageTitle: {
          ...theme.typography.headingSmall,
          color: theme.colors.textPrimary,
          marginBottom: theme.spacing.lg,
        },
        card: {
          borderRadius: theme.radius['2xl'],
          borderWidth: 1,
          borderColor: theme.colors.border,
          padding: theme.spacing.lg,
          marginBottom: theme.spacing.md,
          backgroundColor: theme.colors.surface,
          ...theme.shadows.sm,
        },
        cardHeader: {
          flexDirection: 'row',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: theme.spacing.sm,
        },
        cardTitle: {
          ...theme.typography.labelLarge,
          color: theme.colors.textPrimary,
        },
        edit: {
          ...theme.typography.labelMedium,
          color: theme.colors.primary,
        },
        row: {
          flexDirection: 'row',
          justifyContent: 'space-between',
          marginBottom: theme.spacing.xs,
        },
        label: {
          ...theme.typography.bodySmall,
          color: theme.colors.textSecondary,
        },
        value: {
          ...theme.typography.bodyMedium,
          color: theme.colors.textPrimary,
          maxWidth: '55%',
          textAlign: 'right',
        },
        docRow: {
          flexDirection: 'row',
          alignItems: 'center',
          gap: theme.spacing.sm,
          marginBottom: theme.spacing.xs,
        },
        docName: {
          ...theme.typography.bodyMedium,
          color: theme.colors.textPrimary,
        },
        totalRow: {
          flexDirection: 'row',
          justifyContent: 'space-between',
          marginTop: theme.spacing.sm,
          paddingTop: theme.spacing.sm,
          borderTopWidth: 1,
          borderTopColor: theme.colors.border,
        },
        totalLabel: {
          ...theme.typography.labelLarge,
          color: theme.colors.textPrimary,
        },
        totalValue: {
          ...theme.typography.labelLarge,
          color: theme.colors.primary,
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

  const handlePayment = useCallback(() => {
    if (!applicationId) return;
    navigation.navigate('ServicePayment', {
      categoryId,
      optionId,
      applicationId,
      stateCode,
      stateName,
    });
  }, [applicationId, categoryId, navigation, optionId, stateCode, stateName]);

  if (!applicationId) return null;

  if (isLoading || !application) {
    return (
      <View style={styles.container}>
        <ServiceHubHeader title={t.services.reviewDetails} showBack onBack={() => goBackInServicesStack(navigation)} />
        <View style={styles.center}>
          <ActivityIndicator color={theme.colors.primary} />
        </View>
      </View>
    );
  }

  const serviceName =
    application.serviceVersion.overview?.displayName ??
    application.serviceVersion.subService.name;

  return (
    <View style={styles.container}>
      <ServiceHubHeader
        title={t.services.reviewDetails}
        showBack
        onBack={() => goBackInServicesStack(navigation)}
        step={3}
        totalSteps={5}
      />

      <ScrollView
        style={styles.content}
        contentContainerStyle={styles.footer}
        showsVerticalScrollIndicator={false}>
        <Text style={styles.pageTitle}>{t.services.review}</Text>

        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <Text style={styles.cardTitle}>{t.services.formDetails}</Text>
            <Pressable
              accessibilityRole="button"
              onPress={() =>
                navigation.navigate('ApplyService', {
                  categoryId,
                  optionId,
                  applicationId,
                  stateCode,
                  stateName,
                })
              }>
              <Text style={styles.edit}>{t.common.edit}</Text>
            </Pressable>
          </View>
          {application.fieldValues.map(fv => (
            <View key={fv.id} style={styles.row}>
              <Text style={styles.label}>{fv.fieldKey}</Text>
              <Text style={styles.value}>{String(fv.value ?? '—')}</Text>
            </View>
          ))}
        </View>

        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <Text style={styles.cardTitle}>{t.services.uploadedDocuments}</Text>
            <Pressable
              accessibilityRole="button"
              onPress={() =>
                navigation.navigate('UploadProofs', {
                  categoryId,
                  optionId,
                  applicationId,
                  stateCode,
                  stateName,
                })
              }>
              <Text style={styles.edit}>{t.common.edit}</Text>
            </Pressable>
          </View>
          {(application.documents as Array<{ id: string; documentRequirement?: { name: string } }>).map(
            doc => (
              <View key={doc.id} style={styles.docRow}>
                <FileDocIcon color={theme.colors.primary} />
                <Text style={styles.docName}>
                  {doc.documentRequirement?.name ?? t.services.documentFallback}
                </Text>
              </View>
            ),
          )}
          {application.documents.length === 0 ? (
            <Text style={styles.label}>{t.services.noDocumentsUploaded}</Text>
          ) : null}
        </View>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>{t.services.paymentSummary}</Text>
          <View style={styles.row}>
            <Text style={styles.label}>{t.services.serviceLabel}</Text>
            <Text style={styles.value}>{serviceName}</Text>
          </View>
          {config?.pricing?.platformFee && Number(config.pricing.platformFee) > 0 ? (
            <View style={styles.row}>
              <Text style={styles.label}>{t.services.platformFee}</Text>
              <Text style={styles.value}>₹{Number(config.pricing.platformFee).toFixed(2)}</Text>
            </View>
          ) : null}
          <View style={styles.totalRow}>
            <Text style={styles.totalLabel}>{t.services.totalPayable}</Text>
            <Text style={styles.totalValue}>
              {totalAmount > 0 ? `₹${totalAmount.toFixed(2)}` : t.common.free}
            </Text>
          </View>
        </View>

        <Button
          title={totalAmount > 0 ? t.services.proceedPayment : t.services.submitApp}
          onPress={handlePayment}
        />
      </ScrollView>
    </View>
  );
};
