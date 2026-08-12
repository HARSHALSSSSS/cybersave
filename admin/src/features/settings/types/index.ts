export interface AdminProfile {
  fullName: string;
  email: string;
  phone: string;
  role: string;
  initials: string;
}

export interface NotificationPreferences {
  email: boolean;
  push: boolean;
  documentUploadAlerts: boolean;
  expiryReminders: boolean;
  systemUpdates: boolean;
}

export interface LocalizationSettings {
  language: string;
  timezone: string;
  colorTheme: string;
}
