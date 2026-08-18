import React, { useCallback, useEffect, useMemo, useState } from 'react';
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
import { ServicesStackParamList } from '@/types/navigation';
import { useTheme } from '@app/providers/ThemeProvider';
import { Button } from '@components/Button';
import { TabStackScreenLayout } from '@components/layout';
import {
  CheckCircleIcon,
  CloudUploadIcon,
  FileDocIcon,
  TrashIcon,
} from '@components/icons';
import { ServiceHubHeader } from '@features/services/components';
import { goBackInServicesStack } from '@features/services/utils/navigateToService';
import {
  prefetchApplicationDetail,
  prefetchWalletForPayment,
  APPLY_QUERY_STALE_MS,
} from '@features/services/utils/applyFlowPrefetch';
import {
  pickDocument,
  transferFileToUploadSession,
  validateDocumentForRequirement,
} from '@features/services/utils/documentUpload';
import { useTranslation } from '@/i18n';
import {
  applicationsApi,
  applicationsQueryKeys,
  getApiErrorMessage,
  servicesApi,
  servicesQueryKeys,
} from '@services/api';

type Props = NativeStackScreenProps<ServicesStackParamList, 'UploadProofs'>;

type UploadedDoc = {
  name: string;
  requirementId: string;
  documentId?: string;
};

