export const APP_NAME = 'Cybersave';
export const APP_TAGLINE = 'All Government Services, One App';
export const APP_SUBTAGLINE = 'Ministry of Electronics & IT Initiative';
export const APP_MOTTO = 'DIGITAL SERVICES • TRUSTED ALWAYS';

export const ONBOARDING_SLIDES = [
  {
    id: '1',
    title: 'Welcome to',
    brandHighlight: true,
    subtitle:
      'Access 500+ central and state government services securely from your phone.',
    imageKey: 'onboarding1' as const,
  },
  {
    id: '2',
    title: 'All Services in One Place',
    brandHighlight: false,
    subtitle:
      'Aadhaar, PAN, Certificates, Bills, Banking & more. Safe digital storage for daily life.',
    imageKey: 'onboarding2' as const,
  },
  {
    id: '3',
    title: 'Safe & Secure',
    brandHighlight: false,
    subtitle:
      'Bank-grade encryption protects your documents and personal identity data.',
    imageKey: 'onboarding3' as const,
  },
] as const;

export const LANGUAGES = [
  { id: 'en', native: 'English', english: 'English' },
  { id: 'hi', native: 'हिन्दी', english: 'Hindi' },
  { id: 'bn', native: 'বাংলা', english: 'Bengali' },
  { id: 'ta', native: 'தமிழ்', english: 'Tamil' },
  { id: 'te', native: 'తెలుగు', english: 'Telugu' },
  { id: 'kn', native: 'ಕನ್ನಡ', english: 'Kannada' },
  { id: 'ml', native: 'മലയാളം', english: 'Malayalam' },
  { id: 'mr', native: 'मराठी', english: 'Marathi' },
  { id: 'gu', native: 'ગુજરાતી', english: 'Gujarati' },
  { id: 'pa', native: 'ਪੰਜਾਬੀ', english: 'Punjabi' },
  { id: 'or', native: 'ଓଡ଼ିଆ', english: 'Odia' },
  { id: 'as', native: 'অসমীয়া', english: 'Assamese' },
] as const;

export const INDIAN_STATES = [
  'Maharashtra',
  'Delhi',
  'Karnataka',
  'Tamil Nadu',
  'Gujarat',
  'Rajasthan',
  'Uttar Pradesh',
  'West Bengal',
] as const;

export const DISTRICTS: Record<string, string[]> = {
  Maharashtra: ['Mumbai City', 'Pune', 'Nagpur', 'Thane'],
  Delhi: ['Central Delhi', 'South Delhi', 'North Delhi'],
  Karnataka: ['Bengaluru Urban', 'Mysuru', 'Mangaluru'],
  'Tamil Nadu': ['Chennai', 'Coimbatore', 'Madurai'],
  Gujarat: ['Ahmedabad', 'Surat', 'Vadodara'],
  Rajasthan: ['Jaipur', 'Jodhpur', 'Udaipur'],
  'Uttar Pradesh': ['Lucknow', 'Noida', 'Kanpur'],
  'West Bengal': ['Kolkata', 'Howrah', 'Darjeeling'],
};

export const OTP_LENGTH = 6;
export const OTP_RESEND_SECONDS = 30;
export const DEV_OTP_HINT = '123456';
