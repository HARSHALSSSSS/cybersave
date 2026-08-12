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
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useQuery } from '@tanstack/react-query';

import { ProfileStackParamList } from '@/types/navigation';
import { useTranslation } from '@/i18n';
import { useTheme } from '@app/providers/ThemeProvider';
import { GradientScreenHeader } from '@features/profile/components/GradientScreenHeader';
import { ChevronRightSmallIcon } from '@components/icons';
import { SupportTicket, supportApi, supportQueryKeys } from '@services/api';

type Props = NativeStackScreenProps<ProfileStackParamList, 'MyTickets'>;

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
}

function statusColor(status: string): string {
  switch (status) {
    case 'OPEN':
      return '#2563EB';
    case 'IN_PROGRESS':
      return '#F59E0B';
    case 'RESOLVED':
      return '#10B981';
    case 'CLOSED':
      return '#6B7280';
    default:
      return '#2563EB';
  }
}

function statusLabel(status: string): string {
  return status.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
}

export const MyTicketsScreen: React.FC<Props> = ({ navigation }) => {
  const { theme } = useTheme();
  const insets = useSafeAreaInsets();
  const { t } = useTranslation();

  const { data, isLoading, isError, refetch, isRefetching } = useQuery({
    queryKey: supportQueryKeys.tickets(1),
    queryFn: () => supportApi.listTickets(1, 50),
  });

  const tickets = data?.data ?? [];

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
        },
        loadingBox: {
          flex: 1,
          alignItems: 'center',
          justifyContent: 'center',
          padding: theme.spacing['2xl'],
        },
        errorText: {
          ...theme.typography.bodyMedium,
          color: theme.colors.textSecondary,
          textAlign: 'center',
          marginBottom: theme.spacing.lg,
        },
        retryBtn: {
          paddingVertical: theme.spacing.sm,
          paddingHorizontal: theme.spacing.lg,
          borderRadius: theme.radius.full,
          backgroundColor: theme.colors.primary,
        },
        retryText: { ...theme.typography.labelMedium, color: theme.colors.textInverse },
        emptyBox: {
          flex: 1,
          alignItems: 'center',
          justifyContent: 'center',
          padding: theme.spacing['2xl'],
        },
        emptyText: {
          ...theme.typography.bodyMedium,
          color: theme.colors.textSecondary,
          textAlign: 'center',
          marginBottom: theme.spacing.lg,
        },
        newTicketBtn: {
          paddingVertical: theme.spacing.md,
          paddingHorizontal: theme.spacing.xl,
          borderRadius: theme.radius.full,
          backgroundColor: theme.colors.primary,
        },
        newTicketText: { ...theme.typography.labelMedium, color: theme.colors.textInverse },
        listContent: {
          paddingHorizontal: theme.spacing['2xl'],
          paddingBottom: insets.bottom + theme.spacing['3xl'],
        },
        ticketCard: {
          borderWidth: 1,
          borderColor: theme.colors.border,
          borderRadius: theme.radius.xl,
          padding: theme.spacing.lg,
          marginBottom: theme.spacing.md,
          backgroundColor: theme.colors.surface,
        },
        ticketTop: {
          flexDirection: 'row',
          alignItems: 'flex-start',
          justifyContent: 'space-between',
          gap: theme.spacing.md,
        },
        ticketSubject: {
          flex: 1,
          ...theme.typography.labelLarge,
          color: theme.colors.textPrimary,
        },
        statusBadge: {
          paddingHorizontal: theme.spacing.sm,
          paddingVertical: 4,
          borderRadius: theme.radius.full,
        },
        statusText: {
          ...theme.typography.caption,
          fontWeight: '600',
          letterSpacing: 0,
        },
        ticketMeta: {
          ...theme.typography.bodySmall,
          color: theme.colors.textSecondary,
          marginTop: theme.spacing.sm,
        },
        preview: {
          ...theme.typography.bodySmall,
          color: theme.colors.textSecondary,
          marginTop: theme.spacing.xs,
        },
      }),
    [theme, insets.bottom],
  );

  const renderItem: ListRenderItem<SupportTicket> = useCallback(
    ({ item }) => {
      const preview = item.messages?.[0]?.content ?? '';
      return (
        <Pressable
          style={styles.ticketCard}
          onPress={() => navigation.navigate('TicketDetail', { ticketId: item.id })}>
          <View style={styles.ticketTop}>
            <Text style={styles.ticketSubject} numberOfLines={2}>
              {item.subject}
            </Text>
            <View style={[styles.statusBadge, { backgroundColor: `${statusColor(item.status)}18` }]}>
              <Text style={[styles.statusText, { color: statusColor(item.status) }]}>
                {statusLabel(item.status)}
              </Text>
            </View>
          </View>
          <Text style={styles.ticketMeta}>{t.support.created} {formatDate(item.createdAt)}</Text>
          {preview ? (
            <Text style={styles.preview} numberOfLines={2}>
              {preview}
            </Text>
          ) : null}
          <View style={{ alignItems: 'flex-end', marginTop: theme.spacing.sm }}>
            <ChevronRightSmallIcon color={theme.colors.textSecondary} />
          </View>
        </Pressable>
      );
    },
    [navigation, styles, theme.colors.textSecondary, t.support.created],
  );

  return (
    <View style={styles.container}>
      <GradientScreenHeader
        title={t.profile.myTickets}
        showBack
        onBack={() => navigation.goBack()}
        rightAction={
          <Pressable onPress={() => navigation.navigate('RaiseTicket')}>
            <Text style={{ color: theme.colors.textInverse, ...theme.typography.bodySmall }}>
              {t.common.new}
            </Text>
          </Pressable>
        }
      />

      <View style={styles.content}>
        {isLoading ? (
          <View style={styles.loadingBox}>
            <ActivityIndicator color={theme.colors.primary} size="large" />
          </View>
        ) : isError ? (
          <View style={styles.loadingBox}>
            <Text style={styles.errorText}>{t.support.loadTicketsError}</Text>
            <Pressable style={styles.retryBtn} onPress={() => refetch()}>
              <Text style={styles.retryText}>{t.common.retry}</Text>
            </Pressable>
          </View>
        ) : tickets.length === 0 ? (
          <View style={styles.emptyBox}>
            <Text style={styles.emptyText}>
              {t.support.emptyTicketsMessage}
            </Text>
            <Pressable
              style={styles.newTicketBtn}
              onPress={() => navigation.navigate('RaiseTicket')}>
              <Text style={styles.newTicketText}>{t.profile.raiseTicket}</Text>
            </Pressable>
          </View>
        ) : (
          <FlatList
            data={tickets}
            keyExtractor={item => item.id}
            renderItem={renderItem}
            contentContainerStyle={styles.listContent}
            refreshing={isRefetching}
            onRefresh={() => refetch()}
            showsVerticalScrollIndicator={false}
          />
        )}
      </View>
    </View>
  );
};
