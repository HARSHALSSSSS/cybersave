import React, { useMemo } from 'react';
import { Modal, Pressable, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '@app/providers/ThemeProvider';
import { useTranslation } from '@/i18n';
import { Button } from '@components/Button';

type Props = {
  visible: boolean;
  onComplete: () => void;
  onLater: () => void;
};

export const CompleteProfileModal: React.FC<Props> = ({
  visible,
  onComplete,
  onLater,
}) => {
  const { theme } = useTheme();
  const insets = useSafeAreaInsets();
  const { t } = useTranslation();

  const styles = useMemo(
    () =>
      StyleSheet.create({
        backdrop: {
          flex: 1,
          backgroundColor: 'rgba(15, 23, 42, 0.5)',
          justifyContent: 'flex-end',
        },
        sheet: {
          backgroundColor: theme.colors.surface,
          borderTopLeftRadius: theme.radius['3xl'],
          borderTopRightRadius: theme.radius['3xl'],
          paddingHorizontal: theme.spacing['2xl'],
          paddingTop: theme.spacing.lg,
          paddingBottom: insets.bottom + theme.spacing['2xl'],
        },
        handle: {
          width: 36,
          height: 4,
          borderRadius: 2,
          backgroundColor: theme.colors.border,
          alignSelf: 'center',
          marginBottom: theme.spacing.xl,
        },
        title: {
          ...theme.typography.headingSmall,
          color: theme.colors.textPrimary,
          marginBottom: theme.spacing.sm,
        },
        body: {
          ...theme.typography.bodyMedium,
          color: theme.colors.textSecondary,
          lineHeight: 22,
          marginBottom: theme.spacing['2xl'],
        },
        actions: {
          gap: theme.spacing.sm,
        },
        later: {
          alignItems: 'center',
          paddingVertical: theme.spacing.md,
        },
        laterText: {
          ...theme.typography.labelMedium,
          color: theme.colors.textSecondary,
        },
      }),
    [theme, insets.bottom],
  );

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onLater}>
      <View style={styles.backdrop}>
        <View style={styles.sheet}>
          <View style={styles.handle} />
          <Text style={styles.title}>{t.profile.completeProfileTitle}</Text>
          <Text style={styles.body}>{t.profile.completeProfileMessage}</Text>
          <View style={styles.actions}>
            <Button title={t.common.continue} onPress={onComplete} />
            <Pressable
              accessibilityRole="button"
              style={styles.later}
              onPress={onLater}>
              <Text style={styles.laterText}>{t.common.notNow}</Text>
            </Pressable>
          </View>
        </View>
      </View>
    </Modal>
  );
};