export const UploadProofsScreen: React.FC<Props> = ({ navigation, route }) => {
  const { categoryId, optionId, applicationId, stateCode, stateName } = route.params;
  const { theme } = useTheme();
  const { t, format } = useTranslation();
  const queryClient = useQueryClient();
  const [uploadingId, setUploadingId] = useState<string | null>(null);

  const { data: config, isLoading } = useQuery({
    queryKey: servicesQueryKeys.configuration(optionId, stateCode),
    queryFn: () => servicesApi.getSubServiceConfiguration(optionId, stateCode),
    staleTime: APPLY_QUERY_STALE_MS,
    placeholderData: previous => previous,
  });

  const { data: application } = useQuery({
    queryKey: applicationId
      ? applicationsQueryKeys.detail(applicationId)
      : ['applications', 'missing'],
    queryFn: () => applicationsApi.getApplicationById(applicationId!),
    enabled: Boolean(applicationId),
    staleTime: APPLY_QUERY_STALE_MS,
    placeholderData: previous => previous,
  });

  useEffect(() => {
    if (!applicationId) return;
    void prefetchApplicationDetail(queryClient, applicationId);
  }, [applicationId, queryClient]);

  useEffect(() => {
    const total = Number(config?.pricing?.totalAmount ?? 0);
    if (total > 0) {
      void prefetchWalletForPayment(queryClient);
    }
  }, [config?.pricing?.totalAmount, queryClient]);

  // Derived from the application rather than mirrored into local state: a local
  // copy used to survive a delete and make the removed document reappear.
  const uploads = useMemo(() => {
    const next: Record<string, UploadedDoc> = {};
    for (const doc of (application?.documents ?? []) as Array<{
      id?: string;
      documentRequirementId?: string;
      documentRequirement?: { id?: string; name?: string };
      storedFile?: { originalFileName?: string };
    }>) {
      const requirementId =
        doc.documentRequirementId ?? doc.documentRequirement?.id;
      if (!requirementId) continue;
      next[requirementId] = {
        requirementId,
        documentId: doc.id,
        name:
          doc.storedFile?.originalFileName ??
          doc.documentRequirement?.name ??
          t.services.uploadedDocument,
      };
    }
    return next;
  }, [application, t.services.uploadedDocument]);

  const uploadMutation = useMutation({
    mutationFn: async (requirementId: string) => {
      if (!applicationId) throw new Error('Missing application');
      const requirement = config?.documentRequirements?.find(r => r.id === requirementId);
      const picked = await pickDocument(requirement?.allowedFormats);
      if (!picked) {
        return null;
      }

      const check = validateDocumentForRequirement(
        picked,
        requirement?.allowedMimeTypes ?? [],
        requirement?.allowedFormats ?? [],
      );
      if (!check.ok) {
        throw new Error(check.message);
      }

      const session = await applicationsApi.requestDocumentUpload(
        applicationId,
        requirementId,
        picked.name,
        check.mimeType,
      );
      await transferFileToUploadSession(
        picked,
        `/applications/${applicationId}/uploads/${session.uploadSessionId}/file`,
        session,
      );
      const updated = await applicationsApi.completeDocumentUpload(
        applicationId,
        session.uploadSessionId,
        session.storedFileId,
      );

      return updated;
    },
    onSuccess: updated => {
      setUploadingId(null);
      if (!updated || !applicationId) return;
      queryClient.setQueryData(applicationsQueryKeys.detail(applicationId), updated);
    },
    onError: (error: Error) => {
      setUploadingId(null);
      Alert.alert(t.services.uploadFailed, error.message || t.services.couldNotUpload);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (documentId: string) => {
      if (!applicationId) throw new Error('Missing application');
      return applicationsApi.deleteApplicationDocument(applicationId, documentId);
    },
    onSuccess: updated => {
      if (!applicationId) return;
      queryClient.setQueryData(applicationsQueryKeys.detail(applicationId), updated);
    },
    onError: (error: unknown) =>
      Alert.alert(
        t.services.removeFailed,
        getApiErrorMessage(error, t.services.couldNotRemoveDoc),
      ),
  });

  const requirements = useMemo(
    () =>
      [...(config?.documentRequirements ?? [])].sort(
        (a, b) => a.sortOrder - b.sortOrder,
      ),
    [config],
  );

  const styles = useMemo(
    () =>
      StyleSheet.create({
        container: {
          flex: 1,
          backgroundColor: theme.colors.backgroundSecondary,
        },
        title: {
          ...theme.typography.headingSmall,
          color: theme.colors.textPrimary,
          marginBottom: theme.spacing.lg,
        },
        label: {
          ...theme.typography.labelMedium,
          color: theme.colors.textPrimary,
          marginBottom: theme.spacing.sm,
        },
        uploaded: {
          flexDirection: 'row',
          alignItems: 'center',
          gap: theme.spacing.sm,
          padding: theme.spacing.lg,
          borderRadius: theme.radius.lg,
          backgroundColor: theme.colors.backgroundSecondary,
          marginBottom: theme.spacing.lg,
        },
        fileName: {
          flex: 1,
          ...theme.typography.bodyMedium,
          color: theme.colors.textPrimary,
        },
        uploadZone: {
          alignItems: 'center',
          justifyContent: 'center',
          paddingVertical: theme.spacing['2xl'],
          borderRadius: theme.radius.lg,
          borderWidth: 1.5,
          borderStyle: 'dashed',
          borderColor: theme.colors.border,
          backgroundColor: theme.colors.backgroundSecondary,
          marginBottom: theme.spacing.lg,
        },
        uploadHint: {
          ...theme.typography.bodySmall,
          color: theme.colors.textSecondary,
          marginTop: theme.spacing.sm,
          textAlign: 'center',
          paddingHorizontal: theme.spacing.lg,
        },
        center: {
          flex: 1,
          alignItems: 'center',
          justifyContent: 'center',
        },
        optional: {
          ...theme.typography.bodySmall,
          color: theme.colors.textSecondary,
          marginBottom: theme.spacing.lg,
        },
      }),
    [theme],
  );

  const requiredIds = requirements.filter(r => r.required).map(r => r.id);
  const allRequiredUploaded = requiredIds.every(id => uploads[id]);

  const handleUpload = useCallback(
    (requirementId: string) => {
      setUploadingId(requirementId);
      uploadMutation.mutate(requirementId);
    },
    [uploadMutation],
  );

  const handleContinue = useCallback(() => {
    if (!applicationId) {
      Alert.alert(t.common.error, t.services.applicationNotFound);
      return;
    }
    navigation.navigate('ReviewApplication', {
      categoryId,
      optionId,
      applicationId,
      stateCode,
      stateName,
    });
    void applicationsApi.validateApplication(applicationId).catch(() => {
      // Validation runs in background; review screen shows latest cached application data.
    });
  }, [applicationId, categoryId, navigation, optionId, stateCode, stateName, t]);

  if (!applicationId) {
    return (
      <View style={styles.container}>
        <ServiceHubHeader title={t.services.uploadProofs} showBack onBack={() => goBackInServicesStack(navigation)} />
        <View style={styles.center}>
          <Text style={styles.uploadHint}>{t.services.startFromForm}</Text>
        </View>
      </View>
    );
  }

  if (isLoading && !config) {
    return (
      <View style={styles.container}>
        <ServiceHubHeader title={t.services.uploadProofs} showBack onBack={() => goBackInServicesStack(navigation)} />
        <View style={styles.center}>
          <ActivityIndicator color={theme.colors.primary} />
        </View>
      </View>
    );
  }

  if (requirements.length === 0) {
    return (
      <TabStackScreenLayout
        header={
          <ServiceHubHeader
            title={t.services.uploadProofs}
            showBack
            onBack={() => goBackInServicesStack(navigation)}
            step={2}
            totalSteps={5}
          />
        }
        footer={<Button title={t.common.continue} onPress={handleContinue} />}
        scroll={false}>
        <Text style={styles.optional}>{t.services.noDocumentsRequired}</Text>
      </TabStackScreenLayout>
    );
  }

  return (
    <TabStackScreenLayout
      header={
        <ServiceHubHeader
          title={t.services.uploadProofs}
          showBack
          onBack={() => goBackInServicesStack(navigation)}
          step={2}
          totalSteps={5}
        />
      }
      footer={
        <Button
          title={t.common.continue}
          disabled={!allRequiredUploaded || uploadMutation.isPending}
          onPress={handleContinue}
        />
      }>
      <Text style={styles.title}>{t.services.requiredDocs}</Text>

      {requirements.map(doc => {
        const uploaded = uploads[doc.id];
        const isUploading = uploadingId === doc.id;
        const formats = (doc.allowedFormats ?? []).join(', ').toUpperCase() || 'PDF, JPG, PNG';
        return (
          <View key={doc.id}>
            <Text style={styles.label}>
              {doc.name}
              {!doc.required ? ` ${t.services.optionalSuffix}` : ' *'}
            </Text>
            {uploaded ? (
              <View style={styles.uploaded}>
                <FileDocIcon color={theme.colors.primary} size={22} />
                <Text style={styles.fileName} numberOfLines={1}>
                  {uploaded.name}
                </Text>
                <Pressable
                  accessibilityRole="button"
                  disabled={!uploaded.documentId || deleteMutation.isPending}
                  onPress={() =>
                    uploaded.documentId &&
                    deleteMutation.mutate(uploaded.documentId)
                  }>
                  <TrashIcon color="#EF4444" size={18} />
                </Pressable>
                <CheckCircleIcon color="#10B981" size={20} />
              </View>
            ) : (
              <Pressable
                style={styles.uploadZone}
                accessibilityRole="button"
                disabled={isUploading}
                onPress={() => handleUpload(doc.id)}>
                {isUploading ? (
                  <ActivityIndicator color={theme.colors.primary} />
                ) : (
                  <CloudUploadIcon color={theme.colors.textSecondary} />
                )}
                <Text style={styles.uploadHint}>
                  {doc.description ?? format(t.services.tapToChooseFile, { formats })}
                </Text>
              </Pressable>
            )}
          </View>
        );
      })}
    </TabStackScreenLayout>
  );
};
