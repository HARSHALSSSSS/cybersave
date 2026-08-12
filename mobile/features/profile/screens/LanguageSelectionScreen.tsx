import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  FlatList,
  ListRenderItem,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useDispatch, useSelector } from 'react-redux';
import { ProfileStackParamList } from '@/types/navigation';
import { LANGUAGES } from '@constants/index';
import { useTheme } from '@app/providers/ThemeProvider';
import { Button } from '@components/Button';
import { ScrollScreenAction } from '@components/layout';
import { GradientScreenHeader } from '@features/profile/components/GradientScreenHeader';
import { setLanguage } from '@features/auth/store/authSlice';
import { setString, StorageKeys } from '@services/storage';
import { useTranslation } from '@/i18n';
import { getScrollBottomPadding } from '@utils/layout';
import type { RootState } from '@app/store';
import Svg, { Path } from 'react-native-svg';

type Language = (typeof LANGUAGES)[number];
type Props = NativeStackScreenProps<ProfileStackParamList, 'LanguageSelection'>;

const CheckIcon = ({ color }: { color: string }) => (
  <Svg width={12} height={12} viewBox="0 0 12 12" fill="none">
    <Path d="M2 6L5 9L10 3" stroke={color} strokeWidth={2} strokeLinecap="round" />
  </Svg>
);

export const LanguageSelectionScreen: React.FC<Props> = ({ navigation }) => {
  const { theme } = useTheme();
  const insets = useSafeAreaInsets();
  const dispatch = useDispatch();
  const savedLocale = useSelector((state: RootState) => state.auth.language);
  const { t } = useTranslation();
  const [selected, setSelected] = useState(savedLocale || 'en');

  useEffect(() => {
    if (savedLocale) setSelected(savedLocale);
  }, [savedLocale]);

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
          paddingTop: theme.spacing['2xl'],
          paddingHorizontal: theme.spacing['2xl'],
        },
        description: {
          ...theme.typography.bodyMedium,
          color: theme.colors.textSecondary,
          marginBottom: theme.spacing['2xl'],
          lineHeight: 22,
        },
        tile: {
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'space-between',
          borderWidth: 1.5,
          borderRadius: theme.radius.lg,
          paddingVertical: theme.spacing.lg,
          paddingHorizontal: theme.spacing.lg,
          marginBottom: theme.spacing.md,
        },
        tileSelected: {
          borderColor: theme.colors.primary,
          backgroundColor: 'rgba(37, 99, 235, 0.04)',
        },
        tileUnselected: {
          borderColor: theme.colors.border,
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
        },
        listContent: {
          paddingBottom: getScrollBottomPadding(insets, theme.spacing.lg),
        },
      }),
    [theme, insets],
  );

  const handleSelect = useCallback(
    (id: string) => {
      setSelected(id);
      dispatch(setLanguage(id));
      setString(StorageKeys.LANGUAGE, id);
    },
    [dispatch],
  );

  const handleSave = useCallback(() => {
    navigation.goBack();
  }, [navigation]);

  const renderItem: ListRenderItem<Language> = useCallback(
    ({ item }) => {
      const isSelected = selected === item.id;
      return (
        <Pressable
          accessibilityRole="radio"
          accessibilityState={{ selected: isSelected }}
          onPress={() => handleSelect(item.id)}
          style={[
            styles.tile,
            isSelected ? styles.tileSelected : styles.tileUnselected,
          ]}>
          <View>
            <Text style={styles.native}>{item.native}</Text>
            <Text style={styles.english}>{item.english}</Text>
          </View>
          <View
            style={[
              styles.radio,
              isSelected ? styles.radioSelected : styles.radioUnselected,
            ]}>
            {isSelected ? (
              <CheckIcon color={theme.colors.textInverse} />
            ) : null}
          </View>
        </Pressable>
      );
    },
    [selected, styles, theme, handleSelect],
  );

  return (
    <View style={styles.container}>
      <GradientScreenHeader
        title={t.language.title}
        showBack
        onBack={() => navigation.goBack()}
      />

      <FlatList
        style={styles.content}
        data={[...LANGUAGES]}
        renderItem={renderItem}
        keyExtractor={item => item.id}
        ListHeaderComponent={
          <Text style={styles.description}>{t.language.subtitle}</Text>
        }
        ListFooterComponent={
          <ScrollScreenAction>
            <Button title={t.common.save} onPress={handleSave} />
          </ScrollScreenAction>
        }
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
      />
    </View>
  );
};
