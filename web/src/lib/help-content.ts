export const FAQ_ITEMS = [
  {
    id: '1',
    question: 'How long does it take for a birth certificate application to process?',
    answer:
      'Standard processing takes 7–15 working days after payment and document verification. You will receive SMS and email updates at each stage.',
  },
  {
    id: '2',
    question: 'What is the fee for PAN-Aadhaar linking?',
    answer:
      'The standard government fee for PAN-Aadhaar linking is ₹1,000 if done after the deadline. Cybersave does not charge any additional platform fee for this service.',
  },
  {
    id: '3',
    question: 'How can I track my application status?',
    answer:
      'Go to Applications in the sidebar, select your submission, and view the live status tracker. You can also pay pending fees directly from the application detail page.',
  },
  {
    id: '4',
    question: 'Is my digital signature legally valid?',
    answer:
      'Yes. Cybersave uses IT Act 2000 compliant Class 3 Digital Signatures issued by licensed Certifying Authorities.',
  },
  {
    id: '5',
    question: 'Can I pay utility bills through Cybersave?',
    answer:
      'Bill payments are available through the bill payments service. Successful payments appear in your Wallet transaction history.',
  },
  {
    id: '6',
    question: 'How secure is Cybersave with my data?',
    answer:
      'All data is encrypted with AES-256 at rest and TLS 1.3 in transit. We comply with National Identity Vault security standards.',
  },
] as const;

export const HELP_TOPICS = [
  {
    id: 'getting-started',
    title: 'Getting Started',
    description: 'Registration, OTP login, and identity verification steps.',
    icon: 'rocket',
  },
  {
    id: 'account',
    title: 'Account & Profile',
    description: 'Manage personal details, phone verification, and login.',
    icon: 'user',
  },
  {
    id: 'services',
    title: 'Services & Apps',
    description: 'Guidance on submitting and tracking government applications.',
    icon: 'grid',
  },
  {
    id: 'payments',
    title: 'Payments & Wallet',
    description: 'Track fees, refunds, and bill payment history.',
    icon: 'wallet',
  },
  {
    id: 'documents',
    title: 'Documents Locker',
    description: 'Upload, store, and reuse verified digital certificates.',
    icon: 'shield',
  },
  {
    id: 'technical',
    title: 'Technical Issues',
    description: 'Resolve loading failures, OTP issues, or upload errors.',
    icon: 'wrench',
  },
] as const;
