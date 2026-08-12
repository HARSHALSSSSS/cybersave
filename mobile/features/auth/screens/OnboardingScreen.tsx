import React, { useCallback, useMemo, useRef, useState } from 'react';
import {
  Dimensions,
  FlatList,
  Image,
  ListRenderItem,
  Pressable,
  StyleSheet,
  Text,
  View,
  ViewToken,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '@/types/navigation';
import { Images } from '@assets/index';
import { useTranslation, getOnboardingSlides } from '@/i18n';
import { useTheme } from '@app/providers/ThemeProvider';
import { palette } from '@theme/colors';
import { Button } from '@components/Button';
import { PageIndicator } from '@features/auth/components/PageIndicator';
import { BrandTitle } from '@features/auth/components/BrandLogo';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

const slideImages = {
  onboarding1: Images.onboarding1,
  onboarding2: Images.onboarding2,
  onboarding3: Images.onboarding3,
} as const;

type Slide = ReturnType<typeof getOnboardingSlides>[number];
type Props = NativeStackScreenProps<RootStackParamList, 'Onboarding'>;

export const OnboardingScreen: React.FC<Props> = ({ navigation }) => {
  const { theme } = useTheme();
  const insets = useSafeAreaInsets();
  const { t } = useTranslation();
  const onboardingSlides = useMemo(() => getOnboardingSlides(t), [t]);
  const flatListRef = useRef<FlatList<Slide>>(null);
  const [activeIndex, setActiveIndex] = useState(0);

  const styles = useMemo(
    () =>
      StyleSheet.create({
        container: {
          flex: 1,
          backgroundColor: theme.colors.background,
        },
        skip: {
          position: 'absolute',
          top: insets.top + theme.spacing.md,
          right: theme.spacing['2xl'],
          zIndex: 10,
        },
        skipText: {
          ...theme.typography.labelMedium,
          color: theme.colors.primary,
        },
        slide: {
          width: SCREEN_WIDTH,
          paddingHorizontal: theme.spacing['2xl'],
          alignItems: 'center',
        },
        header: {
          marginTop: insets.top + theme.spacing['5xl'],
          marginBottom: theme.spacing.lg,
          minHeight: 100,
        },
        title: {
          ...theme.typography.headingLarge,
          color: palette.navy800,
          textAlign: 'center',
          fontWeight: '700',
        },
        subtitle: {
          ...theme.typography.bodyMedium,
          color: theme.colors.textSecondary,
          textAlign: 'center',
          marginTop: theme.spacing.md,
          lineHeight: 22,
          paddingHorizontal: theme.spacing.md,
          maxWidth: 320,
          alignSelf: 'center',
        },
        imageContainer: {
          flex: 1,
          justifyContent: 'center',
          alignItems: 'center',
          width: '100%',
          backgroundColor: theme.colors.background,
        },
        image: {
          width: SCREEN_WIDTH * 0.82,
          height: SCREEN_WIDTH * 0.82,
          resizeMode: 'contain',
          backgroundColor: 'transparent',
        },
        footer: {
          paddingHorizontal: theme.spacing['2xl'],
          paddingBottom: insets.bottom + theme.spacing.xl,
          gap: theme.spacing['2xl'],
        },
      }),
    [theme, insets],
  );

  const onViewableItemsChanged = useRef(
    ({ viewableItems }: { viewableItems: ViewToken[] }) => {
      if (viewableItems[0]?.index != null) {
        setActiveIndex(viewableItems[0].index);
      }
    },
  ).current;

  const handleNext = useCallback(() => {
    if (activeIndex < onboardingSlides.length - 1) {
      flatListRef.current?.scrollToIndex({
        index: activeIndex + 1,
        animated: true,
      });
    } else {
      navigation.replace('Language');
    }
  }, [activeIndex, navigation, onboardingSlides.length]);

  const handleSkip = useCallback(() => {
    navigation.replace('Language');
  }, [navigation]);

  const renderItem: ListRenderItem<Slide> = useCallback(
    ({ item }) => (
      <View style={styles.slide}>
        <View style={styles.header}>
          {item.brandHighlight ? (
            <BrandTitle prefix={t.auth.onboardingTitle1} />
          ) : (
            <Text style={styles.title}>{item.title}</Text>
          )}
          <Text style={styles.subtitle}>{item.subtitle}</Text>
        </View>
        <View style={styles.imageContainer}>
          <Image
            source={slideImages[item.imageKey]}
            style={styles.image}
            accessibilityIgnoresInvertColors
          />
        </View>
      </View>
    ),
    [styles, t.auth.onboardingTitle1],
  );

  const isLastSlide = activeIndex === onboardingSlides.length - 1;

  return (
    <View style={styles.container}>
      <Pressable
        accessibilityRole="button"
        onPress={handleSkip}
        style={styles.skip}>
        <Text style={styles.skipText}>{t.common.skip}</Text>
      </Pressable>

      <FlatList
        ref={flatListRef}
        data={onboardingSlides}
        renderItem={renderItem}
        keyExtractor={item => item.id}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        bounces={false}
        onViewableItemsChanged={onViewableItemsChanged}
        viewabilityConfig={{ viewAreaCoveragePercentThreshold: 50 }}
        getItemLayout={(_, index) => ({
          length: SCREEN_WIDTH,
          offset: SCREEN_WIDTH * index,
          index,
        })}
      />

      <View style={styles.footer}>
        <PageIndicator
          count={onboardingSlides.length}
          activeIndex={activeIndex}
        />
        <Button
          title={isLastSlide ? t.common.getStarted : t.common.next}
          onPress={handleNext}
        />
      </View>
    </View>
  );
};
