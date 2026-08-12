import React, { useMemo, useState } from 'react';
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
import { ProfileStackParamList } from '@/types/navigation';
import {
  getFaqCategories,
  getFaqCategoryLabel,
  getFaqItems,
  type LocalizedFaqCategory,
  useTranslation,
} from '@/i18n';
import { useTheme } from '@app/providers/ThemeProvider';
import { SearchBar } from '@components/SearchBar';
import { GradientScreenHeader } from '@features/profile/components/GradientScreenHeader';
import { FAQAccordion } from '@features/profile/components/FAQAccordion';
import { FilterChips } from '@features/services/components';
import { InfoCircleIcon } from '@components/icons';

type FAQItem = ReturnType<typeof getFaqItems>[number];
type Props = NativeStackScreenProps<ProfileStackParamList, 'FAQSupport'>;

export const FAQSupportScreen: React.FC<Props> = ({ navigation }) => {
  const { theme } = useTheme();
  const insets = useSafeAreaInsets();
  const { t } = useTranslation();
  const faqCategories = useMemo(() => getFaqCategories(t), [t]);
  const faqItems = useMemo(() => getFaqItems(t), [t]);
  const [activeCategory, setActiveCategory] = useState<LocalizedFaqCategory>('General');
  const [expandedId, setExpandedId] = useState<string>('1');
  const [searchQuery, setSearchQuery] = useState('');

  const categoryLabels = useMemo(
    () => faqCategories.map(cat => getFaqCategoryLabel(t, cat)),
    [faqCategories, t],
  );
  const categoryLabelToKey = useMemo(
    () =>
      Object.fromEntries(
        faqCategories.map(cat => [getFaqCategoryLabel(t, cat), cat]),
      ) as Record<string, LocalizedFaqCategory>,
    [faqCategories, t],
  );
  const activeCategoryLabel = getFaqCategoryLabel(t, activeCategory);

  const filtered = useMemo(() => {
    let items = faqItems.filter(
      item => activeCategory === 'General' || item.category === activeCategory,
    );
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      items = items.filter(
        item =>
          item.question.toLowerCase().includes(q) ||
          item.answer.toLowerCase().includes(q),
      );
    }
    return items;
  }, [activeCategory, faqItems, searchQuery]);

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
        },
        searchWrap: {
          paddingHorizontal: theme.spacing['2xl'],
          marginBottom: theme.spacing.lg,
        },
        listContent: {
          paddingHorizontal: theme.spacing['2xl'],
          paddingBottom: insets.bottom + theme.spacing['2xl'],
        },
        hint: {
          flexDirection: 'row',
          alignItems: 'center',
          gap: theme.spacing.sm,
          marginHorizontal: theme.spacing['2xl'],
          marginBottom: theme.spacing.lg,
          padding: theme.spacing.md,
          borderRadius: theme.radius.md,
          backgroundColor: '#EFF6FF',
        },
        hintText: {
          flex: 1,
          ...theme.typography.bodySmall,
          color: theme.colors.primary,
        },
      }),
    [theme, insets],
  );

  const renderItem: ListRenderItem<FAQItem> = ({ item }) => (
    <FAQAccordion
      question={item.question}
      answer={item.answer}
      expanded={expandedId === item.id}
      onToggle={() =>
        setExpandedId(prev => (prev === item.id ? '' : item.id))
      }
    />
  );

  return (
    <View style={styles.container}>
      <GradientScreenHeader
        title={t.profile.faqSupport}
        showBack
        onBack={() => navigation.goBack()}
      />

      <View style={styles.content}>
        <View style={styles.searchWrap}>
          <SearchBar
            placeholder={t.profile.searchFaq}
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>

        <FilterChips
          filters={categoryLabels}
          active={activeCategoryLabel}
          onChange={label =>
            setActiveCategory(categoryLabelToKey[label] ?? 'General')
          }
        />

        <Pressable
          style={styles.hint}
          accessibilityRole="button"
          onPress={() => navigation.navigate('RaiseTicket')}>
          <InfoCircleIcon />
          <Text style={styles.hintText}>
            {t.support.faqHint}
          </Text>
        </Pressable>

        <FlatList
          data={filtered}
          renderItem={renderItem}
          keyExtractor={item => item.id}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.listContent}
        />
      </View>
    </View>
  );
};
