import { NavigatorScreenParams } from '@react-navigation/native';

export type ThemeMode = 'light' | 'dark' | 'system';

export type RootStackParamList = {
  Splash: undefined;
  Onboarding: undefined;
  Language: undefined;
  Auth: undefined;
  Main: undefined;
};

export type AuthStackParamList = {
  Login: undefined;
  OTP: { phone: string; devCode?: string };
  Register: undefined;
};

export type BillPaymentsStackParamList = {
  BillPaymentsHome: undefined;
  CategoryBillers: { category: string; categoryName: string };
  BillerForm: {
    billerId: string;
    billerName?: string;
    accountHolder?: Record<string, string>;
  };
  BillDetails: { requestId: string };
  ConfirmPayment: { requestId: string };
  PaymentResult: { paymentId: string };
  BillPaymentHistory: undefined;
  SavedBillers: undefined;
};

export type HomeStackParamList = {
  HomeMain: undefined;
  Notifications: undefined;
  GovernmentSchemes: undefined;
} & BillPaymentsStackParamList;

export type WalletStackParamList = {
  WalletMain: undefined;
  TransactionHistory: undefined;
  TransactionDetails: { transactionId: string };
  AddMoney: undefined;
  RefundStatus: { refundId: string };
};

export type ProfileStackParamList = {
  ProfileMain: undefined;
  CompleteProfile: {
    returnTo?: {
      tab: 'ServicesTab';
      screen: 'ServiceDetail';
      params: ServicesStackParamList['ServiceDetail'];
    };
  } | undefined;
  PersonalInformation: { mode?: 'edit' } | undefined;
  SavedDocuments: undefined;
  Addresses: undefined;
  Settings: undefined;
  PrivacySecurity: undefined;
  HelpSupport: undefined;
  FAQSupport: undefined;
  ShareFeedback: undefined;
  SupportChat: undefined;
  RaiseTicket: undefined;
  MyTickets: undefined;
  TicketDetail: { ticketId: string };
  LanguageSelection: undefined;
};

export type ServicesStackParamList = {
  ServicesMain: undefined;
  ServiceSearch: { initialQuery?: string } | undefined;
  ServiceHub: { categoryId: string };
  StateSelect: { categoryId: string; optionId: string; optionName: string };
  ServiceDetail: {
    categoryId: string;
    optionId: string;
    stateCode?: string;
    stateName?: string;
  };
  ApplyService: {
    categoryId: string;
    optionId: string;
    applicationId?: string;
    stateCode?: string;
    stateName?: string;
  };
  UploadProofs: {
    categoryId: string;
    optionId: string;
    applicationId?: string;
    stateCode?: string;
    stateName?: string;
  };
  ReviewApplication: {
    categoryId: string;
    optionId: string;
    applicationId?: string;
    stateCode?: string;
    stateName?: string;
  };
  ServicePayment: {
    categoryId: string;
    optionId: string;
    applicationId?: string;
    stateCode?: string;
    stateName?: string;
  };
  ApplicationSuccess: {
    categoryId: string;
    optionId: string;
    ref: string;
    applicationId: string;
  };
};

export type ApplicationsStackParamList = {
  ApplicationsMain: undefined;
  ApplicationStatus: { applicationId: string };
  ApplicationDetail: { applicationId: string };
  SubmitCorrections: { applicationId: string };
  ApplicationRejected: { applicationId: string };
  ViewCertificate: { applicationId: string };
};

export type MainTabParamList = {
  HomeTab: NavigatorScreenParams<HomeStackParamList>;
  ServicesTab: NavigatorScreenParams<ServicesStackParamList>;
  ApplicationsTab: NavigatorScreenParams<ApplicationsStackParamList>;
  WalletTab: NavigatorScreenParams<WalletStackParamList>;
  ProfileTab: NavigatorScreenParams<ProfileStackParamList>;
};

export type OnboardingStackParamList = {
  OnboardingMain: undefined;
};
