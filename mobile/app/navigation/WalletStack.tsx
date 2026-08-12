import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { WalletStackParamList } from '@/types/navigation';
import {
  WalletScreen,
  TransactionHistoryScreen,
  TransactionDetailsScreen,
  AddMoneyScreen,
  RefundStatusScreen,
} from '@features/wallet/screens';

const Stack = createNativeStackNavigator<WalletStackParamList>();

export const WalletStack: React.FC = () => (
  <Stack.Navigator screenOptions={{ headerShown: false }}>
    <Stack.Screen name="WalletMain" component={WalletScreen} />
    <Stack.Screen
      name="TransactionHistory"
      component={TransactionHistoryScreen}
      options={{ animation: 'slide_from_right' }}
    />
    <Stack.Screen
      name="TransactionDetails"
      component={TransactionDetailsScreen}
      options={{ animation: 'slide_from_right' }}
    />
    <Stack.Screen
      name="AddMoney"
      component={AddMoneyScreen}
      options={{ animation: 'slide_from_right' }}
    />
    <Stack.Screen
      name="RefundStatus"
      component={RefundStatusScreen}
      options={{ animation: 'slide_from_right' }}
    />
  </Stack.Navigator>
);
