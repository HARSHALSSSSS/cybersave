import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  Pressable,
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
import {
  DynamicFormFields,
  ServiceHubHeader,
} from '@features/services/components';
import { goBackInServicesStack } from '@features/services/utils/navigateToService';
import {
  applicationsApi,
  applicationsQueryKeys,
  servicesApi,
  servicesQueryKeys,
} from '@services/api';
import { useTranslation } from '@/i18n';
import { getScrollBottomPadding } from '@utils/layout';
import { validateFormFields } from '@features/services/utils/formValidation';

type Props = NativeStackScreenProps<ServicesStackParamList, 'ApplyService'>;

export const ApplyServiceScreen: React.FC<Props> = ({ navigation, route }) => {
  const { categoryId, optionId, applicationId: existingApplicationId, stateCode, stateName } =
    route.params;
  const { theme } = useTheme();
  const insets = useSafeAreaInsets();
  const { t, format } = useTranslation();
  const [formValues, setFormValues] = useState<Record<string, unknown>>({});
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [applicationId, setApplicationId] = useState<string | undefined>(
    existingApplicationId,
  );
  const [hydrated, setHydrated] = useState(!existingApplicationId);

  const { data: config, isLoading } = useQuery({
    queryKey: servicesQueryKeys.configuration(optionId, stateCode),
    queryFn: () => servicesApi.getSubServiceConfiguration(optionId, stateCode),
  });

  const { data: existingApplication, isLoading: isLoadingExisting, isError: isExistingError } =
    useQuery({
      queryKey: existingApplicationId
        ? applicationsQueryKeys.detail(existingApplicationId)
        : ['applications', 'missing'],
      queryFn: () => applicationsApi.getApplicationById(existingApplicationId!),
      enabled: Boolean(existingApplicationId),
    });

  useEffect(() => {
    if (!config?.form?.fields) return;
    const defaults: Record<string, unknown> = {};
    config.form.fields.forEach(field => {
      if (field.defaultValue != null && field.defaultValue !== '') {
        defaults[field.key] = field.defaultValue;
      }
    });
    setFormValues(prev => ({ ...defaults, ...prev }));
  }, [config]);

  useEffect(() => {
    if (!existingApplicationId) return;
    if (isExistingError) {
      setHydrated(true);
      return;
    }
    if (!existingApplication?.fieldValues) return;
    const fromApi: Record<string, unknown> = {};
    existingApplication.fieldValues.forEach(fv => {
      fromApi[fv.fieldKey] = fv.value;
    });
    setFormValues(prev => ({ ...prev, ...fromApi }));
    setHydrated(true);
  }, [existingApplication, existingApplicationId, isExistingError]);

  const createDraftMutation = useMutation({
    mutationFn: () =>
      applicationsApi.createDraftApplication(optionId, stateCode, stateName),
    onSuccess: data => {
      setApplicationId(data.id);
    },
  });

  const saveFormMutation = useMutation({
    mutationFn: (params: { id: string; values: Record<string, unknown> }) =>
      applicationsApi.saveApplicationFormValues(params.id, params.values),
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
        sectionTitle: {
          ...theme.typography.headingSmall,
          color: theme.colors.primary,
          marginBottom: theme.spacing.lg,
        },
        scrollContent: {
          paddingBottom: getScrollBottomPadding(insets, theme.spacing['3xl']),
        },
        draftBtn: {
          alignItems: 'center',
          paddingVertical: theme.spacing.lg,
        },
        draftText: {
          ...theme.typography.labelMedium,
          color: theme.colors.textSecondary,
        },
        center: {
          flex: 1,
          alignItems: 'center',
          justifyContent: 'center',
        },
      }),
    [theme, insets],
  );

  const updateField = useCallback((key: string, value: unknown) => {
    setFormValues(prev => ({ ...prev, [key]: value }));
    setFieldErrors(prev => {
      if (!prev[key]) return prev;
      const next = { ...prev };
      delete next[key];
      return next;
    });
  }, []);

  const validateRequiredFields = useCallback((): boolean => {
    const fields = config?.form?.fields ?? [];
    const errors = validateFormFields(fields, formValues);
    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors);
      const first = Object.values(errors)[0];
      Alert.alert(t.services.checkDetails, first ?? t.services.fixHighlightedFields);
      return false;
    }
    setFieldErrors({});
    return true;
  }, [config?.form?.fields, formValues]);

  const ensureDraft = useCallback(async (): Promise<string> => {
    if (applicationId) return applicationId;
    const draft = await createDraftMutation.mutateAsync();
    setApplicationId(draft.id);
    return draft.id;
  }, [applicationId, createDraftMutation]);

  const handleContinue = useCallback(async () => {
    if (!validateRequiredFields()) return;
    try {
      const id = await ensureDraft();
      await saveFormMutation.mutateAsync({ id, values: formValues });
      navigation.navigate('UploadProofs', {
        categoryId,
        optionId,
        applicationId: id,
        stateCode,
        stateName,
      });
    } catch {
      Alert.alert(t.common.error, t.services.couldNotSaveApplication);
    }
  }, [
    categoryId,
    ensureDraft,
    formValues,
    navigation,
    optionId,
    saveFormMutation,
    validateRequiredFields,
  ]);

  const handleSaveDraft = useCallback(async () => {
    try {
      const id = await ensureDraft();
      await saveFormMutation.mutateAsync({ id, values: formValues });
      Alert.alert(t.services.draftSaved, t.services.draftSavedMessage);
    } catch {
      Alert.alert(t.common.error, t.services.couldNotSaveDraft);
    }
  }, [ensureDraft, formValues, saveFormMutation]);

  const displayName =
    config?.overview?.displayName ?? config?.subService.name ?? t.services.defaultService;
  const isBusy =
    createDraftMutation.isPending || saveFormMutation.isPending;
  const waitingOnExisting =
    Boolean(existingApplicationId) && (isLoadingExisting || !hydrated);

  if (isLoading || waitingOnExisting) {
    return (
      <View style={styles.container}>
        <ServiceHubHeader title={t.services.applyTitle} showBack onBack={() => goBackInServicesStack(navigation)} />
        <View style={styles.center}>
          <ActivityIndicator color={theme.colors.primary} />
        </View>
      </View>
    );
  }

  if (!config?.form?.fields?.length) {
    return (
      <View style={styles.container}>
        <ServiceHubHeader
          title={format(t.services.applyForName, { name: displayName })}
          showBack
          onBack={() => goBackInServicesStack(navigation)}
        />
        <View style={styles.center}>
          <Text style={styles.draftText}>{t.services.noFormConfigured}</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <ServiceHubHeader
        title={format(t.services.applyForName, { name: displayName })}
        showBack
        onBack={() => goBackInServicesStack(navigation)}
        step={1}
        totalSteps={5}
      />

      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView
          style={styles.content}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled">
          <Text style={styles.sectionTitle}>{t.services.applicationDetails}</Text>

          <DynamicFormFields
            fields={config.form.fields}
            values={formValues}
            onChange={updateField}
            errors={fieldErrors}
          />

          <Button
            title={t.common.continue}
            loading={isBusy}
            onPress={handleContinue}
          />

          <Pressable
            style={styles.draftBtn}
            accessibilityRole="button"
            disabled={isBusy}
            onPress={handleSaveDraft}>
            <Text style={styles.draftText}>{t.services.saveDraft}</Text>
          </Pressable>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
};
