import React, { useCallback, useMemo } from 'react';
import {
  ActivityIndicator,
  FlatList,
  ListRenderItem,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { BottomTabNavigationProp } from '@react-navigation/bottom-tabs';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useIsFocused } from '@react-navigation/native';
import {
  HomeStackParamList,
  MainTabParamList,
} from '@/types/navigation';
import { useTheme } from '@app/providers/ThemeProvider';
import { BackIcon, BillIcon, GearIcon, ShieldIcon } from '@components/icons';
import {
  CitizenNotification,
  notificationsApi,
  resolveNotificationType,
} from '@services/api';
import { formatAppDate, useTranslation } from '@/i18n';
import { getScreenBottomPadding } from '@utils/layout';

type Props = NativeStackScreenProps<HomeStackParamList, 'Notifications'>;

const NotificationIcon = ({ type, color }: { type: string; color: string }) => {
  const t = type.toLowerCase();
  if (t.includes('payment')) return <BillIcon color={color} size={20} />;
  if (t.includes('system')) return <GearIcon color={color} size={20} />;
  return <ShieldIcon color={color} size={20} />;
};

export const NotificationsScreen: React.FC<Props> = ({ navigation }) => {
  const { theme } = useTheme();
  const insets = useSafeAreaInsets();
  const queryClient = useQueryClient();
  const isFocused = useIsFocused();
  const { t, locale } = useTranslation();

  const { data, isLoading, isError } = useQuery({
    queryKey: ['notifications'],
    queryFn: () => notificationsApi.listNotifications(),
    refetchInterval: isFocused ? 15000 : false,
    refetchIntervalInBackground: false,
  });

  const markReadMutation = useMutation({
    mutationFn: (id: string) => notificationsApi.markNotificationRead(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['notifications'] }),
  });

  const notifications = data?.data ?? [];

  const styles = useMemo(
    () =>
      StyleSheet.create({
        gradient: {
          flex: 1,
          paddingTop: insets.top + theme.spacing.lg,
        },
        header: {
          flexDirection: 'row',
          alignItems: 'center',
          paddingHorizontal: theme.spacing['2xl'],
          marginBottom: theme.spacing.lg,
          gap: theme.spacing.md,
        },
        headerTitle: {
          ...theme.typography.headingSmall,
          color: theme.colors.textInverse,
        },
        list: {
          flex: 1,
          backgroundColor: theme.colors.surface,
          borderTopLeftRadius: theme.radius['3xl'],
          borderTopRightRadius: theme.radius['3xl'],
          paddingTop: theme.spacing.lg,
        },
        item: {
          flexDirection: 'row',
          gap: theme.spacing.md,
          paddingHorizontal: theme.spacing['2xl'],
          paddingVertical: theme.spacing.lg,
          borderBottomWidth: 1,
          borderBottomColor: theme.colors.border,
        },
        unread: {
          backgroundColor: theme.colors.backgroundSecondary,
        },
        iconWrap: {
          width: 40,
          height: 40,
          borderRadius: theme.radius.full,
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: '#EFF6FF',
        },
        body: { flex: 1 },
        title: {
          ...theme.typography.labelMedium,
          color: theme.colors.textPrimary,
        },
        message: {
          ...theme.typography.bodySmall,
          color: theme.colors.textSecondary,
          marginTop: 2,
        },
        time: {
          ...theme.typography.bodySmall,
          color: theme.colors.textSecondary,
          marginTop: 4,
        },
        listContent: {
          paddingBottom: getScreenBottomPadding(insets),
        },
        center: {
          padding: theme.spacing['3xl'],
          alignItems: 'center',
        },
      }),
    [theme, insets],
  );

  const handlePress = useCallback(
    (item: CitizenNotification) => {
      if (!item.readAt) {
        markReadMutation.mutate(item.id);
      }
      const ticketId = item.metadata?.ticketId;
      if (typeof ticketId === 'string') {
        navigation
          .getParent<BottomTabNavigationProp<MainTabParamList>>()
          ?.navigate('ProfileTab', {
            screen: 'TicketDetail',
            params: { ticketId },
          });
        return;
      }
      const applicationId = item.metadata?.applicationId;
      if (typeof applicationId === 'string') {
        navigation
          .getParent<BottomTabNavigationProp<MainTabParamList>>()
          ?.navigate('ApplicationsTab', {
            screen: 'ApplicationDetail',
            params: { applicationId },
          });
      }
    },
    [markReadMutation, navigation],
  );

  const renderItem: ListRenderItem<CitizenNotification> = useCallback(
    ({ item }) => {
      const type = resolveNotificationType(item);
      return (
        <Pressable
          style={[styles.item, !item.readAt && styles.unread]}
          onPress={() => handlePress(item)}>
          <View style={styles.iconWrap}>
            <NotificationIcon type={type} color={theme.colors.primary} />
          </View>
          <View style={styles.body}>
            <Text style={styles.title}>{item.title}</Text>
            <Text style={styles.message}>{item.body}</Text>
            <Text style={styles.time}>
              {formatAppDate(item.createdAt, locale)}
            </Text>
          </View>
        </Pressable>
      );
    },
    [handlePress, locale, styles, theme.colors.primary],
  );

  return (
    <LinearGradient
      colors={[theme.colors.gradientHeaderStart, theme.colors.gradientHeaderEnd]}
      style={styles.gradient}>
      <View style={styles.header}>
        <Pressable accessibilityRole="button" onPress={() => navigation.goBack()}>
          <BackIcon color={theme.colors.textInverse} />
        </Pressable>
        <Text style={styles.headerTitle}>{t.notifications.title}</Text>
      </View>

      {isLoading ? (
        <View style={[styles.list, styles.center]}>
          <ActivityIndicator color={theme.colors.primary} />
        </View>
      ) : isError ? (
        <View style={[styles.list, styles.center]}>
          <Text style={styles.message}>{t.notifications.loadError}</Text>
        </View>
      ) : (
        <FlatList
          style={styles.list}
          data={notifications}
          keyExtractor={item => item.id}
          renderItem={renderItem}
          contentContainerStyle={styles.listContent}
          ListEmptyComponent={
            <View style={styles.center}>
              <Text style={styles.message}>{t.notifications.empty}</Text>
            </View>
          }
        />
      )}
    </LinearGradient>
  );
};
