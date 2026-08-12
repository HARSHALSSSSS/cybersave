import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { ApplicationsStackParamList } from '@/types/navigation';
import {
  MyApplicationsScreen,
  ApplicationStatusScreen,
  ApplicationDetailScreen,
  ApplicationRejectedScreen,
  ViewCertificateScreen,
  SubmitCorrectionsScreen,
} from '@features/applications/screens';

const Stack = createNativeStackNavigator<ApplicationsStackParamList>();

export const ApplicationsStack: React.FC = () => (
  <Stack.Navigator screenOptions={{ headerShown: false }}>
    <Stack.Screen name="ApplicationsMain" component={MyApplicationsScreen} />
    <Stack.Screen
      name="ApplicationStatus"
      component={ApplicationStatusScreen}
      options={{ animation: 'slide_from_right' }}
    />
    <Stack.Screen
      name="ApplicationDetail"
      component={ApplicationDetailScreen}
      options={{ animation: 'slide_from_right' }}
    />
    <Stack.Screen
      name="ApplicationRejected"
      component={ApplicationRejectedScreen}
      options={{ animation: 'slide_from_right' }}
    />
    <Stack.Screen
      name="SubmitCorrections"
      component={SubmitCorrectionsScreen}
      options={{ animation: 'slide_from_right' }}
    />
    <Stack.Screen
      name="ViewCertificate"
      component={ViewCertificateScreen}
      options={{ animation: 'slide_from_right' }}
    />
  </Stack.Navigator>
);
