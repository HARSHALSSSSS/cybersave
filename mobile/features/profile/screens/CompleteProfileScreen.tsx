import React, { useEffect, useMemo, useState } from 'react';
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { BottomTabNavigationProp } from '@react-navigation/bottom-tabs';
import { useQuery } from '@tanstack/react-query';
import LinearGradient from 'react-native-linear-gradient';
import { ProfileStackParamList, MainTabParamList } from '@/types/navigation';
import { GENDER_OPTIONS } from '@constants/index';
import { INDIAN_STATE_NAMES } from '@constants/indianStates';
import { useTranslation } from '@/i18n';
import { useTheme } from '@app/providers/ThemeProvider';
import { Button } from '@components/Button';
import { ScrollScreenAction } from '@components/layout';
import { Input } from '@components/Input';
import { GradientScreenHeader } from '@features/profile/components/GradientScreenHeader';
import { useCitizenProfile } from '@features/profile/hooks/useCitizenProfile';
import { saveProfileDetails } from '@features/profile/utils/saveProfileDetails';
import { profileApi, profileQueryKeys } from '@services/api';
import { formatPhoneNumber } from '@utils/format';
import { getProfileExtras } from '@utils/profileExtras';
import { getScrollBottomPadding } from '@utils/layout';
import Svg, { Path } from 'react-native-svg';

type Props = NativeStackScreenProps<ProfileStackParamList, 'CompleteProfile'>;

const ChevronDown = ({ color }: { color: string }) => (
  <Svg width={16} height={16} viewBox="0 0 16 16" fill="none">
    <Path
      d="M4 6L8 10L12 6"
      stroke={color}
      strokeWidth={1.5}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </Svg>
);

function SectionCard({
  title,
  subtitle,
  children,
  theme,
}: {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
  theme: ReturnType<typeof useTheme>['theme'];
}) {
  return (
    <View
      style={{
        marginBottom: theme.spacing.lg,
        padding: theme.spacing.lg,
        borderRadius: theme.radius.xl,
        borderWidth: 1,
        borderColor: theme.colors.border,
        backgroundColor: theme.colors.backgroundSecondary,
      }}>
      <Text style={{ ...theme.typography.labelLarge, color: theme.colors.textPrimary }}>
        {title}
      </Text>
      {subtitle ? (
        <Text
          style={{
            ...theme.typography.bodySmall,
            color: theme.colors.textSecondary,
            marginTop: 4,
            marginBottom: theme.spacing.md,
          }}>
          {subtitle}
        </Text>
      ) : (
        <View style={{ height: theme.spacing.md }} />
      )}
      {children}
    </View>
  );
}

