import React, { useMemo } from 'react';
import { Linking, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useQuery } from '@tanstack/react-query';
import { SchemeStackParamList } from '@/types/navigation';
import { useTranslation } from '@/i18n';
import { useTheme } from '@app/providers/ThemeProvider';
import { BackIcon } from '@components/icons';
import { schemesApi, schemesQueryKeys } from '@services/api';
import { getScrollBottomPadding } from '@utils/layout';

type Props = NativeStackScreenProps<SchemeStackParamList, 'SchemeDetail'>;

export const SchemeDetailScreen: React.FC<Props> = ({ navigation, route }) => {
  const { schemeId } = route.params;
  const { theme } = useTheme();
  const insets = useSafeAreaInsets();
  const { t } = useTranslation();

  const { data: scheme, isLoading } = useQuery({
    queryKey: schemesQueryKeys.detail(schemeId),
    queryFn: () => schemesApi.getGovernmentScheme(schemeId),
  });

  const styles = useMemo(
    () =>
      StyleSheet.create({
        container: { flex: 1, backgroundColor: theme.colors.background },
        headerGradient: {
          paddingTop: insets.top + theme.spacing.md,
          paddingHorizontal: theme.spacing['2xl'],
          paddingBottom: theme.spacing.lg,
        },
        headerRow: {
          flexDirection: 'row',
          alignItems: 'center',
          gap: theme.spacing.md,
        },
        backButton: { padding: theme.spacing.xs },
        headerTitle: {
          ...theme.typography.headingSmall,
          color: theme.colors.textPrimary,
          flex: 1,
        },
        content: {
          paddingHorizontal: theme.spacing['2xl'],
          paddingTop: theme.spacing.lg,
          paddingBottom: getScrollBottomPadding(insets),
        },
        card: {
          backgroundColor: theme.colors.surface,
          borderRadius: theme.radius.lg,
          padding: theme.spacing.xl,
          marginBottom: theme.spacing.md,
          borderWidth: 1,
          borderColor: theme.colors.border,
        },
        sectionTitle: {
          ...theme.typography.labelLarge,
          color: theme.colors.textPrimary,
        },
        body: {
          ...theme.typography.bodySmall,
          color: theme.colors.textSecondary,
          marginTop: theme.spacing.sm,
          lineHeight: 20,
        },
        bullet: {
          ...theme.typography.bodySmall,
          color: theme.colors.textSecondary,
          marginTop: theme.spacing.xs,
          lineHeight: 20,
        },
        cta: {
          marginTop: theme.spacing.md,
          backgroundColor: theme.colors.primary,
          borderRadius: theme.radius.md,
          paddingVertical: theme.spacing.md,
          alignItems: 'center',
        },
        ctaText: {
          ...theme.typography.labelSmall,
          color: theme.colors.textInverse,
        },
      }),
    [theme, insets],
  );

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={[theme.colors.gradientHeaderStart, theme.colors.gradientHeaderEnd]}
        style={styles.headerGradient}>
        <View style={styles.headerRow}>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={t.accessibility.goBack}
            onPress={() => navigation.goBack()}
            style={styles.backButton}>
            <BackIcon color={theme.colors.textPrimary} />
          </Pressable>
          <Text style={styles.headerTitle} numberOfLines={2}>
            {scheme?.name ?? t.home.schemesTitle}
          </Text>
        </View>
      </LinearGradient>

      <ScrollView contentContainerStyle={styles.content}>
        {isLoading || !scheme ? (
          <Text style={styles.body}>{isLoading ? t.common.loading : t.home.noSchemes}</Text>
        ) : (
          <>
            {scheme.ministry ? (
              <Text style={[styles.body, { marginBottom: theme.spacing.md }]}>{scheme.ministry}</Text>
            ) : null}

            <View style={styles.card}>
              <Text style={styles.sectionTitle}>{t.home.aboutScheme ?? 'About this scheme'}</Text>
              <Text style={styles.body}>{scheme.description}</Text>
            </View>

            <View style={styles.card}>
              <Text style={styles.sectionTitle}>{t.home.whoCanApply ?? 'Who can apply'}</Text>
              <Text style={styles.body}>{scheme.whoCanApply}</Text>
              <Text style={[styles.sectionTitle, { marginTop: theme.spacing.lg }]}>
                {t.home.eligibility ?? 'Eligibility'}
              </Text>
              <Text style={styles.body}>{scheme.eligibility}</Text>
            </View>

            <View style={styles.card}>
              <Text style={styles.sectionTitle}>{t.home.documentsRequired ?? 'Documents required'}</Text>
              {scheme.documentsRequired.length === 0 ? (
                <Text style={styles.body}>{t.home.checkOfficialPortal ?? 'Check the official portal for documents.'}</Text>
              ) : (
                scheme.documentsRequired.map(doc => (
                  <Text key={doc} style={styles.bullet}>
                    • {doc}
                  </Text>
                ))
              )}
            </View>

            <Pressable
              style={styles.cta}
              onPress={() => void Linking.openURL(scheme.officialPortalUrl)}>
              <Text style={styles.ctaText}>
                {scheme.officialPortalLabel || t.home.officialPortal || 'Official Portal'}
              </Text>
            </Pressable>
          </>
        )}
      </ScrollView>
    </View>
  );
};
