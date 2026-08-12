import React, { useMemo } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useTheme } from '@app/providers/ThemeProvider';

type FAQAccordionProps = {
  question: string;
  answer: string;
  expanded: boolean;
  onToggle: () => void;
};

export const FAQAccordion: React.FC<FAQAccordionProps> = ({
  question,
  answer,
  expanded,
  onToggle,
}) => {
  const { theme } = useTheme();

  const styles = useMemo(
    () =>
      StyleSheet.create({
        card: {
          borderRadius: theme.radius.lg,
          borderWidth: 1,
          borderColor: theme.colors.border,
          backgroundColor: theme.colors.surface,
          padding: theme.spacing.lg,
          marginBottom: theme.spacing.md,
        },
        question: {
          ...theme.typography.labelLarge,
          color: theme.colors.textPrimary,
        },
        answer: {
          ...theme.typography.bodyMedium,
          color: theme.colors.textSecondary,
          marginTop: theme.spacing.md,
          lineHeight: 22,
        },
      }),
    [theme],
  );

  return (
    <Pressable
      style={({ pressed }) => [styles.card, pressed && { opacity: 0.95 }]}
      accessibilityRole="button"
      accessibilityState={{ expanded }}
      onPress={onToggle}>
      <Text style={styles.question}>{question}</Text>
      {expanded ? <Text style={styles.answer}>{answer}</Text> : null}
    </Pressable>
  );
};
