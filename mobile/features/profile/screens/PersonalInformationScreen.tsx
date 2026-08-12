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
import { useTranslation } from '@/i18n';
import { useTheme } from '@app/providers/ThemeProvider';
import { Button } from '@components/Button';
import { GradientScreenHeader } from '@features/profile/components/GradientScreenHeader';
import { StatusBadge } from '@features/profile/components/StatusBadge';
import { useCitizenProfile } from '@features/profile/hooks/useCitizenProfile';
import {
  parseFullName,
  validateProfileName,
} from '@features/profile/utils/profileSync';
import { authApi } from '@services/api';
import { getNestedStackFooterPadding } from '@utils/layout';
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
  const footerBottomPad = getNestedStackFooterPadding(insets);

  const { data: profile, isLoading } = useQuery({
    queryKey: ['citizen', 'me'],
    queryFn: () => authApi.getMe(),
    initialData: citizen ?? undefined,
  });

  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [gender, setGender] = useState<string>(GENDER_OPTIONS[0]);
  const [showGenderPicker, setShowGenderPicker] = useState(false);
  const [nameError, setNameError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (profile) {
      setFullName(
        [profile.firstName, profile.lastName].filter(Boolean).join(' ') || '',
      );
      setEmail(profile.email ?? '');
    }
  }, [profile]);

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
          paddingBottom: theme.spacing.xl,
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
        footer: {
          paddingHorizontal: theme.spacing['2xl'],
          paddingTop: theme.spacing.md,
          paddingBottom: footerBottomPad,
          backgroundColor: theme.colors.surface,
          borderTopWidth: 1,
          borderTopColor: theme.colors.border,
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
    [theme, footerBottomPad],
  );

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
    } catch {
      Alert.alert(t.common.couldNotSave, t.profile.checkDetails);
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

            <Text style={styles.lastUpdated}>
              {t.profile.memberSince}{' '}
              {profile?.createdAt
                ? new Date(profile.createdAt).toLocaleDateString('en-IN')
                : '—'}
            </Text>
          </ScrollView>
        </KeyboardAvoidingView>
      </View>

      <View style={styles.footer}>
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
      </View>
    </View>
  );
};
