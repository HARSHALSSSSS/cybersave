import React, { useCallback, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  FlatList,
  ListRenderItem,
  Modal,
  Pressable,
  StyleSheet,
  Switch,
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
import { EditIcon, MapPinIcon, TrashIcon } from '@components/icons';
import {
  CitizenAddress,
  CreateAddressPayload,
  profileApi,
  profileQueryKeys,
} from '@services/api';

type Props = NativeStackScreenProps<ProfileStackParamList, 'Addresses'>;

const emptyForm: CreateAddressPayload = {
  label: '',
  line1: '',
  line2: '',
  city: '',
  state: '',
  pincode: '',
  isDefault: false,
};

function formatAddressLines(item: CitizenAddress): string {
  return [item.line1, item.line2, item.city, item.state]
    .filter(Boolean)
    .join(', ');
}

export const AddressesScreen: React.FC<Props> = ({ navigation }) => {
  const { theme } = useTheme();
  const insets = useSafeAreaInsets();
  const { t } = useTranslation();
  const queryClient = useQueryClient();
  const [modalVisible, setModalVisible] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<CreateAddressPayload>(emptyForm);

  const { data: addresses = [], isLoading, isError, refetch, isRefetching } =
    useQuery({
      queryKey: profileQueryKeys.addresses(),
      queryFn: () => profileApi.listAddresses(),
    });

  const invalidate = useCallback(() => {
    void queryClient.invalidateQueries({ queryKey: profileQueryKeys.addresses() });
  }, [queryClient]);

  const createMutation = useMutation({
    mutationFn: (payload: CreateAddressPayload) =>
      profileApi.createAddress(payload),
    onSuccess: () => {
      invalidate();
      setModalVisible(false);
      setForm(emptyForm);
      setEditingId(null);
    },
    onError: () => Alert.alert(t.common.error, t.profile.couldNotSaveAddress),
  });

  const updateMutation = useMutation({
    mutationFn: ({
      id,
      payload,
    }: {
      id: string;
      payload: CreateAddressPayload;
    }) => profileApi.updateAddress(id, payload),
    onSuccess: () => {
      invalidate();
      setModalVisible(false);
      setForm(emptyForm);
      setEditingId(null);
    },
    onError: () => Alert.alert(t.common.error, t.profile.couldNotUpdateAddress),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => profileApi.deleteAddress(id),
    onSuccess: invalidate,
    onError: () => Alert.alert(t.common.error, t.profile.couldNotDeleteAddress),
  });

  const setDefaultMutation = useMutation({
    mutationFn: (id: string) =>
      profileApi.updateAddress(id, { isDefault: true }),
    onSuccess: invalidate,
    onError: () => Alert.alert(t.common.error, t.profile.couldNotSetDefault),
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
          paddingTop: theme.spacing['2xl'],
          paddingHorizontal: theme.spacing['2xl'],
        },
        addButton: {
          paddingVertical: theme.spacing.lg,
          borderRadius: theme.radius.lg,
          borderWidth: 1,
          borderColor: theme.colors.border,
          alignItems: 'center',
          marginBottom: theme.spacing.lg,
          backgroundColor: theme.colors.surface,
        },
        addText: {
          ...theme.typography.labelLarge,
          color: theme.colors.textPrimary,
        },
        addressCard: {
          borderRadius: theme.radius.lg,
          borderWidth: 1,
          borderColor: theme.colors.border,
          padding: theme.spacing.lg,
          marginBottom: theme.spacing.md,
          backgroundColor: theme.colors.surface,
        },
        cardHeader: {
          flexDirection: 'row',
          alignItems: 'center',
          marginBottom: theme.spacing.md,
        },
        iconWrap: {
          marginRight: theme.spacing.sm,
        },
        labelRow: {
          flex: 1,
          flexDirection: 'row',
          alignItems: 'center',
          gap: theme.spacing.sm,
        },
        label: {
          ...theme.typography.labelLarge,
          color: theme.colors.textPrimary,
        },
        defaultBadge: {
          paddingHorizontal: theme.spacing.sm,
          paddingVertical: theme.spacing.xxs,
          borderRadius: theme.radius.full,
          backgroundColor: '#DBEAFE',
        },
        defaultText: {
          ...theme.typography.caption,
          letterSpacing: 0,
          fontSize: 10,
          fontWeight: '600',
          color: theme.colors.primary,
        },
        actions: {
          flexDirection: 'row',
          gap: theme.spacing.md,
        },
        actionBtn: {
          padding: theme.spacing.xs,
        },
        addressText: {
          ...theme.typography.bodyMedium,
          color: theme.colors.textSecondary,
          lineHeight: 22,
          marginBottom: theme.spacing.md,
        },
        pincode: {
          ...theme.typography.labelMedium,
          color: theme.colors.textPrimary,
        },
        setDefault: {
          ...theme.typography.bodySmall,
          color: theme.colors.primary,
          marginTop: theme.spacing.sm,
        },
        listContent: {
          paddingBottom: insets.bottom + 100,
        },
        center: {
          flex: 1,
          alignItems: 'center',
          justifyContent: 'center',
          padding: theme.spacing['3xl'],
        },
        message: {
          ...theme.typography.bodyMedium,
          color: theme.colors.textSecondary,
          textAlign: 'center',
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
          marginBottom: theme.spacing.sm,
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
        switchRow: {
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginTop: theme.spacing.xs,
        },
        switchLabel: {
          ...theme.typography.labelMedium,
          color: theme.colors.textPrimary,
        },
        modalActions: {
          flexDirection: 'row',
          gap: theme.spacing.md,
          marginTop: theme.spacing.md,
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

  const openCreate = useCallback(() => {
    setEditingId(null);
    setForm(emptyForm);
    setModalVisible(true);
  }, []);

  const openEdit = useCallback((item: CitizenAddress) => {
    setEditingId(item.id);
    setForm({
      label: item.label,
      line1: item.line1,
      line2: item.line2 ?? '',
      city: item.city,
      state: item.state,
      pincode: item.pincode,
      isDefault: item.isDefault,
    });
    setModalVisible(true);
  }, []);

  const handleSave = useCallback(() => {
    if (
      !form.label.trim() ||
      !form.line1.trim() ||
      !form.city.trim() ||
      !form.state.trim() ||
      !form.pincode.trim()
    ) {
      Alert.alert(t.common.missingFields, t.profile.fillAddressFields);
      return;
    }

    const payload: CreateAddressPayload = {
      label: form.label.trim(),
      line1: form.line1.trim(),
      line2: form.line2?.trim() || undefined,
      city: form.city.trim(),
      state: form.state.trim(),
      pincode: form.pincode.trim(),
      isDefault: form.isDefault,
    };

    if (editingId) {
      updateMutation.mutate({ id: editingId, payload });
    } else {
      createMutation.mutate(payload);
    }
  }, [form, editingId, createMutation, updateMutation]);

  const handleDelete = useCallback(
    (id: string) => {
      Alert.alert(t.profile.deleteAddress, t.profile.deleteAddressConfirm, [
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

  const renderItem: ListRenderItem<CitizenAddress> = useCallback(
    ({ item }) => (
      <View style={styles.addressCard}>
        <View style={styles.cardHeader}>
          <View style={styles.iconWrap}>
            <MapPinIcon color={theme.colors.primary} size={20} />
          </View>
          <View style={styles.labelRow}>
            <Text style={styles.label}>{item.label}</Text>
            {item.isDefault ? (
              <View style={styles.defaultBadge}>
                <Text style={styles.defaultText}>{t.profile.defaultLabel}</Text>
              </View>
            ) : null}
          </View>
          <View style={styles.actions}>
            <Pressable
              style={styles.actionBtn}
              accessibilityRole="button"
              onPress={() => openEdit(item)}>
              <EditIcon />
            </Pressable>
            <Pressable
              style={styles.actionBtn}
              accessibilityRole="button"
              onPress={() => handleDelete(item.id)}>
              <TrashIcon />
            </Pressable>
          </View>
        </View>
        <Text style={styles.addressText}>{formatAddressLines(item)}</Text>
        <Text style={styles.pincode}>{t.profile.pincodeLabel}: {item.pincode}</Text>
        {!item.isDefault ? (
          <Pressable
            accessibilityRole="button"
            onPress={() => setDefaultMutation.mutate(item.id)}>
            <Text style={styles.setDefault}>{t.profile.setAsDefault}</Text>
          </Pressable>
        ) : null}
      </View>
    ),
    [styles, theme, handleDelete, openEdit, setDefaultMutation, t],
  );

  return (
    <View style={styles.container}>
      <GradientScreenHeader
        title={t.profile.myAddresses}
        showBack
        onBack={() => navigation.goBack()}
      />

      <View style={styles.content}>
        <Pressable
          style={styles.addButton}
          accessibilityRole="button"
          onPress={openCreate}>
          <Text style={styles.addText}>+ {t.profile.addNewAddress}</Text>
        </Pressable>

        {isLoading ? (
          <View style={styles.center}>
            <ActivityIndicator color={theme.colors.primary} />
          </View>
        ) : isError ? (
          <View style={styles.center}>
            <Text style={styles.message}>{t.profile.loadAddressesError}</Text>
            <Pressable onPress={() => void refetch()}>
              <Text style={styles.setDefault}>{t.common.retry}</Text>
            </Pressable>
          </View>
        ) : (
          <FlatList
            data={addresses}
            renderItem={renderItem}
            keyExtractor={item => item.id}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.listContent}
            refreshing={isRefetching}
            onRefresh={() => void refetch()}
            ListEmptyComponent={
              <Text style={styles.message}>{t.profile.noSavedAddresses}</Text>
            }
          />
        )}
      </View>

      <Modal
        visible={modalVisible}
        animationType="slide"
        transparent
        onRequestClose={() => setModalVisible(false)}>
        <View style={styles.modalBackdrop}>
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>
              {editingId ? t.profile.editAddress : t.profile.addAddress}
            </Text>
            {(
              [
                ['label', t.profile.addressLabel],
                ['line1', t.profile.addressLine1],
                ['line2', t.profile.addressLine2],
                ['city', t.profile.addressCity],
                ['state', t.profile.addressState],
                ['pincode', t.profile.pincodeLabel],
              ] as const
            ).map(([key, placeholder]) => (
              <TextInput
                key={key}
                style={styles.input}
                placeholder={placeholder}
                placeholderTextColor={theme.colors.textSecondary}
                value={(form[key] as string) ?? ''}
                onChangeText={text => setForm(prev => ({ ...prev, [key]: text }))}
                autoCapitalize={key === 'pincode' ? 'none' : 'words'}
                keyboardType={key === 'pincode' ? 'number-pad' : 'default'}
              />
            ))}
            <View style={styles.switchRow}>
              <Text style={styles.switchLabel}>{t.profile.setAsDefault}</Text>
              <Switch
                value={!!form.isDefault}
                onValueChange={value =>
                  setForm(prev => ({ ...prev, isDefault: value }))
                }
              />
            </View>
            <View style={styles.modalActions}>
              <Pressable
                style={[styles.modalBtn, styles.cancelBtn]}
                onPress={() => setModalVisible(false)}>
                <Text style={styles.cancelText}>{t.common.cancel}</Text>
              </Pressable>
              <Pressable
                style={[styles.modalBtn, styles.saveBtn]}
                onPress={handleSave}
                disabled={createMutation.isPending || updateMutation.isPending}>
                <Text style={styles.saveText}>
                  {createMutation.isPending || updateMutation.isPending
                    ? t.profile.saving
                    : t.common.save}
                </Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
};
