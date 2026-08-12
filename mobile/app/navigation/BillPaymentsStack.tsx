import React from 'react';
import { StyleSheet, View } from 'react-native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { BillPaymentsStackParamList } from '@/types/navigation';
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

/**
 * @deprecated Bill payment screens are registered directly on HomeStack to avoid
 * nested native-stack blank-screen issues on Android. Kept for reference only.
 */
const Stack = createNativeStackNavigator<BillPaymentsStackParamList>();

export const BillPaymentsStack: React.FC = () => (
  <View style={styles.root}>
    <Stack.Navigator screenOptions={{ headerShown: false, contentStyle: styles.content }}>
      <Stack.Screen name="BillPaymentsHome" component={BillPaymentsHomeScreen} />
      <Stack.Screen name="CategoryBillers" component={CategoryBillersScreen} />
      <Stack.Screen name="BillerForm" component={BillerFormScreen} />
      <Stack.Screen name="BillDetails" component={BillDetailsScreen} />
      <Stack.Screen name="ConfirmPayment" component={ConfirmPaymentScreen} />
      <Stack.Screen name="PaymentResult" component={PaymentResultScreen} />
      <Stack.Screen name="BillPaymentHistory" component={BillPaymentHistoryScreen} />
      <Stack.Screen name="SavedBillers" component={SavedBillersScreen} />
    </Stack.Navigator>
  </View>
);

const styles = StyleSheet.create({
  root: { flex: 1 },
  content: { flex: 1 },
});
