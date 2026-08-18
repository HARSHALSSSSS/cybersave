import React, { useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useQuery } from '@tanstack/react-query';
import { ProfileStackParamList } from '@/types/navigation';
import { GENDER_OPTIONS } from '@constants/index';
import { INDIAN_STATE_NAMES } from '@constants/indianStates';
import { useTranslation } from '@/i18n';
import { useTheme } from '@app/providers/ThemeProvider';
import { Button } from '@components/Button';
import { ScrollScreenAction } from '@components/layout';
import { GradientScreenHeader } from '@features/profile/components/GradientScreenHeader';
import { StatusBadge } from '@features/profile/components/StatusBadge';
import { useCitizenProfile } from '@features/profile/hooks/useCitizenProfile';
import { saveProfileDetails } from '@features/profile/utils/saveProfileDetails';
import { authApi, profileApi, profileQueryKeys } from '@services/api';
import { getProfileExtras } from '@utils/profileExtras';
import { getScrollBottomPadding } from '@utils/layout';
import Svg, { Path } from 'react-native-svg';

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

type Props = NativeStackScreenProps<
  ProfileStackParamList,
  'PersonalInformation'
>;

export const PersonalInformationScreen: React.FC<Props> = ({ navigation, route }) => {
  const { theme } = useTheme();
  const insets = useSafeAreaInsets();
  const { t } = useTranslation();
  const isEditMode = route.params?.mode === 'edit';
  const { citizen, isProfileComplete, saveProfile } = useCitizenProfile();

  const { data: profile, isLoading } = useQuery({
    queryKey: ['citizen', 'me'],
    queryFn: () => authApi.getMe(),
    initialData: citizen ?? undefined,
  });

  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [fatherName, setFatherName] = useState('');
  const [dateOfBirth, setDateOfBirth] = useState('');
  const [line1, setLine1] = useState('');
  const [line2, setLine2] = useState('');
  const [city, setCity] = useState('');
  const [stateName, setStateName] = useState('');
  const [pincode, setPincode] = useState('');
  const [gender, setGender] = useState<string>(GENDER_OPTIONS[0]);
  const [showGenderPicker, setShowGenderPicker] = useState(false);
  const [showStatePicker, setShowStatePicker] = useState(false);
  const [nameError, setNameError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const { data: addresses = [] } = useQuery({
    queryKey: profileQueryKeys.addresses(),
    queryFn: () => profileApi.listAddresses(),
    enabled: Boolean(profile?.id),
  });

  const defaultAddress = addresses.find(a => a.isDefault) ?? addresses[0];

  useEffect(() => {
    if (profile) {
      const extras = getProfileExtras(profile.id);
      setFullName(
        [profile.firstName, profile.lastName].filter(Boolean).join(' ') || '',
      );
      setEmail(profile.email ?? '');
      setFatherName(extras.fatherOrGuardianName ?? '');
      setGender(extras.gender ?? GENDER_OPTIONS[0]);
      setDateOfBirth(extras.dateOfBirth ?? '');
      setLine1(defaultAddress?.line1 ?? '');
      setLine2(defaultAddress?.line2 ?? '');
      setCity(defaultAddress?.city ?? '');
      setStateName(defaultAddress?.state ?? '');
      setPincode(defaultAddress?.pincode ?? '');
    }
  }, [profile, defaultAddress]);

  const initials = useMemo(() => {
    const parts = fullName.trim().split(/\s+/);
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
          overflow: 'hidden',
        },
        scrollContent: {
          paddingHorizontal: theme.spacing['2xl'],
          paddingTop: theme.spacing['3xl'],
          paddingBottom: getScrollBottomPadding(insets, theme.spacing.lg),
        },
        avatarSection: {
          alignItems: 'center',
          marginBottom: theme.spacing['2xl'],
        },
        avatar: {
          width: 88,
          height: 88,
          borderRadius: theme.radius.full,
          backgroundColor: theme.colors.primary,
          alignItems: 'center',
          justifyContent: 'center',
          marginBottom: theme.spacing.lg,
        },
        avatarText: {
          fontSize: 32,
          fontWeight: '700',
          color: theme.colors.textInverse,
        },
        statusRow: {
          flexDirection: 'row',
          gap: theme.spacing.sm,
          marginBottom: theme.spacing.lg,
        },
        field: {
          marginBottom: theme.spacing.lg,
        },
        labelRow: {
          flexDirection: 'row',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: theme.spacing.sm,
        },
        label: {
          ...theme.typography.labelMedium,
          color: theme.colors.textPrimary,
        },
        input: {
          borderWidth: 1,
          borderColor: theme.colors.border,
          borderRadius: theme.radius.md,
          paddingHorizontal: theme.spacing.lg,
          paddingVertical: theme.spacing.md,
          ...theme.typography.bodyLarge,
          color: theme.colors.textPrimary,
          backgroundColor: theme.colors.surface,
          minHeight: 52,
        },
        inputError: {
          borderColor: theme.colors.error,
        },
        inputReadonly: {
          backgroundColor: theme.colors.backgroundSecondary,
          color: theme.colors.textSecondary,
        },
        errorText: {
          ...theme.typography.bodySmall,
          color: theme.colors.error,
          marginTop: theme.spacing.xs,
        },
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
        },
        pickerText: {
          ...theme.typography.bodyLarge,
          color: theme.colors.textPrimary,
        },
        dropdown: {
          borderWidth: 1,
          borderColor: theme.colors.border,
          borderRadius: theme.radius.md,
          marginTop: theme.spacing.xs,
          overflow: 'hidden',
          ...theme.shadows.sm,
        },
        dropdownItem: {
          padding: theme.spacing.lg,
          borderBottomWidth: 1,
          borderBottomColor: theme.colors.border,
        },
        lastUpdated: {
          ...theme.typography.bodySmall,
          color: theme.colors.textSecondary,
          textAlign: 'center',
          marginTop: theme.spacing.lg,
        },
        center: {
          flex: 1,
          alignItems: 'center',
          justifyContent: 'center',
        },
      }),
    [theme, insets],
  );

  const handleSave = async () => {
    if (!profile) return;
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
          citizenId: profile.id,
          existingAddress: defaultAddress,
          saveProfile,
        },
      );

      if (justCompleted) {
        Alert.alert(
          t.profile.profileCompleteAlert,
          t.profile.profileCompleteAlertMessage,
          [{ text: t.common.ok, onPress: () => navigation.goBack() }],
        );
      } else {
        Alert.alert(t.profile.profileUpdated, t.profile.profileSaved, [
          { text: t.common.ok, onPress: () => navigation.goBack() },
        ]);
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : t.profile.checkDetails;
      if (message.toLowerCase().includes('name')) setNameError(message);
      Alert.alert(t.common.couldNotSave, message);
    } finally {
      setSaving(false);
    }
  };

  if (isLoading && !profile) {
    return (
      <View style={styles.container}>
        <GradientScreenHeader
          title={isEditMode ? t.profile.updateProfile : t.profile.personalInfo}
          showBack
          onBack={() => navigation.goBack()}
        />
        <View style={styles.center}>
          <ActivityIndicator color={theme.colors.primary} />
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <GradientScreenHeader
        title={isEditMode ? t.profile.updateProfile : t.profile.personalInfo}
        showBack
        onBack={() => navigation.goBack()}
      />

      <View style={styles.sheet}>
        <KeyboardAvoidingView
          style={{ flex: 1 }}
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
          keyboardVerticalOffset={Platform.OS === 'ios' ? insets.top + 56 : 0}>
          <ScrollView
            contentContainerStyle={styles.scrollContent}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}>
            <View style={styles.avatarSection}>
              <View style={styles.avatar}>
                <Text style={styles.avatarText}>{initials}</Text>
              </View>
              <View style={styles.statusRow}>
                <StatusBadge label={t.profile.phoneVerified} />
                {isProfileComplete ? (
                  <StatusBadge label={t.profile.profileCompleteStatus} />
                ) : (
                  <StatusBadge label={t.common.incomplete} />
                )}
              </View>
            </View>

            <View style={styles.field}>
              <Text style={styles.label}>{t.profile.fullNameLabel} *</Text>
              <TextInput
                style={[styles.input, nameError ? styles.inputError : null]}
                value={fullName}
                onChangeText={text => {
                  setFullName(text);
                  setNameError(null);
                }}
                placeholder={t.profile.enterFullName}
                autoCapitalize="words"
              />
              {nameError ? <Text style={styles.errorText}>{nameError}</Text> : null}
            </View>

            <View style={styles.field}>
              <Text style={styles.label}>Father / guardian name</Text>
              <TextInput
                style={styles.input}
                value={fatherName}
                onChangeText={setFatherName}
                placeholder="As on official records"
                autoCapitalize="words"
              />
            </View>

            <View style={styles.field}>
              <Text style={styles.label}>Date of birth</Text>
              <TextInput
                style={styles.input}
                value={dateOfBirth}
                onChangeText={setDateOfBirth}
                placeholder="YYYY-MM-DD"
              />
            </View>

            <View style={styles.field}>
              <View style={styles.labelRow}>
                <Text style={styles.label}>{t.profile.phone}</Text>
                <StatusBadge label={t.common.verified} />
              </View>
              <TextInput
                style={[styles.input, styles.inputReadonly]}
                value={profile?.phone ?? ''}
                editable={false}
              />
            </View>

            <View style={styles.field}>
              <Text style={styles.label}>{t.profile.email}</Text>
              <TextInput
                style={styles.input}
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
                placeholder={t.profile.optional}
              />
            </View>

            <View style={styles.field}>
              <Text style={styles.label}>{t.profile.gender}</Text>
              <Pressable
                style={styles.pickerRow}
                onPress={() => setShowGenderPicker(!showGenderPicker)}>
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
            </View>

            <View style={[styles.field, { marginTop: theme.spacing.md }]}>
              <Text style={[styles.label, { fontSize: 13, color: theme.colors.textSecondary }]}>
                RESIDENTIAL ADDRESS
              </Text>
            </View>

            <View style={styles.field}>
              <Text style={styles.label}>House / flat / street</Text>
              <TextInput
                style={styles.input}
                value={line1}
                onChangeText={setLine1}
                placeholder="Flat 402, Green Valley Apartments"
              />
            </View>

            <View style={styles.field}>
              <Text style={styles.label}>Landmark (optional)</Text>
              <TextInput
                style={styles.input}
                value={line2}
                onChangeText={setLine2}
                placeholder="Near City Mall"
              />
            </View>

            <View style={styles.field}>
              <Text style={styles.label}>City / town</Text>
              <TextInput style={styles.input} value={city} onChangeText={setCity} placeholder="Pune" />
            </View>

            <View style={styles.field}>
              <Text style={styles.label}>State</Text>
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
            </View>

            <View style={styles.field}>
              <Text style={styles.label}>PIN code</Text>
              <TextInput
                style={styles.input}
                value={pincode}
                onChangeText={text => setPincode(text.replace(/\D/g, '').slice(0, 6))}
                placeholder="411001"
                keyboardType="number-pad"
                maxLength={6}
              />
            </View>

            <Text style={styles.lastUpdated}>
              {t.profile.memberSince}{' '}
              {profile?.createdAt
                ? new Date(profile.createdAt).toLocaleDateString('en-IN')
                : '—'}
            </Text>

            <ScrollScreenAction>
              <Button
                title={
                  saving
                    ? t.profile.saving
                    : isEditMode
                      ? t.profile.updateProfile
                      : t.profile.saveChanges
                }
                loading={saving}
                onPress={handleSave}
              />
            </ScrollScreenAction>
          </ScrollView>
        </KeyboardAvoidingView>
      </View>
    </View>
  );
};
