import React, { useCallback, useMemo } from 'react';
import {
  Alert,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useQuery } from '@tanstack/react-query';
import { ProfileStackParamList } from '@/types/navigation';
import { APP_NAME } from '@constants/index';
import { useDispatch, useSelector } from 'react-redux';
import {
  formatAppDate,
  getLanguageLabel,
  useTranslation,
} from '@/i18n';
import { useTheme } from '@app/providers/ThemeProvider';
import { ProfileMenuItem } from '@features/profile/components/ProfileMenuItem';
import { StatusBadge } from '@features/profile/components/StatusBadge';
import { useCitizenProfile } from '@features/profile/hooks/useCitizenProfile';
import { useProfileNavigation } from '@features/profile/hooks/useRequireProfile';
import { logout } from '@features/auth/store/authSlice';
import { resetToAuth } from '@utils/navigation';
import type { RootState } from '@app/store';
import {
  applicationsApi,
  applicationsQueryKeys,
  profileApi,
  profileQueryKeys,
} from '@services/api';
import {
  FileDocIcon,
  GlobeIcon,
  HelpIcon,
  InfoIcon,
  MapPinIcon,
  SettingsIcon,
  ShieldIcon,
  UserIcon,
} from '@components/icons';
import { Button } from '@components/Button';
import { getScrollBottomPadding } from '@utils/layout';

type Props = NativeStackScreenProps<ProfileStackParamList, 'ProfileMain'>;

type MenuItem = {
  id: string;
  labelKey:
    | 'personalInfo'
    | 'savedDocuments'
    | 'addresses'
    | 'language'
    | 'settings'
    | 'privacySecurity'
    | 'helpSupport'
    | 'about';
  icon: string;
  screen?: keyof ProfileStackParamList;
};

const ACCOUNT_MENU: MenuItem[] = [
  { id: 'personal', labelKey: 'personalInfo', icon: 'user', screen: 'PersonalInformation' },
  { id: 'documents', labelKey: 'savedDocuments', icon: 'document', screen: 'SavedDocuments' },
  { id: 'addresses', labelKey: 'addresses', icon: 'location', screen: 'Addresses' },
  { id: 'language', labelKey: 'language', icon: 'globe', screen: 'LanguageSelection' },
  { id: 'settings', labelKey: 'settings', icon: 'settings', screen: 'Settings' },
];

const SUPPORT_MENU: MenuItem[] = [
  { id: 'privacy', labelKey: 'privacySecurity', icon: 'shield', screen: 'PrivacySecurity' },
  { id: 'help', labelKey: 'helpSupport', icon: 'help', screen: 'HelpSupport' },
  { id: 'about', labelKey: 'about', icon: 'info' },
];

const MenuIcon = ({ icon }: { icon: string }) => {
  const color = '#2563EB';
  switch (icon) {
    case 'user':
      return <UserIcon color={color} size={22} />;
    case 'document':
      return <FileDocIcon color={color} size={22} />;
    case 'location':
      return <MapPinIcon color={color} size={22} />;
    case 'globe':
      return <GlobeIcon color={color} size={22} />;
    case 'settings':
      return <SettingsIcon color={color} size={22} />;
    case 'shield':
      return <ShieldIcon color={color} size={22} />;
    case 'help':
      return <HelpIcon color={color} size={22} />;
    case 'info':
      return <InfoIcon color={color} size={22} />;
    default:
      return <FileDocIcon color={color} size={22} />;
  }
};

