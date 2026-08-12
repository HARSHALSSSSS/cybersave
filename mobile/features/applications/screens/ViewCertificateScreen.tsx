import React, { useMemo } from 'react';
import {
  ActivityIndicator,
  Linking,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useQuery } from '@tanstack/react-query';
import { ApplicationsStackParamList } from '@/types/navigation';
import { formatAppDate, useTranslation } from '@/i18n';
import { useTheme } from '@app/providers/ThemeProvider';
import { Button } from '@components/Button';
import { FileDocIcon } from '@components/icons';
import { GradientScreenHeader } from '@features/profile/components/GradientScreenHeader';
import {
  applicationsApi,
  applicationsQueryKeys,
} from '@services/api';
import { getScrollBottomPadding } from '@utils/layout';

type Props = NativeStackScreenProps<
  ApplicationsStackParamList,
  'ViewCertificate'
>;

export const ViewCertificateScreen: React.FC<Props> = ({
  navigation,
  route,
}) => {
  const { applicationId } = route.params;
  const { theme } = useTheme();
  const insets = useSafeAreaInsets();
  const { t, locale } = useTranslation();

  const { data, isLoading, isError, error } = useQuery({
    queryKey: applicationsQueryKeys.certificate(applicationId),
    queryFn: () => applicationsApi.getApplicationCertificate(applicationId),
  });

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
        card: {
          borderRadius: theme.radius.lg,
          borderWidth: 1,
          borderColor: theme.colors.border,
          padding: theme.spacing.xl,
          alignItems: 'center',
          marginBottom: getScrollBottomPadding(insets),
        },
        preview: {
          width: '100%',
          aspectRatio: 1.4,
          borderRadius: theme.radius.lg,
          borderWidth: 1.5,
          borderColor: theme.colors.primary,
          backgroundColor: '#F8FAFC',
          alignItems: 'center',
          justifyContent: 'center',
          padding: theme.spacing.xl,
          marginBottom: theme.spacing.xl,
        },
        govTitle: {
          ...theme.typography.labelLarge,
          color: theme.colors.primary,
          marginTop: theme.spacing.md,
          fontWeight: '700',
        },
        watermark: {
          ...theme.typography.bodySmall,
          color: theme.colors.textSecondary,
          marginTop: theme.spacing.xs,
          textAlign: 'center',
        },
        name: {
          ...theme.typography.headingSmall,
          color: theme.colors.textPrimary,
          marginBottom: theme.spacing.sm,
          textAlign: 'center',
        },
        certNo: {
          ...theme.typography.bodyMedium,
          color: theme.colors.textSecondary,
        },
        issued: {
          ...theme.typography.bodyMedium,
          color: theme.colors.textSecondary,
          marginTop: 4,
        },
        center: {
          flex: 1,
          alignItems: 'center',
          justifyContent: 'center',
          padding: theme.spacing['3xl'],
        },
        message: {
          ...theme.typography.bodyMedium,
          color: theme.colors.textSecondary,
          textAlign: 'center',
        },
      }),
    [theme, insets],
  );

  if (isLoading) {
    return (
      <View style={styles.container}>
        <GradientScreenHeader
          title={t.applications.viewCertificate}
          showBack
          onBack={() => navigation.goBack()}
        />
        <View style={styles.center}>
          <ActivityIndicator color={theme.colors.primary} />
        </View>
      </View>
    );
  }

  if (isError || !data) {
    return (
      <View style={styles.container}>
        <GradientScreenHeader
          title={t.applications.viewCertificate}
          showBack
          onBack={() => navigation.goBack()}
        />
        <View style={styles.center}>
          <Text style={styles.message}>
            {(error as { response?: { data?: { message?: string } } })?.response
              ?.data?.message ?? t.common.noData}
          </Text>
        </View>
      </View>
    );
  }

  const issuedOn = formatAppDate(data.issuedAt, locale).split(',')[0];

  return (
    <View style={styles.container}>
      <GradientScreenHeader
        title={t.applications.viewCertificate}
        showBack
        onBack={() => navigation.goBack()}
      />

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.card}>
          <View style={styles.preview}>
            <FileDocIcon color="#CBD5E1" size={48} />
            <Text style={styles.govTitle}>CYBERSAVE DIGITAL SERVICES</Text>
            <Text style={styles.watermark}>{data.title}</Text>
          </View>

          <Text style={styles.name}>{data.title}</Text>
          <Text style={styles.certNo}>
            {t.applications.ref}: {data.certificateNumber}
          </Text>
          <Text style={styles.issued}>
            {t.applications.appliedOn}: {issuedOn}
          </Text>

          <View
            style={{
              width: '100%',
              marginTop: theme.spacing.xl,
              gap: theme.spacing.md,
            }}>
            {data.downloadUrl ? (
              <Button
                title={t.common.download}
                onPress={() => {
                  void Linking.openURL(data.downloadUrl!);
                }}
              />
            ) : null}
            <Button
              title={t.applications.backToApplication}
              onPress={() => navigation.goBack()}
            />
          </View>
        </View>
      </ScrollView>
    </View>
  );
};
