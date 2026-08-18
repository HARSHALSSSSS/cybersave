import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  Alert,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useMutation, useQuery } from '@tanstack/react-query';

import { useTheme } from '@app/providers/ThemeProvider';
import { useTranslation } from '@/i18n';
import { Button } from '@components/Button';
import { DynamicBillerForm, billerInitial } from '@features/bill-payments/components';
import { BillPaymentScreenLayout } from '@features/bill-payments/components/BillPaymentScreenLayout';
import { BBPS_BILLER_STALE_MS } from '@features/bill-payments/utils/billPaymentsPrefetch';
import { BillPaymentsStackParamList } from '@/types/navigation';
import { billPaymentsApi, billPaymentsQueryKeys, getBillPaymentsErrorMessage } from '@services/api/billPayments.api';

type Props = NativeStackScreenProps<BillPaymentsStackParamList, 'BillerForm'>;

function validateFields(
  fields: Array<{ key: string; label: string; required: boolean; minLength?: number; maxLength?: number; regex?: string }>,
  values: Record<string, string>,
): Record<string, string> {
  const errors: Record<string, string> = {};
  for (const field of fields) {
    const value = values[field.key]?.trim() ?? '';
    if (field.required && !value) {
      errors[field.key] = `${field.label} is required`;
      continue;
    }
    if (!value) continue;
    if (field.minLength && value.length < field.minLength) {
      errors[field.key] = `Minimum ${field.minLength} characters`;
    }
    if (field.maxLength && value.length > field.maxLength) {
      errors[field.key] = `Maximum ${field.maxLength} characters`;
    }
    if (field.regex) {
      try {
        if (!new RegExp(field.regex).test(value)) {
          errors[field.key] = 'Invalid format';
        }
      } catch {
        // ignore invalid provider regex
      }
    }
  }
  return errors;
}

export const BillerFormScreen: React.FC<Props> = ({ navigation, route }) => {
  const { billerId, billerName, accountHolder: preset } = route.params;
  const { theme } = useTheme();
  const { t } = useTranslation();
  const [values, setValues] = useState<Record<string, string>>(preset ?? {});
  const [errors, setErrors] = useState<Record<string, string>>({});

  const { data: biller, isLoading, isError, refetch } = useQuery({
    queryKey: billPaymentsQueryKeys.biller(billerId),
    queryFn: () => billPaymentsApi.getBiller(billerId),
    retry: 2,
    staleTime: BBPS_BILLER_STALE_MS,
    placeholderData: previous => previous,
  });

  useEffect(() => {
    if (biller?.fields?.length && preset) {
      setValues(prev => ({ ...prev, ...preset }));
    }
  }, [biller, preset]);

  const fetchMutation = useMutation({
    mutationFn: async () => {
      const fieldErrors = validateFields(biller?.fields ?? [], values);
      if (Object.keys(fieldErrors).length > 0) {
        setErrors(fieldErrors);
        throw new Error('Validation failed');
      }
      setErrors({});
      return billPaymentsApi.createBillRequest(billerId, values);
    },
  });

  const handleFetch = useCallback(async () => {
    try {
      const created = await fetchMutation.mutateAsync();
      navigation.replace('BillDetails', { requestId: created.id });
    } catch (error) {
      if (error instanceof Error && error.message === 'Validation failed') return;
      Alert.alert(
        t.bills.couldNotFetchBill,
        getBillPaymentsErrorMessage(error, t.bills.unableToStartFetch),
      );
    }
  }, [fetchMutation, navigation, t]);

  const styles = useMemo(
    () =>
      StyleSheet.create({
        headerBlock: { alignItems: 'center', marginBottom: theme.spacing['2xl'] },
        avatar: {
          width: 56,
          height: 56,
          borderRadius: theme.radius.xl,
          backgroundColor: theme.colors.primaryMuted,
          alignItems: 'center',
          justifyContent: 'center',
          marginBottom: theme.spacing.sm,
        },
        avatarText: { ...theme.typography.headingMedium, color: theme.colors.primary },
        title: { ...theme.typography.headingSmall, color: theme.colors.textPrimary },
        alias: { ...theme.typography.bodySmall, color: theme.colors.textSecondary, textAlign: 'center' },
        sectionTitle: {
          ...theme.typography.bodyLarge,
          color: theme.colors.textPrimary,
          marginBottom: theme.spacing.lg,
        },
      }),
    [theme],
  );

  const displayName = billerName ?? biller?.name ?? t.bills.billerName;

  return (
    <BillPaymentScreenLayout
      title={t.bills.payBill}
      showBack
      onBack={() => navigation.goBack()}
      loading={isLoading && !biller}
      error={isError}
      errorMessage={t.bills.loadBillerError}
      onRetry={() => refetch()}
      scroll>
      {biller ? (
        <>
          <View style={styles.headerBlock}>
            <View style={styles.avatar}>
              <Text style={styles.avatarText}>{billerInitial(displayName)}</Text>
            </View>
            <Text style={styles.title}>{displayName}</Text>
            {biller.aliasName ? <Text style={styles.alias}>{biller.aliasName}</Text> : null}
          </View>

          <Text style={styles.sectionTitle}>{t.bills.enterBillDetails}</Text>
          <DynamicBillerForm
            fields={biller.fields ?? []}
            values={values}
            onChange={(key, value) => setValues(prev => ({ ...prev, [key]: value }))}
            errors={errors}
          />

          <Button
            title={t.bills.fetchBill.toUpperCase()}
            loading={fetchMutation.isPending}
            onPress={handleFetch}
          />
        </>
      ) : null}
    </BillPaymentScreenLayout>
  );
};
