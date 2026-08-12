import type { TranslationTree } from './locales/en';

export function getQuickActions(t: TranslationTree) {
  return [
    { id: 'aadhaar', label: t.home.quickAadhaar, color: '#2563EB', icon: 'shield' as const },
    { id: 'pan', label: t.home.quickPan, color: '#10B981', icon: 'card' as const },
    { id: 'bills', label: t.home.quickBills, color: '#F59E0B', icon: 'bill' as const },
    { id: 'certificates', label: t.home.quickCertificates, color: '#8B5CF6', icon: 'badge' as const },
  ];
}

export function getSchemeFilters(t: TranslationTree) {
  return [
    t.home.filterAll,
    t.home.filterAgriculture,
    t.home.filterEducation,
    t.home.filterHealth,
    t.home.filterHousing,
  ] as const;
}

export function getSettingsSections(t: TranslationTree) {
  return [
    {
      id: 'general',
      title: t.settings.general,
      items: [
        {
          id: 'language',
          label: t.settings.rowLanguage,
          icon: 'globe',
          type: 'link' as const,
        },
        {
          id: 'notifications',
          label: t.settings.rowNotifications,
          icon: 'bell',
          type: 'link' as const,
        },
      ],
    },
    {
      id: 'security',
      title: t.settings.security,
      items: [
        {
          id: 'biometric',
          label: t.settings.rowBiometric,
          icon: 'fingerprint',
          type: 'toggle' as const,
          defaultOn: false,
        },
        {
          id: 'mpin',
          label: t.settings.rowMpin,
          icon: 'refresh',
          type: 'link' as const,
        },
        {
          id: 'privacy',
          label: t.settings.rowPrivacy,
          icon: 'lock',
          type: 'link' as const,
        },
        {
          id: 'loginHistory',
          label: t.settings.rowLoginHistory,
          icon: 'clock',
          type: 'link' as const,
        },
      ],
    },
    {
      id: 'data',
      title: t.settings.data,
      items: [
        {
          id: 'cache',
          label: t.settings.rowCache,
          icon: 'trash',
          type: 'link' as const,
        },
        {
          id: 'deleteAccount',
          label: t.settings.rowDeleteAccount,
          icon: 'warning',
          type: 'danger' as const,
        },
      ],
    },
  ];
}

export function getOnboardingSlides(t: TranslationTree) {
  return [
    {
      id: '1',
      title: t.auth.onboardingTitle1,
      brandHighlight: true,
      subtitle: t.auth.onboardingSubtitle1,
      imageKey: 'onboarding1' as const,
    },
    {
      id: '2',
      title: t.auth.onboardingTitle2,
      brandHighlight: false,
      subtitle: t.auth.onboardingSubtitle2,
      imageKey: 'onboarding2' as const,
    },
    {
      id: '3',
      title: t.auth.onboardingTitle3,
      brandHighlight: false,
      subtitle: t.auth.onboardingSubtitle3,
      imageKey: 'onboarding3' as const,
    },
  ];
}

export function getApplicationFilters(t: TranslationTree) {
  return [
    t.applications.all,
    t.applications.inProgress,
    t.applications.approved,
    t.applications.rejected,
    t.applications.draft,
  ];
}

export function getNotificationFilters(t: TranslationTree) {
  return [
    t.notifications.filterAll,
    t.notifications.filterAlerts,
    t.notifications.filterUpdates,
    t.notifications.filterPayments,
  ];
}

export function getGovernmentSchemes(t: TranslationTree) {
  return [
    {
      id: '1',
      title: t.home.scheme1Title,
      ministry: t.home.scheme1Ministry,
      description: t.home.scheme1Desc,
      eligibility: t.home.scheme1Eligibility,
      eligibilityColor: '#EA580C',
      eligibilityBg: '#FFEDD5',
      category: 'Housing' as const,
    },
    {
      id: '2',
      title: t.home.scheme2Title,
      ministry: t.home.scheme2Ministry,
      description: t.home.scheme2Desc,
      eligibility: t.home.scheme2Eligibility,
      eligibilityColor: '#DC2626',
      eligibilityBg: '#FEE2E2',
      category: 'Health' as const,
    },
    {
      id: '3',
      title: t.home.scheme3Title,
      ministry: t.home.scheme3Ministry,
      description: t.home.scheme3Desc,
      eligibility: t.home.scheme3Eligibility,
      eligibilityColor: '#2563EB',
      eligibilityBg: '#DBEAFE',
      category: 'Housing' as const,
    },
    {
      id: '4',
      title: t.home.scheme4Title,
      ministry: t.home.scheme4Ministry,
      description: t.home.scheme4Desc,
      eligibility: t.home.scheme4Eligibility,
      eligibilityColor: '#059669',
      eligibilityBg: '#D1FAE5',
      category: 'Agriculture' as const,
    },
    {
      id: '5',
      title: t.home.scheme5Title,
      ministry: t.home.scheme5Ministry,
      description: t.home.scheme5Desc,
      eligibility: t.home.scheme5Eligibility,
      eligibilityColor: '#7C3AED',
      eligibilityBg: '#EDE9FE',
      category: 'Education' as const,
    },
  ];
}


export function getFaqCategories(t: TranslationTree): LocalizedFaqCategory[] {
  return ['General', 'Payments', 'Services', 'Account'];
}

export function getFaqCategoryLabel(
  t: TranslationTree,
  category: LocalizedFaqCategory,
): string {
  const map: Record<LocalizedFaqCategory, string> = {
    General: t.support.faqCatGeneral,
    Payments: t.support.faqCatPayments,
    Services: t.support.faqCatServices,
    Account: t.support.faqCatAccount,
  };
  return map[category];
}

export function getFaqItems(t: TranslationTree) {
  const entries = [
    { id: '1', category: 'Services' as const, q: t.support.faq1Q, a: t.support.faq1A },
    { id: '2', category: 'Payments' as const, q: t.support.faq2Q, a: t.support.faq2A },
    { id: '3', category: 'Services' as const, q: t.support.faq3Q, a: t.support.faq3A },
    { id: '4', category: 'General' as const, q: t.support.faq4Q, a: t.support.faq4A },
    { id: '5', category: 'Payments' as const, q: t.support.faq5Q, a: t.support.faq5A },
    { id: '6', category: 'Services' as const, q: t.support.faq6Q, a: t.support.faq6A },
    { id: '7', category: 'Services' as const, q: t.support.faq7Q, a: t.support.faq7A },
    { id: '8', category: 'Payments' as const, q: t.support.faq8Q, a: t.support.faq8A },
    { id: '9', category: 'Account' as const, q: t.support.faq9Q, a: t.support.faq9A },
    { id: '10', category: 'Services' as const, q: t.support.faq10Q, a: t.support.faq10A },
  ];
  return entries.map(item => ({
    id: item.id,
    category: item.category,
    question: item.q,
    answer: item.a,
  }));
}
