import React, { useMemo } from 'react';
import {
  Platform,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { BlurView } from '@react-native-community/blur';
import { BottomTabBarProps } from '@react-navigation/bottom-tabs';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import LinearGradient from 'react-native-linear-gradient';
import { useTheme } from '@app/providers/ThemeProvider';
import { useTranslation } from '@/i18n';
import {
  DocumentIcon,
  GridIcon,
  HomeIcon,
  UserIcon,
  WalletIcon,
} from '@components/icons';
import { palette } from '@theme/colors';

const TAB_KEYS: Array<{
  key: string;
  labelKey: 'home' | 'services' | 'applications' | 'wallet' | 'profile';
  Icon: React.ComponentType<{ color?: string; size?: number; filled?: boolean }>;
  center?: boolean;
}> = [
  { key: 'HomeTab', labelKey: 'home' as const, Icon: HomeIcon },
  { key: 'ServicesTab', labelKey: 'services' as const, Icon: GridIcon },
  { key: 'ApplicationsTab', labelKey: 'applications' as const, Icon: DocumentIcon, center: true },
  { key: 'WalletTab', labelKey: 'wallet' as const, Icon: WalletIcon },
  { key: 'ProfileTab', labelKey: 'profile' as const, Icon: UserIcon },
];

const INACTIVE_COLOR = palette.gray600;
const CENTER_BUTTON_SIZE = 58;
const CENTER_LIFT = 28;

const TAB_ROOTS: Partial<Record<string, string>> = {
  HomeTab: 'HomeMain',
  ServicesTab: 'ServicesMain',
  ApplicationsTab: 'ApplicationsMain',
  WalletTab: 'WalletMain',
  ProfileTab: 'ProfileMain',
};

export const CustomTabBar: React.FC<BottomTabBarProps> = ({
  state,
  navigation,
}) => {
  const { theme } = useTheme();
  const { t } = useTranslation();
  const insets = useSafeAreaInsets();

  const styles = useMemo(
    () =>
      StyleSheet.create({
    wrapper: {
      position: 'absolute',
      left: theme.spacing.xl,
      right: theme.spacing.xl,
      bottom: insets.bottom + theme.spacing.xs,
      overflow: 'visible',
    },
    bar: {
      position: 'relative',
      overflow: 'visible',
      paddingTop: CENTER_LIFT,
    },
    glassBg: {
      ...StyleSheet.absoluteFill,
      top: CENTER_LIFT,
      borderRadius: theme.radius['2xl'],
      overflow: 'hidden',
      borderWidth: 1,
      borderColor: 'rgba(255, 255, 255, 0.75)',
      ...theme.shadows.lg,
    },
    blur: {
      ...StyleSheet.absoluteFill,
    },
    glassOverlay: {
      ...StyleSheet.absoluteFill,
      backgroundColor:
        Platform.OS === 'ios'
          ? 'rgba(255, 255, 255, 0.45)'
          : 'rgba(255, 255, 255, 0.82)',
    },
    container: {
      flexDirection: 'row',
      alignItems: 'flex-end',
      paddingHorizontal: theme.spacing.sm,
      paddingTop: theme.spacing.md,
      paddingBottom: theme.spacing.md,
      minHeight: 68,
      overflow: 'visible',
    },
    tab: {
      flex: 1,
      alignItems: 'center',
      justifyContent: 'center',
      gap: theme.spacing.xxs,
      minHeight: 48,
    },
    centerTab: {
      flex: 1,
      alignItems: 'center',
      marginTop: -CENTER_LIFT,
      overflow: 'visible',
    },
    centerButton: {
      width: CENTER_BUTTON_SIZE,
      height: CENTER_BUTTON_SIZE,
      borderRadius: theme.radius.full,
      alignItems: 'center',
      justifyContent: 'center',
      borderWidth: 3,
      borderColor: 'rgba(255, 255, 255, 0.9)',
      ...theme.shadows.button,
    },
    label: {
      fontSize: 10,
      fontWeight: '500',
      letterSpacing: 0.1,
    },
    labelActive: {
      fontWeight: '700',
    },
      }),
    [theme, insets.bottom],
  );

  return (
    <View style={styles.wrapper} pointerEvents="box-none">
      <View style={styles.bar} pointerEvents="box-none">
        <View style={styles.glassBg} pointerEvents="none">
          <BlurView
            style={styles.blur}
            blurType="light"
            blurAmount={Platform.OS === 'ios' ? 24 : 18}
            reducedTransparencyFallbackColor="rgba(255,255,255,0.92)"
            overlayColor="rgba(255,255,255,0.65)"
          />
          <View style={styles.glassOverlay} />
        </View>

        <View style={styles.container}>
          {state.routes.map((route, index) => {
            const config = TAB_KEYS[index];
            if (!config) return null;

            const isFocused = state.index === index;
            const isCenter = config.center === true;
            const label = t.tabs[config.labelKey];
            const color =
              isFocused || isCenter ? theme.colors.primary : INACTIVE_COLOR;

            const onPress = () => {
              const event = navigation.emit({
                type: 'tabPress',
                target: route.key,
                canPreventDefault: true,
              });
              if (event.defaultPrevented) return;

              const rootScreen = TAB_ROOTS[route.name];
              if (rootScreen) {
                navigation.navigate(route.name, { screen: rootScreen });
                return;
              }
              navigation.navigate(route.name);
            };

            if (isCenter) {
              return (
                <Pressable
                  key={route.key}
                  accessibilityRole="button"
                  accessibilityState={{ selected: isFocused }}
                  onPress={onPress}
                  style={styles.centerTab}>
                  <LinearGradient
                    colors={[
                      theme.colors.gradientStart,
                      theme.colors.gradientEnd,
                    ]}
                    style={styles.centerButton}>
                    <config.Icon color="#FFFFFF" size={24} />
                  </LinearGradient>
                  <Text
                    style={[
                      styles.label,
                      styles.labelActive,
                      {
                        color: theme.colors.primary,
                        marginTop: theme.spacing.sm,
                      },
                    ]}>
                    {label}
                  </Text>
                </Pressable>
              );
            }

            const IconComponent = config.Icon;
            return (
              <Pressable
                key={route.key}
                accessibilityRole="button"
                accessibilityState={{ selected: isFocused }}
                onPress={onPress}
                style={styles.tab}>
                <IconComponent
                  color={color}
                  size={22}
                  {...(config.key === 'HomeTab' ? { filled: isFocused } : {})}
                />
                <Text
                  style={[
                    styles.label,
                    isFocused && styles.labelActive,
                    { color },
                  ]}>
                  {label}
                </Text>
              </Pressable>
            );
          })}
        </View>
      </View>
    </View>
  );
};
