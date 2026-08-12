import React, { useMemo } from 'react';
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { ProfileStackParamList } from '@/types/navigation';
import { HELP_TOPICS } from '@constants/index';
import { useTranslation } from '@/i18n';
import { useTheme } from '@app/providers/ThemeProvider';
import { SearchBar } from '@components/SearchBar';
import { GradientScreenHeader } from '@features/profile/components/GradientScreenHeader';
import {
  ChatBubbleIcon,
  ChevronRightSmallIcon,
  MailTicketIcon,
  PhoneIcon,
} from '@components/icons';

type Props = NativeStackScreenProps<ProfileStackParamList, 'HelpSupport'>;

export const HelpSupportScreen: React.FC<Props> = ({ navigation }) => {
  const { theme } = useTheme();
  const insets = useSafeAreaInsets();
  const { t } = useTranslation();

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
        searchWrap: {
          paddingHorizontal: theme.spacing['2xl'],
          marginBottom: theme.spacing.lg,
        },
        openTicketWrap: {
          flexDirection: 'row',
          paddingHorizontal: theme.spacing['2xl'],
          marginBottom: theme.spacing['2xl'],
          gap: theme.spacing.md,
          justifyContent: 'space-between',
        },
        openTicketCard: {
          flex: 1,
          alignItems: 'center',
          paddingVertical: theme.spacing.lg,
          paddingHorizontal: theme.spacing.sm,
          borderRadius: theme.radius.lg,
          borderWidth: 1,
          borderColor: theme.colors.border,
          backgroundColor: theme.colors.surface,
          ...theme.shadows.sm,
        },
        quickIcon: {
          width: 44,
          height: 44,
          borderRadius: theme.radius.full,
          backgroundColor: '#FEE2E2',
          alignItems: 'center',
          justifyContent: 'center',
          marginBottom: theme.spacing.sm,
        },
        quickLabel: {
          ...theme.typography.labelSmall,
          color: theme.colors.textPrimary,
          textAlign: 'center',
        },
        quickSub: {
          ...theme.typography.caption,
          letterSpacing: 0,
          fontSize: 9,
          color: theme.colors.textSecondary,
          marginTop: 2,
        },
        sectionTitle: {
          ...theme.typography.headingSmall,
          color: theme.colors.textPrimary,
          paddingHorizontal: theme.spacing['2xl'],
          marginBottom: theme.spacing.md,
        },
        topicsBox: {
          marginHorizontal: theme.spacing['2xl'],
          borderRadius: theme.radius.lg,
          borderWidth: 1,
          borderColor: theme.colors.border,
          overflow: 'hidden',
          marginBottom: theme.spacing['2xl'],
        },
        topicRow: {
          flexDirection: 'row',
          alignItems: 'center',
          paddingVertical: theme.spacing.lg,
          paddingHorizontal: theme.spacing.lg,
          borderBottomWidth: 1,
          borderBottomColor: theme.colors.border,
        },
        topicText: {
          flex: 1,
          ...theme.typography.bodyMedium,
          color: theme.colors.textPrimary,
        },
        emergencyCard: {
          marginHorizontal: theme.spacing['2xl'],
          flexDirection: 'row',
          alignItems: 'center',
          backgroundColor: '#FEF2F2',
          borderRadius: theme.radius.lg,
          borderWidth: 1,
          borderColor: '#FECACA',
          padding: theme.spacing.lg,
          marginBottom: theme.spacing['2xl'],
          gap: theme.spacing.md,
        },
        emergencyIcon: {
          width: 44,
          height: 44,
          borderRadius: theme.radius.full,
          backgroundColor: '#EF4444',
          alignItems: 'center',
          justifyContent: 'center',
        },
        emergencyContent: {
          flex: 1,
        },
        emergencyTitle: {
          ...theme.typography.labelLarge,
          color: '#DC2626',
        },
        emergencySub: {
          ...theme.typography.bodySmall,
          color: '#EF4444',
          marginTop: 2,
        },
        emergencyNumber: {
          fontSize: 28,
          fontWeight: '700',
          color: '#DC2626',
        },
        feedbackBtn: {
          marginHorizontal: theme.spacing['2xl'],
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'center',
          gap: theme.spacing.sm,
          paddingVertical: theme.spacing.lg,
          borderRadius: theme.radius.lg,
          borderWidth: 1.5,
          borderColor: theme.colors.primary,
          backgroundColor: '#EFF6FF',
          marginBottom: insets.bottom + 100,
        },
        feedbackText: {
          ...theme.typography.labelLarge,
          color: theme.colors.primary,
        },
      }),
    [theme, insets],
  );

  return (
    <View style={styles.container}>
      <GradientScreenHeader
        title={t.support.helpSupport}
        showBack
        onBack={() => navigation.goBack()}
      />

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.searchWrap}>
          <SearchBar placeholder={t.profile.searchHelp} editable={false} />
        </View>

        <View style={styles.openTicketWrap}>
          <Pressable
            style={styles.openTicketCard}
            accessibilityRole="button"
            onPress={() => navigation.navigate('RaiseTicket')}>
            <View style={[styles.quickIcon, { backgroundColor: '#FEE2E2' }]}>
              <MailTicketIcon color="#EF4444" size={20} />
            </View>
            <Text style={styles.quickLabel}>{t.support.openTicket}</Text>
            <Text style={styles.quickSub}>{t.support.raiseIssue}</Text>
          </Pressable>

          <Pressable
            style={styles.openTicketCard}
            accessibilityRole="button"
            onPress={() => navigation.navigate('SupportChat')}>
            <View style={[styles.quickIcon, { backgroundColor: '#DBEAFE' }]}>
              <ChatBubbleIcon color={theme.colors.primary} size={20} />
            </View>
            <Text style={styles.quickLabel}>{t.support.liveChat}</Text>
            <Text style={styles.quickSub}>{t.support.quickHelp}</Text>
          </Pressable>

          <Pressable
            style={styles.openTicketCard}
            accessibilityRole="button"
            onPress={() => navigation.navigate('MyTickets')}>
            <View style={[styles.quickIcon, { backgroundColor: '#ECFDF5' }]}>
              <MailTicketIcon color="#10B981" size={20} />
            </View>
            <Text style={styles.quickLabel}>{t.support.myTickets}</Text>
            <Text style={styles.quickSub}>{t.support.trackStatus}</Text>
          </Pressable>
        </View>

        <Text style={styles.sectionTitle}>{t.support.popularHelpTopics}</Text>
        <View style={styles.topicsBox}>
          {HELP_TOPICS.map((topic, index) => (
            <Pressable
              key={topic}
              style={[
                styles.topicRow,
                index === HELP_TOPICS.length - 1 && { borderBottomWidth: 0 },
              ]}
              accessibilityRole="button"
              onPress={() => navigation.navigate('FAQSupport')}>
              <Text style={styles.topicText}>{topic}</Text>
              <ChevronRightSmallIcon />
            </Pressable>
          ))}
        </View>

        <Text style={styles.sectionTitle}>{t.support.nationalHelpline}</Text>
        <View style={styles.emergencyCard}>
          <View style={styles.emergencyIcon}>
            <PhoneIcon color="#FFFFFF" size={20} />
          </View>
          <View style={styles.emergencyContent}>
            <Text style={styles.emergencyTitle}>{t.support.nationalEmergency}</Text>
            <Text style={styles.emergencySub}>
              {t.support.emergencySub}
            </Text>
          </View>
          <Text style={styles.emergencyNumber}>112</Text>
        </View>

        <Pressable
          style={styles.feedbackBtn}
          accessibilityRole="button"
          onPress={() => navigation.navigate('ShareFeedback')}>
          <ChatBubbleIcon />
          <Text style={styles.feedbackText}>{t.support.shareAppFeedback}</Text>
        </Pressable>
      </ScrollView>
    </View>
  );
};
