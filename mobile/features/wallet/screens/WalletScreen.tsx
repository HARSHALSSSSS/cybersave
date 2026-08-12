import React, { useCallback, useMemo, useState } from 'react';
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import { useFocusEffect } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { BottomTabNavigationProp } from '@react-navigation/bottom-tabs';
import { WalletStackParamList, MainTabParamList } from '@/types/navigation';
import {
  formatCurrency,
  getWalletBalance,
  getWalletTransactions,
  LINKED_PAYMENT_METHOD,
  navigateWalletTransaction,
} from '@constants/index';
import { useTranslation } from '@/i18n';
import { useTheme } from '@app/providers/ThemeProvider';
import { getScrollBottomPadding } from '@utils/layout';
import {
  BellIcon,
  BillIcon,
  CardIcon,
  CheckFilledIcon,
  LockSmallIcon,
  PlusIcon,
} from '@components/icons';

type Props = NativeStackScreenProps<WalletStackParamList, 'WalletMain'>;

const RECENT_TRANSACTIONS = () => getWalletTransactions().slice(0, 3);

export const WalletScreen: React.FC<Props> = ({ navigation }) => {
  const { theme } = useTheme();
  const insets = useSafeAreaInsets();
  const { t } = useTranslation();
  const [balance, setBalance] = useState(getWalletBalance());

  useFocusEffect(
    useCallback(() => {
      setBalance(getWalletBalance());
    }, []),
  );

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
          paddingBottom: theme.spacing['4xl'],
          borderBottomLeftRadius: theme.radius['3xl'],
          borderBottomRightRadius: theme.radius['3xl'],
        },
        headerRow: {
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'center',
          minHeight: 44,
        },
        headerTitle: {
          ...theme.typography.headingMedium,
          color: theme.colors.textInverse,
        },
        bellButton: {
          position: 'absolute',
          right: 0,
          width: 40,
          height: 40,
          borderRadius: theme.radius.md,
          backgroundColor: theme.colors.surface,
          alignItems: 'center',
          justifyContent: 'center',
        },
        content: {
          flex: 1,
          marginTop: -theme.spacing['2xl'],
          paddingHorizontal: theme.spacing['2xl'],
        },
        balanceCard: {
          borderRadius: theme.radius.xl,
          padding: theme.spacing['2xl'],
          marginBottom: theme.spacing['2xl'],
          ...theme.shadows.lg,
        },
        balanceLabel: {
          ...theme.typography.bodyMedium,
          color: 'rgba(255,255,255,0.85)',
        },
        balanceRow: {
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginTop: theme.spacing.sm,
        },
        balanceAmount: {
          fontSize: 32,
          fontWeight: '700',
          color: theme.colors.textInverse,
        },
        addButton: {
          width: 44,
          height: 44,
          borderRadius: theme.radius.md,
          backgroundColor: theme.colors.surface,
          alignItems: 'center',
          justifyContent: 'center',
        },
        securedRow: {
          flexDirection: 'row',
          alignItems: 'center',
          gap: theme.spacing.xs,
          marginTop: theme.spacing.lg,
        },
        securedText: {
          ...theme.typography.bodySmall,
          color: 'rgba(255,255,255,0.8)',
        },
        sectionHeader: {
          flexDirection: 'row',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: theme.spacing.md,
        },
        sectionTitle: {
          ...theme.typography.headingSmall,
          color: theme.colors.textPrimary,
        },
        viewAll: {
          ...theme.typography.labelMedium,
          color: theme.colors.primary,
        },
        txCard: {
          flexDirection: 'row',
          alignItems: 'center',
          backgroundColor: theme.colors.surface,
          borderRadius: theme.radius.lg,
          padding: theme.spacing.lg,
          marginBottom: theme.spacing.md,
          borderWidth: 1,
          borderColor: theme.colors.border,
          gap: theme.spacing.md,
          ...theme.shadows.sm,
        },
        txIcon: {
          width: 44,
          height: 44,
          borderRadius: theme.radius.md,
          alignItems: 'center',
          justifyContent: 'center',
        },
        txContent: {
          flex: 1,
        },
        txTitle: {
          ...theme.typography.labelMedium,
          color: theme.colors.textPrimary,
        },
        txTime: {
          ...theme.typography.bodySmall,
          color: theme.colors.textSecondary,
          marginTop: 2,
        },
        txAmount: {
          ...theme.typography.labelMedium,
          fontWeight: '700',
        },
        paymentCard: {
          flexDirection: 'row',
          alignItems: 'center',
          backgroundColor: theme.colors.surface,
          borderRadius: theme.radius.lg,
          padding: theme.spacing.lg,
          borderWidth: 1,
          borderColor: theme.colors.border,
          gap: theme.spacing.md,
        },
        paymentIcon: {
          width: 44,
          height: 44,
          borderRadius: theme.radius.md,
          backgroundColor: theme.colors.backgroundSecondary,
          alignItems: 'center',
          justifyContent: 'center',
        },
        paymentContent: {
          flex: 1,
        },
        paymentTitle: {
          ...theme.typography.labelLarge,
          color: theme.colors.textPrimary,
        },
        paymentSub: {
          ...theme.typography.bodySmall,
          color: theme.colors.textSecondary,
          marginTop: 2,
        },
        scrollContent: {
          paddingBottom: getScrollBottomPadding(insets),
        },
      }),
    [theme, insets],
  );

  const handleTransactionPress = useCallback(
    (tx: ReturnType<typeof getWalletTransactions>[number]) => {
      navigateWalletTransaction(navigation, tx);
    },
    [navigation],
  );

  const goToNotifications = useCallback(() => {
    navigation
      .getParent<BottomTabNavigationProp<MainTabParamList>>()
      ?.navigate('HomeTab', { screen: 'Notifications' });
  }, [navigation]);

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={[theme.colors.gradientHeaderStart, theme.colors.gradientHeaderEnd]}
        style={styles.headerGradient}>
        <View style={styles.headerRow}>
          <Text style={styles.headerTitle}>{t.wallet.title}</Text>
          <Pressable
            style={styles.bellButton}
            accessibilityRole="button"
            onPress={goToNotifications}>
            <BellIcon color={theme.colors.textPrimary} />
          </Pressable>
        </View>
      </LinearGradient>

      <ScrollView
        style={styles.content}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}>
        <LinearGradient
          colors={['#2563EB', '#1D4ED8']}
          style={styles.balanceCard}>
          <Text style={styles.balanceLabel}>{t.wallet.balance}</Text>
          <View style={styles.balanceRow}>
            <Text style={styles.balanceAmount}>
              ₹{balance.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
            </Text>
            <Pressable
              style={styles.addButton}
              accessibilityRole="button"
              accessibilityLabel={t.accessibility.addMoney}
              onPress={() => navigation.navigate('AddMoney')}>
              <PlusIcon color={theme.colors.primary} size={24} />
            </Pressable>
          </View>
          <View style={styles.securedRow}>
            <LockSmallIcon />
            <Text style={styles.securedText}>
              {t.wallet.securedBy}
            </Text>
          </View>
        </LinearGradient>

        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>{t.wallet.transactions}</Text>
          <Pressable
            accessibilityRole="button"
            onPress={() => navigation.navigate('TransactionHistory')}>
            <Text style={styles.viewAll}>{t.wallet.viewAll}</Text>
          </Pressable>
        </View>

        {RECENT_TRANSACTIONS().map(tx => {
          const isCredit = tx.amount > 0;
          const iconBg = isCredit ? '#D1FAE5' : '#FEE2E2';
          const amountColor = isCredit ? '#059669' : theme.colors.textPrimary;

          return (
            <Pressable
              key={tx.id}
              style={styles.txCard}
              accessibilityRole="button"
              onPress={() => handleTransactionPress(tx)}>
              <View style={[styles.txIcon, { backgroundColor: iconBg }]}>
                {isCredit ? (
                  <PlusIcon color="#059669" size={20} />
                ) : (
                  <BillIcon color="#EF4444" size={20} />
                )}
              </View>
              <View style={styles.txContent}>
                <Text style={styles.txTitle}>{tx.title}</Text>
                <Text style={styles.txTime}>{tx.time}</Text>
              </View>
              <Text style={[styles.txAmount, { color: amountColor }]}>
                {formatCurrency(tx.amount)}
              </Text>
            </Pressable>
          );
        })}

        <Text
          style={[
            styles.sectionTitle,
            { marginTop: theme.spacing.lg, marginBottom: theme.spacing.md },
          ]}>
          {t.wallet.linkedPaymentMethods}
        </Text>
        <View style={styles.paymentCard}>
          <View style={styles.paymentIcon}>
            <CardIcon color={theme.colors.textPrimary} size={22} />
          </View>
          <View style={styles.paymentContent}>
            <Text style={styles.paymentTitle}>
              {LINKED_PAYMENT_METHOD.bankName}
            </Text>
            <Text style={styles.paymentSub}>
              {t.wallet.primaryAccount} • {LINKED_PAYMENT_METHOD.accountMasked}
            </Text>
          </View>
          <CheckFilledIcon color="#10B981" size={24} />
        </View>
      </ScrollView>
    </View>
  );
};
