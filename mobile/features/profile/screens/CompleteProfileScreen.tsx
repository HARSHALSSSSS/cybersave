import React, { useMemo, useState } from 'react';
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { BottomTabNavigationProp } from '@react-navigation/bottom-tabs';
import LinearGradient from 'react-native-linear-gradient';
import { ProfileStackParamList, MainTabParamList } from '@/types/navigation';
import { useTranslation } from '@/i18n';
import { useTheme } from '@app/providers/ThemeProvider';
import { Button } from '@components/Button';
import { ScrollScreenAction } from '@components/layout';
import { Input } from '@components/Input';
import { GradientScreenHeader } from '@features/profile/components/GradientScreenHeader';
import { useCitizenProfile } from '@features/profile/hooks/useCitizenProfile';
import {
  parseFullName,
  validateProfileName,
} from '@features/profile/utils/profileSync';
import { formatPhoneNumber } from '@utils/format';
import { getScrollBottomPadding } from '@utils/layout';

type Props = NativeStackScreenProps<ProfileStackParamList, 'CompleteProfile'>;

export const CompleteProfileScreen: React.FC<Props> = ({ navigation, route }) => {
  const { theme } = useTheme();
  const insets = useSafeAreaInsets();
  const { t } = useTranslation();
  const { citizen, saveProfile } = useCitizenProfile();
  const returnTo = route.params?.returnTo;

  const [fullName, setFullName] = useState(
    [citizen?.firstName, citizen?.lastName].filter(Boolean).join(' '),
  );
  const [email, setEmail] = useState(citizen?.email ?? '');
  const [nameError, setNameError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const phoneDisplay = citizen?.phone
    ? `+91 ${formatPhoneNumber(citizen.phone.replace(/\D/g, '').slice(-10))}`
    : '—';

  const initials = useMemo(() => {
    const parts = fullName.trim().split(/\s+/).filter(Boolean);
    if (parts.length >= 2) {
      return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
    }
    return (parts[0]?.slice(0, 2) ?? 'CS').toUpperCase();
  }, [fullName]);

  const styles = useMemo(
    () =>
      StyleSheet.create({
        container: {
          flex: 1,
          backgroundColor: theme.colors.backgroundSecondary,
        },
        sheet: {
          flex: 1,
          backgroundColor: theme.colors.surface,
          borderTopLeftRadius: theme.radius['3xl'],
          borderTopRightRadius: theme.radius['3xl'],
          marginTop: -theme.spacing.lg,
          paddingHorizontal: theme.spacing['2xl'],
          paddingTop: theme.spacing['2xl'],
        },
        scrollContent: {
          paddingBottom: getScrollBottomPadding(insets, theme.spacing.lg),
        },
        profileRow: {
          flexDirection: 'row',
          alignItems: 'center',
          gap: theme.spacing.lg,
          marginBottom: theme.spacing['2xl'],
          padding: theme.spacing.lg,
          borderRadius: theme.radius.xl,
          backgroundColor: theme.colors.backgroundSecondary,
        },
        avatar: {
          width: 56,
          height: 56,
          borderRadius: theme.radius.full,
          alignItems: 'center',
          justifyContent: 'center',
        },
        avatarText: {
          fontSize: 20,
          fontWeight: '700',
          color: theme.colors.textInverse,
        },
        profileMeta: {
          flex: 1,
        },
        profileName: {
          ...theme.typography.labelLarge,
          color: theme.colors.textPrimary,
        },
        profilePhone: {
          ...theme.typography.bodySmall,
          color: theme.colors.textSecondary,
          marginTop: 2,
        },
        sectionLabel: {
          ...theme.typography.labelMedium,
          color: theme.colors.textSecondary,
          marginBottom: theme.spacing.lg,
          letterSpacing: 0.4,
          textTransform: 'uppercase',
          fontSize: 11,
        },
        fieldGap: {
          height: theme.spacing.lg,
        },
      }),
    [theme, insets],
  );

  const handleReturnAfterSave = () => {
    if (returnTo?.tab === 'ServicesTab' && returnTo.screen) {
      const tabNav =
        navigation.getParent<BottomTabNavigationProp<MainTabParamList>>();
      tabNav?.navigate(returnTo.tab, {
        screen: returnTo.screen,
        params: returnTo.params,
      });
      return;
    }
    if (navigation.canGoBack()) {
      navigation.goBack();
      return;
    }
    navigation.navigate('ProfileMain');
  };

  const handleSave = async () => {
    const validationError = validateProfileName(fullName);
    if (validationError) {
      setNameError(validationError);
      return;
    }
    setNameError(null);
    setSaving(true);
    try {
      const payload = parseFullName(fullName);
      const { justCompleted } = await saveProfile({
        ...payload,
        email: email.trim() || undefined,
      });

      if (justCompleted) {
        Alert.alert(t.common.done, t.profile.profileDone, [
          { text: t.common.ok, onPress: handleReturnAfterSave },
        ]);
      } else {
        Alert.alert(t.common.saved, t.profile.profileUpdatedShort, [
          { text: t.common.ok, onPress: handleReturnAfterSave },
        ]);
      }
    } catch {
      Alert.alert(t.common.error, t.profile.couldNotSaveProfile);
    } finally {
      setSaving(false);
    }
  };

  return (
    <View style={styles.container}>
      <GradientScreenHeader
        title={t.profile.completeProfile}
        showBack
        onBack={() => navigation.goBack()}
      />

      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView
          style={styles.sheet}
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}>
          <View style={styles.profileRow}>
            <LinearGradient
              colors={[theme.colors.gradientStart, theme.colors.gradientEnd]}
              style={styles.avatar}>
              <Text style={styles.avatarText}>{initials}</Text>
            </LinearGradient>
            <View style={styles.profileMeta}>
              <Text style={styles.profileName}>
                {fullName.trim() || t.profile.yourName}
              </Text>
              <Text style={styles.profilePhone}>{phoneDisplay}</Text>
            </View>
          </View>

          <Text style={styles.sectionLabel}>{t.profile.basicDetails}</Text>

          <Input
            label={t.auth.fullName}
            placeholder={t.profile.asOnAadhaar}
            value={fullName}
            onChangeText={text => {
              setFullName(text);
              setNameError(null);
            }}
            error={nameError ?? undefined}
            autoCapitalize="words"
          />

          <View style={styles.fieldGap} />

          <Input
            label={t.auth.mobileNumber}
            value={phoneDisplay}
            editable={false}
          />

          <View style={styles.fieldGap} />

          <Input
            label={t.profile.email}
            placeholder={t.profile.optional}
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
          />

          <ScrollScreenAction>
            <Button
              title={saving ? t.profile.saving : t.profile.saveProfile}
              loading={saving}
              onPress={handleSave}
            />
          </ScrollScreenAction>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
};
