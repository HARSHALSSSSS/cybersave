import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  useWindowDimensions,
  View,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { BottomTabNavigationProp } from '@react-navigation/bottom-tabs';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useSelector } from 'react-redux';
import { HomeStackParamList, MainTabParamList } from '@/types/navigation';
import type { RootState } from '@app/store';
import { getGreetingKey, getQuickActions, useTranslation } from '@/i18n';
import { useTheme } from '@app/providers/ThemeProvider';
import { SearchBar } from '@components/SearchBar';
import {
  applicationsApi,
  applicationsQueryKeys,
  homeBannersApi,
  homeBannersQueryKeys,
  mapApplicationListItem,
  schemesApi,
  schemesQueryKeys,
  servicesApi,
  servicesQueryKeys,
} from '@services/api';
import {
  BadgeIcon,
  BankIcon,
  BellIcon,
  BillIcon,
  BookIcon,
  CardIcon,
  ChevronRightIcon,
  HealthIcon,
  HouseIcon,
  ShieldIcon,
  TransportIcon,
  UmbrellaIcon,
} from '@components/icons';
import { CompleteProfileModal } from '@features/profile/components/CompleteProfileModal';
import { PromotionalBannerCard } from '@features/home/components/PromotionalBannerCard';
import { getCatalogIconStyle } from '@features/services/utils/catalogHelpers';
import { queryClient } from '@app/providers/QueryProvider';
import { prefetchBillPaymentsHome } from '@features/bill-payments/utils/billPaymentsPrefetch';
import { navigateToSubServiceById, findSubServiceBySlugHints, QUICK_ACTION_SLUG_HINTS } from '@features/services/utils/navigateToService';
import {
  getProfileGreetingName,
  getProfileInitials,
  isProfileComplete,
} from '@utils/profile';
import { FEATURED_STATES, STATE_PREVIEW_COUNT } from '@constants/featuredStates';
import { useUnreadNotificationCount } from '@/hooks/useUnreadNotificationCount';
import { getScrollBottomPadding } from '@utils/layout';

type Props = NativeStackScreenProps<HomeStackParamList, 'HomeMain'>;

const QuickActionIcon = ({ icon, color }: { icon: string; color: string }) => {
  switch (icon) {
    case 'shield':
      return <ShieldIcon color={color} size={24} />;
    case 'card':
      return <CardIcon color={color} size={24} />;
    case 'bill':
      return <BillIcon color={color} size={24} />;
    case 'bank':
      return <BankIcon color={color} size={24} />;
    case 'badge':
      return <BadgeIcon color={color} size={24} />;
    default:
      return null;
  }
};

const CategoryIcon = ({ icon, color }: { icon: string; color: string }) => {
  switch (icon) {
    case 'badge':
      return <BadgeIcon color={color} size={22} />;
    case 'umbrella':
      return <UmbrellaIcon color={color} size={22} />;
    case 'book':
      return <BookIcon color={color} size={22} />;
    case 'health':
      return <HealthIcon color={color} size={22} />;
    case 'transport':
      return <TransportIcon color={color} size={22} />;
    case 'document':
      return <BadgeIcon color={color} size={22} />;
    case 'building':
      return <BankIcon color={color} size={22} />;
    case 'home':
      return <HouseIcon color={color} size={22} />;
    case 'shield':
      return <ShieldIcon color={color} size={22} />;
    case 'card':
      return <CardIcon color={color} size={22} />;
    default:
      return null;
  }
};

