import React, { useCallback, useMemo } from 'react';
import { Linking, ScrollView, StyleSheet, Text, View } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useTheme } from '@app/providers/ThemeProvider';
import { Button } from '@components/Button';
import { ServiceHubHeader } from '@features/services/components';
import { ServicesStackParamList } from '@/types/navigation';
import { manualApplyApi } from '@services/api';
import { useTranslation } from '@/i18n';
import { getTabFooterPadding } from '@utils/layout';

type Props = NativeStackScreenProps<ServicesStackParamList, 'ManualApplySuccess'>;

export const ManualApplySuccessScreen: React.FC<Props> = ({ navigation, route }) => {
  const { sessionId, officialPortalUrl, serviceName } = route.params;
  const { theme } = useTheme();
  const insets = useSafeAreaInsets();
  const { t, format } = useTranslation();

  const openPortal = useCallback(async () => {
    await Linking.openURL(officialPortalUrl);
    await manualApplyApi.markRedirected(sessionId).catch(() => undefined);
  }, [officialPortalUrl, sessionId]);

  const confirmDone = useCallback(async () => {
    await manualApplyApi.confirmApplied(sessionId).catch(() => undefined);
    navigation.popToTop();
  }, [navigation, sessionId]);

  const styles = useMemo(
    () =>
      StyleSheet.create({
        container: { flex: 1, backgroundColor: theme.colors.backgroundSecondary },
        content: {
          flex: 1,
          backgroundColor: theme.colors.surface,
          borderTopLeftRadius: theme.radius['3xl'],
          borderTopRightRadius: theme.radius['3xl'],
          marginTop: -theme.spacing.lg,
          paddingHorizontal: theme.spacing['2xl'],
          paddingTop: theme.spacing['3xl'],
          paddingBottom: getTabFooterPadding(insets),
          alignItems: 'center',
        },
        icon: { fontSize: 48, marginBottom: theme.spacing.lg },
        title: { ...theme.typography.headingMedium, color: theme.colors.textPrimary, textAlign: 'center' },
        subtitle: {
          ...theme.typography.bodyMedium,
          color: theme.colors.textSecondary,
          textAlign: 'center',
          marginTop: theme.spacing.sm,
          marginBottom: theme.spacing['2xl'],
        },
        actions: { width: '100%', gap: theme.spacing.md },
      }),
    [theme, insets.bottom],
  );

  return (
    <View style={styles.container}>
      <ServiceHubHeader title={t.services.readyToApply} showBack={false} />

      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.icon}>✓</Text>
        <Text style={styles.title}>{t.services.manualSuccessTitle}</Text>
        <Text style={styles.subtitle}>
          {format(t.services.manualSuccessSubtitle, { serviceName })}
        </Text>

        <View style={styles.actions}>
          <Button title={t.services.openOfficialPortal} onPress={openPortal} />
          <Button title={t.services.appliedOnPortal} variant="outline" onPress={confirmDone} />
          <Button title={t.services.backToServices} variant="ghost" onPress={() => navigation.popToTop()} />
        </View>
      </ScrollView>
    </View>
  );
};
