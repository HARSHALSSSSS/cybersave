import React, { useCallback, useEffect, useMemo } from 'react';
import {
  FlatList,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useQuery } from '@tanstack/react-query';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useTheme } from '@app/providers/ThemeProvider';
import { ServiceHubHeader } from '@features/services/components';
import { goBackInServicesStack } from '@features/services/utils/navigateToService';
import { ServicesStackParamList } from '@/types/navigation';
import { getStateUi } from '@constants/indianStatesUi';
import { useTranslation } from '@/i18n';
import { servicesApi, servicesQueryKeys } from '@services/api';
import { getScrollBottomPadding } from '@utils/layout';

type Props = NativeStackScreenProps<ServicesStackParamList, 'StateSelect'>;

export const StateSelectScreen: React.FC<Props> = ({ navigation, route }) => {
  const { categoryId, optionId, optionName } = route.params;
  const { theme } = useTheme();
  const insets = useSafeAreaInsets();
  const { t } = useTranslation();

  const { data: config } = useQuery({
    queryKey: servicesQueryKeys.configuration(optionId),
    queryFn: () => servicesApi.getSubServiceConfiguration(optionId),
  });

  const states = useMemo(() => {
    const fromConfig = config?.fulfillment?.availableStates ?? [];
    return fromConfig.map(s => ({ code: s.code, name: s.name }));
  }, [config]);

  const autoSelect = useCallback(
    (code: string, name: string) => {
      navigation.replace('ServiceDetail', {
        categoryId,
        optionId,
        stateCode: code,
        stateName: name,
      });
    },
    [categoryId, navigation, optionId],
  );

  useEffect(() => {
    if (states.length === 1) {
      autoSelect(states[0].code, states[0].name);
    }
  }, [autoSelect, states]);

  const list = states;

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
          paddingTop: theme.spacing['2xl'],
          paddingHorizontal: theme.spacing.lg,
          paddingBottom: getScrollBottomPadding(insets),
        },
        subtitle: {
          ...theme.typography.bodyMedium,
          color: theme.colors.textSecondary,
          paddingHorizontal: theme.spacing.md,
          marginBottom: theme.spacing.lg,
          lineHeight: 22,
        },
        grid: {
          paddingBottom: getScrollBottomPadding(insets, theme.spacing.lg),
        },
        row: {
          flexDirection: 'row',
          gap: theme.spacing.md,
          marginBottom: theme.spacing.md,
        },
        card: {
          flex: 1,
          borderRadius: theme.radius.xl,
          borderWidth: 1,
          borderColor: theme.colors.borderLight,
          padding: theme.spacing.lg,
          minHeight: 96,
          backgroundColor: theme.colors.surface,
          shadowColor: '#0F172A',
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.06,
          shadowRadius: 8,
          elevation: 2,
        },
        badge: {
          width: 44,
          height: 44,
          borderRadius: theme.radius.lg,
          alignItems: 'center',
          justifyContent: 'center',
          marginBottom: theme.spacing.sm,
        },
        badgeText: {
          ...theme.typography.labelLarge,
          fontWeight: '700',
        },
        name: {
          ...theme.typography.labelMedium,
          color: theme.colors.textPrimary,
          lineHeight: 20,
        },
        code: {
          ...theme.typography.bodySmall,
          color: theme.colors.textSecondary,
          marginTop: 2,
        },
        empty: {
          flex: 1,
          alignItems: 'center',
          justifyContent: 'center',
          paddingHorizontal: theme.spacing.xl,
        },
        emptyTitle: {
          ...theme.typography.headingSmall,
          color: theme.colors.textPrimary,
          textAlign: 'center',
          marginBottom: theme.spacing.sm,
        },
        emptyText: {
          ...theme.typography.bodyMedium,
          color: theme.colors.textSecondary,
          textAlign: 'center',
          lineHeight: 22,
        },
      }),
    [theme, insets.bottom],
  );

  const selectState = useCallback(
    (code: string, name: string) => {
      navigation.replace('ServiceDetail', {
        categoryId,
        optionId,
        stateCode: code,
        stateName: name,
      });
    },
    [categoryId, navigation, optionId],
  );

  const pairs = useMemo(() => {
    const rows: Array<Array<{ code: string; name: string }>> = [];
    for (let i = 0; i < list.length; i += 2) {
      rows.push(list.slice(i, i + 2));
    }
    return rows;
  }, [list]);

  return (
    <View style={styles.container}>
      <ServiceHubHeader
        title={t.services.selectState}
        showBack
        onBack={() => goBackInServicesStack(navigation)}
      />
      <View style={styles.content}>
        <Text style={styles.subtitle}>
          {optionName} — {t.services.stateSubtitle}
        </Text>
        {list.length === 0 ? (
          <View style={styles.empty}>
            <Text style={styles.emptyTitle}>{t.services.noStatesTitle}</Text>
            <Text style={styles.emptyText}>{t.services.noStatesMessage}</Text>
          </View>
        ) : (
          <FlatList
            data={pairs}
            keyExtractor={(_, index) => String(index)}
            contentContainerStyle={styles.grid}
            showsVerticalScrollIndicator={false}
            renderItem={({ item: row }) => (
              <View style={styles.row}>
                {row.map(state => {
                  const ui = getStateUi(state.code);
                  return (
                    <Pressable
                      key={state.code}
                      style={styles.card}
                      accessibilityRole="button"
                      onPress={() => selectState(state.code, state.name)}>
                      <View style={[styles.badge, { backgroundColor: ui.bg }]}>
                        <Text style={[styles.badgeText, { color: ui.color }]}>
                          {ui.short}
                        </Text>
                      </View>
                      <Text style={styles.name} numberOfLines={2}>
                        {state.name}
                      </Text>
                      <Text style={styles.code}>{state.code}</Text>
                    </Pressable>
                  );
                })}
                {row.length === 1 ? <View style={{ flex: 1 }} /> : null}
              </View>
            )}
          />
        )}
      </View>
    </View>
  );
};
