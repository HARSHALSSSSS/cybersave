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
import { useDispatch } from 'react-redux';
import { useMutation } from '@tanstack/react-query';
import { AuthStackParamList } from '@/types/navigation';
import { useTheme } from '@app/providers/ThemeProvider';
import { Button } from '@components/Button';
import { Input } from '@components/Input';
import { Header } from '@components/Header';
import { setPhone } from '@features/auth/store/authSlice';
import { requestLoginOtp } from '@utils/firebasePhoneAuth';
import { formatPhoneNumber } from '@utils/format';
import { useTranslation } from '@/i18n';
import Svg, { Circle, Path } from 'react-native-svg';

type LoginForm = { phone: string };
type Props = NativeStackScreenProps<AuthStackParamList, 'Login'>;

const FingerprintIcon = ({ color }: { color: string }) => (
  <Svg width={28} height={28} viewBox="0 0 24 24" fill="none">
    <Path
      d="M12 2C9.5 2 7.5 3.5 7 5.5M17 5.5C16.5 3.5 14.5 2 12 2M12 22V18M8 20C5 18 3 15 3 12C3 9 4 6.5 6 5M18 5C20 6.5 21 9 21 12C21 15 19 18 16 20"
      stroke={color}
      strokeWidth={1.5}
      strokeLinecap="round"
    />
    <Circle cx="12" cy="12" r="3" stroke={color} strokeWidth={1.5} />
  </Svg>
);

const FlagIcon = () => (
  <View style={{ flexDirection: 'row' }}>
    <View
      style={{
        width: 8,
        height: 14,
        backgroundColor: '#FF9933',
        borderTopLeftRadius: 2,
        borderBottomLeftRadius: 2,
      }}
    />
    <View style={{ width: 8, height: 14, backgroundColor: '#FFFFFF' }} />
    <View
      style={{
        width: 8,
        height: 14,
        backgroundColor: '#138808',
        borderTopRightRadius: 2,
        borderBottomRightRadius: 2,
      }}
    />
  </View>
);

export const LoginScreen: React.FC<Props> = ({ navigation }) => {
  const { theme } = useTheme();
  const insets = useSafeAreaInsets();
  const dispatch = useDispatch();
  const { t } = useTranslation();
  const [apiError, setApiError] = useState<string | null>(null);

  const loginSchema = useMemo(
    () =>
      z.object({
        phone: z
          .string()
          .refine(
            value => value.replace(/\D/g, '').length === 10,
            t.validation.phoneInvalid,
          ),
      }),
    [t],
  );

  const {
    control,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginForm>({
    resolver: zodResolver(loginSchema),
    defaultValues: { phone: '' },
  });

  const requestOtpMutation = useMutation({
    mutationFn: (phone: string) => requestLoginOtp(phone),
    onSuccess: (result, phone) => {
      dispatch(setPhone(phone));
      navigation.navigate('OTP', {
        phone,
        devCode: result.devCode,
        authMode: result.mode,
      });
    },
    onError: (error: unknown) => {
      const message =
        error instanceof Error ? error.message : t.auth.couldNotReachServer;
      setApiError(message);
    },
  });

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
          paddingBottom: theme.spacing['2xl'],
        },
        title: {
          ...theme.typography.headingLarge,
          color: theme.colors.textPrimary,
          marginBottom: theme.spacing.sm,
        },
        description: {
          ...theme.typography.bodyMedium,
          color: theme.colors.textSecondary,
          lineHeight: 22,
          marginBottom: theme.spacing['3xl'],
        },
        countryCode: {
          flexDirection: 'row',
          alignItems: 'center',
          gap: theme.spacing.sm,
          paddingRight: theme.spacing.sm,
        },
        countryText: {
          ...theme.typography.labelLarge,
          color: theme.colors.textPrimary,
        },
        fieldGap: {
          height: theme.spacing.xl,
        },
        orRow: {
          flexDirection: 'row',
          alignItems: 'center',
          marginVertical: theme.spacing['2xl'],
          gap: theme.spacing.md,
        },
        orLine: {
          flex: 1,
          height: 1,
          backgroundColor: theme.colors.border,
        },
        orText: {
          ...theme.typography.bodySmall,
          color: theme.colors.textSecondary,
        },
        biometric: {
          alignItems: 'center',
          gap: theme.spacing.md,
          paddingVertical: theme.spacing.md,
        },
        biometricIcon: {
          width: 56,
          height: 56,
          borderRadius: theme.radius.full,
          backgroundColor: 'rgba(37, 99, 235, 0.08)',
          alignItems: 'center',
          justifyContent: 'center',
        },
        biometricText: {
          ...theme.typography.labelMedium,
          color: theme.colors.primary,
        },
        apiError: {
          ...theme.typography.bodySmall,
          color: theme.colors.error,
          marginTop: theme.spacing.md,
          lineHeight: 20,
        },
        hint: {
          ...theme.typography.bodySmall,
          color: theme.colors.textSecondary,
          marginTop: theme.spacing.md,
        },
      }),
    [theme, insets],
  );

  const onSubmit = (data: LoginForm) => {
    setApiError(null);
    const phone = data.phone.replace(/\D/g, '');
    requestOtpMutation.mutate(phone);
  };

  const loading = isSubmitting || requestOtpMutation.isPending;

  return (
    <View style={styles.container}>
      <Header title={t.auth.welcome} subtitle={t.auth.welcomeSubtitle} />

      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView
          contentContainerStyle={{ flexGrow: 1 }}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}>
          <View style={styles.card}>
            <Text style={styles.title}>{t.auth.enterPhone}</Text>
            <Text style={styles.description}>{t.auth.otpHint}</Text>

            <Controller
              control={control}
              name="phone"
              render={({ field: { onChange, onBlur, value } }) => (
                <Input
                  label={t.auth.mobileNumber}
                  placeholder={t.auth.placeholderPhone}
                  keyboardType="phone-pad"
                  maxLength={11}
                  onBlur={onBlur}
                  onChangeText={text => onChange(formatPhoneNumber(text))}
                  value={value}
                  error={errors.phone?.message}
                  leftElement={
                    <View style={styles.countryCode}>
                      <FlagIcon />
                      <Text style={styles.countryText}>+91</Text>
                    </View>
                  }
                />
              )}
            />

            {apiError ? <Text style={styles.apiError}>{apiError}</Text> : null}

            <View style={styles.fieldGap} />

            <Button
              title={t.auth.sendOtp}
              loading={loading}
              onPress={handleSubmit(onSubmit)}
            />

            <View style={styles.orRow}>
              <View style={styles.orLine} />
              <Text style={styles.orText}>{t.common.or}</Text>
              <View style={styles.orLine} />
            </View>

            <Pressable style={styles.biometric} accessibilityRole="button">
              <View style={styles.biometricIcon}>
                <FingerprintIcon color={theme.colors.primary} />
              </View>
              <Text style={styles.biometricText}>{t.auth.biometricLogin}</Text>
            </Pressable>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
};