export const CompleteProfileScreen: React.FC<Props> = ({ navigation, route }) => {
  const { theme } = useTheme();
  const insets = useSafeAreaInsets();
  const { t } = useTranslation();
  const { citizen, saveProfile } = useCitizenProfile();
  const returnTo = route.params?.returnTo;

  const { data: addresses = [] } = useQuery({
    queryKey: profileQueryKeys.addresses(),
    queryFn: () => profileApi.listAddresses(),
    enabled: Boolean(citizen),
  });

  const defaultAddress = addresses.find(a => a.isDefault) ?? addresses[0];

  const [fullName, setFullName] = useState('');
  const [fatherName, setFatherName] = useState('');
  const [gender, setGender] = useState<string>(GENDER_OPTIONS[0]);
  const [dateOfBirth, setDateOfBirth] = useState('');
  const [email, setEmail] = useState('');
  const [line1, setLine1] = useState('');
  const [line2, setLine2] = useState('');
  const [city, setCity] = useState('');
  const [stateName, setStateName] = useState('');
  const [pincode, setPincode] = useState('');
  const [showGenderPicker, setShowGenderPicker] = useState(false);
  const [showStatePicker, setShowStatePicker] = useState(false);
  const [nameError, setNameError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!citizen) return;
    const extras = getProfileExtras(citizen.id);
    setFullName([citizen.firstName, citizen.lastName].filter(Boolean).join(' '));
    setEmail(citizen.email ?? '');
    setFatherName(extras.fatherOrGuardianName ?? '');
    setGender(extras.gender ?? GENDER_OPTIONS[0]);
    setDateOfBirth(extras.dateOfBirth ?? '');
    setLine1(defaultAddress?.line1 ?? '');
    setLine2(defaultAddress?.line2 ?? '');
    setCity(defaultAddress?.city ?? '');
    setStateName(defaultAddress?.state ?? '');
    setPincode(defaultAddress?.pincode ?? '');
  }, [citizen, defaultAddress]);

  const phoneDisplay = citizen?.phone
    ? `+91 ${formatPhoneNumber(citizen.phone.replace(/\D/g, '').slice(-10))}`
    : '—';

  const initials = useMemo(() => {
    const parts = fullName.trim().split(/\s+/).filter(Boolean);
    if (parts.length >= 2) return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
    return (parts[0]?.slice(0, 2) ?? 'CS').toUpperCase();
  }, [fullName]);

  const styles = useMemo(
    () =>
      StyleSheet.create({
        container: { flex: 1, backgroundColor: theme.colors.backgroundSecondary },
        sheet: {
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
        hero: {
          flexDirection: 'row',
          alignItems: 'center',
          gap: theme.spacing.lg,
          marginBottom: theme.spacing.xl,
          padding: theme.spacing.lg,
          borderRadius: theme.radius.xl,
          backgroundColor: theme.colors.primaryMuted ?? theme.colors.backgroundSecondary,
        },
        avatar: {
          width: 56,
          height: 56,
          borderRadius: theme.radius.full,
          alignItems: 'center',
          justifyContent: 'center',
        },
        avatarText: { fontSize: 20, fontWeight: '700', color: theme.colors.textInverse },
        heroTitle: { ...theme.typography.labelLarge, color: theme.colors.textPrimary },
        heroSub: { ...theme.typography.bodySmall, color: theme.colors.textSecondary, marginTop: 2 },
        pickerRow: {
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'space-between',
          borderWidth: 1,
          borderColor: theme.colors.border,
          borderRadius: theme.radius.md,
          paddingHorizontal: theme.spacing.lg,
          paddingVertical: theme.spacing.md,
          minHeight: 52,
          backgroundColor: theme.colors.surface,
        },
        pickerText: { ...theme.typography.bodyLarge, color: theme.colors.textPrimary },
        dropdown: {
          borderWidth: 1,
          borderColor: theme.colors.border,
          borderRadius: theme.radius.md,
          marginTop: theme.spacing.xs,
          overflow: 'hidden',
          backgroundColor: theme.colors.surface,
        },
        dropdownItem: {
          padding: theme.spacing.lg,
          borderBottomWidth: 1,
          borderBottomColor: theme.colors.border,
        },
        fieldGap: { height: theme.spacing.md },
      }),
    [theme, insets],
  );

  const handleReturnAfterSave = () => {
    if (returnTo?.tab === 'ServicesTab' && returnTo.screen) {
      const tabNav = navigation.getParent<BottomTabNavigationProp<MainTabParamList>>();
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
    if (!citizen) return;
    setNameError(null);
    setSaving(true);
    try {
      const { justCompleted } = await saveProfileDetails(
        {
          fullName,
          email,
          fatherOrGuardianName: fatherName,
          gender,
          dateOfBirth,
          address: line1.trim()
            ? { line1, line2, city, state: stateName, pincode }
            : undefined,
        },
        {
          citizenId: citizen.id,
          existingAddress: defaultAddress,
          saveProfile,
        },
      );

      if (justCompleted) {
        Alert.alert(t.common.done, t.profile.profileDone, [
          { text: t.common.ok, onPress: handleReturnAfterSave },
        ]);
      } else {
        Alert.alert(t.common.saved, t.profile.profileUpdatedShort, [
          { text: t.common.ok, onPress: handleReturnAfterSave },
        ]);
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : t.profile.couldNotSaveProfile;
      if (message.toLowerCase().includes('name')) setNameError(message);
      Alert.alert(t.common.error, message);
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
          <View style={styles.hero}>
            <LinearGradient
              colors={[theme.colors.gradientStart, theme.colors.gradientEnd]}
              style={styles.avatar}>
              <Text style={styles.avatarText}>{initials}</Text>
            </LinearGradient>
            <View style={{ flex: 1 }}>
              <Text style={styles.heroTitle}>{fullName.trim() || t.profile.yourName}</Text>
              <Text style={styles.heroSub}>{phoneDisplay}</Text>
              <Text style={[styles.heroSub, { marginTop: 4 }]}>
                Complete your profile for faster service applications
              </Text>
            </View>
          </View>

          <SectionCard
            theme={theme}
            title="Personal information"
            subtitle="Use the name exactly as on Aadhaar or government ID">
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
              label="Father / guardian name"
              placeholder="As on official records"
              value={fatherName}
              onChangeText={setFatherName}
              autoCapitalize="words"
            />
            <View style={styles.fieldGap} />
            <Text style={{ ...theme.typography.labelMedium, color: theme.colors.textPrimary, marginBottom: 8 }}>
              {t.profile.gender}
            </Text>
            <Pressable style={styles.pickerRow} onPress={() => setShowGenderPicker(v => !v)}>
              <Text style={styles.pickerText}>{gender}</Text>
              <ChevronDown color={theme.colors.textSecondary} />
            </Pressable>
            {showGenderPicker ? (
              <View style={styles.dropdown}>
                {GENDER_OPTIONS.map(option => (
                  <Pressable
                    key={option}
                    style={styles.dropdownItem}
                    onPress={() => {
                      setGender(option);
                      setShowGenderPicker(false);
                    }}>
                    <Text style={styles.pickerText}>{option}</Text>
                  </Pressable>
                ))}
              </View>
            ) : null}
            <View style={styles.fieldGap} />
            <Input
              label="Date of birth"
              placeholder="YYYY-MM-DD"
              value={dateOfBirth}
              onChangeText={setDateOfBirth}
            />
          </SectionCard>

          <SectionCard theme={theme} title="Contact details" subtitle="Email is used for receipts and alerts">
            <Input label={t.auth.mobileNumber} value={phoneDisplay} editable={false} />
            <View style={styles.fieldGap} />
            <Input
              label={t.profile.email}
              placeholder={t.profile.optional}
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
            />
          </SectionCard>

          <SectionCard theme={theme} title="Residential address" subtitle="Pre-fills future applications">
            <Input
              label="House / flat / street"
              placeholder="Flat 402, Green Valley Apartments"
              value={line1}
              onChangeText={setLine1}
            />
            <View style={styles.fieldGap} />
            <Input
              label="Landmark (optional)"
              placeholder="Near City Mall"
              value={line2}
              onChangeText={setLine2}
            />
            <View style={styles.fieldGap} />
            <Input label="City / town" placeholder="Pune" value={city} onChangeText={setCity} />
            <View style={styles.fieldGap} />
            <Text style={{ ...theme.typography.labelMedium, color: theme.colors.textPrimary, marginBottom: 8 }}>
              State
            </Text>
            <Pressable style={styles.pickerRow} onPress={() => setShowStatePicker(v => !v)}>
              <Text style={styles.pickerText}>{stateName || 'Select state'}</Text>
              <ChevronDown color={theme.colors.textSecondary} />
            </Pressable>
            {showStatePicker ? (
              <View style={styles.dropdown}>
                {INDIAN_STATE_NAMES.map(name => (
                  <Pressable
                    key={name}
                    style={styles.dropdownItem}
                    onPress={() => {
                      setStateName(name);
                      setShowStatePicker(false);
                    }}>
                    <Text style={styles.pickerText}>{name}</Text>
                  </Pressable>
                ))}
              </View>
            ) : null}
            <View style={styles.fieldGap} />
            <Input
              label="PIN code"
              placeholder="411001"
              value={pincode}
              onChangeText={text => setPincode(text.replace(/\D/g, '').slice(0, 6))}
              keyboardType="number-pad"
              maxLength={6}
            />
          </SectionCard>

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
