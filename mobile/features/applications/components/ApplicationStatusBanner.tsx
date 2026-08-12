import React, { useMemo } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import { ApplicationRecord, ApplicationStatus, getStatusBannerConfig } from '@constants/index';
import { useTranslation } from '@/i18n';
import { useTheme } from '@app/providers/ThemeProvider';
import Svg, { Circle, Path } from 'react-native-svg';

type ApplicationStatusBannerProps = {
  application: ApplicationRecord;
};

const RefreshIcon = () => (
  <Svg width={22} height={22} viewBox="0 0 24 24" fill="none">
    <Path
      d="M4 12a8 8 0 0113.66-5.66M20 12a8 8 0 01-13.66 5.66"
      stroke="#FFFFFF"
      strokeWidth={2}
      strokeLinecap="round"
    />
    <Path
      d="M16 6h4V2M8 18H4v4"
      stroke="#FFFFFF"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </Svg>
);

const RejectIcon = () => (
  <Svg width={22} height={22} viewBox="0 0 24 24" fill="none">
    <Circle cx="12" cy="12" r="10" stroke="#EF4444" strokeWidth={2} />
    <Path d="M8 8L16 16M16 8L8 16" stroke="#EF4444" strokeWidth={2} strokeLinecap="round" />
  </Svg>
);

export const ApplicationStatusBanner: React.FC<ApplicationStatusBannerProps> = ({
  application,
}) => {
  const { theme } = useTheme();
  const { t } = useTranslation();
  const config = getStatusBannerConfig(application.status);

  const bannerTitle = (status: ApplicationStatus) => {
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

  const styles = useMemo(
    () =>
      StyleSheet.create({
        banner: {
          borderRadius: theme.radius.lg,
          padding: theme.spacing.lg,
          flexDirection: 'row',
          alignItems: 'center',
          gap: theme.spacing.md,
          marginBottom: theme.spacing.lg,
        },
        iconWrap: {
          width: 44,
          height: 44,
          borderRadius: theme.radius.full,
          backgroundColor: application.status === 'rejected' ? '#FFFFFF' : 'rgba(255,255,255,0.2)',
          alignItems: 'center',
          justifyContent: 'center',
        },
        title: {
          ...theme.typography.labelLarge,
          color: theme.colors.textInverse,
        },
        subtitle: {
          ...theme.typography.bodySmall,
          color: 'rgba(255,255,255,0.9)',
          marginTop: 2,
        },
      }),
    [theme, application.status],
  );

  return (
    <LinearGradient
      colors={[...config.bg]}
      style={styles.banner}>
      <View style={styles.iconWrap}>
        {application.status === 'rejected' ? <RejectIcon /> : <RefreshIcon />}
      </View>
      <View style={{ flex: 1 }}>
        <Text style={styles.title}>{bannerTitle(application.status)}</Text>
        <Text style={styles.subtitle}>
          {application.title} • {application.ref}
        </Text>
      </View>
    </LinearGradient>
  );
};
