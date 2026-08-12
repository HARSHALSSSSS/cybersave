import React, { useMemo, useState } from 'react';
import {
  Alert,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { ProfileStackParamList } from '@/types/navigation';
import {
  ACTIVE_SESSIONS,
  PRIVACY_TOGGLES,
} from '@constants/index';
import { useTranslation } from '@/i18n';
import { useTheme } from '@app/providers/ThemeProvider';
import { GradientScreenHeader } from '@features/profile/components/GradientScreenHeader';
import { useCitizenProfile } from '@features/profile/hooks/useCitizenProfile';
import { Toggle } from '@components/Toggle';
import { ShieldIcon } from '@components/icons';

type Props = NativeStackScreenProps<ProfileStackParamList, 'PrivacySecurity'>;

export const PrivacySecurityScreen: React.FC<Props> = ({ navigation }) => {
  const { theme } = useTheme();
  const insets = useSafeAreaInsets();
  const { t } = useTranslation();
  const { citizen } = useCitizenProfile();
  const [toggles, setToggles] = useState<Record<string, boolean>>(() => {
    const initial: Record<string, boolean> = {};
    PRIVACY_TOGGLES.forEach(t => {
      initial[t.id] = t.defaultOn;
    });
    return initial;
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
        shieldBanner: {
          flexDirection: 'row',
          alignItems: 'center',
          gap: theme.spacing.md,
          padding: theme.spacing.lg,
          borderRadius: theme.radius.lg,
          borderWidth: 1,
          borderColor: '#BBF7D0',
          backgroundColor: '#F0FDF4',
          marginBottom: theme.spacing['2xl'],
        },
        shieldIcon: {
          width: 44,
          height: 44,
          borderRadius: theme.radius.full,
          backgroundColor: '#DCFCE7',
          alignItems: 'center',
          justifyContent: 'center',
        },
        shieldTitle: {
          ...theme.typography.labelLarge,
          color: theme.colors.textPrimary,
        },
        shieldSub: {
          ...theme.typography.bodySmall,
          color: theme.colors.textSecondary,
          marginTop: 2,
        },
        sectionTitle: {
          ...theme.typography.caption,
          color: theme.colors.textSecondary,
          letterSpacing: 1,
          marginBottom: theme.spacing.sm,
        },
        sectionBox: {
          borderRadius: theme.radius.lg,
          borderWidth: 1,
          borderColor: theme.colors.border,
          marginBottom: theme.spacing['2xl'],
          overflow: 'hidden',
        },
        toggleRow: {
          flexDirection: 'row',
          alignItems: 'center',
          padding: theme.spacing.lg,
          borderBottomWidth: 1,
          borderBottomColor: theme.colors.border,
          gap: theme.spacing.md,
        },
        toggleRowLast: {
          borderBottomWidth: 0,
        },
        toggleContent: {
          flex: 1,
        },
        toggleTitle: {
          ...theme.typography.labelMedium,
          color: theme.colors.textPrimary,
        },
        toggleDesc: {
          ...theme.typography.bodySmall,
          color: theme.colors.textSecondary,
          marginTop: 2,
        },
        sessionRow: {
          padding: theme.spacing.lg,
          borderBottomWidth: 1,
          borderBottomColor: theme.colors.border,
        },
        sessionRowLast: {
          borderBottomWidth: 0,
        },
        sessionDevice: {
          ...theme.typography.labelMedium,
          color: theme.colors.textPrimary,
        },
        sessionLocation: {
          ...theme.typography.bodySmall,
          color: theme.colors.textSecondary,
          marginTop: 2,
        },
        sessionStatus: {
          ...theme.typography.labelSmall,
          color: theme.colors.primary,
          marginTop: theme.spacing.xs,
        },
        sessionTime: {
          ...theme.typography.bodySmall,
          color: theme.colors.textSecondary,
          marginTop: theme.spacing.xs,
        },
        downloadBtn: {
          paddingVertical: theme.spacing.lg,
          borderRadius: theme.radius.lg,
          borderWidth: 1,
          borderColor: theme.colors.border,
          alignItems: 'center',
          marginBottom: theme.spacing.md,
        },
        downloadText: {
          ...theme.typography.labelLarge,
          color: theme.colors.textPrimary,
        },
        deactivateBtn: {
          paddingVertical: theme.spacing.lg,
          borderRadius: theme.radius.lg,
          backgroundColor: '#EF4444',
          alignItems: 'center',
          marginBottom: insets.bottom + 100,
        },
        deactivateText: {
          ...theme.typography.labelLarge,
          color: theme.colors.textInverse,
        },
        scrollContent: {
          paddingBottom: theme.spacing.xl,
        },
      }),
    [theme, insets],
  );

  return (
    <View style={styles.container}>
      <GradientScreenHeader
        title={t.profile.privacyTitle}
        showBack
        onBack={() => navigation.goBack()}
      />

      <ScrollView
        style={styles.content}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}>
        <View style={styles.shieldBanner}>
          <View style={styles.shieldIcon}>
            <ShieldIcon color="#10B981" size={22} />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.shieldTitle}>{t.profile.securityShieldActive}</Text>
            <Text style={styles.shieldSub}>
              {t.profile.securityShieldSub}
            </Text>
          </View>
        </View>

        <Text style={styles.sectionTitle}>{t.profile.consentManagement}</Text>
        <View style={styles.sectionBox}>
          {PRIVACY_TOGGLES.map((item, index) => (
            <View
              key={item.id}
              style={[
                styles.toggleRow,
                index === PRIVACY_TOGGLES.length - 1 && styles.toggleRowLast,
              ]}>
              <View style={styles.toggleContent}>
                <Text style={styles.toggleTitle}>{item.title}</Text>
                <Text style={styles.toggleDesc}>{item.description}</Text>
              </View>
              <Toggle
                value={toggles[item.id] ?? false}
                onValueChange={val =>
                  setToggles(prev => ({ ...prev, [item.id]: val }))
                }
              />
            </View>
          ))}
        </View>

        <Text style={styles.sectionTitle}>{t.profile.activeSessions}</Text>
        <View style={styles.sectionBox}>
          {ACTIVE_SESSIONS.map((session, index) => (
            <View
              key={session.id}
              style={[
                styles.sessionRow,
                index === ACTIVE_SESSIONS.length - 1 && styles.sessionRowLast,
              ]}>
              <Text style={styles.sessionDevice}>{session.device}</Text>
              <Text style={styles.sessionLocation}>{session.location}</Text>
              {session.isCurrent ? (
                <Text style={styles.sessionStatus}>{session.status}</Text>
              ) : (
                <Text style={styles.sessionTime}>{session.status}</Text>
              )}
            </View>
          ))}
        </View>

        <Pressable
          style={styles.downloadBtn}
          accessibilityRole="button"
          onPress={() => {
            const name =
              [citizen?.firstName, citizen?.lastName].filter(Boolean).join(' ') || t.common.citizen;
            Alert.alert(
              t.profile.dataSummaryTitle,
              [
                `${t.auth.fullName}: ${name}`,
                `${t.profile.phone}: ${citizen?.phone ?? '—'}`,
                `${t.profile.email}: ${citizen?.email ?? '—'}`,
                '',
                t.profile.dataExportNote,
              ].join('\n'),
            );
          }}>
          <Text style={styles.downloadText}>{t.profile.downloadDigitalData}</Text>
        </Pressable>

        <Pressable
          style={({ pressed }) => [
            styles.deactivateBtn,
            pressed && { opacity: 0.92 },
          ]}
          accessibilityRole="button"
          onPress={() =>
            Alert.alert(
              t.profile.deactivateAccount,
              t.profile.deactivateMessage,
            )
          }>
          <Text style={styles.deactivateText}>{t.profile.deactivateAccount}</Text>
        </Pressable>
      </ScrollView>
    </View>
  );
};
