import React, { useMemo, useState } from 'react';
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { ProfileStackParamList } from '@/types/navigation';
import {
  FEEDBACK_TAGS,
  RECENT_REVIEWS,
} from '@constants/index';
import { useTranslation } from '@/i18n';
import { useTheme } from '@app/providers/ThemeProvider';
import { Button } from '@components/Button';
import { GradientScreenHeader } from '@features/profile/components/GradientScreenHeader';
import { StarRating } from '@features/profile/components/StarRating';
import { CameraIcon } from '@components/icons';
import { supportApi } from '@services/api';

type Props = NativeStackScreenProps<ProfileStackParamList, 'ShareFeedback'>;

export const ShareFeedbackScreen: React.FC<Props> = ({ navigation }) => {
  const { theme } = useTheme();
  const insets = useSafeAreaInsets();
  const { t, format } = useTranslation();
  const ratingLabels = useMemo(
    () => ['', t.support.ratingPoor, t.support.ratingFair, t.support.ratingGood, t.support.ratingVeryGood, t.support.ratingExcellent],
    [t],
  );
  const [rating, setRating] = useState(4);
  const [selectedTag, setSelectedTag] = useState('App Experience');
  const [feedback, setFeedback] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (!feedback.trim()) {
      Alert.alert(t.profile.feedbackRequired, t.profile.writeFeedback);
      return;
    }
    setSubmitting(true);
    try {
      await supportApi.submitFeedback({ rating, tag: selectedTag, feedback });
      Alert.alert(t.common.thankYou, t.profile.feedbackSubmitted, [
        { text: t.common.ok, onPress: () => navigation.goBack() },
      ]);
    } catch {
      Alert.alert(t.common.error, t.profile.couldNotSubmitFeedback);
    } finally {
      setSubmitting(false);
    }
  };

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
        ratingCard: {
          borderRadius: theme.radius.lg,
          borderWidth: 1,
          borderColor: theme.colors.border,
          padding: theme.spacing['2xl'],
          alignItems: 'center',
          marginBottom: theme.spacing['2xl'],
        },
        ratingTitle: {
          ...theme.typography.labelLarge,
          color: theme.colors.textPrimary,
          marginBottom: theme.spacing.lg,
        },
        ratingSub: {
          ...theme.typography.bodySmall,
          color: theme.colors.textSecondary,
          marginTop: theme.spacing.md,
        },
        sectionLabel: {
          ...theme.typography.labelMedium,
          color: theme.colors.textPrimary,
          marginBottom: theme.spacing.md,
        },
        chipsRow: {
          flexDirection: 'row',
          flexWrap: 'wrap',
          gap: theme.spacing.sm,
          marginBottom: theme.spacing['2xl'],
        },
        chip: {
          paddingHorizontal: theme.spacing.lg,
          paddingVertical: theme.spacing.sm,
          borderRadius: theme.radius.full,
          borderWidth: 1,
          borderColor: theme.colors.border,
        },
        chipActive: {
          backgroundColor: theme.colors.primary,
          borderColor: theme.colors.primary,
        },
        chipText: {
          ...theme.typography.labelSmall,
          color: theme.colors.textSecondary,
        },
        chipTextActive: {
          color: theme.colors.textInverse,
        },
        textArea: {
          borderWidth: 1,
          borderColor: theme.colors.border,
          borderRadius: theme.radius.lg,
          padding: theme.spacing.lg,
          minHeight: 120,
          ...theme.typography.bodyMedium,
          color: theme.colors.textPrimary,
          textAlignVertical: 'top',
          marginBottom: theme.spacing.lg,
        },
        actionsRow: {
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: theme.spacing['2xl'],
          gap: theme.spacing.md,
        },
        attachBtn: {
          flexDirection: 'row',
          alignItems: 'center',
          gap: theme.spacing.sm,
        },
        attachText: {
          ...theme.typography.labelMedium,
          color: theme.colors.primary,
        },
        submitWrap: {
          flex: 1,
        },
        reviewsTitle: {
          ...theme.typography.headingSmall,
          color: theme.colors.textPrimary,
          marginBottom: theme.spacing.md,
        },
        reviewCard: {
          borderRadius: theme.radius.lg,
          borderWidth: 1,
          borderColor: theme.colors.border,
          padding: theme.spacing.lg,
          marginBottom: theme.spacing.md,
        },
        reviewHeader: {
          flexDirection: 'row',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: theme.spacing.sm,
        },
        reviewName: {
          ...theme.typography.labelMedium,
          color: theme.colors.textPrimary,
        },
        reviewStars: {
          flexDirection: 'row',
          gap: 2,
        },
        starSmall: {
          fontSize: 12,
          color: '#F59E0B',
        },
        reviewText: {
          ...theme.typography.bodySmall,
          color: theme.colors.textSecondary,
          lineHeight: 20,
        },
        scrollContent: {
          paddingBottom: insets.bottom + theme.spacing['2xl'],
        },
      }),
    [theme, insets],
  );

  return (
    <View style={styles.container}>
      <GradientScreenHeader
        title={t.profile.shareFeedback}
        showBack
        onBack={() => navigation.goBack()}
      />

      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView
          style={styles.content}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled">
          <View style={styles.ratingCard}>
            <Text style={styles.ratingTitle}>{t.support.rateExperience}</Text>
            <StarRating rating={rating} onRatingChange={setRating} size={40} />
            <Text style={styles.ratingSub}>
              {format(t.support.selectedStars, {
                count: rating,
                label: ratingLabels[rating],
              })}
            </Text>
          </View>

          <Text style={styles.sectionLabel}>{t.support.improveQuestion}</Text>
          <View style={styles.chipsRow}>
            {FEEDBACK_TAGS.map(tag => {
              const isActive = selectedTag === tag;
              return (
                <Pressable
                  key={tag}
                  style={[styles.chip, isActive && styles.chipActive]}
                  onPress={() => setSelectedTag(tag)}>
                  <Text
                    style={[styles.chipText, isActive && styles.chipTextActive]}>
                    {tag}
                  </Text>
                </Pressable>
              );
            })}
          </View>

          <Text style={styles.sectionLabel}>{t.support.writeFeedbackLabel}</Text>
          <TextInput
            style={styles.textArea}
            placeholder={t.profile.feedbackPlaceholder}
            placeholderTextColor={theme.colors.inputPlaceholder}
            multiline
            value={feedback}
            onChangeText={setFeedback}
          />

          <View style={styles.actionsRow}>
            <Pressable style={styles.attachBtn} accessibilityRole="button">
              <CameraIcon />
              <Text style={styles.attachText}>{t.support.attachImage}</Text>
            </Pressable>
            <View style={styles.submitWrap}>
              <Button
                title={t.profile.submitFeedback}
                size="md"
                loading={submitting}
                onPress={handleSubmit}
              />
            </View>
          </View>

          <Text style={styles.reviewsTitle}>{t.support.recentReviews}</Text>
          {RECENT_REVIEWS.map(review => (
            <View key={review.id} style={styles.reviewCard}>
              <View style={styles.reviewHeader}>
                <Text style={styles.reviewName}>{review.name}</Text>
                <View style={styles.reviewStars}>
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Text key={i} style={styles.starSmall}>
                      {i < review.stars ? '★' : '☆'}
                    </Text>
                  ))}
                </View>
              </View>
              <Text style={styles.reviewText}>{review.text}</Text>
            </View>
          ))}
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
};
