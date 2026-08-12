import React, { useCallback, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  FlatList,
  KeyboardAvoidingView,
  ListRenderItem,
  Platform,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { ProfileStackParamList } from '@/types/navigation';
import { useTranslation } from '@/i18n';
import { useTheme } from '@app/providers/ThemeProvider';
import { Button } from '@components/Button';
import { GradientScreenHeader } from '@features/profile/components/GradientScreenHeader';
import { TicketMessage, supportApi, supportQueryKeys } from '@services/api';

type Props = NativeStackScreenProps<ProfileStackParamList, 'TicketDetail'>;

function formatDateTime(iso: string): string {
  return new Date(iso).toLocaleString('en-IN', {
    day: 'numeric',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export const TicketDetailScreen: React.FC<Props> = ({ navigation, route }) => {
  const { ticketId } = route.params;
  const { theme } = useTheme();
  const insets = useSafeAreaInsets();
  const { t } = useTranslation();
  const queryClient = useQueryClient();
  const [reply, setReply] = useState('');

  const { data: ticket, isLoading, isError, refetch } = useQuery({
    queryKey: supportQueryKeys.ticket(ticketId),
    queryFn: () => supportApi.getTicket(ticketId),
  });

  const replyMutation = useMutation({
    mutationFn: (content: string) => supportApi.addTicketMessage(ticketId, content),
    onSuccess: () => {
      setReply('');
      void queryClient.invalidateQueries({ queryKey: supportQueryKeys.ticket(ticketId) });
      void queryClient.invalidateQueries({ queryKey: supportQueryKeys.tickets(1) });
    },
    onError: () => Alert.alert(t.common.error, t.profile.couldNotSendReply),
  });

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
        },
        loadingBox: {
          flex: 1,
          alignItems: 'center',
          justifyContent: 'center',
          padding: theme.spacing['2xl'],
        },
        headerBlock: {
          paddingHorizontal: theme.spacing['2xl'],
          paddingTop: theme.spacing['2xl'],
          paddingBottom: theme.spacing.lg,
          borderBottomWidth: 1,
          borderBottomColor: theme.colors.borderLight,
        },
        subject: {
          ...theme.typography.headingSmall,
          color: theme.colors.textPrimary,
        },
        meta: {
          ...theme.typography.bodySmall,
          color: theme.colors.textSecondary,
          marginTop: theme.spacing.xs,
        },
        messagesList: {
          paddingHorizontal: theme.spacing['2xl'],
          paddingVertical: theme.spacing.lg,
          paddingBottom: theme.spacing.md,
        },
        messageBubble: {
          maxWidth: '88%',
          borderRadius: theme.radius.lg,
          padding: theme.spacing.md,
          marginBottom: theme.spacing.md,
        },
        citizenBubble: {
          alignSelf: 'flex-end',
          backgroundColor: theme.colors.primary,
        },
        supportBubble: {
          alignSelf: 'flex-start',
          backgroundColor: theme.colors.backgroundSecondary,
          borderWidth: 1,
          borderColor: theme.colors.border,
        },
        messageText: {
          ...theme.typography.bodyMedium,
        },
        citizenText: { color: theme.colors.textInverse },
        supportText: { color: theme.colors.textPrimary },
        messageTime: {
          ...theme.typography.caption,
          marginTop: theme.spacing.xs,
          letterSpacing: 0,
        },
        footer: {
          paddingHorizontal: theme.spacing['2xl'],
          paddingTop: theme.spacing.md,
          paddingBottom: insets.bottom + theme.spacing.md,
          borderTopWidth: 1,
          borderTopColor: theme.colors.borderLight,
          backgroundColor: theme.colors.surface,
        },
        input: {
          borderWidth: 1,
          borderColor: theme.colors.border,
          borderRadius: theme.radius.lg,
          paddingHorizontal: theme.spacing.lg,
          paddingVertical: theme.spacing.md,
          minHeight: 80,
          ...theme.typography.bodyMedium,
          color: theme.colors.textPrimary,
          textAlignVertical: 'top',
          marginBottom: theme.spacing.md,
        },
        closedNote: {
          ...theme.typography.bodySmall,
          color: theme.colors.textSecondary,
          textAlign: 'center',
          padding: theme.spacing.lg,
        },
      }),
    [theme, insets.bottom],
  );

  const renderMessage: ListRenderItem<TicketMessage> = useCallback(
    ({ item }) => {
      const isCitizen = item.senderType === 'citizen';
      return (
        <View
          style={[
            styles.messageBubble,
            isCitizen ? styles.citizenBubble : styles.supportBubble,
          ]}>
          <Text style={[styles.messageText, isCitizen ? styles.citizenText : styles.supportText]}>
            {item.content}
          </Text>
          <Text
            style={[
              styles.messageTime,
              { color: isCitizen ? 'rgba(255,255,255,0.75)' : theme.colors.textSecondary },
            ]}>
            {formatDateTime(item.createdAt)}
          </Text>
        </View>
      );
    },
    [styles, theme.colors.textSecondary],
  );

  const isClosed = ticket?.status === 'CLOSED' || ticket?.status === 'RESOLVED';

  const handleSend = useCallback(() => {
    const trimmed = reply.trim();
    if (!trimmed) {
      Alert.alert(t.profile.emptyReply, t.profile.enterMessageBeforeSend);
      return;
    }
    replyMutation.mutate(trimmed);
  }, [reply, replyMutation]);

  if (isLoading || !ticket) {
    return (
      <View style={styles.container}>
        <GradientScreenHeader title={t.profile.ticket} showBack onBack={() => navigation.goBack()} />
        <View style={styles.loadingBox}>
          {isError ? (
            <>
              <Text style={styles.meta}>{t.support.couldNotLoadTicket}</Text>
              <Button title={t.common.retry} onPress={() => refetch()} />
            </>
          ) : (
            <ActivityIndicator color={theme.colors.primary} size="large" />
          )}
        </View>
      </View>
    );
  }

  const messages = ticket.messages ?? [];

  return (
    <View style={styles.container}>
      <GradientScreenHeader title={t.profile.ticketDetails} showBack onBack={() => navigation.goBack()} />

      <KeyboardAvoidingView
        style={styles.content}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={80}>
        <View style={styles.headerBlock}>
          <Text style={styles.subject}>{ticket.subject}</Text>
          <Text style={styles.meta}>
            {t.support.statusPrefix}: {ticket.status.replace(/_/g, ' ')} • {t.support.opened}{' '}
            {formatDateTime(ticket.createdAt)}
          </Text>
        </View>

        <FlatList
          data={messages}
          keyExtractor={item => item.id}
          renderItem={renderMessage}
          contentContainerStyle={styles.messagesList}
          showsVerticalScrollIndicator={false}
        />

        {isClosed ? (
          <Text style={styles.closedNote}>{t.support.ticketClosedNote}</Text>
        ) : (
          <View style={styles.footer}>
            <TextInput
              style={styles.input}
              placeholder={t.profile.typeReply}
              placeholderTextColor={theme.colors.inputPlaceholder}
              multiline
              value={reply}
              onChangeText={setReply}
            />
            <Button
              title={t.profile.sendReply}
              loading={replyMutation.isPending}
              onPress={handleSend}
            />
          </View>
        )}
      </KeyboardAvoidingView>
    </View>
  );
};
