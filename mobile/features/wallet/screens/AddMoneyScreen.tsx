import React, { useMemo, useState } from 'react';
import {
  Alert,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useSelector } from 'react-redux';
import { WalletStackParamList } from '@/types/navigation';
import { formatAmountInput, QUICK_AMOUNTS } from '@constants/index';
import { useTranslation } from '@/i18n';
import { useTheme } from '@app/providers/ThemeProvider';
import { Button } from '@components/Button';
import { ScrollScreenAction } from '@components/layout';
import { BackIcon } from '@components/icons';
import {
  isRazorpayUserCancelled,
  processWalletTopUp,
} from '@features/wallet/utils/walletTopUp';
import { walletApi, walletQueryKeys } from '@services/api';
import type { RootState } from '@app/store';
import { getScrollBottomPadding } from '@utils/layout';

type Props = NativeStackScreenProps<WalletStackParamList, 'AddMoney'>;

export const AddMoneyScreen: React.FC<Props> = ({ navigation }) => {
  const { theme } = useTheme();
  const insets = useSafeAreaInsets();
  const { t, format } = useTranslation();
  const queryClient = useQueryClient();
  const citizen = useSelector((state: RootState) => state.auth.citizen);
  const [amount, setAmount] = useState(2000);
  const [confirmVisible, setConfirmVisible] = useState(false);
  const [processing, setProcessing] = useState(false);

  const { data: wallet } = useQuery({
    queryKey: walletQueryKeys.summary(),
    queryFn: () => walletApi.getWalletSummary(),
  });

  const balance = wallet?.balance ?? 0;

  const openConfirm = () => {
    if (amount < 1) {
      Alert.alert(t.common.error, t.wallet.minAmount);
      return;
    }
    setConfirmVisible(true);
  };

  const runPayment = async () => {
    setProcessing(true);
    try {
      const idempotencyKey = `topup_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
      await processWalletTopUp({
        amount,
        idempotencyKey,
        prefill: {
          contact: citizen?.phone,
          email: citizen?.email ?? undefined,
          name: [citizen?.firstName, citizen?.lastName].filter(Boolean).join(' ') || undefined,
        },
      });
      await queryClient.invalidateQueries({ queryKey: walletQueryKeys.summary() });
      setConfirmVisible(false);
      Alert.alert(
        t.wallet.paymentSuccessful,
        format(t.wallet.moneyAddedSuccess, { amount: formatAmountInput(amount) }),
        [{ text: t.common.ok, onPress: () => navigation.goBack() }],
      );
    } catch (error) {
      if (isRazorpayUserCancelled(error)) return;
      Alert.alert(t.common.error, t.wallet.topUpFailed ?? t.common.pleaseTryAgain);
    } finally {
      setProcessing(false);
    }
  };

  const styles = useMemo(
    () =>
      StyleSheet.create({
        container: {
          flex: 1,
          backgroundColor: theme.colors.backgroundSecondary,
        },
        headerGradient: {
          paddingTop: insets.top + theme.spacing.md,
          paddingHorizontal: theme.spacing['2xl'],
          paddingBottom: theme.spacing['3xl'],
          borderBottomLeftRadius: theme.radius['3xl'],
          borderBottomRightRadius: theme.radius['3xl'],
        },
        headerRow: {
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'center',
          minHeight: 44,
        },
        backButton: {
          position: 'absolute',
          left: 0,
          width: 40,
          height: 40,
          borderRadius: theme.radius.full,
          backgroundColor: theme.colors.surface,
          alignItems: 'center',
          justifyContent: 'center',
        },
        headerTitle: {
          ...theme.typography.headingMedium,
          color: theme.colors.textInverse,
        },
        content: {
          flex: 1,
          backgroundColor: theme.colors.surface,
          borderTopLeftRadius: theme.radius['3xl'],
          borderTopRightRadius: theme.radius['3xl'],
          marginTop: -theme.spacing.lg,
        },
        scrollContent: {
          paddingHorizontal: theme.spacing['2xl'],
          paddingTop: theme.spacing['2xl'],
          paddingBottom: getScrollBottomPadding(insets, theme.spacing.lg),
        },
        balanceCard: {
          flexDirection: 'row',
          justifyContent: 'space-between',
          alignItems: 'center',
          backgroundColor: theme.colors.surface,
          borderRadius: theme.radius.lg,
          padding: theme.spacing.lg,
          borderWidth: 1,
          borderColor: theme.colors.border,
          marginBottom: theme.spacing['2xl'],
          ...theme.shadows.sm,
        },
        balanceLabel: {
          ...theme.typography.bodyMedium,
          color: theme.colors.primary,
        },
        balanceValue: {
          ...theme.typography.headingMedium,
          color: theme.colors.primary,
        },
        sectionLabel: {
          ...theme.typography.labelMedium,
          color: theme.colors.textPrimary,
          marginBottom: theme.spacing.md,
        },
        amountInput: {
          flexDirection: 'row',
          alignItems: 'center',
          borderWidth: 2,
          borderColor: theme.colors.primary,
          borderRadius: theme.radius.lg,
          paddingHorizontal: theme.spacing.lg,
          paddingVertical: theme.spacing.lg,
          marginBottom: theme.spacing.lg,
        },
        rupee: {
          fontSize: 28,
          fontWeight: '700',
          color: theme.colors.primary,
          marginRight: theme.spacing.sm,
        },
        amountText: {
          flex: 1,
          fontSize: 28,
          fontWeight: '700',
          color: theme.colors.textPrimary,
          padding: 0,
        },
        chipsRow: {
          flexDirection: 'row',
          gap: theme.spacing.sm,
          marginBottom: theme.spacing['2xl'],
        },
        chip: {
          flex: 1,
          paddingVertical: theme.spacing.md,
          borderRadius: theme.radius.lg,
          borderWidth: 1,
          borderColor: theme.colors.border,
          alignItems: 'center',
        },
        chipActive: {
          backgroundColor: theme.colors.primary,
          borderColor: theme.colors.primary,
        },
        chipText: {
          ...theme.typography.labelSmall,
          color: theme.colors.textSecondary,
        },
        chipTextActive: {
          color: theme.colors.textInverse,
        },
        sourceCard: {
          flexDirection: 'row',
          alignItems: 'center',
          padding: theme.spacing.lg,
          borderRadius: theme.radius.lg,
          borderWidth: 1.5,
          borderColor: theme.colors.border,
          marginBottom: theme.spacing.md,
          gap: theme.spacing.md,
        },
        sourceCardActive: {
          borderColor: theme.colors.primary,
          backgroundColor: 'rgba(37, 99, 235, 0.04)',
        },
        sourceIcon: {
          width: 40,
          height: 40,
          borderRadius: theme.radius.md,
          backgroundColor: theme.colors.backgroundSecondary,
          alignItems: 'center',
          justifyContent: 'center',
        },
        sourceContent: {
          flex: 1,
        },
        sourceTitle: {
          ...theme.typography.labelMedium,
          color: theme.colors.textPrimary,
        },
        sourceSub: {
          ...theme.typography.bodySmall,
          color: theme.colors.textSecondary,
          marginTop: 2,
        },
        modalBackdrop: {
          flex: 1,
          backgroundColor: 'rgba(15, 23, 42, 0.45)',
          justifyContent: 'flex-end',
        },
        modalCard: {
          backgroundColor: theme.colors.surface,
          borderTopLeftRadius: theme.radius['3xl'],
          borderTopRightRadius: theme.radius['3xl'],
          padding: theme.spacing['2xl'],
          paddingBottom: insets.bottom + theme.spacing['2xl'],
          gap: theme.spacing.md,
        },
        modalTitle: {
          ...theme.typography.headingSmall,
          color: theme.colors.textPrimary,
        },
        modalBody: {
          ...theme.typography.bodyMedium,
          color: theme.colors.textSecondary,
          lineHeight: 22,
        },
        modalAmount: {
          ...theme.typography.headingMedium,
          color: theme.colors.primary,
          textAlign: 'center',
          marginVertical: theme.spacing.sm,
        },
        modalSource: {
          backgroundColor: theme.colors.backgroundSecondary,
          borderRadius: theme.radius.lg,
          padding: theme.spacing.lg,
        },
        processingRow: {
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'center',
          gap: theme.spacing.sm,
          paddingVertical: theme.spacing.lg,
        },
      }),
    [theme, insets],
  );

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={[theme.colors.gradientHeaderStart, theme.colors.gradientHeaderEnd]}
        style={styles.headerGradient}>
        <View style={styles.headerRow}>
          <Pressable
            style={styles.backButton}
            accessibilityRole="button"
            onPress={() => navigation.goBack()}>
            <BackIcon color={theme.colors.textPrimary} />
          </Pressable>
          <Text style={styles.headerTitle}>{t.wallet.addMoney}</Text>
        </View>
      </LinearGradient>

      <ScrollView
        style={styles.content}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}>
        <View style={styles.balanceCard}>
          <Text style={styles.balanceLabel}>{t.wallet.currentBalance}</Text>
          <Text style={styles.balanceValue}>
            ₹{balance.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
          </Text>
        </View>

        <Text style={styles.sectionLabel}>{t.wallet.enterAmount}</Text>
        <View style={styles.amountInput}>
          <Text style={styles.rupee}>₹</Text>
          <TextInput
            style={styles.amountText}
            keyboardType="number-pad"
            value={formatAmountInput(amount)}
            onChangeText={text => {
              const num = parseInt(text.replace(/\D/g, ''), 10);
              setAmount(Number.isNaN(num) ? 0 : num);
            }}
          />
        </View>

        <View style={styles.chipsRow}>
          {QUICK_AMOUNTS.map(quick => {
            const isActive = amount === quick;
            return (
              <Pressable
                key={quick}
                style={[styles.chip, isActive && styles.chipActive]}
                onPress={() => setAmount(quick)}>
                <Text
                  style={[styles.chipText, isActive && styles.chipTextActive]}>
                  + ₹{quick.toLocaleString('en-IN')}
                </Text>
              </Pressable>
            );
          })}
        </View>

        <View style={[styles.sourceCard, styles.sourceCardActive]}>
          <View style={styles.sourceContent}>
            <Text style={styles.sourceTitle}>{t.services.payViaRazorpay}</Text>
            <Text style={styles.sourceSub}>{t.services.razorpayMethodsHint}</Text>
            <Text style={[styles.sourceSub, { marginTop: 6, color: theme.colors.primary }]}>
              {t.services.securedRazorpay}
            </Text>
          </View>
        </View>

        <ScrollScreenAction>
          <Button
            title={format(t.wallet.proceedToPay, { amount: formatAmountInput(amount) })}
            onPress={openConfirm}
          />
        </ScrollScreenAction>
      </ScrollView>

      <Modal
        visible={confirmVisible}
        transparent
        animationType="slide"
        onRequestClose={() => !processing && setConfirmVisible(false)}>
        <View style={styles.modalBackdrop}>
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>{t.wallet.confirmPayment}</Text>
            <Text style={styles.modalBody}>{t.wallet.demoPaymentHint}</Text>
            <Text style={styles.modalAmount}>₹{formatAmountInput(amount)}.00</Text>
            {processing ? (
              <View style={styles.processingRow}>
                <Text style={styles.modalBody}>{t.wallet.processingPayment}</Text>
              </View>
            ) : (
              <>
                <Button
                  title={format(t.wallet.payNow, { amount: formatAmountInput(amount) })}
                  onPress={() => void runPayment()}
                />
                <Button
                  title={t.common.cancel}
                  variant="outline"
                  onPress={() => setConfirmVisible(false)}
                />
              </>
            )}
          </View>
        </View>
      </Modal>
    </View>
  );
};
