import React, { useMemo } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { useTheme } from '@app/providers/ThemeProvider';
import { InfoCircleIcon } from '@components/icons';

type InfoBannerProps = {
  text: string;
  type?: 'info' | 'warning';
};

export const InfoBanner: React.FC<InfoBannerProps> = ({
  text,
  type = 'info',
}) => {
  const { theme } = useTheme();
  const isWarning = type === 'warning';

  const styles = useMemo(
    () =>
      StyleSheet.create({
        banner: {
          flexDirection: 'row',
          gap: theme.spacing.sm,
          padding: theme.spacing.lg,
          borderRadius: theme.radius.lg,
          marginBottom: theme.spacing.lg,
          backgroundColor: isWarning ? '#FFFBEB' : '#EFF6FF',
          borderWidth: 1,
          borderColor: isWarning ? '#FDE68A' : '#BFDBFE',
        },
        text: {
          flex: 1,
          ...theme.typography.bodySmall,
          color: isWarning ? '#92400E' : '#1E40AF',
          lineHeight: 20,
        },
      }),
    [theme, isWarning],
  );

  return (
    <View style={styles.banner}>
      <InfoCircleIcon color={isWarning ? '#F59E0B' : theme.colors.primary} />
      <Text style={styles.text}>{text}</Text>
    </View>
  );
};
