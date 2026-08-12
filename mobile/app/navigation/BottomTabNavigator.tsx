import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { MainTabParamList } from '@/types/navigation';
import { HomeStack } from './HomeStack';
import { WalletStack } from './WalletStack';
import { ProfileStack } from './ProfileStack';
import { ServicesStack } from './ServicesStack';
import { ApplicationsStack } from './ApplicationsStack';
import { CustomTabBar } from './CustomTabBar';

const Tab = createBottomTabNavigator<MainTabParamList>();

export const BottomTabNavigator: React.FC = () => (
  <Tab.Navigator
    tabBar={props => <CustomTabBar {...props} />}
    screenOptions={{ headerShown: false }}>
    <Tab.Screen
      name="HomeTab"
      component={HomeStack}
      options={{ title: 'Home' }}
    />
    <Tab.Screen
      name="ServicesTab"
      component={ServicesStack}
      options={{ title: 'Services' }}
    />
    <Tab.Screen
      name="ApplicationsTab"
      component={ApplicationsStack}
      options={{ title: 'Applications' }}
    />
    <Tab.Screen
      name="WalletTab"
      component={WalletStack}
      options={{ title: 'Wallet' }}
    />
    <Tab.Screen
      name="ProfileTab"
      component={ProfileStack}
      options={{ title: 'Profile' }}
    />
  </Tab.Navigator>
);
