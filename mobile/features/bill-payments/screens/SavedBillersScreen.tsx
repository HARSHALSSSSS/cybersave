import React, { useCallback, useMemo } from 'react';
import {
  Alert,
  FlatList,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useTheme } from '@app/providers/ThemeProvider';
import { useTranslation } from '@/i18n';
import { GradientScreenHeader } from '@features/profile/components';
import { billerInitial, formatRupee } from '@features/bill-payments/components';
import { BillPaymentsStackParamList } from '@/types/navigation';
import { billPaymentsApi, billPaymentsQueryKeys } from '@services/api/billPayments.api';

type Props = NativeStackScreenProps<BillPaymentsStackParamList, 'SavedBillers'>;

export const SavedBillersScreen: React.FC<Props> = ({ navigation }) => {
  const { theme } = useTheme();
  const insets = useSafeAreaInsets();
  const { t } = useTranslation();
  const queryClient = useQueryClient();

  const { data: saved = [] } = useQuery({
    queryKey: billPaymentsQueryKeys.saved(),
    queryFn: () => billPaymentsApi.listSavedBillers(),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => billPaymentsApi.deleteSavedBiller(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: billPaymentsQueryKeys.saved() });
    },
  });

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
          paddingTop: theme.spacing.lg,
          paddingBottom: insets.bottom,
        },
        row: {
          flexDirection: 'row',
          alignItems: 'center',
          marginHorizontal: theme.spacing['2xl'],
          marginBottom: theme.spacing.sm,
          padding: theme.spacing.md,
          borderRadius: theme.radius.xl,
          backgroundColor: theme.colors.backgroundSecondary,
        },
        avatar: {
          width: 44,
          height: 44,
          borderRadius: theme.radius.lg,
          backgroundColor: theme.colors.primaryMuted,
          alignItems: 'center',
          justifyContent: 'center',
          marginRight: theme.spacing.md,
        },
        avatarText: { ...theme.typography.headingSmall, color: theme.colors.primary },
        info: { flex: 1 },
        name: { ...theme.typography.bodyLarge, color: theme.colors.textPrimary },
        meta: { ...theme.typography.bodySmall, color: theme.colors.textSecondary },
        payBtn: {
          paddingVertical: theme.spacing.xs,
          paddingHorizontal: theme.spacing.md,
          borderRadius: theme.radius.full,
          backgroundColor: theme.colors.primary,
        },
        payText: { ...theme.typography.labelSmall, color: theme.colors.textInverse },
        empty: { padding: theme.spacing['3xl'], alignItems: 'center' },
      }),
    [theme, insets.bottom],
  );

  const payAgain = useCallback(
    (billerId: string, accountHolder: Record<string, string>) => {
      navigation.navigate('BillerForm', { billerId, accountHolder });
    },
    [navigation],
  );

  const confirmDelete = (id: string) => {
    Alert.alert(t.bills.removeBiller, t.bills.removeBillerConfirm, [
      { text: t.common.cancel, style: 'cancel' },
      { text: t.common.remove, style: 'destructive', onPress: () => deleteMutation.mutate(id) },
    ]);
  };

  return (
    <View style={styles.container}>
      <GradientScreenHeader title={t.bills.myBillers} showBack onBack={() => navigation.goBack()} />

      <View style={styles.content}>
        <FlatList
          data={saved}
          keyExtractor={item => item.id}
          ListEmptyComponent={
            <View style={styles.empty}>
              <Text style={styles.meta}>{t.bills.savedBillersHint}</Text>
            </View>
          }
          renderItem={({ item }) => (
            <Pressable style={styles.row} onLongPress={() => confirmDelete(item.id)}>
              <View style={styles.avatar}>
                <Text style={styles.avatarText}>{billerInitial(item.billerName)}</Text>
              </View>
              <View style={styles.info}>
                <Text style={styles.name}>{item.nickname ?? item.billerName}</Text>
                <Text style={styles.meta}>
                  {item.accountMasked}
                  {item.lastPaymentAmount ? ` • ${formatRupee(item.lastPaymentAmount)}` : ''}
                </Text>
              </View>
              <Pressable
                style={styles.payBtn}
                onPress={() => payAgain(item.billerId, item.accountHolderData)}>
                <Text style={styles.payText}>{t.bills.payLabel}</Text>
              </Pressable>
            </Pressable>
          )}
        />
      </View>
    </View>
  );
};
