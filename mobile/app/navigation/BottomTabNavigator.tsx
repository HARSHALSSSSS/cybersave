import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { MainTabParamList } from '@/types/navigation';
import { useTheme } from '@app/providers/ThemeProvider';
import { HomeStack } from './HomeStack';
import { WalletStack } from './WalletStack';
import { ProfileStack } from './ProfileStack';
import { ServicesStack } from './ServicesStack';
import { ApplicationsStack } from './ApplicationsStack';
import { CustomTabBar } from './CustomTabBar';

const Tab = createBottomTabNavigator<MainTabParamList>();

export const BottomTabNavigator: React.FC = () => {
  const { theme } = useTheme();

  return (
    <Tab.Navigator
      tabBar={props => <CustomTabBar {...props} />}
      screenOptions={{
        headerShown: false,
        // Mount each tab only when first opened, and stop re-rendering it once
        // it is hidden behind another tab.
        lazy: true,
        freezeOnBlur: true,
        sceneStyle: { backgroundColor: theme.colors.background },
      }}>
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
};
