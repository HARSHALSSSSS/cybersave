import React, { useMemo, useState } from 'react';
import {
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
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { AuthStackParamList } from '@/types/navigation';
import { DISTRICTS, INDIAN_STATES } from '@constants/index';
import { useTheme } from '@app/providers/ThemeProvider';
import { Button } from '@components/Button';
import { Input } from '@components/Input';
import { Header } from '@components/Header';
import { formatAadhaar, formatPhoneNumber } from '@utils/format';
import { useTranslation } from '@/i18n';
import Svg, { Path } from 'react-native-svg';

type RegisterForm = {
  fullName: string;
  phone: string;
  email?: string;
  aadhaar?: string;
  state: string;
  district: string;
  agreed: boolean;
};
type Props = NativeStackScreenProps<AuthStackParamList, 'Register'>;

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

const SelectField: React.FC<{
  label: string;
  value: string;
  options: readonly string[];
  onChange: (value: string) => void;
  error?: string;
}> = ({ label, value, options, onChange, error }) => {
  const { theme } = useTheme();
  const [open, setOpen] = useState(false);

  const styles = useMemo(
    () =>
      StyleSheet.create({
        wrapper: { gap: theme.spacing.sm, flex: 1 },
        label: {
          ...theme.typography.labelMedium,
          color: theme.colors.textPrimary,
        },
        field: {
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'space-between',
          borderWidth: 1,
          borderColor: error ? theme.colors.error : theme.colors.borderLight,
          borderRadius: theme.radius.md,
          paddingHorizontal: theme.spacing.lg,
          minHeight: 52,
          backgroundColor: theme.colors.inputBackground,
        },
        value: {
          ...theme.typography.bodyLarge,
          color: theme.colors.textPrimary,
        },
        dropdown: {
          borderWidth: 1,
          borderColor: theme.colors.border,
          borderRadius: theme.radius.md,
          backgroundColor: theme.colors.surface,
          marginTop: theme.spacing.xs,
          ...theme.shadows.md,
        },
        option: {
          padding: theme.spacing.md,
          borderBottomWidth: 1,
          borderBottomColor: theme.colors.border,
        },
        optionText: {
          ...theme.typography.bodyMedium,
          color: theme.colors.textPrimary,
        },
        error: {
          ...theme.typography.bodySmall,
          color: theme.colors.error,
        },
      }),
    [theme, error],
  );

  return (
    <View style={styles.wrapper}>
      <Text style={styles.label}>{label}</Text>
      <Pressable style={styles.field} onPress={() => setOpen(!open)}>
        <Text style={styles.value} numberOfLines={1}>
          {value}
        </Text>
        <ChevronDown color={theme.colors.textSecondary} />
      </Pressable>
      {open ? (
        <View style={styles.dropdown}>
          {options.map(option => (
            <Pressable
              key={option}
              style={styles.option}
              onPress={() => {
                onChange(option);
                setOpen(false);
              }}>
              <Text style={styles.optionText}>{option}</Text>
            </Pressable>
          ))}
        </View>
      ) : null}
      {error ? <Text style={styles.error}>{error}</Text> : null}
    </View>
  );
};

export const RegisterScreen: React.FC<Props> = ({ navigation }) => {
  const { theme } = useTheme();
  const insets = useSafeAreaInsets();
  const { t } = useTranslation();

  const registerSchema = useMemo(
    () =>
      z.object({
        fullName: z.string().min(2, t.validation.nameRequired),
        phone: z
          .string()
          .refine(
            value => value.replace(/\D/g, '').length === 10,
            t.validation.phoneInvalid,
          ),
        email: z
          .string()
          .email(t.validation.emailInvalid)
          .optional()
          .or(z.literal('')),
        aadhaar: z.string().optional(),
        state: z.string().min(1, t.validation.stateRequired),
        district: z.string().min(1, t.validation.districtRequired),
        agreed: z.boolean().refine(val => val, t.forms.required),
      }),
    [t],
  );

  const {
    control,
    handleSubmit,
    watch,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<RegisterForm>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      fullName: '',
      phone: '',
      email: '',
      aadhaar: '',
      state: 'Maharashtra',
      district: 'Mumbai City',
      agreed: true,
    },
  });

  const selectedState = watch('state');

  const styles = useMemo(
    () =>
      StyleSheet.create({
        container: {
          flex: 1,
          backgroundColor: theme.colors.backgroundSecondary,
        },
        card: {
          flex: 1,
          backgroundColor: theme.colors.surface,
          borderTopLeftRadius: theme.radius['3xl'],
          borderTopRightRadius: theme.radius['3xl'],
          marginTop: -theme.spacing['2xl'],
          paddingHorizontal: theme.spacing['2xl'],
          paddingTop: theme.spacing['3xl'],
          paddingBottom: theme.spacing['3xl'],
        },
        title: {
          ...theme.typography.headingLarge,
          color: theme.colors.textPrimary,
        },
        subtitle: {
          ...theme.typography.bodyMedium,
          color: theme.colors.textSecondary,
          marginTop: theme.spacing.sm,
          marginBottom: theme.spacing['2xl'],
          lineHeight: 22,
        },
        row: {
          flexDirection: 'row',
          gap: theme.spacing.md,
        },
        gap: {
          height: theme.spacing.lg,
        },
        checkboxRow: {
          flexDirection: 'row',
          alignItems: 'flex-start',
          gap: theme.spacing.md,
          marginVertical: theme.spacing.lg,
        },
        checkbox: {
          width: 22,
          height: 22,
          borderRadius: theme.radius.xs,
          backgroundColor: theme.colors.primary,
          alignItems: 'center',
          justifyContent: 'center',
          marginTop: 2,
        },
        checkmark: {
          color: theme.colors.textInverse,
          fontSize: 14,
          fontWeight: '700',
        },
        terms: {
          flex: 1,
          ...theme.typography.bodySmall,
          color: theme.colors.textSecondary,
          lineHeight: 20,
        },
        footer: {
          paddingHorizontal: theme.spacing['2xl'],
          paddingBottom: insets.bottom + theme.spacing.lg,
          paddingTop: theme.spacing.md,
          alignItems: 'center',
          backgroundColor: theme.colors.surface,
        },
        footerText: {
          ...theme.typography.bodyMedium,
          color: theme.colors.textSecondary,
          marginTop: theme.spacing.lg,
        },
        link: {
          color: theme.colors.primary,
          fontWeight: '700',
        },
      }),
    [theme, insets],
  );

  const onSubmit = (_data: RegisterForm) => {
    navigation.navigate('Login');
  };

  return (
    <View style={styles.container}>
      <Header
        title={t.auth.createAccount}
        showBack
        onBack={() => navigation.goBack()}
        centered
      />

      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled">
          <View style={styles.card}>
            <Text style={styles.title}>{t.auth.createAccount}</Text>
            <Text style={styles.subtitle}>{t.auth.onboardingSubtitle1}</Text>

            <Controller
              control={control}
              name="fullName"
              render={({ field: { onChange, onBlur, value } }) => (
                <Input
                  label={`${t.auth.fullName} (${t.profile.asOnAadhaar})`}
                  placeholder={t.auth.placeholderName}
                  onBlur={onBlur}
                  onChangeText={onChange}
                  value={value}
                  error={errors.fullName?.message}
                />
              )}
            />
            <View style={styles.gap} />

            <Controller
              control={control}
              name="phone"
              render={({ field: { onChange, onBlur, value } }) => (
                <Input
                  label={t.auth.mobileNumber}
                  placeholder={t.auth.placeholderPhone}
                  keyboardType="phone-pad"
                  onBlur={onBlur}
                  onChangeText={text => onChange(formatPhoneNumber(text))}
                  value={value}
                  error={errors.phone?.message}
                  leftElement={
                    <Text
                      style={{
                        ...theme.typography.labelLarge,
                        color: theme.colors.textPrimary,
                      }}>
                      +91
                    </Text>
                  }
                />
              )}
            />
            <View style={styles.gap} />

            <Controller
              control={control}
              name="email"
              render={({ field: { onChange, onBlur, value } }) => (
                <Input
                  label={`${t.auth.email} (${t.profile.optional})`}
                  placeholder={t.auth.placeholderEmail}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  onBlur={onBlur}
                  onChangeText={onChange}
                  value={value}
                  error={errors.email?.message}
                />
              )}
            />
            <View style={styles.gap} />

            <Controller
              control={control}
              name="aadhaar"
              render={({ field: { onChange, onBlur, value } }) => (
                <Input
                  label={`${t.auth.aadhaar} (${t.profile.optional})`}
                  placeholder={t.auth.placeholderAadhaar}
                  keyboardType="number-pad"
                  onBlur={onBlur}
                  onChangeText={text => onChange(formatAadhaar(text))}
                  value={value}
                />
              )}
            />
            <View style={styles.gap} />

            <View style={styles.row}>
              <Controller
                control={control}
                name="state"
                render={({ field: { onChange, value } }) => (
                  <SelectField
                    label={t.auth.selectState}
                    value={value}
                    options={INDIAN_STATES}
                    onChange={val => {
                      onChange(val);
                      const districts = DISTRICTS[val];
                      if (districts?.[0]) {
                        setValue('district', districts[0]);
                      }
                    }}
                    error={errors.state?.message}
                  />
                )}
              />
              <Controller
                control={control}
                name="district"
                render={({ field: { onChange, value } }) => (
                  <SelectField
                    label={t.auth.selectDistrict}
                    value={value}
                    options={DISTRICTS[selectedState] ?? []}
                    onChange={onChange}
                    error={errors.district?.message}
                  />
                )}
              />
            </View>

            <Controller
              control={control}
              name="agreed"
              render={({ field: { value, onChange } }) => (
                <Pressable
                  style={styles.checkboxRow}
                  onPress={() => onChange(!value)}
                  accessibilityRole="checkbox"
                  accessibilityState={{ checked: value }}>
                  <View
                    style={[
                      styles.checkbox,
                      !value && {
                        backgroundColor: 'transparent',
                        borderWidth: 1.5,
                        borderColor: theme.colors.border,
                      },
                    ]}>
                    {value ? <Text style={styles.checkmark}>✓</Text> : null}
                  </View>
                  <Text style={styles.terms}>
                    {t.settings.privacy}
                  </Text>
                </Pressable>
              )}
            />

            <Button
              title={t.auth.createAccount}
              loading={isSubmitting}
              onPress={handleSubmit(onSubmit)}
            />
          </View>
        </ScrollView>
      </KeyboardAvoidingView>

      <View style={styles.footer}>
        <Text style={styles.footerText}>
          {t.auth.alreadyHaveAccount}{' '}
          <Text
            style={styles.link}
            onPress={() => navigation.navigate('Login')}>
            {t.auth.signIn}
          </Text>
        </Text>
      </View>
    </View>
  );
};
