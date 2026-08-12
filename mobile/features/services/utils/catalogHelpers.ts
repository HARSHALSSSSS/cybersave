import type { ServiceFilter, ServiceIconKey } from '@constants/index';
import type { MainServiceCatalogItem } from '@services/api';

const ICON_PALETTE: Array<{ icon: ServiceIconKey; iconColor: string; iconBg: string }> = [
  { icon: 'shield', iconColor: '#2563EB', iconBg: '#DBEAFE' },
  { icon: 'card', iconColor: '#10B981', iconBg: '#D1FAE5' },
  { icon: 'badge', iconColor: '#F59E0B', iconBg: '#FEF3C7' },
  { icon: 'bill', iconColor: '#EF4444', iconBg: '#FEE2E2' },
  { icon: 'bank', iconColor: '#F97316', iconBg: '#FFEDD5' },
  { icon: 'umbrella', iconColor: '#10B981', iconBg: '#D1FAE5' },
  { icon: 'book', iconColor: '#8B5CF6', iconBg: '#EDE9FE' },
  { icon: 'document', iconColor: '#2563EB', iconBg: '#DBEAFE' },
  { icon: 'health', iconColor: '#EC4899', iconBg: '#FCE7F3' },
  { icon: 'building', iconColor: '#6366F1', iconBg: '#E0E7FF' },
  { icon: 'transport', iconColor: '#F97316', iconBg: '#FFF7ED' },
  { icon: 'home', iconColor: '#8B5CF6', iconBg: '#EDE9FE' },
];

const SLUG_ICON_OVERRIDES: Record<string, ServiceIconKey> = {
  'identity-kyc': 'shield',
  aadhaar: 'shield',
  pan: 'card',
  certificates: 'badge',
  certificate: 'badge',
  'civil-records': 'document',
  'transport-rto': 'transport',
  transport: 'transport',
  'social-welfare': 'health',
  'agriculture-rural': 'home',
  agriculture: 'home',
  'employment-labour': 'building',
  employment: 'building',
  'education-services': 'book',
  education: 'book',
  utility: 'bill',
  tax: 'tax',
  health: 'health',
  property: 'home',
};

export function getCatalogIconStyle(slug: string, index = 0) {
  const iconName = SLUG_ICON_OVERRIDES[slug.toLowerCase()];
  if (iconName) {
    const match = ICON_PALETTE.find(p => p.icon === iconName);
    if (match) return match;
  }
  return ICON_PALETTE[index % ICON_PALETTE.length];
}

export function filterCatalogByChip(
  services: MainServiceCatalogItem[],
  filter: ServiceFilter,
): MainServiceCatalogItem[] {
  if (filter === 'All') return services;

  const keyword = filter.toLowerCase();
  return services.filter(service => {
    const slug = service.slug.toLowerCase();
    const name = service.name.toLowerCase();
    if (filter === 'Popular') {
      return service.subServices.length >= 2;
    }
    if (filter === 'Government') {
      return (
        slug.includes('cert') ||
        slug.includes('civil') ||
        slug.includes('identity') ||
        slug.includes('gov') ||
        slug.includes('aadhaar') ||
        slug.includes('pan') ||
        slug.includes('welfare') ||
        slug.includes('agriculture') ||
        slug.includes('education') ||
        name.includes('certificate') ||
        name.includes('government')
      );
    }
    if (filter === 'Finance') {
      return (
        slug.includes('tax') ||
        slug.includes('finance') ||
        slug.includes('income') ||
        slug.includes('solvency') ||
        slug.includes('ews')
      );
    }
    return name.includes(keyword) || slug.includes(keyword);
  });
}

export function isCertificateHub(slug: string, subServiceCount: number): boolean {
  return slug.toLowerCase().includes('cert') || subServiceCount > 6;
}

export function formatServiceFee(baseFee: string, currency = 'INR'): string {
  const amount = Number(baseFee);
  if (!amount) return 'Free';
  return currency === 'INR' ? `₹${amount}` : `${currency} ${amount}`;
}