export const HomeScreen: React.FC<Props> = ({ navigation }) => {
  const { theme } = useTheme();
  const insets = useSafeAreaInsets();
  const { width: screenWidth } = useWindowDimensions();
  const { t } = useTranslation();
  const greetingKey = getGreetingKey();
  const greeting = t.home[greetingKey];
  const quickActions = useMemo(() => getQuickActions(t), [t]);
  const citizen = useSelector((state: RootState) => state.auth.citizen);
  const [showProfilePrompt, setShowProfilePrompt] = useState(false);

  useEffect(() => {
    if (!isProfileComplete(citizen)) {
      setShowProfilePrompt(true);
    } else {
      setShowProfilePrompt(false);
    }
  }, [citizen]);

  const goToCompleteProfile = useCallback(() => {
    setShowProfilePrompt(false);
    navigation
      .getParent<BottomTabNavigationProp<MainTabParamList>>()
      ?.navigate('ProfileTab', { screen: 'CompleteProfile' });
  }, [navigation]);

  const { data: catalogue = [] } = useQuery({
    queryKey: servicesQueryKeys.catalog(),
    queryFn: () => servicesApi.getServicesCatalog(),
    staleTime: 1000 * 60 * 10,
    placeholderData: previous => previous ?? [],
  });

  const { data: recentApps } = useQuery({
    queryKey: applicationsQueryKeys.all,
    queryFn: () => applicationsApi.listApplications({ page: 1, limit: 1 }),
    staleTime: 1000 * 60 * 2,
  });

  const { data: homeBanners = [] } = useQuery({
    queryKey: homeBannersQueryKeys.list('home'),
    queryFn: () => homeBannersApi.getHomeBanners('home'),
    staleTime: 1000 * 60 * 10,
    placeholderData: previous => previous ?? [],
  });

  const { data: schemeBanners = [] } = useQuery({
    queryKey: homeBannersQueryKeys.list('schemes'),
    queryFn: () => homeBannersApi.getHomeBanners('schemes'),
    staleTime: 1000 * 60 * 10,
    placeholderData: previous => previous ?? [],
  });

  const {
    data: homeSchemes = [],
    isError: schemesError,
    refetch: refetchSchemes,
  } = useQuery({
    queryKey: schemesQueryKeys.list(),
    queryFn: () => schemesApi.getGovernmentSchemes(),
    staleTime: 1000 * 60 * 10,
  });

  const unreadNotifications = useUnreadNotificationCount(Boolean(citizen));

  const goToStateServices = useCallback(
    (stateCode: string) => {
      navigation
        .getParent<BottomTabNavigationProp<MainTabParamList>>()
        ?.navigate('ServicesTab', {
          screen: 'StateServices',
          params: { stateCode },
        });
    },
    [navigation],
  );

  const goToAllStates = useCallback(() => {
    navigation
      .getParent<BottomTabNavigationProp<MainTabParamList>>()
      ?.navigate('ServicesTab', { screen: 'AllStates' });
  }, [navigation]);
  const profileComplete = isProfileComplete(citizen);
  const greetingName = getProfileGreetingName(citizen);
  const avatarInitials = getProfileInitials(citizen);

  const greetingLine = greetingName
    ? `${greeting}, ${greetingName}`
    : greeting;

  const headerSubtitle = profileComplete
    ? t.home.digitalServices
    : t.home.completeProfileHint;

  const popularServices = useMemo(() => {
    return catalogue
      .flatMap(main =>
        main.subServices.map(sub => ({
          id: sub.id,
          title: sub.displayName || sub.name,
          description: sub.shortDescription || sub.description || main.name,
          mainServiceId: main.id,
        })),
      )
      .slice(0, 3);
  }, [catalogue]);

  const recentApplication = useMemo(() => {
    const item = recentApps?.data?.[0];
    if (!item) return null;
    const mapped = mapApplicationListItem(item);
    return {
      applicationId: item.id,
      title: mapped.title,
      id: mapped.ref,
      appliedOn: mapped.submittedShort,
      status: mapped.status.toUpperCase(),
    };
  }, [recentApps]);

  const goToServices = useCallback(() => {
    navigation
      .getParent<BottomTabNavigationProp<MainTabParamList>>()
      ?.navigate('ServicesTab', { screen: 'ServicesMain' });
  }, [navigation]);

  const goToBillPayments = useCallback(() => {
    void prefetchBillPaymentsHome(queryClient);
    navigation.navigate('BillPaymentsHome');
  }, [navigation]);

  const goToServiceDetail = useCallback(
    (categoryId: string, optionId: string) => {
      navigateToSubServiceById(
        navigation.getParent<BottomTabNavigationProp<MainTabParamList>>(),
        catalogue,
        categoryId,
        optionId,
      );
    },
    [catalogue, navigation],
  );

  const handleQuickAction = useCallback(
    (actionId: string) => {
      if (actionId === 'bills') {
        goToBillPayments();
        return;
      }

      const hints = QUICK_ACTION_SLUG_HINTS[actionId];
      if (hints?.length && catalogue.length > 0) {
        const match = findSubServiceBySlugHints(catalogue, hints);
        if (match) {
          goToServiceDetail(match.categoryId, match.subService.id);
          return;
        }
      }
      goToServices();
    },
    [catalogue, goToBillPayments, goToServiceDetail, goToServices],
  );

  const goToApplications = useCallback(
    (applicationId?: string) => {
      const tabNav = navigation.getParent<BottomTabNavigationProp<MainTabParamList>>();
      if (applicationId) {
        tabNav?.navigate('ApplicationsTab', {
          screen: 'ApplicationDetail',
          params: { applicationId },
        });
        return;
      }
      tabNav?.navigate('ApplicationsTab', { screen: 'ApplicationsMain' });
    },
    [navigation],
  );

  const styles = useMemo(
    () => {
      const categoryCardWidth = Math.min(
        128,
        Math.max(
          100,
          (screenWidth - theme.spacing['2xl'] * 2 - theme.spacing.md * 2) / 2.5,
        ),
      );

      return StyleSheet.create({
        container: {
          flex: 1,
          backgroundColor: theme.colors.backgroundSecondary,
        },
        headerGradient: {
          paddingTop: insets.top + theme.spacing.xl,
          paddingHorizontal: theme.spacing['2xl'],
          paddingBottom: theme.spacing['6xl'],
          borderBottomLeftRadius: theme.radius['3xl'],
          borderBottomRightRadius: theme.radius['3xl'],
        },
        headerRow: {
          flexDirection: 'row',
          alignItems: 'center',
          gap: theme.spacing.md,
          marginBottom: theme.spacing.md,
        },
        profileRow: {
          flexDirection: 'row',
          alignItems: 'center',
          gap: theme.spacing.md,
          flex: 1,
          minWidth: 0,
        },
        profileText: {
          flex: 1,
          minWidth: 0,
        },
        avatar: {
          width: 52,
          height: 52,
          borderRadius: theme.radius.full,
          backgroundColor: 'rgba(255,255,255,0.22)',
          borderWidth: 2,
          borderColor: 'rgba(255,255,255,0.5)',
          alignItems: 'center',
          justifyContent: 'center',
          flexShrink: 0,
        },
        avatarText: {
          ...theme.typography.labelLarge,
          color: theme.colors.textInverse,
          fontWeight: '700',
        },
        greeting: {
          ...theme.typography.headingSmall,
          color: theme.colors.textInverse,
        },
        location: {
          ...theme.typography.bodySmall,
          color: 'rgba(255,255,255,0.85)',
          marginTop: 4,
        },
        bellButton: {
          width: 44,
          height: 44,
          borderRadius: theme.radius.full,
          backgroundColor: theme.colors.surface,
          alignItems: 'center',
          justifyContent: 'center',
          flexShrink: 0,
          ...theme.shadows.sm,
        },
        bellDot: {
          position: 'absolute',
          top: 8,
          right: 8,
          width: 8,
          height: 8,
          borderRadius: 4,
          backgroundColor: theme.colors.error,
          borderWidth: 2,
          borderColor: theme.colors.surface,
        },
        searchWrapper: {
          marginTop: -theme.spacing['3xl'],
          paddingHorizontal: theme.spacing['2xl'],
          marginBottom: theme.spacing['2xl'],
          zIndex: 4,
          elevation: 4,
        },
        scrollContent: {
          paddingHorizontal: theme.spacing['2xl'],
          paddingBottom: getScrollBottomPadding(insets, theme.spacing['3xl']),
          gap: theme.spacing['3xl'],
        },
        sectionHeader: {
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: theme.spacing.lg,
        },
        sectionTitle: {
          ...theme.typography.headingMedium,
          color: theme.colors.textPrimary,
        },
        viewAll: {
          ...theme.typography.labelMedium,
          color: theme.colors.primary,
        },
        quickActionsCard: {
          backgroundColor: theme.colors.surface,
          borderRadius: theme.radius['2xl'],
          padding: theme.spacing.lg,
          borderWidth: 1,
          borderColor: theme.colors.borderLight,
          ...theme.shadows.md,
        },
        quickActionsRow: {
          flexDirection: 'row',
          justifyContent: 'space-between',
        },
        quickAction: {
          alignItems: 'center',
          gap: theme.spacing.sm,
          flex: 1,
          paddingVertical: theme.spacing.sm,
        },
        quickActionIcon: {
          width: 56,
          height: 56,
          borderRadius: theme.radius.xl,
          alignItems: 'center',
          justifyContent: 'center',
        },
        quickActionLabel: {
          ...theme.typography.labelMedium,
          color: theme.colors.textPrimary,
          textAlign: 'center',
        },
        categoriesScroll: {
          gap: theme.spacing.md,
          paddingRight: theme.spacing['2xl'],
        },
        schemeBannerSlide: {
          width: Math.min(screenWidth - theme.spacing['2xl'] * 2 - 24, 340),
        },
        categoryCard: {
          width: categoryCardWidth,
          minHeight: 128,
          backgroundColor: theme.colors.surface,
          borderRadius: theme.radius.xl,
          paddingTop: theme.spacing.md,
          paddingBottom: theme.spacing.lg,
          paddingHorizontal: theme.spacing.sm,
          alignItems: 'center',
          gap: theme.spacing.md,
          borderWidth: 1,
          borderColor: theme.colors.borderLight,
          overflow: 'hidden',
          ...theme.shadows.sm,
        },
        categoryAccent: {
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          height: 4,
        },
        categoryIcon: {
          width: 48,
          height: 48,
          borderRadius: theme.radius.lg,
          alignItems: 'center',
          justifyContent: 'center',
          marginTop: theme.spacing.xs,
        },
        categoryLabel: {
          ...theme.typography.labelMedium,
          color: theme.colors.textPrimary,
          textAlign: 'center',
          lineHeight: 18,
        },
        servicesGroup: {
          backgroundColor: theme.colors.surface,
          borderRadius: theme.radius.xl,
          borderWidth: 1,
          borderColor: theme.colors.borderLight,
          overflow: 'hidden',
          ...theme.shadows.sm,
        },
        serviceCard: {
          flexDirection: 'row',
          alignItems: 'center',
          padding: theme.spacing.lg,
          gap: theme.spacing.md,
        },
        serviceCardBorder: {
          borderBottomWidth: 1,
          borderBottomColor: theme.colors.borderLight,
        },
        serviceIcon: {
          width: 48,
          height: 48,
          borderRadius: theme.radius.lg,
          alignItems: 'center',
          justifyContent: 'center',
          flexShrink: 0,
        },
        serviceContent: {
          flex: 1,
        },
        serviceTitle: {
          ...theme.typography.labelLarge,
          color: theme.colors.textPrimary,
        },
        serviceDesc: {
          ...theme.typography.bodySmall,
          color: theme.colors.textSecondary,
          marginTop: 2,
        },
        applicationCard: {
          backgroundColor: theme.colors.surface,
          borderRadius: theme.radius.xl,
          padding: theme.spacing.xl,
          borderWidth: 1,
          borderColor: theme.colors.border,
          ...theme.shadows.sm,
        },
        applicationTitle: {
          ...theme.typography.labelLarge,
          color: theme.colors.textPrimary,
        },
        applicationMeta: {
          ...theme.typography.bodySmall,
          color: theme.colors.textSecondary,
          marginTop: theme.spacing.xs,
        },
        statusBadge: {
          alignSelf: 'flex-start',
          marginTop: theme.spacing.sm,
          paddingHorizontal: theme.spacing.md,
          paddingVertical: theme.spacing.xxs,
          borderRadius: theme.radius.full,
          backgroundColor: '#FEF3C7',
        },
        statusText: {
          ...theme.typography.caption,
          color: '#D97706',
          letterSpacing: 0.5,
          fontSize: 11,
        },
      });
    },
    [theme, insets, screenWidth],
  );

  const handleSearchPress = useCallback(() => {
    navigation
      .getParent<BottomTabNavigationProp<MainTabParamList>>()
      ?.navigate('ServicesTab', { screen: 'ServiceSearch' });
  }, [navigation]);

  const handleBellPress = useCallback(() => {
    navigation.navigate('Notifications');
  }, [navigation]);

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={[theme.colors.gradientHeaderStart, theme.colors.gradientHeaderEnd]}
        style={styles.headerGradient}>
        <View style={styles.headerRow}>
          <Pressable
            style={styles.profileRow}
            accessibilityRole={profileComplete ? 'text' : 'button'}
            onPress={profileComplete ? undefined : goToCompleteProfile}
            disabled={profileComplete}>
            <View style={styles.avatar}>
              <Text style={styles.avatarText}>{avatarInitials}</Text>
            </View>
            <View style={styles.profileText}>
              <Text style={styles.greeting} numberOfLines={1} ellipsizeMode="tail">
                {greetingLine}
              </Text>
              <Text style={styles.location} numberOfLines={1} ellipsizeMode="tail">
                {headerSubtitle}
              </Text>
            </View>
          </Pressable>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={t.accessibility.notifications}
            onPress={handleBellPress}
            style={styles.bellButton}>
            <BellIcon color={theme.colors.textPrimary} />
            {unreadNotifications > 0 ? <View style={styles.bellDot} /> : null}
          </Pressable>
        </View>
      </LinearGradient>

      <View style={styles.searchWrapper}>
        <SearchBar
          placeholder={t.home.search}
          editable={false}
          onPress={handleSearchPress}
        />
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}>
        {/* Quick Actions */}
        <View>
          <Text style={[styles.sectionTitle, { marginBottom: theme.spacing.md }]}>
            {t.home.quickActions}
          </Text>
          <View style={styles.quickActionsCard}>
            <View style={styles.quickActionsRow}>
              {quickActions.map(action => (
                <Pressable
                  key={action.id}
                  style={styles.quickAction}
                  accessibilityRole="button"
                  onPress={() => handleQuickAction(action.id)}>
                  <View
                    style={[
                      styles.quickActionIcon,
                      { backgroundColor: `${action.color}18` },
                    ]}>
                    <QuickActionIcon icon={action.icon} color={action.color} />
                  </View>
                  <Text style={styles.quickActionLabel}>{action.label}</Text>
                </Pressable>
              ))}
            </View>
          </View>
        </View>

        {/* State services */}
        <View>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>{t.home.stateServices}</Text>
            <Pressable accessibilityRole="button" onPress={goToAllStates}>
              <Text style={styles.viewAll}>{t.home.viewAll}</Text>
            </Pressable>
          </View>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.categoriesScroll}>
            {FEATURED_STATES.slice(0, STATE_PREVIEW_COUNT).map(state => (
              <Pressable
                key={state.code}
                style={styles.categoryCard}
                accessibilityRole="button"
                onPress={() => goToStateServices(state.code)}>
                <View
                  style={[styles.categoryAccent, { backgroundColor: state.color }]}
                />
                <View
                  style={[
                    styles.categoryIcon,
                    { backgroundColor: state.bg },
                  ]}>
                  <Text style={{ ...theme.typography.labelMedium, color: state.color }}>
                    {state.code}
                  </Text>
                </View>
                <Text style={styles.categoryLabel} numberOfLines={2}>
                  {state.name}
                </Text>
              </Pressable>
            ))}
          </ScrollView>
        </View>

        {/* Service Categories */}
        <View>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>{t.home.categories}</Text>
            <Pressable accessibilityRole="button" onPress={goToServices}>
              <Text style={styles.viewAll}>{t.home.viewAll}</Text>
            </Pressable>
          </View>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.categoriesScroll}>
            {(catalogue.length > 0
              ? catalogue.slice(0, 8).map((main, index) => {
                  const style = getCatalogIconStyle(main.slug, index);
                  return {
                    id: main.id,
                    label: main.name,
                    color: style.iconColor,
                    bg: style.iconBg,
                    icon: style.icon,
                  };
                })
              : []
            ).map(category => (
              <Pressable
                key={category.id}
                style={styles.categoryCard}
                accessibilityRole="button"
                onPress={() =>
                  catalogue.length > 0
                    ? navigation
                        .getParent<BottomTabNavigationProp<MainTabParamList>>()
                        ?.navigate('ServicesTab', {
                          screen: 'ServiceHub',
                          params: { categoryId: category.id },
                        })
                    : goToServices()
                }>
                <View
                  style={[styles.categoryAccent, { backgroundColor: category.color }]}
                />
                <View
                  style={[
                    styles.categoryIcon,
                    { backgroundColor: category.bg },
                  ]}>
                  <CategoryIcon icon={category.icon} color={category.color} />
                </View>
                <Text style={styles.categoryLabel} numberOfLines={2}>
                  {category.label}
                </Text>
              </Pressable>
            ))}
          </ScrollView>
        </View>

        {/* Government schemes */}
        <View>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>{t.home.schemesTitle}</Text>
            <Pressable
              accessibilityRole="button"
              onPress={() => navigation.navigate('GovernmentSchemes')}>
              <Text style={styles.viewAll}>{t.home.viewAll}</Text>
            </Pressable>
          </View>
          {schemeBanners.length > 0 ? (
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={[styles.categoriesScroll, { marginBottom: theme.spacing.md }]}>
              {schemeBanners.map(banner => (
                <View key={banner.id} style={styles.schemeBannerSlide}>
                  <PromotionalBannerCard
                    banner={banner}
                    onPress={() =>
                      goToServiceDetail(banner.mainServiceId, banner.subServiceId)
                    }
                  />
                </View>
              ))}
            </ScrollView>
          ) : null}
          <View style={styles.servicesGroup}>
            {schemesError ? (
              <Pressable style={styles.serviceCard} onPress={() => void refetchSchemes()}>
                <Text style={styles.serviceDesc}>
                  {t.home.schemesLoadError} {t.common.retry}
                </Text>
              </Pressable>
            ) : homeSchemes.length === 0 ? (
              <Pressable
                style={styles.serviceCard}
                onPress={() => navigation.navigate('GovernmentSchemes')}>
                <Text style={styles.serviceDesc}>{t.home.noSchemes}</Text>
              </Pressable>
            ) : (
              homeSchemes.slice(0, 3).map((scheme, index) => {
                const isLast = index === Math.min(homeSchemes.length, 3) - 1;
                return (
                  <Pressable
                    key={scheme.id}
                    style={[styles.serviceCard, !isLast && styles.serviceCardBorder]}
                    accessibilityRole="button"
                    onPress={() =>
                      navigation.navigate('SchemeDetail', { schemeId: scheme.slug })
                    }>
                    <View style={styles.serviceContent}>
                      <Text style={styles.serviceTitle} numberOfLines={1}>
                        {scheme.name}
                      </Text>
                      <Text style={styles.serviceDesc} numberOfLines={2}>
                        {scheme.whoCanApply}
                      </Text>
                    </View>
                    <ChevronRightIcon color={theme.colors.textSecondary} />
                  </Pressable>
                );
              })
            )}
          </View>
        </View>

        {/* Popular Services */}
        <View>
          <Text style={[styles.sectionTitle, { marginBottom: theme.spacing.md }]}>
            {t.home.popular}
          </Text>
          <View style={styles.servicesGroup}>
            {popularServices.length > 0 ? (
              popularServices.map((service, index) => {
                const styleMeta = getCatalogIconStyle(service.id, index);
                const isLast = index === popularServices.length - 1;
                return (
                  <Pressable
                    key={service.id}
                    style={[
                      styles.serviceCard,
                      !isLast && styles.serviceCardBorder,
                    ]}
                    accessibilityRole="button"
                    onPress={() =>
                      goToServiceDetail(service.mainServiceId, service.id)
                    }>
                    <View
                      style={[
                        styles.serviceIcon,
                        { backgroundColor: styleMeta.iconBg },
                      ]}>
                      <CategoryIcon icon={styleMeta.icon} color={styleMeta.iconColor} />
                    </View>
                    <View style={styles.serviceContent}>
                      <Text style={styles.serviceTitle} numberOfLines={1}>
                        {service.title}
                      </Text>
                      <Text style={styles.serviceDesc} numberOfLines={2}>
                        {service.description}
                      </Text>
                    </View>
                    <ChevronRightIcon color={theme.colors.textSecondary} />
                  </Pressable>
                );
              })
            ) : (
              <View style={styles.serviceCard}>
                <Text style={styles.serviceDesc}>{t.home.noServices}</Text>
              </View>
            )}
          </View>
        </View>

        {/* Promotional Banners */}
        {homeBanners.map(banner => (
          <PromotionalBannerCard
            key={banner.id}
            banner={banner}
            onPress={() => goToServiceDetail(banner.mainServiceId, banner.subServiceId)}
          />
        ))}

        {/* Recent Application */}
        {recentApplication ? (
          <Pressable
            style={styles.applicationCard}
            accessibilityRole="button"
            onPress={() => goToApplications(recentApplication.applicationId)}>
            <Text style={styles.applicationTitle}>{recentApplication.title}</Text>
            <Text style={styles.applicationMeta}>
              ID: {recentApplication.id} • Applied on {recentApplication.appliedOn}
            </Text>
            <View style={styles.statusBadge}>
              <Text style={styles.statusText}>{recentApplication.status}</Text>
            </View>
          </Pressable>
        ) : null}
      </ScrollView>
      <CompleteProfileModal
        visible={showProfilePrompt}
        onComplete={goToCompleteProfile}
        onLater={() => setShowProfilePrompt(false)}
      />
    </View>
  );
};
