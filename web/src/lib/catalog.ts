import { type LucideIcon } from 'lucide-react';

export type ServiceIconKey =
  | 'shield'
  | 'card'
  | 'badge'
  | 'bill'
  | 'bank'
  | 'umbrella'
  | 'book'
  | 'health'
  | 'transport'
  | 'home'
  | 'building';

const ICON_PALETTE: Array<{ icon: ServiceIconKey; iconColor: string; iconBg: string }> = [
  { icon: 'shield', iconColor: '#2563EB', iconBg: '#DBEAFE' },
  { icon: 'card', iconColor: '#10B981', iconBg: '#D1FAE5' },
  { icon: 'badge', iconColor: '#F59E0B', iconBg: '#FEF3C7' },
  { icon: 'bill', iconColor: '#EF4444', iconBg: '#FEE2E2' },
  { icon: 'bank', iconColor: '#F97316', iconBg: '#FFEDD5' },
  { icon: 'umbrella', iconColor: '#10B981', iconBg: '#D1FAE5' },
  { icon: 'book', iconColor: '#8B5CF6', iconBg: '#EDE9FE' },
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
  'civil-records': 'badge',
  'transport-rto': 'transport',
  'social-welfare': 'health',
  'agriculture-rural': 'home',
  'employment-labour': 'building',
  'education-services': 'book',
  'state-portal-services': 'building',
  utility: 'bill',
  health: 'health',
};

export function getCatalogIconStyle(slug: string, index = 0) {
  const iconName = SLUG_ICON_OVERRIDES[slug.toLowerCase()];
  if (iconName) {
    const match = ICON_PALETTE.find(p => p.icon === iconName);
    if (match) return match;
  }
  return ICON_PALETTE[index % ICON_PALETTE.length];
}

export const QUICK_ACTIONS = [
  { id: 'aadhaar', title: 'Aadhaar Services', subtitle: 'Apply / Update Now', icon: 'shield' as const, color: '#2563EB', bg: '#DBEAFE', slugHints: ['aadhaar-update', 'aadhaar'] },
  { id: 'pan', title: 'PAN Card', subtitle: 'Apply / Update Now', icon: 'card' as const, color: '#10B981', bg: '#D1FAE5', slugHints: ['pan-card', 'pan'] },
  { id: 'bills', title: 'Pay Utility Bills', subtitle: 'Apply / Update Now', icon: 'bill' as const, color: '#F59E0B', bg: '#FEF3C7', slugHints: [] },
  { id: 'banking', title: 'Banking (AEPS)', subtitle: 'Apply / Update Now', icon: 'bank' as const, color: '#EF4444', bg: '#FEE2E2', slugHints: [] },
] as const;

export function findSubServiceBySlugHints(
  catalog: import('@/services/api').MainServiceCatalogItem[],
  hints: string[],
) {
  for (const main of catalog) {
    for (const sub of main.subServices) {
      const slug = sub.slug.toLowerCase();
      if (hints.some(h => slug.includes(h.toLowerCase()))) {
        return { main, sub };
      }
    }
  }
  return null;
}

export type IconComponent = LucideIcon;
