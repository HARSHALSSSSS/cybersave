import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import { RootStackParamList } from '@/types/navigation';
import { useTheme } from '@app/providers/ThemeProvider';
import { SplashScreen } from '@features/auth/screens/SplashScreen';
import { OnboardingScreen } from '@features/auth/screens/OnboardingScreen';
import { LanguageScreen } from '@features/auth/screens/LanguageScreen';
import { AuthNavigator } from './AuthNavigator';
import { BottomTabNavigator } from './BottomTabNavigator';

const Stack = createNativeStackNavigator<RootStackParamList>();

export const RootNavigator: React.FC = () => {
  const { theme } = useTheme();

  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
        animation: 'fade',
        // Without an explicit background the native window shows through as
        // black while a screen mounts.
        contentStyle: { backgroundColor: theme.colors.background },
      }}>
      <Stack.Screen name="Splash" component={SplashScreen} />
      <Stack.Screen
        name="Onboarding"
        component={OnboardingScreen}
        options={{ animation: 'fade' }}
      />
      <Stack.Screen
        name="Language"
        component={LanguageScreen}
        options={{ animation: 'slide_from_right' }}
      />
      <Stack.Screen
        name="Auth"
        component={AuthNavigator}
        options={{ animation: 'slide_from_right' }}
      />
      <Stack.Screen
        name="Main"
        component={BottomTabNavigator}
        // Animating this hand-off flashes an empty window while five tab
        // stacks mount, which reads as a black screen.
        options={{ animation: 'none' }}
      />
    </Stack.Navigator>
  );
};
