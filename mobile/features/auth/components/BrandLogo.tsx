import React, { useMemo } from 'react';
import { Image, StyleSheet, Text, View } from 'react-native';
import { Images } from '@assets/index';
import { useTranslation } from '@/i18n';
import { useTheme } from '@app/providers/ThemeProvider';
import { palette } from '@theme/colors';

const LOGO_HEIGHT = {
  sm: 44,
  md: 52,
  lg: 64,
} as const;

/** Navbar lockup aspect (782×252). */
const LOCKUP_ASPECT = 782 / 252;

type BrandLogoProps = {
  size?: keyof typeof LOGO_HEIGHT;
  /** Center the lockup in its container (splash hero). */
  centered?: boolean;
};

export const BrandLogo: React.FC<BrandLogoProps> = ({
  size = 'md',
  centered = false,
}) => {
  const height = LOGO_HEIGHT[size];
  const width = Math.round(height * LOCKUP_ASPECT);

  return (
    <View style={centered ? styles.centered : undefined}>
      <Image
        source={Images.brandLockupNav}
        style={[styles.logo, { width, height }]}
        resizeMode="contain"
        accessibilityLabel="Cybersave — Digital Services, Trusted Always"
      />
    </View>
  );
};

export const BrandTitle: React.FC<{ prefix?: string }> = ({ prefix }) => {
  const { theme } = useTheme();
  const { t } = useTranslation();
  const displayPrefix = prefix ?? t.auth.onboardingTitle1;

  const styles = useMemo(
    () =>
      StyleSheet.create({
        container: {
          alignItems: 'center',
        },
        line: {
          flexDirection: 'row',
          flexWrap: 'wrap',
          justifyContent: 'center',
          alignItems: 'baseline',
        },
        prefix: {
          ...theme.typography.headingLarge,
          color: palette.navy800,
          textAlign: 'center',
        },
        cyber: {
          ...theme.typography.headingLarge,
          color: palette.navy800,
          fontWeight: '700',
        },
        save: {
          ...theme.typography.headingLarge,
          color: palette.royal200,
          fontWeight: '700',
        },
      }),
    [theme],
  );

  return (
    <View style={styles.container}>
      <View style={styles.line}>
        <Text style={styles.prefix}>{displayPrefix} </Text>
        <Text style={styles.cyber}>Cyber</Text>
        <Text style={styles.save}>save</Text>
      </View>
    </View>
  );
};

export const DigitalIndiaBadge: React.FC = () => {
  const { theme } = useTheme();

  const styles = useMemo(
    () =>
      StyleSheet.create({
        badge: {
          flexDirection: 'row',
          alignItems: 'center',
          backgroundColor: 'rgba(15, 23, 42, 0.55)',
          paddingHorizontal: theme.spacing.xl,
          paddingVertical: theme.spacing.md,
          borderRadius: theme.radius.full,
          gap: theme.spacing.md,
          borderWidth: 1,
          borderColor: 'rgba(255,255,255,0.12)',
        },
        flag: {
          flexDirection: 'row',
          gap: 3,
        },
        flagStripe: {
          width: 14,
          height: 10,
          borderRadius: 2,
        },
        text: {
          ...theme.typography.labelSmall,
          color: theme.colors.textInverse,
          letterSpacing: 1.5,
          fontWeight: '700',
        },
      }),
    [theme],
  );

  return (
    <View style={styles.badge}>
      <View style={styles.flag}>
        <View style={[styles.flagStripe, { backgroundColor: palette.saffron }]} />
        <View style={[styles.flagStripe, { backgroundColor: palette.indiaWhite }]} />
        <View style={[styles.flagStripe, { backgroundColor: palette.indiaGreen }]} />
      </View>
      <Text style={styles.text}>DIGITAL INDIA</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  centered: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  logo: {
    maxWidth: '100%',
  },
});
