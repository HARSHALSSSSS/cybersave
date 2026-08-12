import { useCallback } from 'react';
import { Alert } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { BottomTabNavigationProp } from '@react-navigation/bottom-tabs';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { MainTabParamList, ProfileStackParamList, ServicesStackParamList } from '@/types/navigation';
import { useTranslation } from '@/i18n';
import { useCitizenProfile } from './useCitizenProfile';

type ServiceReturnContext = {
  tab: 'ServicesTab';
  screen: 'ServiceDetail';
  params: import('@/types/navigation').ServicesStackParamList['ServiceDetail'];
};

export function useRequireProfile() {
  const { isProfileComplete } = useCitizenProfile();
  const navigation = useNavigation();
  const { t } = useTranslation();

  const goToCompleteProfile = useCallback(
    (returnTo?: ServiceReturnContext) => {
      const tabNav =
        navigation.getParent<BottomTabNavigationProp<MainTabParamList>>() ??
        (navigation as unknown as BottomTabNavigationProp<MainTabParamList>);

      tabNav.navigate('ProfileTab', {
        screen: 'CompleteProfile',
        params: returnTo ? { returnTo } : undefined,
      });
    },
    [navigation],
  );

  const goToUpdateProfile = useCallback(() => {
    const tabNav =
      navigation.getParent<BottomTabNavigationProp<MainTabParamList>>() ??
      (navigation as unknown as BottomTabNavigationProp<MainTabParamList>);

    tabNav.navigate('ProfileTab', {
      screen: 'PersonalInformation',
      params: { mode: 'edit' },
    });
  }, [navigation]);

  const ensureProfile = useCallback(
    (onReady: () => void, returnTo?: ServiceReturnContext) => {
      if (isProfileComplete) {
        onReady();
        return;
      }
      Alert.alert(
        t.profile.completeProfileTitle,
        t.profile.completeProfileMessage,
        [
          { text: t.common.notNow, style: 'cancel' },
          {
            text: t.profile.completeProfile,
            onPress: () => goToCompleteProfile(returnTo),
          },
        ],
      );
    },
    [goToCompleteProfile, isProfileComplete, t],
  );

  return {
    isProfileComplete,
    ensureProfile,
    goToCompleteProfile,
    goToUpdateProfile,
  };
}

/** Navigate to CompleteProfile from Profile stack itself. */
export function useProfileNavigation() {
  const navigation =
    useNavigation<NativeStackNavigationProp<ProfileStackParamList>>();

  const openCompleteProfile = useCallback(
    (returnTo?: ServiceReturnContext) => {
      navigation.navigate('CompleteProfile', returnTo ? { returnTo } : undefined);
    },
    [navigation],
  );

  const openUpdateProfile = useCallback(() => {
    navigation.navigate('PersonalInformation', { mode: 'edit' });
  }, [navigation]);

  return { openCompleteProfile, openUpdateProfile };
}
