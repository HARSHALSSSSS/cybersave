import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useDispatch } from 'react-redux';
import { useMutation } from '@tanstack/react-query';
import { AuthStackParamList } from '@/types/navigation';
import { OTP_LENGTH, OTP_RESEND_SECONDS, DEV_OTP_HINT } from '@constants/index';
import { useTheme } from '@app/providers/ThemeProvider';
import { Button } from '@components/Button';
import { Header } from '@components/Header';
import { loginSuccess } from '@features/auth/store/authSlice';
import { markOnboardingComplete } from '@features/auth/utils/restoreSession';
import { authApi, setAuthTokens } from '@services/api';
import { maskPhoneNumber } from '@utils/format';
import {
  clearPendingFirebaseConfirmation,
  resendLoginOtp,
  verifyLoginOtp,
  type OtpAuthMode,
} from '@utils/firebasePhoneAuth';
import { resetToMain } from '@utils/navigation';
import { useTranslation } from '@/i18n';
import Svg, { Path } from 'react-native-svg';

type Props = NativeStackScreenProps<AuthStackParamList, 'OTP'>;

const LockIcon = ({ color }: { color: string }) => (
  <Svg width={14} height={14} viewBox="0 0 14 14" fill="none">
    <Path
      d="M3.5 6V4.5C3.5 2.843 4.843 1.5 6.5 1.5C8.157 1.5 9.5 2.843 9.5 4.5V6M2.5 6H10.5C11.052 6 11.5 6.448 11.5 7V11.5C11.5 12.052 11.052 12.5 10.5 12.5H2.5C1.948 12.5 1.5 12.052 1.5 11.5V7C1.5 6.448 1.948 6 2.5 6Z"
      stroke={color}
      strokeWidth={1.2}
      strokeLinecap="round"
    />
  </Svg>
);

