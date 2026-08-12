import React, { useMemo } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { ApplicationRecord, ApplicationStatus, STATUS_COLORS } from '@constants/index';
import { useTranslation } from '@/i18n';
import { useTheme } from '@app/providers/ThemeProvider';
import { DocumentIcon, DownloadIcon } from '@components/icons';

type ApplicationCardProps = {
  application: ApplicationRecord;
  onPress: () => void;
  onDownload?: () => void;
};

export const ApplicationCard: React.FC<ApplicationCardProps> = ({
  application,
  onPress,
  onDownload,
}) => {
  const { theme } = useTheme();
  const { t } = useTranslation();
  const statusColor = STATUS_COLORS[application.status];

  const statusLabel = (status: ApplicationStatus) => {
    switch (status) {
      case 'in_progress':
        return t.applications.inProgress;
      case 'approved':
        return t.applications.approved;
      case 'rejected':
        return t.applications.rejected;
      case 'pending':
        return t.applications.pending;
    }
  };

  const label = statusLabel(application.status);

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
          ...theme.shadows.sm,
        },
        row: {
          flexDirection: 'row',
          alignItems: 'flex-start',
          gap: theme.spacing.md,
        },
        iconWrap: {
          width: 44,
          height: 44,
          borderRadius: theme.radius.full,
          backgroundColor: '#DBEAFE',
          alignItems: 'center',
          justifyContent: 'center',
        },
        content: {
          flex: 1,
        },
        topRow: {
          flexDirection: 'row',
          justifyContent: 'space-between',
          alignItems: 'flex-start',
          marginBottom: theme.spacing.xs,
        },
        title: {
          ...theme.typography.labelLarge,
          color: theme.colors.textPrimary,
          flex: 1,
          marginRight: theme.spacing.sm,
        },
        status: {
          ...theme.typography.labelSmall,
          fontWeight: '600',
        },
        meta: {
          ...theme.typography.bodySmall,
          color: theme.colors.textSecondary,
        },
        divider: {
          height: 1,
          backgroundColor: theme.colors.border,
          marginVertical: theme.spacing.md,
        },
        downloadRow: {
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'space-between',
        },
        downloadText: {
          ...theme.typography.labelMedium,
          color: theme.colors.primary,
        },
      }),
    [theme],
  );

  return (
    <Pressable
      style={({ pressed }) => [styles.card, pressed && { opacity: 0.95 }]}
      accessibilityRole="button"
      onPress={onPress}>
      <View style={styles.row}>
        <View style={styles.iconWrap}>
          <DocumentIcon color={theme.colors.primary} size={22} />
        </View>
        <View style={styles.content}>
          <View style={styles.topRow}>
            <Text style={styles.title}>{application.title}</Text>
            <Text style={[styles.status, { color: statusColor }]}>
              {label}
            </Text>
          </View>
          <Text style={styles.meta}>
            {t.applications.ref}: {application.ref} • {t.applications.appliedOn}{' '}
            {application.submittedShort}
          </Text>
        </View>
      </View>

      {application.status === 'approved' && onDownload ? (
        <>
          <View style={styles.divider} />
          <Pressable
            style={styles.downloadRow}
            accessibilityRole="button"
            onPress={onDownload}>
            <Text style={styles.downloadText}>{t.common.download}</Text>
            <DownloadIcon color={theme.colors.primary} size={20} />
          </Pressable>
        </>
      ) : null}
    </Pressable>
  );
};
