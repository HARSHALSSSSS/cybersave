export const QUICK_ACTIONS = [
  { id: 'aadhaar', label: 'Aadhaar', color: '#2563EB', icon: 'shield' as const },
  { id: 'pan', label: 'PAN Card', color: '#10B981', icon: 'card' as const },
  { id: 'bills', label: 'Pay Bills', color: '#F59E0B', icon: 'bill' as const },
  { id: 'certificates', label: 'Certificates', color: '#8B5CF6', icon: 'badge' as const },
] as const;

export const SERVICE_CATEGORIES = [
  { id: 'certificates', label: 'Certificates', color: '#2563EB', bg: '#EFF6FF', icon: 'badge' as const },
  { id: 'insurance', label: 'Insurance', color: '#10B981', bg: '#ECFDF5', icon: 'umbrella' as const },
  { id: 'education', label: 'Education', color: '#8B5CF6', bg: '#F5F3FF', icon: 'book' as const },
  { id: 'health', label: 'Health', color: '#EC4899', bg: '#FDF2F8', icon: 'health' as const },
  { id: 'transport', label: 'Transport', color: '#F97316', bg: '#FFF7ED', icon: 'transport' as const },
] as const;

export const POPULAR_SERVICES = [
  {
    id: 'electricity',
    title: 'Electricity Bill',
    description: 'Pay central & state utility bills',
    icon: 'bolt' as const,
    iconColor: '#F59E0B',
    iconBg: '#FEF3C7',
  },
  {
    id: 'water',
    title: 'Water Bill',
    description: 'Municipal water supply payments',
    icon: 'water' as const,
    iconColor: '#3B82F6',
    iconBg: '#DBEAFE',
  },
  {
    id: 'property',
    title: 'Property Tax',
    description: 'Pay local municipal property tax',
    icon: 'home' as const,
    iconColor: '#8B5CF6',
    iconBg: '#EDE9FE',
  },
] as const;

export const RECENT_APPLICATION = {
  id: 'CS9824719',
  title: 'Income Certificate',
  appliedOn: '12 May',
  status: 'In Progress' as const,
};

export const PM_KISAN_SCHEME = {
  tag: 'NEW SCHEME',
  title: 'PM-Kisan Samman Nidhi',
  description:
    'Eligible farmers get ₹6,000 yearly directly into bank accounts. Apply easily today.',
  cta: 'Check Eligibility',
};

export const NOTIFICATION_FILTERS = [
  'All',
  'Alerts',
  'Updates',
  'Payments',
] as const;

export type NotificationFilter = (typeof NOTIFICATION_FILTERS)[number];

export const NOTIFICATIONS = [
  {
    id: '1',
    type: 'Alerts' as const,
    title: 'Identity Verified Securely',
    body: 'Your recent KYC refresh using Aadhaar has been verified by state portal.',
    time: '2 hours ago',
    icon: 'shield' as const,
    iconColor: '#10B981',
    iconBg: '#D1FAE5',
    read: false,
  },
  {
    id: '2',
    type: 'Payments' as const,
    title: 'Electricity Bill Due',
    body: 'Your July consumer cycle invoice of ₹1,420 has been generated. Pay to avoid fine.',
    time: '1 day ago',
    icon: 'bill' as const,
    iconColor: '#2563EB',
    iconBg: '#DBEAFE',
    read: false,
  },
  {
    id: '3',
    type: 'Updates' as const,
    title: 'System Update Scheduled',
    body: 'National Vault systems will go down for major security maintenance on Sunday 02:00 AM.',
    time: '2 days ago',
    icon: 'gear' as const,
    iconColor: '#F59E0B',
    iconBg: '#FEF3C7',
    read: true,
  },
  {
    id: '4',
    type: 'Alerts' as const,
    title: 'PAN Update Successful',
    body: 'Your PAN card address has been updated in the National Identity Vault.',
    time: '3 days ago',
    icon: 'shield' as const,
    iconColor: '#10B981',
    iconBg: '#D1FAE5',
    read: true,
  },
] as const;

export const SCHEME_FILTERS = [
  'All',
  'Agriculture',
  'Education',
  'Health',
  'Housing',
] as const;

export type SchemeFilter = (typeof SCHEME_FILTERS)[number];

export const GOVERNMENT_SCHEMES = [
  {
    id: '1',
    title: 'PM SVANidhi Scheme',
    ministry: 'Ministry of Housing & Urban Affairs',
    description:
      'Special Micro-Credit Facility scheme for providing affordable Working Capital loan to street vendors.',
    eligibility: 'Self-Employed',
    eligibilityColor: '#EA580C',
    eligibilityBg: '#FFEDD5',
    category: 'Housing' as const,
  },
  {
    id: '2',
    title: 'Ayushman Bharat PM-JAY',
    ministry: 'Ministry of Health & Family Welfare',
    description:
      'Provides health cover up to ₹5 Lakh per family per year for secondary and tertiary care hospitalization.',
    eligibility: 'Below Poverty Line',
    eligibilityColor: '#DC2626',
    eligibilityBg: '#FEE2E2',
    category: 'Health' as const,
  },
  {
    id: '3',
    title: 'Pradhan Mantri Awas Yojana',
    ministry: 'Ministry of Rural Development',
    description:
      'Providing a pucca house with basic amenities to all homeless householders in rural and urban areas.',
    eligibility: 'All Indian Citizens',
    eligibilityColor: '#2563EB',
    eligibilityBg: '#DBEAFE',
    category: 'Housing' as const,
  },
  {
    id: '4',
    title: 'PM-Kisan Samman Nidhi',
    ministry: 'Ministry of Agriculture & Farmers Welfare',
    description:
      'Income support of ₹6,000 per year to all landholding farmer families across the country.',
    eligibility: 'Farmers',
    eligibilityColor: '#059669',
    eligibilityBg: '#D1FAE5',
    category: 'Agriculture' as const,
  },
  {
    id: '5',
    title: 'National Scholarship Portal',
    ministry: 'Ministry of Education',
    description:
      'One-stop platform for students to apply for various government scholarship schemes.',
    eligibility: 'Students',
    eligibilityColor: '#7C3AED',
    eligibilityBg: '#EDE9FE',
    category: 'Education' as const,
  },
] as const;

export const MOCK_USER = {
  name: 'Rajesh',
  location: 'New Delhi, India',
  greeting: 'Good Morning',
};
