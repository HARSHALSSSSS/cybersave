import type { AdminProfile, LocalizationSettings, NotificationPreferences } from '../types';

export const DEFAULT_PROFILE: AdminProfile = {
  fullName: 'Rajesh Kumar',
  email: 'rajesh.kumar@cybersave.gov.in',
  phone: '+91 98765 12340',
  role: 'Portal Administrator',
  initials: 'RK',
};

export const ROLE_OPTIONS = ['Portal Administrator', 'Supervisor', 'Operator', 'Support Staff'];

export const DEFAULT_NOTIFICATION_PREFERENCES: NotificationPreferences = {
  email: true,
  push: false,
  documentUploadAlerts: true,
  expiryReminders: true,
  systemUpdates: false,
};

export const DEFAULT_LOCALIZATION: LocalizationSettings = {
  language: 'en',
  timezone: 'ist',
  colorTheme: 'light',
};

export const LANGUAGE_OPTIONS = [
  { value: 'en', label: 'English' },
  { value: 'hi', label: 'Hindi' },
  { value: 'te', label: 'Telugu' },
  { value: 'ta', label: 'Tamil' },
  { value: 'bn', label: 'Bengali' },
];

export const TIMEZONE_OPTIONS = [
  { value: 'ist', label: '(GMT+5:30) Chennai, Kolkata, Mumbai, New Delhi' },
  { value: 'utc', label: '(GMT+0:00) London, Dublin, Lisbon' },
  { value: 'est', label: '(GMT-5:00) New York, Toronto' },
  { value: 'sgt', label: '(GMT+8:00) Singapore, Kuala Lumpur' },
];

export const COLOR_THEME_OPTIONS = [
  { value: 'light', label: 'Light' },
  { value: 'dark', label: 'Dark' },
  { value: 'system', label: 'System Default' },
];
