import React from 'react';

import { StyleSheet, View } from 'react-native';

import { createNativeStackNavigator } from '@react-navigation/native-stack';

import { ProfileStackParamList } from '@/types/navigation';

import {

  ProfileScreen,

  CompleteProfileScreen,

  PersonalInformationScreen,

  SavedDocumentsScreen,

  AddressesScreen,

  SettingsScreen,

  PrivacySecurityScreen,

  HelpSupportScreen,

  FAQSupportScreen,

  ShareFeedbackScreen,

  SupportChatScreen,

  RaiseTicketScreen,

  LanguageSelectionScreen,

  MyTicketsScreen,

  TicketDetailScreen,

} from '@features/profile/screens';



const Stack = createNativeStackNavigator<ProfileStackParamList>();



export const ProfileStack: React.FC = () => (

  <View style={styles.root}>

    <Stack.Navigator screenOptions={{ headerShown: false, contentStyle: styles.content }}>

      <Stack.Screen name="ProfileMain" component={ProfileScreen} />

      <Stack.Screen

        name="CompleteProfile"

        component={CompleteProfileScreen}

        options={{ animation: 'slide_from_right' }}

      />

      <Stack.Screen

        name="PersonalInformation"

        component={PersonalInformationScreen}

        options={{ animation: 'slide_from_right' }}

      />

      <Stack.Screen

        name="SavedDocuments"

        component={SavedDocumentsScreen}

        options={{ animation: 'slide_from_right' }}

      />

      <Stack.Screen

        name="Addresses"

        component={AddressesScreen}

        options={{ animation: 'slide_from_right' }}

      />

      <Stack.Screen

        name="LanguageSelection"

        component={LanguageSelectionScreen}

        options={{ animation: 'slide_from_right' }}

      />

      <Stack.Screen

        name="Settings"

        component={SettingsScreen}

        options={{ animation: 'slide_from_right' }}

      />

      <Stack.Screen

        name="PrivacySecurity"

        component={PrivacySecurityScreen}

        options={{ animation: 'slide_from_right' }}

      />

      <Stack.Screen

        name="HelpSupport"

        component={HelpSupportScreen}

        options={{ animation: 'slide_from_right' }}

      />

      <Stack.Screen

        name="FAQSupport"

        component={FAQSupportScreen}

        options={{ animation: 'slide_from_right' }}

      />

      <Stack.Screen

        name="ShareFeedback"

        component={ShareFeedbackScreen}

        options={{ animation: 'slide_from_right' }}

      />

      <Stack.Screen

        name="SupportChat"

        component={SupportChatScreen}

        options={{ animation: 'slide_from_right' }}

      />

      <Stack.Screen

        name="RaiseTicket"

        component={RaiseTicketScreen}

        options={{ animation: 'slide_from_right' }}

      />

      <Stack.Screen

        name="MyTickets"

        component={MyTicketsScreen}

        options={{ animation: 'slide_from_right' }}

      />

      <Stack.Screen

        name="TicketDetail"

        component={TicketDetailScreen}

        options={{ animation: 'slide_from_right' }}

      />

    </Stack.Navigator>

  </View>

);



const styles = StyleSheet.create({

  root: { flex: 1 },

  content: { flex: 1 },

});


