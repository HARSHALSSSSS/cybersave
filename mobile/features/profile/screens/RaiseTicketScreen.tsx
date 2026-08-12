import React, { useMemo, useState } from 'react';
import {
  Alert,
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
import Svg, { Path } from 'react-native-svg';
import { ProfileStackParamList } from '@/types/navigation';
import {
  PRIORITY_LEVELS,
  PriorityLevel,
  TICKET_CATEGORIES,
} from '@constants/index';
import { useTranslation } from '@/i18n';
import { supportApi } from '@services/api';
import { useTheme } from '@app/providers/ThemeProvider';
import { Button } from '@components/Button';
import { GradientScreenHeader } from '@features/profile/components/GradientScreenHeader';
import {
  CloudUploadIcon,
  InfoCircleIcon,
  RadioSelectedIcon,
  RadioUnselectedIcon,
} from '@components/icons';

type Props = NativeStackScreenProps<ProfileStackParamList, 'RaiseTicket'>;

const ChevronDown = ({ color }: { color: string }) => (
  <Svg width={16} height={16} viewBox="0 0 16 16" fill="none">
    <Path d="M4 6L8 10L12 6" stroke={color} strokeWidth={1.5} strokeLinecap="round" />
  </Svg>
);

export const RaiseTicketScreen: React.FC<Props> = ({ navigation }) => {
  const { theme } = useTheme();
  const insets = useSafeAreaInsets();
  const { t } = useTranslation();
  const [category, setCategory] = useState<(typeof TICKET_CATEGORIES)[number]>(
    TICKET_CATEGORIES[0],
  );
  const [showCategories, setShowCategories] = useState(false);
  const [subject, setSubject] = useState('');
  const [description, setDescription] = useState('');
  const [priority, setPriority] = useState<PriorityLevel>('Medium');

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
          paddingHorizontal: theme.spacing['2xl'],
          paddingTop: theme.spacing['2xl'],
        },
        label: {
          ...theme.typography.labelMedium,
          color: theme.colors.textPrimary,
          marginBottom: theme.spacing.sm,
        },
        field: {
          borderWidth: 1,
          borderColor: theme.colors.border,
          borderRadius: theme.radius.md,
          paddingHorizontal: theme.spacing.lg,
          paddingVertical: theme.spacing.md,
          minHeight: 52,
          marginBottom: theme.spacing.lg,
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'space-between',
        },
        fieldText: {
          ...theme.typography.bodyLarge,
          color: theme.colors.textPrimary,
        },
        input: {
          borderWidth: 1,
          borderColor: theme.colors.border,
          borderRadius: theme.radius.md,
          paddingHorizontal: theme.spacing.lg,
          paddingVertical: theme.spacing.md,
          ...theme.typography.bodyLarge,
          color: theme.colors.textPrimary,
          marginBottom: theme.spacing.lg,
          minHeight: 52,
        },
        textArea: {
          minHeight: 120,
          textAlignVertical: 'top',
        },
        dropdown: {
          borderWidth: 1,
          borderColor: theme.colors.border,
          borderRadius: theme.radius.md,
          marginTop: -theme.spacing.md,
          marginBottom: theme.spacing.lg,
          overflow: 'hidden',
        },
        dropdownItem: {
          padding: theme.spacing.lg,
          borderBottomWidth: 1,
          borderBottomColor: theme.colors.border,
        },
        priorityRow: {
          flexDirection: 'row',
          gap: theme.spacing.sm,
          marginBottom: theme.spacing.lg,
        },
        priorityBtn: {
          flex: 1,
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'center',
          gap: theme.spacing.sm,
          paddingVertical: theme.spacing.md,
          borderRadius: theme.radius.md,
          borderWidth: 1.5,
          borderColor: theme.colors.border,
        },
        priorityActive: {
          borderColor: theme.colors.primary,
          backgroundColor: 'rgba(37, 99, 235, 0.04)',
        },
        priorityText: {
          ...theme.typography.labelSmall,
          color: theme.colors.textPrimary,
        },
        uploadZone: {
          borderWidth: 1.5,
          borderStyle: 'dashed',
          borderColor: theme.colors.primary,
          borderRadius: theme.radius.lg,
          padding: theme.spacing['2xl'],
          alignItems: 'center',
          marginBottom: theme.spacing['2xl'],
        },
        uploadTitle: {
          ...theme.typography.labelMedium,
          color: theme.colors.primary,
          marginTop: theme.spacing.md,
        },
        uploadSub: {
          ...theme.typography.bodySmall,
          color: theme.colors.textSecondary,
          marginTop: theme.spacing.xs,
        },
        hint: {
          flexDirection: 'row',
          alignItems: 'center',
          gap: theme.spacing.sm,
          padding: theme.spacing.lg,
          borderRadius: theme.radius.md,
          backgroundColor: '#EFF6FF',
          marginBottom: theme.spacing.lg,
        },
        hintText: {
          flex: 1,
          ...theme.typography.bodySmall,
          color: theme.colors.primary,
        },
        footer: {
          paddingHorizontal: theme.spacing['2xl'],
          paddingBottom: insets.bottom + theme.spacing.lg,
          paddingTop: theme.spacing.md,
          backgroundColor: theme.colors.surface,
        },
        scrollContent: {
          paddingBottom: theme.spacing.xl,
        },
      }),
    [theme, insets],
  );

  const handleSubmit = async () => {
    if (!subject.trim() || !description.trim()) {
      Alert.alert(t.common.missingFields, t.profile.enterSubjectDescription);
      return;
    }
    try {
      const fullSubject = `[${category}] [${priority}] ${subject.trim()}`;
      const fullContent = [
        `Category: ${category}`,
        `Priority: ${priority}`,
        '',
        description.trim(),
      ].join('\n');
      await supportApi.createTicket(fullSubject, fullContent);
      Alert.alert(t.profile.ticketSubmitted, t.profile.ticketCreated, [
        { text: t.support.viewTickets, onPress: () => navigation.replace('MyTickets') },
        { text: t.common.ok, onPress: () => navigation.goBack() },
      ]);
    } catch {
      Alert.alert(t.common.error, t.profile.couldNotSubmitTicket);
    }
  };

  return (
    <View style={styles.container}>
      <GradientScreenHeader
        title={t.profile.raiseTicket}
        showBack
        onBack={() => navigation.goBack()}
      />

      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView
          style={styles.content}
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}>
          <Text style={styles.label}>{t.support.supportCategory}</Text>
          <Pressable
            style={styles.field}
            onPress={() => setShowCategories(!showCategories)}>
            <Text style={styles.fieldText}>{category}</Text>
            <ChevronDown color={theme.colors.textSecondary} />
          </Pressable>
          {showCategories ? (
            <View style={styles.dropdown}>
              {TICKET_CATEGORIES.map(cat => (
                <Pressable
                  key={cat}
                  style={styles.dropdownItem}
                  onPress={() => {
                    setCategory(cat);
                    setShowCategories(false);
                  }}>
                  <Text style={styles.fieldText}>{cat}</Text>
                </Pressable>
              ))}
            </View>
          ) : null}

          <Text style={styles.label}>{t.support.ticketSubjectLabel}</Text>
          <TextInput
            style={styles.input}
            placeholder={t.profile.ticketSubject}
            placeholderTextColor={theme.colors.inputPlaceholder}
            value={subject}
            onChangeText={setSubject}
          />

          <Text style={styles.label}>{t.support.detailedDescription}</Text>
          <TextInput
            style={[styles.input, styles.textArea]}
            placeholder={t.profile.ticketDescription}
            placeholderTextColor={theme.colors.inputPlaceholder}
            multiline
            value={description}
            onChangeText={setDescription}
          />

          <Text style={styles.label}>{t.support.priorityLevel}</Text>
          <View style={styles.priorityRow}>
            {PRIORITY_LEVELS.map(level => {
              const isActive = priority === level;
              return (
                <Pressable
                  key={level}
                  style={[styles.priorityBtn, isActive && styles.priorityActive]}
                  onPress={() => setPriority(level)}>
                  {isActive ? (
                    <RadioSelectedIcon color={theme.colors.primary} size={18} />
                  ) : (
                    <RadioUnselectedIcon size={18} />
                  )}
                  <Text style={styles.priorityText}>{level}</Text>
                </Pressable>
              );
            })}
          </View>

          <Text style={styles.label}>{t.support.uploadScreenshots}</Text>
          <Pressable style={styles.uploadZone} accessibilityRole="button">
            <CloudUploadIcon />
            <Text style={styles.uploadTitle}>{t.support.uploadHint}</Text>
            <Text style={styles.uploadSub}>{t.support.uploadFileTypes}</Text>
          </Pressable>

          <Pressable
            style={styles.hint}
            accessibilityRole="button"
            onPress={() => navigation.navigate('FAQSupport')}>
            <InfoCircleIcon />
            <Text style={styles.hintText}>
              {t.support.faqHint}
            </Text>
          </Pressable>
        </ScrollView>
      </KeyboardAvoidingView>

      <View style={styles.footer}>
        <Button title={t.profile.submitTicket} onPress={handleSubmit} />
      </View>
    </View>
  );
};
