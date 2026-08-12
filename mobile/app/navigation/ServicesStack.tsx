import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { ServicesStackParamList } from '@/types/navigation';
import {
  AllServicesScreen,
  ServiceSearchScreen,
  ServiceHubScreen,
  StateSelectScreen,
  ServiceDetailScreen,
  ApplyServiceScreen,
  UploadProofsScreen,
  ReviewApplicationScreen,
  ServicePaymentScreen,
  ApplicationSuccessScreen,
} from '@features/services/screens';

const Stack = createNativeStackNavigator<ServicesStackParamList>();

export const ServicesStack: React.FC = () => (
  <Stack.Navigator screenOptions={{ headerShown: false }}>
    <Stack.Screen name="ServicesMain" component={AllServicesScreen} />
    <Stack.Screen
      name="ServiceSearch"
      component={ServiceSearchScreen}
      options={{ animation: 'slide_from_right' }}
    />
    <Stack.Screen name="ServiceHub" component={ServiceHubScreen} options={{ animation: 'slide_from_right' }} />
    <Stack.Screen name="StateSelect" component={StateSelectScreen} options={{ animation: 'slide_from_right' }} />
    <Stack.Screen name="ServiceDetail" component={ServiceDetailScreen} options={{ animation: 'slide_from_right' }} />
    <Stack.Screen
      name="ApplyService"
      component={ApplyServiceScreen}
      options={{ animation: 'slide_from_right' }}
    />
    <Stack.Screen
      name="UploadProofs"
      component={UploadProofsScreen}
      options={{ animation: 'slide_from_right' }}
    />
    <Stack.Screen
      name="ReviewApplication"
      component={ReviewApplicationScreen}
      options={{ animation: 'slide_from_right' }}
    />
    <Stack.Screen
      name="ServicePayment"
      component={ServicePaymentScreen}
      options={{ animation: 'slide_from_right' }}
    />
    <Stack.Screen
      name="ApplicationSuccess"
      component={ApplicationSuccessScreen}
      options={{ animation: 'fade' }}
    />
  </Stack.Navigator>
);
