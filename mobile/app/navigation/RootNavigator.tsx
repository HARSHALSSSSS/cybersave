import React from 'react';

import { createNativeStackNavigator } from '@react-navigation/native-stack';

import { RootStackParamList } from '@/types/navigation';

import { SplashScreen } from '@features/auth/screens/SplashScreen';

import { OnboardingScreen } from '@features/auth/screens/OnboardingScreen';

import { LanguageScreen } from '@features/auth/screens/LanguageScreen';

import { AuthNavigator } from './AuthNavigator';

import { BottomTabNavigator } from './BottomTabNavigator';



const Stack = createNativeStackNavigator<RootStackParamList>();



export const RootNavigator: React.FC = () => (

  <Stack.Navigator

    screenOptions={{

      headerShown: false,

      animation: 'fade',

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

      options={{ animation: 'fade' }}

    />

  </Stack.Navigator>

);