export const OTPScreen: React.FC<Props> = ({ navigation, route }) => {
  const { phone, devCode, authMode: initialAuthMode = 'backend' } = route.params;
  const [authMode, setAuthMode] = useState<OtpAuthMode>(initialAuthMode);
  const { theme } = useTheme();
  const dispatch = useDispatch();
  const insets = useSafeAreaInsets();
  const { t, format } = useTranslation();
  const inputRefs = useRef<(TextInput | null)[]>([]);
  const [otp, setOtp] = useState<string[]>(Array(OTP_LENGTH).fill(''));
  const [timer, setTimer] = useState(OTP_RESEND_SECONDS);
  const [focusedIndex, setFocusedIndex] = useState(0);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (timer <= 0) return;
    const interval = setInterval(() => setTimer(prev => prev - 1), 1000);
    return () => clearInterval(interval);
  }, [timer]);

  const resendMutation = useMutation({
    mutationFn: async () => {
      clearPendingFirebaseConfirmation();
      const mode = await resendLoginOtp(phone);
      setAuthMode(mode);
    },
    onSuccess: () => {
      setTimer(OTP_RESEND_SECONDS);
      setError(null);
    },
    onError: () => {
      Alert.alert(t.common.error, t.auth.couldNotResendOtp);
    },
  });

  const verifyMutation = useMutation({
    mutationFn: async (code: string) => {
      const tokens = await verifyLoginOtp(phone, code, authMode);
      setAuthTokens(tokens.accessToken, tokens.refreshToken);
      const citizen = await authApi.getMe();
      return { tokens, citizen };
    },
    onSuccess: ({ tokens, citizen }) => {
      markOnboardingComplete();
      dispatch(
        loginSuccess({
          accessToken: tokens.accessToken,
          refreshToken: tokens.refreshToken,
          citizen,
        }),
      );
      resetToMain(navigation);
    },
    onError: (error: unknown) => {
      const message =
        error instanceof Error ? error.message : t.validation.otpInvalid;
      setError(message);
      setOtp(Array(OTP_LENGTH).fill(''));
      inputRefs.current[0]?.focus();
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
        },
        title: {
          ...theme.typography.headingLarge,
          color: theme.colors.textPrimary,
          marginBottom: theme.spacing.md,
        },
        description: {
          ...theme.typography.bodyMedium,
          color: theme.colors.textSecondary,
          lineHeight: 22,
          marginBottom: theme.spacing['3xl'],
        },
        phoneHighlight: {
          color: theme.colors.textPrimary,
          fontWeight: '700',
        },
        otpRow: {
          flexDirection: 'row',
          justifyContent: 'space-between',
          gap: theme.spacing.md,
          marginBottom: theme.spacing['2xl'],
        },
        otpBox: {
          flex: 1,
          aspectRatio: 1,
          maxWidth: 64,
          borderWidth: 1.5,
          borderRadius: theme.radius.md,
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: theme.colors.backgroundSecondary,
        },
        otpBoxFocused: {
          borderColor: theme.colors.primary,
          backgroundColor: theme.colors.surface,
        },
        otpBoxDefault: {
          borderColor: theme.colors.border,
        },
        otpText: {
          ...theme.typography.headingMedium,
          color: theme.colors.textPrimary,
        },
        actions: {
          flexDirection: 'row',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: theme.spacing['4xl'],
        },
        timerText: {
          ...theme.typography.bodySmall,
          color: theme.colors.textSecondary,
        },
        timerBold: {
          fontWeight: '700',
          color: theme.colors.textPrimary,
        },
        changeNumber: {
          ...theme.typography.labelMedium,
          color: theme.colors.primary,
        },
        resend: {
          ...theme.typography.labelMedium,
          color: theme.colors.primary,
        },
        resendDisabled: {
          color: theme.colors.textSecondary,
        },
        footer: {
          paddingHorizontal: theme.spacing['2xl'],
          paddingBottom: insets.bottom + theme.spacing.lg,
          gap: theme.spacing.lg,
        },
        security: {
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'center',
          gap: theme.spacing.sm,
        },
        securityText: {
          ...theme.typography.bodySmall,
          color: theme.colors.success,
          fontWeight: '500',
        },
        errorText: {
          ...theme.typography.bodySmall,
          color: theme.colors.error,
          marginBottom: theme.spacing.md,
        },
      }),
    [theme, insets],
  );

  const handleOtpChange = useCallback(
    (value: string, index: number) => {
      const digit = value.replace(/\D/g, '').slice(-1);
      const next = [...otp];
      next[index] = digit;
      setOtp(next);
      setError(null);

      if (digit && index < OTP_LENGTH - 1) {
        inputRefs.current[index + 1]?.focus();
      }
    },
    [otp],
  );

  const handleKeyPress = useCallback(
    (key: string, index: number) => {
      if (key === 'Backspace' && !otp[index] && index > 0) {
        inputRefs.current[index - 1]?.focus();
      }
    },
    [otp],
  );

  const isComplete = otp.every(d => d.length === 1);

  const handleVerify = () => {
    if (!isComplete) return;
    verifyMutation.mutate(otp.join(''));
  };

  return (
    <View style={styles.container}>
      <Header
        title={t.auth.verifyMobile}
        showBack
        onBack={() => navigation.goBack()}
        centered
      />

      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <View style={styles.card}>
          <Text style={styles.title}>{t.auth.enterOtp}</Text>
          <Text style={styles.description}>
            {t.auth.otpHint}{' '}
            <Text style={styles.phoneHighlight}>{maskPhoneNumber(phone)}</Text>
            {!isFirebaseAuthEnabled() && devCode ? (
              <>
                {' · '}
                <Text style={styles.phoneHighlight}>{devCode ?? DEV_OTP_HINT}</Text>
              </>
            ) : null}
          </Text>

          <View style={styles.otpRow}>
            {otp.map((digit, index) => (
              <TextInput
                key={index}
                ref={ref => {
                  inputRefs.current[index] = ref;
                }}
                style={[
                  styles.otpBox,
                  focusedIndex === index
                    ? styles.otpBoxFocused
                    : styles.otpBoxDefault,
                  styles.otpText,
                ]}
                value={digit}
                onChangeText={value => handleOtpChange(value, index)}
                onKeyPress={({ nativeEvent }) =>
                  handleKeyPress(nativeEvent.key, index)
                }
                onFocus={() => setFocusedIndex(index)}
                keyboardType="number-pad"
                maxLength={1}
                selectTextOnFocus
                accessibilityLabel={`OTP digit ${index + 1}`}
              />
            ))}
          </View>

          {error ? <Text style={styles.errorText}>{error}</Text> : null}

          <View style={styles.actions}>
            <Text style={styles.timerText}>
              {format(t.auth.resendIn, { seconds: timer })}
            </Text>
            <Pressable
              accessibilityRole="button"
              onPress={() => navigation.goBack()}>
              <Text style={styles.changeNumber}>{t.auth.enterPhone}</Text>
            </Pressable>
          </View>

          {timer <= 0 ? (
            <Pressable
              accessibilityRole="button"
              disabled={resendMutation.isPending}
              onPress={() => resendMutation.mutate()}>
              <Text
                style={[
                  styles.resend,
                  resendMutation.isPending && styles.resendDisabled,
                ]}>
                {t.auth.resendOtp}
              </Text>
            </Pressable>
          ) : null}
        </View>
      </KeyboardAvoidingView>

      <View style={styles.footer}>
        <Button
          title={t.auth.verify}
          disabled={!isComplete}
          loading={verifyMutation.isPending}
          onPress={handleVerify}
        />
        <View style={styles.security}>
          <LockIcon color={theme.colors.success} />
          <Text style={styles.securityText}>{t.bills.securedBy}</Text>
        </View>
      </View>
    </View>
  );
};
