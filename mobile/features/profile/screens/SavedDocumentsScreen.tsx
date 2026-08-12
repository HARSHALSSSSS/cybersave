import React, { useCallback, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Linking,
  ListRenderItem,
  Modal,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { ProfileStackParamList } from '@/types/navigation';
import { useTranslation } from '@/i18n';
import { useTheme } from '@app/providers/ThemeProvider';
import { GradientScreenHeader } from '@features/profile/components/GradientScreenHeader';
import { FilterChips } from '@features/services/components';
import {
  pickDocument,
  rewriteStorageUrl,
  transferFileToUploadSession,
  type PickedDocument,
} from '@features/services/utils/documentUpload';
import {
  EyeIcon,
  FileDocIcon,
  ShareIcon,
  TrashIcon,
} from '@components/icons';
import {
  CitizenSavedDocument,
  profileApi,
  profileQueryKeys,
} from '@services/api';

type Props = NativeStackScreenProps<ProfileStackParamList, 'SavedDocuments'>;

const DOCUMENT_FILTERS = ['All', 'ID', 'Address', 'Other'] as const;
type DocumentFilter = (typeof DOCUMENT_FILTERS)[number];

function formatUploaded(iso: string): string {
  return new Date(iso).toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
}

function formatSize(bytes?: number | null): string {
  if (!bytes || bytes <= 0) return '—';
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export const SavedDocumentsScreen: React.FC<Props> = ({ navigation }) => {
  const { theme } = useTheme();
  const insets = useSafeAreaInsets();
  const { t } = useTranslation();
  const queryClient = useQueryClient();
  const [activeFilter, setActiveFilter] = useState<DocumentFilter>('All');
  const [modalVisible, setModalVisible] = useState(false);
  const [name, setName] = useState('');
  const [documentType, setDocumentType] = useState('Other');
  const [pickedFile, setPickedFile] = useState<PickedDocument | null>(null);
  const [saving, setSaving] = useState(false);

  const { data: documents = [], isLoading, isError, refetch, isRefetching } =
    useQuery({
      queryKey: profileQueryKeys.documents(),
      queryFn: () => profileApi.listSavedDocuments(),
    });

  const invalidate = useCallback(() => {
    void queryClient.invalidateQueries({ queryKey: profileQueryKeys.documents() });
  }, [queryClient]);

  const deleteMutation = useMutation({
    mutationFn: (id: string) => profileApi.deleteSavedDocument(id),
    onSuccess: invalidate,
    onError: () => Alert.alert(t.common.error, t.common.couldNotDelete),
  });

  const filtered = useMemo(() => {
    if (activeFilter === 'All') return documents;
    return documents.filter(doc => {
      const type = (doc.documentType ?? 'Other').toLowerCase();
      return type.includes(activeFilter.toLowerCase());
    });
  }, [documents, activeFilter]);

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
          paddingTop: theme.spacing['2xl'],
        },
        uploadButton: {
          marginHorizontal: theme.spacing['2xl'],
          marginBottom: theme.spacing.lg,
          paddingVertical: theme.spacing.lg,
          borderRadius: theme.radius.lg,
          borderWidth: 1.5,
          borderStyle: 'dashed',
          borderColor: theme.colors.primary,
          alignItems: 'center',
        },
        uploadText: {
          ...theme.typography.labelLarge,
          color: theme.colors.primary,
        },
        docCard: {
          marginHorizontal: theme.spacing['2xl'],
          marginBottom: theme.spacing.md,
          borderRadius: theme.radius.lg,
          borderWidth: 1,
          borderColor: theme.colors.border,
          backgroundColor: theme.colors.surface,
          overflow: 'hidden',
        },
        docHeader: {
          flexDirection: 'row',
          padding: theme.spacing.lg,
          gap: theme.spacing.md,
        },
        docIcon: {
          width: 48,
          height: 48,
          borderRadius: theme.radius.md,
          backgroundColor: '#DBEAFE',
          alignItems: 'center',
          justifyContent: 'center',
        },
        docInfo: {
          flex: 1,
        },
        docTitleRow: {
          flexDirection: 'row',
          justifyContent: 'space-between',
          alignItems: 'flex-start',
          gap: theme.spacing.sm,
        },
        docName: {
          ...theme.typography.labelLarge,
          color: theme.colors.textPrimary,
          flex: 1,
        },
        categoryTag: {
          paddingHorizontal: theme.spacing.sm,
          paddingVertical: theme.spacing.xxs,
          borderRadius: theme.radius.xs,
          backgroundColor: theme.colors.backgroundSecondary,
        },
        categoryText: {
          ...theme.typography.caption,
          letterSpacing: 0,
          fontSize: 10,
          color: theme.colors.textSecondary,
        },
        docMeta: {
          ...theme.typography.bodySmall,
          color: theme.colors.textSecondary,
          marginTop: theme.spacing.xxs,
        },
        docActions: {
          flexDirection: 'row',
          alignItems: 'center',
          borderTopWidth: 1,
          borderTopColor: theme.colors.border,
          paddingVertical: theme.spacing.sm,
          paddingHorizontal: theme.spacing.lg,
        },
        actionBtn: {
          flexDirection: 'row',
          alignItems: 'center',
          gap: theme.spacing.xxs,
          paddingRight: theme.spacing.lg,
        },
        actionText: {
          ...theme.typography.bodySmall,
          color: theme.colors.textSecondary,
        },
        deleteBtn: {
          marginLeft: 'auto',
          padding: theme.spacing.xs,
        },
        listContent: {
          paddingBottom: insets.bottom + 100,
        },
        center: {
          padding: theme.spacing['3xl'],
          alignItems: 'center',
        },
        message: {
          ...theme.typography.bodyMedium,
          color: theme.colors.textSecondary,
          textAlign: 'center',
        },
        retry: {
          ...theme.typography.labelMedium,
          color: theme.colors.primary,
          marginTop: theme.spacing.sm,
        },
        modalBackdrop: {
          flex: 1,
          backgroundColor: 'rgba(15, 23, 42, 0.45)',
          justifyContent: 'flex-end',
        },
        modalCard: {
          backgroundColor: theme.colors.surface,
          borderTopLeftRadius: theme.radius['2xl'],
          borderTopRightRadius: theme.radius['2xl'],
          padding: theme.spacing['2xl'],
          paddingBottom: insets.bottom + theme.spacing['2xl'],
          gap: theme.spacing.md,
        },
        modalTitle: {
          ...theme.typography.headingSmall,
          color: theme.colors.textPrimary,
        },
        fileHint: {
          ...theme.typography.bodySmall,
          color: theme.colors.textSecondary,
        },
        input: {
          borderWidth: 1,
          borderColor: theme.colors.border,
          borderRadius: theme.radius.md,
          paddingHorizontal: theme.spacing.md,
          paddingVertical: theme.spacing.md,
          ...theme.typography.bodyMedium,
          color: theme.colors.textPrimary,
        },
        typeRow: {
          flexDirection: 'row',
          flexWrap: 'wrap',
          gap: theme.spacing.sm,
        },
        typeChip: {
          paddingHorizontal: theme.spacing.md,
          paddingVertical: theme.spacing.sm,
          borderRadius: theme.radius.full,
          borderWidth: 1,
          borderColor: theme.colors.border,
        },
        typeChipActive: {
          borderColor: theme.colors.primary,
          backgroundColor: '#DBEAFE',
        },
        typeChipText: {
          ...theme.typography.labelMedium,
          color: theme.colors.textSecondary,
        },
        typeChipTextActive: {
          color: theme.colors.primary,
        },
        modalActions: {
          flexDirection: 'row',
          gap: theme.spacing.md,
          marginTop: theme.spacing.sm,
        },
        modalBtn: {
          flex: 1,
          paddingVertical: theme.spacing.md,
          borderRadius: theme.radius.md,
          alignItems: 'center',
        },
        cancelBtn: {
          borderWidth: 1,
          borderColor: theme.colors.border,
        },
        saveBtn: {
          backgroundColor: theme.colors.primary,
        },
        cancelText: {
          ...theme.typography.labelLarge,
          color: theme.colors.textPrimary,
        },
        saveText: {
          ...theme.typography.labelLarge,
          color: '#FFFFFF',
        },
      }),
    [theme, insets],
  );

  const resetModal = useCallback(() => {
    setModalVisible(false);
    setName('');
    setDocumentType('Other');
    setPickedFile(null);
  }, []);

  const handleAddPress = useCallback(async () => {
    try {
      const picked = await pickDocument();
      if (!picked) return;
      setPickedFile(picked);
      setName(picked.name.replace(/\.[^.]+$/, '') || picked.name);
      setDocumentType('Other');
      setModalVisible(true);
    } catch (error) {
      Alert.alert(
        t.profile.pickerError,
        error instanceof Error ? error.message : t.profile.couldNotOpenPicker,
      );
    }
  }, []);

  const getDownloadUrl = useCallback(async (id: string) => {
    const result = await profileApi.getSavedDocumentDownload(id);
    return rewriteStorageUrl(result.downloadUrl);
  }, []);

  const handleView = useCallback(
    async (id: string) => {
      try {
        const url = await getDownloadUrl(id);
        await Linking.openURL(url);
      } catch {
        Alert.alert(t.common.error, t.profile.couldNotOpenDoc);
      }
    },
    [getDownloadUrl],
  );

  const handleShare = useCallback(
    async (id: string) => {
      try {
        const url = await getDownloadUrl(id);
        Alert.alert(t.profile.shareLink, url, [
          { text: t.common.open, onPress: () => void Linking.openURL(url) },
          { text: t.common.close, style: 'cancel' },
        ]);
      } catch {
        Alert.alert(t.common.error, t.profile.couldNotShareLink);
      }
    },
    [getDownloadUrl],
  );

  const handleDelete = useCallback(
    (id: string) => {
      Alert.alert(t.profile.deleteDocument, t.profile.deleteDocumentConfirm, [
        { text: t.common.cancel, style: 'cancel' },
        {
          text: t.common.delete,
          style: 'destructive',
          onPress: () => deleteMutation.mutate(id),
        },
      ]);
    },
    [deleteMutation],
  );

  const handleCreate = useCallback(async () => {
    if (!pickedFile) {
      Alert.alert(t.profile.missingFile, t.profile.pickDocumentFirst);
      return;
    }
    if (!name.trim()) {
      Alert.alert(t.profile.missingName, t.profile.enterDocumentName);
      return;
    }

    setSaving(true);
    try {
      const session = await profileApi.requestDocumentUpload(
        pickedFile.name,
        pickedFile.mimeType,
      );
      await transferFileToUploadSession(
        pickedFile,
        `/profile/documents/uploads/${session.uploadSessionId}/file`,
        session,
      );
      await profileApi.completeDocumentUpload(
        session.uploadSessionId,
        session.storedFileId,
      );
      await profileApi.createSavedDocument({
        name: name.trim(),
        documentType,
        storedFileId: session.storedFileId,
        mimeType: pickedFile.mimeType,
        originalFileName: pickedFile.name,
      });
      invalidate();
      resetModal();
    } catch (error) {
      Alert.alert(
        t.common.error,
        error instanceof Error ? error.message : t.profile.couldNotSaveDocument,
      );
    } finally {
      setSaving(false);
    }
  }, [pickedFile, name, documentType, invalidate, resetModal]);

  const renderItem: ListRenderItem<CitizenSavedDocument> = ({ item }) => (
    <View style={styles.docCard}>
      <View style={styles.docHeader}>
        <View style={styles.docIcon}>
          <FileDocIcon color={theme.colors.primary} size={24} />
        </View>
        <View style={styles.docInfo}>
          <View style={styles.docTitleRow}>
            <Text style={styles.docName}>{item.name}</Text>
            <View style={styles.categoryTag}>
              <Text style={styles.categoryText}>
                {item.documentType ?? 'Other'}
              </Text>
            </View>
          </View>
          <Text style={styles.docMeta}>
            {t.profile.addedOn} {formatUploaded(item.createdAt)} •{' '}
            {formatSize(item.storedFile?.sizeBytes)}
          </Text>
        </View>
      </View>
      <View style={styles.docActions}>
        <Pressable
          style={styles.actionBtn}
          accessibilityRole="button"
          onPress={() => void handleView(item.id)}>
          <EyeIcon />
          <Text style={styles.actionText}>{t.profile.view}</Text>
        </Pressable>
        <Pressable
          style={styles.actionBtn}
          accessibilityRole="button"
          onPress={() => void handleShare(item.id)}>
          <ShareIcon color={theme.colors.textSecondary} size={16} />
          <Text style={styles.actionText}>{t.profile.share}</Text>
        </Pressable>
        <Pressable
          style={styles.deleteBtn}
          accessibilityRole="button"
          onPress={() => handleDelete(item.id)}>
          <TrashIcon />
        </Pressable>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      <GradientScreenHeader
        title={t.profile.myDocuments}
        showBack
        onBack={() => navigation.goBack()}
      />

      <View style={styles.content}>
        <FilterChips
          filters={[...DOCUMENT_FILTERS]}
          active={activeFilter}
          onChange={value => setActiveFilter(value as DocumentFilter)}
        />

        <Pressable
          style={styles.uploadButton}
          accessibilityRole="button"
          onPress={() => void handleAddPress()}>
          <Text style={styles.uploadText}>+ {t.profile.addDocument}</Text>
        </Pressable>

        {isLoading ? (
          <View style={styles.center}>
            <ActivityIndicator color={theme.colors.primary} />
          </View>
        ) : isError ? (
          <View style={styles.center}>
            <Text style={styles.message}>{t.profile.loadDocumentsError}</Text>
            <Pressable onPress={() => void refetch()}>
              <Text style={styles.retry}>{t.common.retry}</Text>
            </Pressable>
          </View>
        ) : (
          <FlatList
            data={filtered}
            renderItem={renderItem}
            keyExtractor={item => item.id}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.listContent}
            refreshing={isRefetching}
            onRefresh={() => void refetch()}
            ListEmptyComponent={
              <Text style={styles.message}>{t.profile.noSavedDocuments}</Text>
            }
          />
        )}
      </View>

      <Modal
        visible={modalVisible}
        animationType="slide"
        transparent
        onRequestClose={resetModal}>
        <View style={styles.modalBackdrop}>
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>{t.profile.addDocument}</Text>
            {pickedFile ? (
              <Text style={styles.fileHint}>{t.profile.fileLabel}: {pickedFile.name}</Text>
            ) : null}
            <TextInput
              style={styles.input}
              placeholder={t.profile.documentName}
              placeholderTextColor={theme.colors.textSecondary}
              value={name}
              onChangeText={setName}
            />
            <View style={styles.typeRow}>
              {DOCUMENT_FILTERS.filter(f => f !== 'All').map(type => (
                <Pressable
                  key={type}
                  style={[
                    styles.typeChip,
                    documentType === type && styles.typeChipActive,
                  ]}
                  onPress={() => setDocumentType(type)}>
                  <Text
                    style={[
                      styles.typeChipText,
                      documentType === type && styles.typeChipTextActive,
                    ]}>
                    {type}
                  </Text>
                </Pressable>
              ))}
            </View>
            <View style={styles.modalActions}>
              <Pressable
                style={[styles.modalBtn, styles.cancelBtn]}
                onPress={resetModal}>
                <Text style={styles.cancelText}>{t.common.cancel}</Text>
              </Pressable>
              <Pressable
                style={[styles.modalBtn, styles.saveBtn]}
                onPress={() => void handleCreate()}
                disabled={saving}>
                <Text style={styles.saveText}>
                  {saving ? t.profile.saving : t.common.save}
                </Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
};




