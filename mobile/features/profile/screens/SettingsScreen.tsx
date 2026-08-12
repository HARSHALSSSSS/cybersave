import React, { useCallback, useMemo, useState } from 'react';
import {
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { ProfileStackParamList } from '@/types/navigation';
import { ACTIVE_SESSIONS } from '@constants/index';
import { getSettingsSections, useTranslation } from '@/i18n';
import { useTheme } from '@app/providers/ThemeProvider';
import { GradientScreenHeader } from '@features/profile/components/GradientScreenHeader';
import { SettingsRow } from '@features/profile/components/SettingsRow';
import { getScrollBottomPadding } from '@utils/layout';
import {
  BellIcon,
  ClockIcon,
  FingerprintIcon,
  GlobeIcon,
  LockIcon,
  RefreshIcon,
  ShieldIcon,
  TrashIcon,
  WarningIcon,
} from '@components/icons';

type Props = NativeStackScreenProps<ProfileStackParamList, 'Settings'>;

const SettingsIconMap = ({ icon, color }: { icon: string; color: string }) => {
  switch (icon) {
    case 'globe':
      return <GlobeIcon color={color} size={20} />;
    case 'bell':
      return <BellIcon color={color} size={20} />;
    case 'fingerprint':
      return <FingerprintIcon color={color} size={20} />;
    case 'refresh':
      return <RefreshIcon color={color} size={20} />;
    case 'lock':
      return <LockIcon color={color} size={20} />;
    case 'shield':
      return <ShieldIcon color={color} size={20} />;
    case 'clock':
      return <ClockIcon color={color} size={20} />;
    case 'trash':
      return <TrashIcon color={color} size={20} />;
    case 'warning':
      return <WarningIcon color={color} size={20} />;
    default:
      return <GlobeIcon color={color} size={20} />;
  }
};

export const SettingsScreen: React.FC<Props> = ({ navigation }) => {
  const { theme } = useTheme();
  const insets = useSafeAreaInsets();
  const { t, format } = useTranslation();
  const settingsSections = useMemo(() => getSettingsSections(t), [t]);
  const [toggles, setToggles] = useState<Record<string, boolean>>(() => {
    const initial: Record<string, boolean> = {};
    settingsSections.forEach(section => {
      section.items.forEach(item => {
        if (item.type === 'toggle' && 'defaultOn' in item) {
          initial[item.id] = item.defaultOn ?? false;
        }
      });
    });
    return initial;
  });

  const styles = useMemo(
    () =>
      StyleSheet.create({
        container: {
          flex: 1,
          backgroundColor: theme.colors.backgroundSecondary,
        },
        content: {
          flex: 1,
          backgroundColor: theme.colors.surface,
          borderTopLeftRadius: theme.radius['3xl'],
          borderTopRightRadius: theme.radius['3xl'],
          marginTop: -theme.spacing.lg,
          paddingTop: theme.spacing['2xl'],
          paddingHorizontal: theme.spacing['2xl'],
        },
        sectionTitle: {
          ...theme.typography.caption,
          color: theme.colors.textSecondary,
          letterSpacing: 1,
          marginBottom: theme.spacing.sm,
          marginTop: theme.spacing.lg,
        },
        sectionBox: {
          borderRadius: theme.radius.lg,
          borderWidth: 1,
          borderColor: theme.colors.border,
          overflow: 'hidden',
          marginBottom: theme.spacing.md,
        },
        scrollContent: {
          paddingBottom: getScrollBottomPadding(insets),
        },
      }),
    [theme, insets],
  );

  const handleRowPress = useCallback(
    (id: string) => {
      if (id === 'language') {
        navigation.navigate('LanguageSelection');
      } else if (id === 'notifications') {
        Alert.alert(t.settings.notifications, t.settings.notificationsAlert);
      } else if (id === 'mpin') {
        Alert.alert(t.settings.mpin, t.settings.mpinHint);
      } else if (id === 'loginHistory') {
        const lines = ACTIVE_SESSIONS.map(
          session => `${session.device}\n${session.location} — ${session.status}`,
        ).join('\n\n');
        Alert.alert(t.settings.loginHistory, lines);
      } else if (id === 'deleteAccount') {
        Alert.alert(t.settings.deleteAccount, t.settings.deleteConfirm, [
          { text: t.common.cancel, style: 'cancel' },
          {
            text: t.common.delete,
            style: 'destructive',
            onPress: () =>
              Alert.alert(t.settings.deleteAccount, t.settings.deleteDemoNote),
          },
        ]);
      } else if (id === 'cache') {
        Alert.alert(
          t.settings.cacheClearedTitle,
          format(t.settings.cacheClearedSize, { size: '4.2 MB' }),
        );
      }
    },
    [navigation, t, format],
  );

  return (
    <View style={styles.container}>
      <GradientScreenHeader
        title={t.settings.title}
        showBack
        onBack={() => navigation.goBack()}
      />

      <ScrollView
        style={styles.content}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}>
        {settingsSections.map(section => (
          <View key={section.id}>
            <Text style={styles.sectionTitle}>{section.title}</Text>
            <View style={styles.sectionBox}>
              {section.items.map((item, index) => (
                <SettingsRow
                  key={item.id}
                  label={item.label}
                  icon={
                    <SettingsIconMap
                      icon={item.icon}
                      color={item.type === 'danger' ? '#EF4444' : theme.colors.primary}
                    />
                  }
                  type={item.type}
                  value={'value' in item ? (item.value as string | undefined) : undefined}
                  toggleValue={toggles[item.id]}
                  onToggle={
                    item.type === 'toggle'
                      ? val => setToggles(prev => ({ ...prev, [item.id]: val }))
                      : undefined
                  }
                  onPress={() => handleRowPress(item.id)}
                  isLast={index === section.items.length - 1}
                />
              ))}
            </View>
          </View>
        ))}
      </ScrollView>
    </View>
  );
};