export const ProfileScreen: React.FC<Props> = ({ navigation }) => {
  const { theme } = useTheme();
  const insets = useSafeAreaInsets();
  const dispatch = useDispatch();
  const { t, locale } = useTranslation();
  const { citizen, isProfileComplete } = useCitizenProfile();
  const { openCompleteProfile, openUpdateProfile } = useProfileNavigation();
  const language = useSelector((state: RootState) => state.auth.language);

  const { data: applications } = useQuery({
    queryKey: applicationsQueryKeys.list('All'),
    queryFn: () => applicationsApi.listApplicationsForFilter('All'),
  });

  const { data: documents = [] } = useQuery({
    queryKey: profileQueryKeys.documents(),
    queryFn: () => profileApi.listSavedDocuments(),
  });

  const displayName =
    [citizen?.firstName, citizen?.lastName].filter(Boolean).join(' ') ||
    citizen?.phone ||
    t.common.citizen;
  const initials = displayName
    .split(/\s+/)
    .map(part => part[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();

  const applicationCount = applications?.data?.length ?? 0;
  const memberSince = citizen?.createdAt
    ? formatAppDate(citizen.createdAt, locale)
    : '—';

  const styles = useMemo(
    () =>
      StyleSheet.create({
        container: { flex: 1, backgroundColor: theme.colors.backgroundSecondary },
        headerGradient: {
          paddingTop: insets.top + theme.spacing.md,
          paddingHorizontal: theme.spacing['2xl'],
          paddingBottom: theme.spacing['5xl'],
          borderBottomLeftRadius: theme.radius['3xl'],
          borderBottomRightRadius: theme.radius['3xl'],
        },
        headerTitle: {
          ...theme.typography.headingMedium,
          color: theme.colors.textInverse,
          textAlign: 'center',
        },
        scroll: { flex: 1, marginTop: -theme.spacing['3xl'] },
        scrollContent: {
          paddingHorizontal: theme.spacing['2xl'],
          paddingBottom: getScrollBottomPadding(insets, theme.spacing['3xl']),
        },
        profileCard: {
          backgroundColor: theme.colors.surface,
          borderRadius: theme.radius.xl,
          padding: theme.spacing['2xl'],
          marginBottom: theme.spacing.lg,
          ...theme.shadows.card,
        },
        profileTop: {
          flexDirection: 'row',
          alignItems: 'center',
          gap: theme.spacing.lg,
        },
        avatar: {
          width: 72,
          height: 72,
          borderRadius: theme.radius.full,
          backgroundColor: theme.colors.primary,
          alignItems: 'center',
          justifyContent: 'center',
        },
        avatarText: { fontSize: 26, fontWeight: '700', color: theme.colors.textInverse },
        profileInfo: { flex: 1, minWidth: 0 },
        nameRow: {
          flexDirection: 'row',
          alignItems: 'center',
          gap: theme.spacing.sm,
          flexWrap: 'wrap',
        },
        name: { ...theme.typography.headingSmall, color: theme.colors.textPrimary },
        contact: {
          ...theme.typography.bodySmall,
          color: theme.colors.textSecondary,
          marginTop: theme.spacing.xxs,
        },
        langChip: {
          alignSelf: 'flex-start',
          marginTop: theme.spacing.sm,
          paddingHorizontal: theme.spacing.md,
          paddingVertical: theme.spacing.xxs,
          borderRadius: theme.radius.full,
          backgroundColor: theme.colors.primaryMuted,
        },
        langChipText: { ...theme.typography.caption, color: theme.colors.primary, fontWeight: '600' },
        statsRow: {
          flexDirection: 'row',
          gap: theme.spacing.sm,
          marginTop: theme.spacing.lg,
        },
        statCard: {
          flex: 1,
          backgroundColor: theme.colors.backgroundSecondary,
          borderRadius: theme.radius.lg,
          padding: theme.spacing.md,
          alignItems: 'center',
        },
        statValue: { ...theme.typography.headingSmall, color: theme.colors.primary },
        statLabel: {
          ...theme.typography.caption,
          color: theme.colors.textSecondary,
          marginTop: 2,
          textAlign: 'center',
        },
        incompleteBanner: {
          marginTop: theme.spacing.md,
          paddingVertical: theme.spacing.sm,
          paddingHorizontal: theme.spacing.md,
          borderRadius: theme.radius.md,
          backgroundColor: theme.colors.primaryMuted,
        },
        incompleteText: { ...theme.typography.bodySmall, color: theme.colors.primary },
        profileAction: { marginTop: theme.spacing.lg },
        sectionTitle: {
          ...theme.typography.caption,
          color: theme.colors.textSecondary,
          letterSpacing: 1,
          marginBottom: theme.spacing.sm,
          marginTop: theme.spacing.md,
        },
        menuList: { gap: theme.spacing.md, marginBottom: theme.spacing.sm },
        logoutButton: {
          marginTop: theme.spacing.lg,
          backgroundColor: '#FEE2E2',
          borderRadius: theme.radius.xl,
          paddingVertical: theme.spacing.lg,
          alignItems: 'center',
        },
        logoutText: { ...theme.typography.labelLarge, color: '#EF4444' },
      }),
    [theme, insets],
  );

  const handleMenuPress = useCallback(
    (item: MenuItem) => {
      if (item.screen) {
        navigation.navigate(item.screen);
        return;
      }
      if (item.id === 'about') {
        Alert.alert(APP_NAME, t.profile.aboutMessage);
      }
    },
    [navigation, t.profile.aboutMessage],
  );

  const handleLogout = useCallback(() => {
    Alert.alert(t.profile.logout, t.profile.logoutConfirm, [
      { text: t.common.cancel, style: 'cancel' },
      {
        text: t.profile.logout,
        style: 'destructive',
        onPress: () => {
          dispatch(logout());
          resetToAuth(navigation);
        },
      },
    ]);
  }, [dispatch, navigation, t]);

  const renderMenuSection = (title: string, items: MenuItem[]) => (
    <>
      <Text style={styles.sectionTitle}>{title}</Text>
      <View style={styles.menuList}>
        {items.map(item => (
          <ProfileMenuItem
            key={item.id}
            label={t.profile[item.labelKey]}
            icon={<MenuIcon icon={item.icon} />}
            onPress={() => handleMenuPress(item)}
          />
        ))}
      </View>
    </>
  );

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={[theme.colors.gradientHeaderStart, theme.colors.gradientHeaderEnd]}
        style={styles.headerGradient}>
        <Text style={styles.headerTitle}>{t.profile.title}</Text>
      </LinearGradient>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}>
        <View style={styles.profileCard}>
          <View style={styles.profileTop}>
            <View style={styles.avatar}>
              <Text style={styles.avatarText}>{initials || 'CS'}</Text>
            </View>
            <View style={styles.profileInfo}>
              <View style={styles.nameRow}>
                <Text style={styles.name} numberOfLines={1}>
                  {displayName}
                </Text>
                <StatusBadge
                  label={isProfileComplete ? t.common.verified : t.common.incomplete}
                />
              </View>
              <Text style={styles.contact}>
                {t.profile.phone}: {citizen?.phone ?? '—'}
              </Text>
              {citizen?.email ? (
                <Text style={styles.contact} numberOfLines={1}>
                  {t.profile.email}: {citizen.email}
                </Text>
              ) : null}
              <View style={styles.langChip}>
                <Text style={styles.langChipText}>
                  {t.language.current}: {getLanguageLabel(language)}
                </Text>
              </View>
            </View>
          </View>

          <View style={styles.statsRow}>
            <View style={styles.statCard}>
              <Text style={styles.statValue}>{applicationCount}</Text>
              <Text style={styles.statLabel}>{t.profile.applications}</Text>
            </View>
            <View style={styles.statCard}>
              <Text style={styles.statValue}>{documents.length}</Text>
              <Text style={styles.statLabel}>{t.profile.documents}</Text>
            </View>
            <View style={styles.statCard}>
              <Text style={styles.statValue}>{isProfileComplete ? '✓' : '—'}</Text>
              <Text style={styles.statLabel}>{t.profile.kycStatus}</Text>
            </View>
          </View>

          <Text style={[styles.contact, { marginTop: theme.spacing.md }]}>
            {t.profile.memberSince}: {memberSince}
          </Text>

          {!isProfileComplete ? (
            <View style={styles.incompleteBanner}>
              <Text style={styles.incompleteText}>{t.profile.incomplete}</Text>
            </View>
          ) : null}

          <View style={styles.profileAction}>
            {isProfileComplete ? (
              <Button
                title={t.profile.updateProfile}
                variant="outline"
                onPress={openUpdateProfile}
              />
            ) : (
              <Button
                title={t.profile.completeProfile}
                onPress={() => openCompleteProfile()}
              />
            )}
          </View>
        </View>

        {renderMenuSection(t.profile.accountSection, ACCOUNT_MENU)}
        {renderMenuSection(t.profile.supportSection, SUPPORT_MENU)}

        <Pressable
          style={({ pressed }) => [styles.logoutButton, pressed && { opacity: 0.9 }]}
          accessibilityRole="button"
          onPress={handleLogout}>
          <Text style={styles.logoutText}>{t.profile.logout}</Text>
        </Pressable>
      </ScrollView>
    </View>
  );
};
