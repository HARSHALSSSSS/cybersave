export const PROFILE_USER = {
  initials: 'RK',
  fullName: 'Rajesh Kumar',
  phone: '+91 98765 43210',
  email: 'rajesh.kumar@email.com',
  isVerified: true,
  dateOfBirth: '15 August 1988',
  gender: 'Male',
  aadhaarMasked: 'XXXX-XXXX-9824',
  panMasked: 'XXXXXX471P',
  aadhaarLinked: true,
  panLinked: true,
  lastUpdated: '12 May 2026, 4:32 PM',
};

export const PROFILE_MENU_ITEMS = [
  { id: 'personal', label: 'Personal Information', icon: 'user' as const, screen: 'PersonalInformation' as const },
  { id: 'documents', label: 'Saved Documents', icon: 'document' as const, screen: 'SavedDocuments' as const },
  { id: 'addresses', label: 'Addresses', icon: 'location' as const, screen: 'Addresses' as const },
  { id: 'language', label: 'Language', icon: 'globe' as const, screen: 'LanguageSelection' as const },
  { id: 'settings', label: 'Settings', icon: 'settings' as const, screen: 'Settings' as const },
  { id: 'privacy', label: 'Privacy & Security', icon: 'shield' as const, screen: 'PrivacySecurity' as const },
  { id: 'help', label: 'Help & Support', icon: 'help' as const, screen: 'HelpSupport' as const },
  { id: 'about', label: 'About Cybersave', icon: 'info' as const, screen: null },
] as const;

export const DOCUMENT_FILTERS = [
  'All',
  'IDs',
  'Certificates',
  'Financial',
] as const;

export type DocumentFilter = (typeof DOCUMENT_FILTERS)[number];

export const STORAGE_USAGE = {
  used: 12.5,
  total: 100,
  unit: 'MB' as const,
};

export const SAVED_DOCUMENTS = [
  {
    id: '1',
    name: 'Aadhaar Card',
    uploaded: '10 May 2026',
    size: '1.2 MB',
    category: 'ID Proof',
    filter: 'IDs' as const,
  },
  {
    id: '2',
    name: 'PAN Card',
    uploaded: '08 May 2026',
    size: '840 KB',
    category: 'ID Proof',
    filter: 'IDs' as const,
  },
  {
    id: '3',
    name: 'Birth Certificate',
    uploaded: '05 May 2026',
    size: '2.4 MB',
    category: 'Certificate',
    filter: 'Certificates' as const,
  },
  {
    id: '4',
    name: 'IT Return FY25-26',
    uploaded: '30 Apr 2026',
    size: '4.1 MB',
    category: 'Financial',
    filter: 'Financial' as const,
  },
] as const;

export type SavedDocument = (typeof SAVED_DOCUMENTS)[number];

export const SAVED_ADDRESSES = [
  {
    id: '1',
    label: 'Home',
    address: 'Flat 402, Sector 15, HSR Layout, Bengaluru, Karnataka',
    pincode: '560102',
    isDefault: true,
  },
  {
    id: '2',
    label: 'Office',
    address: 'Level 5, Cyber Tower, Electronic City Phase 1, Bengaluru, Karnataka',
    pincode: '560100',
    isDefault: false,
  },
] as const;

export type SavedAddress = (typeof SAVED_ADDRESSES)[number];

export const GENDER_OPTIONS = ['Male', 'Female', 'Other'] as const;
