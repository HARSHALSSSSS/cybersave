export const SETTINGS_SECTIONS = [
  {
    id: 'account',
    title: 'ACCOUNT',
    items: [
      {
        id: 'language',
        label: 'Language',
        icon: 'globe' as const,
        type: 'link' as const,
        value: 'English',
      },
      {
        id: 'notifications',
        label: 'Notifications',
        icon: 'bell' as const,
        type: 'link' as const,
        value: 'All Active',
      },
      {
        id: 'biometric',
        label: 'Biometric Login',
        icon: 'fingerprint' as const,
        type: 'toggle' as const,
        defaultOn: true,
      },
      {
        id: 'autopay',
        label: 'Auto-pay',
        icon: 'refresh' as const,
        type: 'toggle' as const,
        defaultOn: false,
      },
    ],
  },
  {
    id: 'security',
    title: 'SECURITY',
    items: [
      {
        id: 'mpin',
        label: 'Change MPIN',
        icon: 'lock' as const,
        type: 'link' as const,
      },
      {
        id: '2fa',
        label: 'Two-Factor Auth',
        icon: 'shield' as const,
        type: 'toggle' as const,
        defaultOn: true,
      },
      {
        id: 'loginHistory',
        label: 'Login History',
        icon: 'clock' as const,
        type: 'link' as const,
      },
    ],
  },
  {
    id: 'data',
    title: 'DATA',
    items: [
      {
        id: 'cache',
        label: 'Clear Cache',
        icon: 'trash' as const,
        type: 'value' as const,
        value: '4.2 MB',
      },
      {
        id: 'deleteAccount',
        label: 'Delete Account',
        icon: 'warning' as const,
        type: 'danger' as const,
      },
    ],
  },
] as const;

export const ACTIVE_SESSIONS = [
  {
    id: '1',
    device: 'iPhone 15 Pro (This device)',
    location: 'Bengaluru, India',
    status: 'Active now',
    isCurrent: true,
  },
  {
    id: '2',
    device: 'Chrome / Windows PC',
    location: 'Mumbai, India',
    status: '10 May, 2:40 PM',
    isCurrent: false,
  },
] as const;

export const PRIVACY_TOGGLES = [
  {
    id: 'analytics',
    title: 'Analytics Consent',
    description: 'Allow anonymous diagnostic reports',
    defaultOn: true,
  },
  {
    id: 'sharing',
    title: 'Third-Party Sharing',
    description: 'Share verified tags with official departments',
    defaultOn: false,
  },
] as const;
