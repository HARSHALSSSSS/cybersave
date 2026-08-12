import React, { useCallback, useMemo, useState } from 'react';
import {
  FlatList,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { ProfileStackParamList } from '@/types/navigation';
import {
  CHAT_MESSAGES,
  CHAT_QUICK_ACTIONS,
  SUPPORT_AGENT,
} from '@constants/index';
import { useTranslation } from '@/i18n';
import { useTheme } from '@app/providers/ThemeProvider';
import { BackIcon, PaperclipIcon, SendIcon } from '@components/icons';

type Props = NativeStackScreenProps<ProfileStackParamList, 'SupportChat'>;

type ChatMessage = {
  id: string;
  type: 'bot' | 'user' | 'agent';
  text: string;
  agentName?: string;
};

export const SupportChatScreen: React.FC<Props> = ({ navigation }) => {
  const { theme } = useTheme();
  const insets = useSafeAreaInsets();
  const { t, format } = useTranslation();
  const [messages, setMessages] = useState<ChatMessage[]>([...CHAT_MESSAGES]);
  const [inputText, setInputText] = useState('');
  const [isTyping, setIsTyping] = useState(false);

  const pushAgentReply = useCallback((text: string) => {
    setIsTyping(true);
    setTimeout(() => {
      setMessages(prev => [
        ...prev,
        {
          id: `agent-${Date.now()}`,
          type: 'agent',
          text,
          agentName: SUPPORT_AGENT.agentName,
        },
      ]);
      setIsTyping(false);
    }, 900);
  }, []);

  const handleSend = useCallback(() => {
    if (!inputText.trim()) return;
    const userText = inputText.trim();
    setMessages(prev => [
      ...prev,
      { id: String(Date.now()), type: 'user', text: userText },
    ]);
    setInputText('');
    pushAgentReply(
      'Thank you for contacting Cybersave support. Our team has noted your message and will assist you shortly. For urgent issues, raise a ticket from Help & Support.',
    );
  }, [inputText, pushAgentReply]);

  const handleQuickAction = useCallback(
    (action: string) => {
      setMessages(prev => [
        ...prev,
        { id: String(Date.now()), type: 'user', text: action },
      ]);
      pushAgentReply(
        `I can help with "${action}". Please share your application reference or registered mobile number so I can look this up.`,
      );
    },
    [pushAgentReply],
  );

  const styles = useMemo(
    () =>
      StyleSheet.create({
        container: {
          flex: 1,
          backgroundColor: theme.colors.backgroundSecondary,
        },
        header: {
          flexDirection: 'row',
          alignItems: 'center',
          paddingTop: insets.top + theme.spacing.sm,
          paddingHorizontal: theme.spacing.lg,
          paddingBottom: theme.spacing.md,
          backgroundColor: theme.colors.surface,
          borderBottomWidth: 1,
          borderBottomColor: theme.colors.border,
          gap: theme.spacing.md,
        },
        backBtn: {
          width: 40,
          height: 40,
          borderRadius: theme.radius.md,
          backgroundColor: theme.colors.backgroundSecondary,
          alignItems: 'center',
          justifyContent: 'center',
        },
        avatar: {
          width: 40,
          height: 40,
          borderRadius: theme.radius.full,
          backgroundColor: '#DBEAFE',
        },
        headerInfo: {
          flex: 1,
        },
        headerTitle: {
          ...theme.typography.labelLarge,
          color: theme.colors.textPrimary,
        },
        statusRow: {
          flexDirection: 'row',
          alignItems: 'center',
          gap: theme.spacing.xs,
          marginTop: 2,
        },
        statusDot: {
          width: 8,
          height: 8,
          borderRadius: theme.radius.full,
          backgroundColor: '#10B981',
        },
        statusText: {
          ...theme.typography.bodySmall,
          color: '#10B981',
        },
        messagesList: {
          padding: theme.spacing.lg,
          gap: theme.spacing.md,
        },
        botRow: {
          flexDirection: 'row',
          alignItems: 'flex-start',
          gap: theme.spacing.sm,
          maxWidth: '85%',
        },
        botAvatar: {
          width: 32,
          height: 32,
          borderRadius: theme.radius.full,
          backgroundColor: '#DBEAFE',
          alignItems: 'center',
          justifyContent: 'center',
        },
        botAvatarText: {
          fontSize: 14,
        },
        bubbleBot: {
          backgroundColor: '#EFF6FF',
          borderRadius: theme.radius.lg,
          padding: theme.spacing.md,
          flex: 1,
        },
        bubbleUser: {
          backgroundColor: theme.colors.primary,
          borderRadius: theme.radius.lg,
          padding: theme.spacing.md,
          maxWidth: '80%',
          alignSelf: 'flex-end',
        },
        bubbleAgent: {
          backgroundColor: '#EFF6FF',
          borderRadius: theme.radius.lg,
          padding: theme.spacing.md,
          maxWidth: '80%',
        },
        textBot: {
          ...theme.typography.bodyMedium,
          color: theme.colors.textPrimary,
          lineHeight: 22,
        },
        textUser: {
          ...theme.typography.bodyMedium,
          color: theme.colors.textInverse,
          lineHeight: 22,
        },
        typing: {
          ...theme.typography.bodySmall,
          color: theme.colors.textSecondary,
          fontStyle: 'italic',
          paddingHorizontal: theme.spacing.lg,
          marginBottom: theme.spacing.sm,
        },
        quickRow: {
          flexDirection: 'row',
          paddingHorizontal: theme.spacing.lg,
          gap: theme.spacing.sm,
          marginBottom: theme.spacing.sm,
        },
        quickChip: {
          paddingHorizontal: theme.spacing.md,
          paddingVertical: theme.spacing.sm,
          borderRadius: theme.radius.full,
          borderWidth: 1,
          borderColor: theme.colors.primary,
          backgroundColor: theme.colors.surface,
        },
        quickText: {
          ...theme.typography.labelSmall,
          color: theme.colors.primary,
        },
        inputBar: {
          flexDirection: 'row',
          alignItems: 'center',
          paddingHorizontal: theme.spacing.lg,
          paddingTop: theme.spacing.sm,
          paddingBottom: insets.bottom + theme.spacing.sm,
          backgroundColor: theme.colors.surface,
          borderTopWidth: 1,
          borderTopColor: theme.colors.border,
          gap: theme.spacing.sm,
        },
        inputWrap: {
          flex: 1,
          flexDirection: 'row',
          alignItems: 'center',
          borderWidth: 1,
          borderColor: theme.colors.border,
          borderRadius: theme.radius.full,
          paddingHorizontal: theme.spacing.md,
          minHeight: 48,
          backgroundColor: theme.colors.surface,
        },
        attachBtn: {
          width: 32,
          height: 32,
          borderRadius: theme.radius.full,
          backgroundColor: '#EFF6FF',
          alignItems: 'center',
          justifyContent: 'center',
        },
        input: {
          flex: 1,
          ...theme.typography.bodyMedium,
          color: theme.colors.textPrimary,
          paddingHorizontal: theme.spacing.sm,
          paddingVertical: theme.spacing.sm,
        },
        sendBtn: {
          width: 44,
          height: 44,
          borderRadius: theme.radius.full,
          backgroundColor: theme.colors.primary,
          alignItems: 'center',
          justifyContent: 'center',
        },
      }),
    [theme, insets],
  );

  const renderMessage = ({ item }: { item: ChatMessage }) => {
    if (item.type === 'user') {
      return (
        <View style={{ alignItems: 'flex-end' }}>
          <View style={styles.bubbleUser}>
            <Text style={styles.textUser}>{item.text}</Text>
          </View>
        </View>
      );
    }
    if (item.type === 'bot') {
      return (
        <View style={styles.botRow}>
          <View style={styles.botAvatar}>
            <Text style={styles.botAvatarText}>🤖</Text>
          </View>
          <View style={styles.bubbleBot}>
            <Text style={styles.textBot}>{item.text}</Text>
          </View>
        </View>
      );
    }
    return (
      <View style={{ alignItems: 'flex-start' }}>
        <View style={styles.bubbleAgent}>
          <Text style={styles.textBot}>{item.text}</Text>
        </View>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Pressable
          style={styles.backBtn}
          accessibilityRole="button"
          onPress={() => navigation.goBack()}>
          <BackIcon color={theme.colors.textPrimary} />
        </Pressable>
        <View style={styles.avatar} />
        <View style={styles.headerInfo}>
          <Text style={styles.headerTitle}>{SUPPORT_AGENT.name}</Text>
          <View style={styles.statusRow}>
            <View style={styles.statusDot} />
            <Text style={styles.statusText}>{SUPPORT_AGENT.status}</Text>
          </View>
        </View>
      </View>

      <FlatList
        data={messages}
        renderItem={renderMessage}
        keyExtractor={item => item.id}
        contentContainerStyle={styles.messagesList}
        showsVerticalScrollIndicator={false}
      />

      {isTyping ? (
        <Text style={styles.typing}>
          {format(t.support.agentTyping, { name: SUPPORT_AGENT.agentName })}
        </Text>
      ) : null}

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.quickRow}>
        {CHAT_QUICK_ACTIONS.map(action => (
          <Pressable
            key={action}
            style={styles.quickChip}
            onPress={() => handleQuickAction(action)}>
            <Text style={styles.quickText}>{action}</Text>
          </Pressable>
        ))}
      </ScrollView>

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <View style={styles.inputBar}>
          <View style={styles.inputWrap}>
            <Pressable style={styles.attachBtn} accessibilityRole="button">
              <PaperclipIcon size={18} />
            </Pressable>
            <TextInput
              style={styles.input}
              placeholder={t.profile.typeMessage}
              placeholderTextColor={theme.colors.inputPlaceholder}
              value={inputText}
              onChangeText={setInputText}
              onSubmitEditing={handleSend}
            />
          </View>
          <Pressable
            style={styles.sendBtn}
            accessibilityRole="button"
            onPress={handleSend}>
            <SendIcon />
          </Pressable>
        </View>
      </KeyboardAvoidingView>
    </View>
  );
};
