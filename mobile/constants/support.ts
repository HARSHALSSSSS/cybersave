export const FAQ_CATEGORIES = [
  'General',
  'Payments',
  'Services',
  'Account',
] as const;

export type FAQCategory = (typeof FAQ_CATEGORIES)[number];

export const FAQ_ITEMS = [
  {
    id: '1',
    category: 'Services' as const,
    question: 'How do I update my Aadhaar address?',
    answer:
      'You can update your address online via the Cybersave Address Service by uploading a valid address proof. Standard processing takes 3-5 business days.',
  },
  {
    id: '2',
    category: 'Payments' as const,
    question: 'What is the fee for PAN-Aadhaar linking?',
    answer:
      'The standard government fee for PAN-Aadhaar linking is ₹1,000 if done after the deadline. Cybersave does not charge any additional platform fee for this service.',
  },
  {
    id: '3',
    category: 'Services' as const,
    question: 'How long does ITR filing verification take?',
    answer:
      'ITR verification typically completes within 24-48 hours after e-verification. You will receive an SMS and email confirmation once processed.',
  },
  {
    id: '4',
    category: 'General' as const,
    question: 'Is my digital signature legally valid?',
    answer:
      'Yes. Cybersave uses IT Act 2000 compliant Class 3 Digital Signatures issued by licensed Certifying Authorities.',
  },
  {
    id: '5',
    category: 'Payments' as const,
    question: 'Can I pay utility bills directly using my wallet?',
    answer:
      'Yes. Navigate to Wallet > Pay Bills or use Quick Actions on the Home screen to pay electricity, water, and other utility bills instantly.',
  },
  {
    id: '6',
    category: 'Services' as const,
    question: 'What documents are required for GST registration?',
    answer:
      'You need PAN, Aadhaar, business address proof, bank account details, and photographs of promoters/directors for GST registration.',
  },
  {
    id: '7',
    category: 'Services' as const,
    question: 'How can I track my passport application?',
    answer:
      'Go to Services > Passport and enter your file number. Real-time status updates are synced from the Passport Seva portal.',
  },
  {
    id: '8',
    category: 'Payments' as const,
    question: 'What is the maximum limit for wallet top-up?',
    answer:
      'Full KYC verified users can top up up to ₹1,00,000 per month. Minimum KYC users have a limit of ₹10,000.',
  },
  {
    id: '9',
    category: 'Account' as const,
    question: 'How secure is Cybersave with my data?',
    answer:
      'All data is encrypted with AES-256 at rest and TLS 1.3 in transit. We comply with National Identity Vault security standards.',
  },
  {
    id: '10',
    category: 'Services' as const,
    question: 'Can I book Tatkal tickets through travel services?',
    answer:
      'Yes. IRCTC Tatkal booking is available under Services > Travel. Link your IRCTC account for seamless booking.',
  },
  {
    id: '11',
    category: 'Services' as const,
    question: 'How do I download my TDS Certificate?',
    answer:
      'Navigate to Saved Documents or Services > Tax > Form 16/16A. Your employer-uploaded TDS certificates appear automatically.',
  },
] as const;

export const HELP_TOPICS = [
  'How to download digital driving license?',
  'Aadhaar fingerprint authentication failed',
  'Linking old PAN with active e-filing portal',
  'Direct Benefits Transfer (DBT) issue report',
] as const;

export const FEEDBACK_TAGS = [
  'App Experience',
  'Service Quality',
  'Support',
] as const;

export const RECENT_REVIEWS = [
  {
    id: '1',
    name: 'Rakesh K.',
    stars: 5,
    text: 'Extremely smooth ITR filing experience! Verified within seconds.',
  },
  {
    id: '2',
    name: 'Ananya S.',
    stars: 4,
    text: 'Very intuitive UI, but I got a minor delay in Aadhaar update status. Overall nice.',
  },
] as const;

export const TICKET_CATEGORIES = [
  'Technical Support',
  'Payment Issue',
  'Service Request',
  'Account & Security',
] as const;

export const PRIORITY_LEVELS = ['Low', 'Medium', 'High'] as const;

export type PriorityLevel = (typeof PRIORITY_LEVELS)[number];

export const CHAT_QUICK_ACTIONS = [
  'Check Status',
  'ITR Help',
  'Talk to Agent',
] as const;

export const CHAT_MESSAGES = [
  {
    id: '1',
    type: 'bot' as const,
    text: 'Hello! Welcome to Cybersave digital trust support. I can assist you with ITR, DSC, or travel filings.',
  },
  {
    id: '2',
    type: 'user' as const,
    text: 'Hey, I am having issues while uploading PDF for PAN Update.',
  },
  {
    id: '3',
    type: 'agent' as const,
    text: 'Got it. Please ensure the PDF is under 5MB and is password-free. Let me check your session status.',
    agentName: 'Rahul',
  },
] as const;

export const SUPPORT_AGENT = {
  name: 'Support Chat',
  status: 'Agent Online',
  agentName: 'Rahul',
};
