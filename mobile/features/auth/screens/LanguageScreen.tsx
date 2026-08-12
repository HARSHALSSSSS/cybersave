import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  FlatList,
  ListRenderItem,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useDispatch, useSelector } from 'react-redux';
import { RootStackParamList } from '@/types/navigation';
import { LANGUAGES } from '@constants/index';
import { useTheme } from '@app/providers/ThemeProvider';
import { Button } from '@components/Button';
import { setLanguage } from '@features/auth/store/authSlice';
import { setString, StorageKeys } from '@services/storage';
import { markOnboardingComplete } from '@features/auth/utils/restoreSession';
import { useTranslation } from '@/i18n';
import type { RootState } from '@app/store';
import Svg, { Circle, Path } from 'react-native-svg';

type Language = (typeof LANGUAGES)[number];
type Props = NativeStackScreenProps<RootStackParamList, 'Language'>;

const CheckIcon = ({ color }: { color: string }) => (
  <Svg width={12} height={12} viewBox="0 0 12 12" fill="none">
    <Path
      d="M2 6L5 9L10 3"
      stroke={color}
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </Svg>
);

export const LanguageScreen: React.FC<Props> = ({ navigation }) => {
  const { theme } = useTheme();
  const insets = useSafeAreaInsets();
  const dispatch = useDispatch();
  const savedLocale = useSelector((state: RootState) => state.auth.language);
  const { t } = useTranslation();
  const [selected, setSelected] = useState<string>(savedLocale || 'en');

  useEffect(() => {
    if (savedLocale) setSelected(savedLocale);
  }, [savedLocale]);

  const styles = useMemo(
    () =>
      StyleSheet.create({
        container: {
          flex: 1,
        },
        header: {
          paddingTop: insets.top + theme.spacing.lg,
          paddingBottom: theme.spacing['3xl'],
          alignItems: 'center',
        },
        headerTitle: {
          ...theme.typography.headingMedium,
          color: theme.colors.textInverse,
        },
        card: {
          flex: 1,
          backgroundColor: theme.colors.surface,
          borderTopLeftRadius: theme.radius['3xl'],
          borderTopRightRadius: theme.radius['3xl'],
          paddingTop: theme.spacing['2xl'],
          paddingHorizontal: theme.spacing['2xl'],
        },
        description: {
          ...theme.typography.bodyMedium,
          color: theme.colors.textSecondary,
          textAlign: 'center',
          marginBottom: theme.spacing['2xl'],
          lineHeight: 22,
        },
        grid: {
          gap: theme.spacing.md,
        },
        row: {
          flexDirection: 'row',
          gap: theme.spacing.md,
        },
        tile: {
          flex: 1,
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'space-between',
          borderWidth: 1.5,
          borderRadius: theme.radius.lg,
          paddingVertical: theme.spacing.lg,
          paddingHorizontal: theme.spacing.lg,
          minHeight: 72,
        },
        tileSelected: {
          borderColor: theme.colors.primary,
          backgroundColor: 'rgba(37, 99, 235, 0.04)',
        },
        tileUnselected: {
          borderColor: theme.colors.border,
          backgroundColor: theme.colors.surface,
        },
        tileText: {
          flex: 1,
        },
        native: {
          ...theme.typography.labelLarge,
          color: theme.colors.textPrimary,
        },
        english: {
          ...theme.typography.bodySmall,
          color: theme.colors.textSecondary,
          marginTop: 2,
        },
        radio: {
          width: 22,
          height: 22,
          borderRadius: theme.radius.full,
          borderWidth: 2,
          alignItems: 'center',
          justifyContent: 'center',
        },
        radioSelected: {
          borderColor: theme.colors.primary,
          backgroundColor: theme.colors.primary,
        },
        radioUnselected: {
          borderColor: theme.colors.border,
          backgroundColor: 'transparent',
        },
        footer: {
          paddingHorizontal: theme.spacing['2xl'],
          paddingBottom: insets.bottom + theme.spacing.xl,
          paddingTop: theme.spacing.lg,
        },
      }),
    [theme, insets],
  );

  const handleContinue = useCallback(() => {
    dispatch(setLanguage(selected));
    setString(StorageKeys.LANGUAGE, selected);
    markOnboardingComplete();
    navigation.replace('Auth');
  }, [dispatch, navigation, selected]);

  const renderLanguageTile = (item: Language) => {
    const isSelected = selected === item.id;
    return (
      <Pressable
        key={item.id}
        accessibilityRole="radio"
        accessibilityState={{ selected: isSelected }}
        onPress={() => setSelected(item.id)}
        style={[
          styles.tile,
          isSelected ? styles.tileSelected : styles.tileUnselected,
        ]}>
        <View style={styles.tileText}>
          <Text style={styles.native}>{item.native}</Text>
          <Text style={styles.english}>{item.english}</Text>
        </View>
        <View
          style={[
            styles.radio,
            isSelected ? styles.radioSelected : styles.radioUnselected,
          ]}>
          {isSelected ? <CheckIcon color={theme.colors.textInverse} /> : null}
        </View>
      </Pressable>
    );
  };

  const renderRow: ListRenderItem<Language[]> = useCallback(
    ({ item: pair }) => (
      <View style={styles.row}>
        {pair.map(lang => renderLanguageTile(lang))}
        {pair.length === 1 ? <View style={{ flex: 1 }} /> : null}
      </View>
    ),
    [styles, selected, theme],
  );

  const languagePairs = useMemo(() => {
    const pairs: Language[][] = [];
    for (let i = 0; i < LANGUAGES.length; i += 2) {
      pairs.push(LANGUAGES.slice(i, i + 2) as Language[]);
    }
    return pairs;
  }, []);

  return (
    <LinearGradient
      colors={[theme.colors.gradientStart, theme.colors.gradientEnd]}
      style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>{t.language.title}</Text>
      </View>

      <View style={styles.card}>
        <Text style={styles.description}>{t.language.subtitle}</Text>
        <FlatList
          data={languagePairs}
          renderItem={renderRow}
          keyExtractor={(_, index) => String(index)}
          contentContainerStyle={styles.grid}
          showsVerticalScrollIndicator={false}
        />
      </View>

      <View style={styles.footer}>
        <Button title={t.language.continue} onPress={handleContinue} />
      </View>
    </LinearGradient>
  );
};
