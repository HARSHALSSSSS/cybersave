import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { HomeStackParamList } from '@/types/navigation';
import { HomeScreen } from '@features/home/screens/HomeScreen';
import { NotificationsScreen } from '@features/notifications/screens/NotificationsScreen';
import { GovernmentSchemesScreen } from '@features/home/screens/GovernmentSchemesScreen';
import { SchemeDetailScreen } from '@features/home/screens/SchemeDetailScreen';
import {
  BillDetailsScreen,
  BillerFormScreen,
  BillPaymentHistoryScreen,
  BillPaymentsHomeScreen,
  CategoryBillersScreen,
  ConfirmPaymentScreen,
  PaymentResultScreen,
  SavedBillersScreen,
} from '@features/bill-payments/screens';

const Stack = createNativeStackNavigator<HomeStackParamList>();

const billScreenOptions = { animation: 'slide_from_right' as const, contentStyle: { flex: 1 } };

export const HomeStack: React.FC = () => (
  <Stack.Navigator
    screenOptions={{
      headerShown: false,
      contentStyle: { flex: 1 },
    }}>
    <Stack.Screen name="HomeMain" component={HomeScreen} />
    <Stack.Screen
      name="Notifications"
      component={NotificationsScreen}
      options={billScreenOptions}
    />
    <Stack.Screen
      name="GovernmentSchemes"
      component={GovernmentSchemesScreen}
      options={billScreenOptions}
    />
    <Stack.Screen
      name="SchemeDetail"
      component={SchemeDetailScreen}
      options={billScreenOptions}
    />
    <Stack.Screen
      name="BillPaymentsHome"
      component={BillPaymentsHomeScreen}
      options={billScreenOptions}
    />
    <Stack.Screen name="CategoryBillers" component={CategoryBillersScreen} options={billScreenOptions} />
    <Stack.Screen name="BillerForm" component={BillerFormScreen} options={billScreenOptions} />
    <Stack.Screen name="BillDetails" component={BillDetailsScreen} options={billScreenOptions} />
    <Stack.Screen name="ConfirmPayment" component={ConfirmPaymentScreen} options={billScreenOptions} />
    <Stack.Screen name="PaymentResult" component={PaymentResultScreen} options={billScreenOptions} />
    <Stack.Screen
      name="BillPaymentHistory"
      component={BillPaymentHistoryScreen}
      options={billScreenOptions}
    />
    <Stack.Screen name="SavedBillers" component={SavedBillersScreen} options={billScreenOptions} />
  </Stack.Navigator>
);
