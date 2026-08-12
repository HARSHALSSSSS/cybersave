import React, { useMemo } from 'react';import LinearGradient from 'react-native-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { WalletStackParamList } from '@/types/navigation';
import { getRefundDetails } from '@constants/index';
import { useTranslation } from '@/i18n';
import { useTheme } from '@app/providers/ThemeProvider';
import { BackIcon } from '@components/icons';

type Props = NativeStackScreenProps<WalletStackParamList, 'RefundStatus'>;

export const RefundStatusScreen: React.FC<Props> = ({ navigation, route }) => {
  const { theme } = useTheme();
  const insets = useSafeAreaInsets();
  const { t } = useTranslation();
  const refund = useMemo(
    () => getRefundDetails(route.params.refundId),
    [route.params.refundId],
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
        scroll: {
          flex: 1,
          paddingHorizontal: theme.spacing['2xl'],
          paddingTop: theme.spacing.lg,
        },
        summaryCard: {
          backgroundColor: '#FFFBEB',
          borderRadius: theme.radius.xl,
          padding: theme.spacing['2xl'],
          marginBottom: theme.spacing['2xl'],
          borderWidth: 1,
          borderColor: '#FDE68A',
        },
        summaryHeader: {
          flexDirection: 'row',
          justifyContent: 'space-between',
          alignItems: 'center',
        },
        statusLabel: {
          ...theme.typography.labelMedium,
          color: '#D97706',
          fontWeight: '700',
          letterSpacing: 0.5,
        },
        refLabel: {
          ...theme.typography.bodySmall,
          color: theme.colors.textSecondary,
        },
        amountLabel: {
          ...theme.typography.bodyMedium,
          color: theme.colors.textSecondary,
          marginTop: theme.spacing.lg,
        },
        amount: {
          fontSize: 32,
          fontWeight: '700',
          color: theme.colors.textPrimary,
          marginTop: theme.spacing.xs,
        },
        sectionTitle: {
          ...theme.typography.headingSmall,
          color: theme.colors.textPrimary,
          marginBottom: theme.spacing.lg,
        },
        stepRow: {
          flexDirection: 'row',
          gap: theme.spacing.lg,
        },
        stepIndicator: {
          alignItems: 'center',
          width: 20,
        },
        stepDot: {
          width: 14,
          height: 14,
          borderRadius: theme.radius.full,
        },
        stepLine: {
          width: 2,
          flex: 1,
          minHeight: 48,
          marginVertical: theme.spacing.xxs,
        },
        stepContent: {
          flex: 1,
          paddingBottom: theme.spacing['2xl'],
        },
        stepTitle: {
          ...theme.typography.labelLarge,
          color: theme.colors.textPrimary,
        },
        stepTitleActive: {
          color: theme.colors.primary,
        },
        stepDesc: {
          ...theme.typography.bodySmall,
          color: theme.colors.textSecondary,
          marginTop: theme.spacing.xxs,
          lineHeight: 20,
        },
        stepTime: {
          ...theme.typography.bodySmall,
          color: theme.colors.textSecondary,
          marginTop: theme.spacing.xs,
        },
        destinationCard: {
          backgroundColor: theme.colors.surface,
          borderRadius: theme.radius.xl,
          padding: theme.spacing['2xl'],
          borderWidth: 1,
          borderColor: theme.colors.border,
          marginBottom: insets.bottom + theme.spacing['2xl'],
        },
        destRow: {
          flexDirection: 'row',
          justifyContent: 'space-between',
          paddingVertical: theme.spacing.md,
          borderBottomWidth: 1,
          borderBottomColor: theme.colors.border,
        },
        destRowLast: {
          borderBottomWidth: 0,
        },
        destLabel: {
          ...theme.typography.bodyMedium,
          color: theme.colors.textSecondary,
        },
        destValue: {
          ...theme.typography.labelMedium,
          color: theme.colors.textPrimary,
          textAlign: 'right',
          flex: 1,
          marginLeft: theme.spacing.lg,
        },
      }),
    [theme, insets],
  );

  const getStepColor = (state: string) => {
    if (state === 'completed') return '#10B981';
    if (state === 'current') return '#F59E0B';
    return theme.colors.border;
  };

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
          <Text style={styles.headerTitle}>{t.wallet.refundStatus}</Text>
        </View>
      </LinearGradient>

      <ScrollView style={styles.scroll} showsVerticalScrollIndicator={false}>
        <View style={styles.summaryCard}>
          <View style={styles.summaryHeader}>
            <Text style={styles.statusLabel}>{refund.status}</Text>
            <Text style={styles.refLabel}>{t.wallet.refPrefix}: {refund.ref}</Text>
          </View>
          <Text style={styles.amountLabel}>{t.wallet.estimatedCredit}</Text>
          <Text style={styles.amount}>
            ₹{refund.amount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
          </Text>
        </View>

        <Text style={styles.sectionTitle}>{t.wallet.refundJourney}</Text>
        {refund.steps.map((step, index) => (
          <View key={step.id} style={styles.stepRow}>
            <View style={styles.stepIndicator}>
              <View
                style={[
                  styles.stepDot,
                  {
                    backgroundColor:
                      step.state === 'pending' ? 'transparent' : getStepColor(step.state),
                    borderWidth: step.state === 'pending' ? 2 : 0,
                    borderColor: theme.colors.border,
                  },
                ]}
              />
              {index < refund.steps.length - 1 ? (
                <View
                  style={[
                    styles.stepLine,
                    {
                      backgroundColor:
                        step.state === 'completed' ? '#10B981' : theme.colors.border,
                    },
                  ]}
                />
              ) : null}
            </View>
            <View style={styles.stepContent}>
              <Text
                style={[
                  styles.stepTitle,
                  step.state === 'current' && styles.stepTitleActive,
                ]}>
                {step.title}
              </Text>
              <Text style={styles.stepDesc}>{step.description}</Text>
              <Text style={styles.stepTime}>{step.timestamp}</Text>
            </View>
          </View>
        ))}

        <View style={styles.destinationCard}>
          <Text style={styles.sectionTitle}>{t.wallet.destinationAccount}</Text>
          <View style={styles.destRow}>
            <Text style={styles.destLabel}>{t.wallet.bankNameLabel}</Text>
            <Text style={styles.destValue}>{refund.destination.bankName}</Text>
          </View>
          <View style={styles.destRow}>
            <Text style={styles.destLabel}>{t.wallet.accountNumberLabel}</Text>
            <Text style={styles.destValue}>
              {refund.destination.accountNumber}
            </Text>
          </View>
          <View style={[styles.destRow, styles.destRowLast]}>
            <Text style={styles.destLabel}>{t.wallet.referenceNumberLabel}</Text>
            <Text style={styles.destValue}>
              {refund.destination.referenceNumber}
            </Text>
          </View>
        </View>
      </ScrollView>
    </View>
  );
};
