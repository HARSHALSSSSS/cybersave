import React, { useEffect, useMemo, useState } from 'react';
import { ActivityIndicator, Image, StyleSheet, Text, View } from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useDispatch } from 'react-redux';
import { RootStackParamList } from '@/types/navigation';
import { Images } from '@assets/index';
import { useTranslation } from '@/i18n';
import { useTheme } from '@app/providers/ThemeProvider';
import { animations } from '@theme/animations';
import { DigitalIndiaBadge } from '@features/auth/components/BrandLogo';
import {
  hasPersistedSession,
  resolveBootstrapRoute,
  type BootstrapRoute,
} from '@features/auth/utils/restoreSession';
import { USE_HOSTED_API } from '@app/config/env';
import { getBoolean, StorageKeys } from '@services/storage';

type Props = NativeStackScreenProps<RootStackParamList, 'Splash'>;

const BOOTSTRAP_MAX_MS = USE_HOSTED_API ? 12000 : 6000;

function fallbackBootstrapRoute(returningUser: boolean): BootstrapRoute {
  if (returningUser) return 'Main';
  if (getBoolean(StorageKeys.ONBOARDING_COMPLETE)) return 'Auth';
  return 'Onboarding';
}

export const SplashScreen: React.FC<Props> = ({ navigation }) => {
  const { theme } = useTheme();
  const insets = useSafeAreaInsets();
  const { t } = useTranslation();
  const dispatch = useDispatch();
  const [bootstrapping, setBootstrapping] = useState(true);

  useEffect(() => {
    let cancelled = false;

    async function bootstrap() {
      const returningUser = hasPersistedSession();
      const minDelayMs = returningUser ? 500 : animations.splashDelay;

      let route: BootstrapRoute = fallbackBootstrapRoute(returningUser);
      try {
        route = await Promise.race([
          resolveBootstrapRoute(dispatch),
          new Promise<BootstrapRoute>((resolve) =>
            setTimeout(() => resolve(fallbackBootstrapRoute(returningUser)), BOOTSTRAP_MAX_MS),
          ),
        ]);
      } catch {
        route = fallbackBootstrapRoute(returningUser);
      }

      await new Promise<void>(resolve => setTimeout(resolve, minDelayMs));
      if (cancelled) return;

      setBootstrapping(false);
      navigation.reset({
        index: 0,
        routes: [{ name: route }],
      });
    }

    void bootstrap();

    return () => {
      cancelled = true;
    };
  }, [dispatch, navigation]);

  const styles = useMemo(
    () =>
      StyleSheet.create({
        container: {
          flex: 1,
        },
        content: {
          flex: 1,
          alignItems: 'center',
          justifyContent: 'space-between',
          paddingTop: insets.top + theme.spacing['3xl'],
          paddingBottom: insets.bottom + theme.spacing['2xl'],
          paddingHorizontal: theme.spacing['2xl'],
        },
        hero: {
          flex: 1,
          width: '100%',
          alignItems: 'center',
          justifyContent: 'center',
          paddingHorizontal: theme.spacing.md,
        },
        splashLogo: {
          width: '88%',
          maxWidth: 320,
          height: undefined,
          aspectRatio: 1,
          maxHeight: 280,
        },
        footer: {
          alignItems: 'center',
          gap: theme.spacing.lg,
          width: '100%',
        },
        loadingRow: {
          flexDirection: 'row',
          alignItems: 'center',
          gap: theme.spacing.sm,
        },
        loadingText: {
          ...theme.typography.bodySmall,
          color: 'rgba(255,255,255,0.72)',
        },
        ministry: {
          ...theme.typography.bodySmall,
          color: 'rgba(255,255,255,0.55)',
          textAlign: 'center',
          marginTop: theme.spacing.md,
          letterSpacing: 0.3,
        },
      }),
    [theme, insets],
  );

  return (
    <LinearGradient
      colors={[
        theme.colors.splashGradientTop,
        theme.colors.splashGradientMid,
        theme.colors.splashGradientBottom,
      ]}
      locations={[0, 0.42, 1]}
      style={styles.container}>
      <View style={styles.content}>
        <View style={styles.hero}>
          <Image
            source={Images.splashBrandLogo}
            style={styles.splashLogo}
            resizeMode="contain"
            accessibilityLabel="Cybersave — Digital Services, Trusted Always"
          />
          <Text style={styles.ministry}>{t.auth.splashSubtagline}</Text>
        </View>

        <View style={styles.footer}>
          {bootstrapping ? (
            <View style={styles.loadingRow}>
              <ActivityIndicator color={theme.colors.textInverse} size="small" />
              <Text style={styles.loadingText}>{t.common.loading}</Text>
            </View>
          ) : null}
          <DigitalIndiaBadge />
        </View>
      </View>
    </LinearGradient>
  );
};
