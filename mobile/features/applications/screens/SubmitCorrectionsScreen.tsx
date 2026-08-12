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
import { ApplicationsStackParamList } from '@/types/navigation';
import { useTranslation } from '@/i18n';
import { useTheme } from '@app/providers/ThemeProvider';
import { Button } from '@components/Button';
import { TabStackScreenLayout } from '@components/layout';
import { Input } from '@components/Input';
import { CloudUploadIcon, FileDocIcon } from '@components/icons';
import { GradientScreenHeader } from '@features/profile/components/GradientScreenHeader';
import {
  pickDocument,
  transferFileToUploadSession,
} from '@features/services/utils/documentUpload';
import {
  applicationsApi,
  applicationsQueryKeys,
  mapApplicationDetail,
} from '@services/api';

type Props = NativeStackScreenProps<
  ApplicationsStackParamList,
  'SubmitCorrections'
>;

function humanizeKey(key: string): string {
  return key
    .replace(/_/g, ' ')
    .replace(/([a-z])([A-Z])/g, '$1 $2')
    .replace(/\b\w/g, char => char.toUpperCase());
}

export const SubmitCorrectionsScreen: React.FC<Props> = ({
  navigation,
  route,
}) => {
  const { applicationId } = route.params;
  const { theme } = useTheme();
  const { t } = useTranslation();
  const queryClient = useQueryClient();
  const [values, setValues] = useState<Record<string, string>>({});
  const [uploadedDocs, setUploadedDocs] = useState<Record<string, string>>({});
  const [uploadingDocId, setUploadingDocId] = useState<string | null>(null);

  const { data, isLoading } = useQuery({
    queryKey: applicationsQueryKeys.detail(applicationId),
    queryFn: () => applicationsApi.getApplicationById(applicationId),
  });

  const application = useMemo(
    () => (data ? mapApplicationDetail(data) : null),
    [data],
  );

  const openActionRequest =
    application?.openActionRequest ??
    data?.actionRequests?.find(r => r.status === 'OPEN');

  const requiredKeys = openActionRequest?.requiredFieldKeys ?? [];
  const requiredDocumentIds = openActionRequest?.requiredDocumentIds ?? [];

  const documentLabel = useCallback(
    (requirementId: string) => {
      const docs = (data?.documents ?? []) as Array<{
        documentRequirementId?: string;
        documentRequirement?: { id?: string; name?: string };
      }>;
      const match = docs.find(
        d =>
          (d.documentRequirementId ?? d.documentRequirement?.id) ===
          requirementId,
      );
      return (
        match?.documentRequirement?.name ??
        `Document ${requirementId.slice(0, 8)}`
      );
    },
    [data?.documents],
  );

  const uploadDocMutation = useMutation({
    mutationFn: async (documentRequirementId: string) => {
      const picked = await pickDocument();
      if (!picked) return null;

      const session = await applicationsApi.requestDocumentUpload(
        applicationId,
        documentRequirementId,
        picked.name,
        picked.mimeType,
      );
      await transferFileToUploadSession(
        picked,
        `/applications/${applicationId}/uploads/${session.uploadSessionId}/file`,
        session,
      );
      await applicationsApi.completeDocumentUpload(
        applicationId,
        session.uploadSessionId,
        session.storedFileId,
      );
      return { documentRequirementId, name: picked.name };
    },
    onSuccess: result => {
      setUploadingDocId(null);
      if (!result) return;
      setUploadedDocs(prev => ({
        ...prev,
        [result.documentRequirementId]: result.name,
      }));
      queryClient.invalidateQueries({
        queryKey: applicationsQueryKeys.detail(applicationId),
      });
    },
    onError: (error: Error) => {
      setUploadingDocId(null);
      Alert.alert(
        t.common.error,
        error.message || t.common.pleaseTryAgain,
      );
    },
  });

  const submitMutation = useMutation({
    mutationFn: () => applicationsApi.submitCorrection(applicationId, values),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: applicationsQueryKeys.detail(applicationId),
      });
      navigation.replace('ApplicationDetail', { applicationId });
    },
    onError: (error: Error) => {
      Alert.alert(
        t.common.error,
        error.message || t.applications.couldNotSubmitCorrections,
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
        intro: {
          ...theme.typography.bodyMedium,
          color: theme.colors.textSecondary,
          marginBottom: theme.spacing.lg,
        },
        reason: {
          ...theme.typography.labelMedium,
          color: theme.colors.textPrimary,
          marginBottom: theme.spacing.sm,
        },
        field: {
          marginBottom: theme.spacing.lg,
        },
        label: {
          ...theme.typography.labelMedium,
          color: theme.colors.textPrimary,
          marginBottom: theme.spacing.sm,
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
        uploadHint: {
          ...theme.typography.bodySmall,
          color: theme.colors.textSecondary,
          marginTop: theme.spacing.sm,
        },
        center: {
          flex: 1,
          alignItems: 'center',
          justifyContent: 'center',
        },
        emptyHint: {
          ...theme.typography.bodySmall,
          color: theme.colors.textSecondary,
          marginBottom: theme.spacing.lg,
        },
      }),
    [theme],
  );

  if (isLoading || !application) {
    return (
      <View style={styles.container}>
        <GradientScreenHeader
          title={t.applications.submitCorrections}
          showBack
          onBack={() => navigation.goBack()}
        />
        <View style={styles.center}>
          <ActivityIndicator color={theme.colors.primary} />
        </View>
      </View>
    );
  }

  const instructions =
    openActionRequest?.instructions ??
    openActionRequest?.reason ??
    'Please update the requested information and resubmit.';

  const canSubmit = Boolean(openActionRequest) && !submitMutation.isPending;

  return (
    <TabStackScreenLayout
      header={
        <GradientScreenHeader
          title={t.applications.submitCorrections}
          showBack
          onBack={() => navigation.goBack()}
        />
      }
      footer={
        <Button
          title={
            submitMutation.isPending
              ? t.common.processing
              : t.applications.submitCorrections
          }
          onPress={() => submitMutation.mutate()}
          disabled={!canSubmit}
          loading={submitMutation.isPending}
        />
      }>
      {openActionRequest?.reason ? (
        <Text style={styles.reason}>{openActionRequest.reason}</Text>
      ) : null}
      <Text style={styles.intro}>{instructions}</Text>

      {requiredKeys.length === 0 && requiredDocumentIds.length === 0 ? (
        <Text style={styles.emptyHint}>
          No specific fields were requested. You can submit to confirm
          corrections are complete.
        </Text>
      ) : null}

      {requiredKeys.map(key => (
        <View key={key} style={styles.field}>
          <Text style={styles.label}>{humanizeKey(key)}</Text>
          <Input
            value={
              values[key] ??
              String(
                data?.fieldValues.find(fv => fv.fieldKey === key)?.value ??
                  '',
              )
            }
            onChangeText={text =>
              setValues(prev => ({ ...prev, [key]: text }))
            }
          />
        </View>
      ))}

      {requiredDocumentIds.map(docId => {
        const uploadedName = uploadedDocs[docId];
        const isUploading = uploadingDocId === docId;
        return (
          <View key={docId}>
            <Text style={styles.label}>{documentLabel(docId)}</Text>
            {uploadedName ? (
              <View style={styles.uploaded}>
                <FileDocIcon color={theme.colors.primary} size={20} />
                <Text style={styles.fileName}>{uploadedName}</Text>
              </View>
            ) : (
              <Pressable
                style={styles.uploadZone}
                accessibilityRole="button"
                disabled={isUploading || uploadDocMutation.isPending}
                onPress={() => {
                  setUploadingDocId(docId);
                  uploadDocMutation.mutate(docId);
                }}>
                {isUploading ? (
                  <ActivityIndicator color={theme.colors.primary} />
                ) : (
                  <>
                    <CloudUploadIcon color={theme.colors.primary} size={28} />
                    <Text style={styles.uploadHint}>
                      Tap to upload document
                    </Text>
                  </>
                )}
              </Pressable>
            )}
          </View>
        );
      })}
    </TabStackScreenLayout>
  );
};
