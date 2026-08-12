import React, { useMemo } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTranslation } from '@/i18n';
import { useTheme } from '@app/providers/ThemeProvider';

type PlaceholderTabScreenProps = {
  title: string;
  subtitle?: string;
};

export const PlaceholderTabScreen: React.FC<PlaceholderTabScreenProps> = ({
  title,
  subtitle,
}) => {
  const { theme } = useTheme();
  const insets = useSafeAreaInsets();
  const { t } = useTranslation();
  const resolvedSubtitle = subtitle ?? t.common.comingSoon;

  const styles = useMemo(
    () =>
      StyleSheet.create({
        container: {
          flex: 1,
          backgroundColor: theme.colors.backgroundSecondary,
          alignItems: 'center',
          justifyContent: 'center',
          paddingHorizontal: theme.spacing['2xl'],
          paddingBottom: insets.bottom + 80,
        },
        title: {
          ...theme.typography.headingLarge,
          color: theme.colors.textPrimary,
          textAlign: 'center',
        },
        subtitle: {
          ...theme.typography.bodyMedium,
          color: theme.colors.textSecondary,
          textAlign: 'center',
          marginTop: theme.spacing.md,
        },
      }),
    [theme, insets.bottom],
  );

  return (
    <View style={styles.container}>
      <Text style={styles.title}>{title}</Text>
      <Text style={styles.subtitle}>{resolvedSubtitle}</Text>
    </View>
  );
};
