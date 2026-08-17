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

export function flattenCatalog(catalog: MainServiceCatalogItem[]) {
  return catalog.flatMap(main => main.subServices.map(sub => ({ main, sub })));
}

export function filterFlattenedServices(
  items: ReturnType<typeof flattenCatalog>,
  query: string,
) {
  const q = query.trim().toLowerCase();
  if (!q) return items;
  return items.filter(({ main, sub }) => {
    const hay = `${main.name} ${main.slug} ${sub.displayName} ${sub.name} ${sub.slug} ${sub.shortDescription ?? ''} ${sub.description ?? ''}`.toLowerCase();
    return hay.includes(q);
  });
}

export function popularCatalogServices(catalog: MainServiceCatalogItem[]) {
  const ranked = [...catalog].sort((a, b) => b.subServices.length - a.subServices.length);
  return flattenCatalog(ranked).slice(0, 10);
}

export function isCertificateHub(slug: string, subServiceCount: number): boolean {
  return slug.toLowerCase().includes('cert') || subServiceCount > 6;
}

export function formatServiceFee(baseFee: string, currency = 'INR'): string {
  const amount = Number(baseFee);
  if (!amount) return 'Free';
  return currency === 'INR' ? `₹${amount}` : `${currency} ${amount}`;
}

export type CatalogSearchHit = {
  categoryId: string;
  categoryName: string;
  categorySlug: string;
  optionId: string;
  optionName: string;
  description?: string;
};

/** Flat search across main categories and sub-services. */
export function searchCatalog(
  catalog: MainServiceCatalogItem[],
  query: string,
): CatalogSearchHit[] {
  const q = query.trim().toLowerCase();
  if (!q) return [];

  const hits: CatalogSearchHit[] = [];
  for (const main of catalog) {
    const mainMatch =
      main.name.toLowerCase().includes(q) ||
      main.slug.toLowerCase().includes(q) ||
      (main.description?.toLowerCase().includes(q) ?? false);

    for (const sub of main.subServices) {
      const subMatch =
        sub.displayName.toLowerCase().includes(q) ||
        sub.name.toLowerCase().includes(q) ||
        (sub.shortDescription?.toLowerCase().includes(q) ?? false) ||
        (sub.description?.toLowerCase().includes(q) ?? false);

      if (mainMatch || subMatch) {
        hits.push({
          categoryId: main.id,
          categoryName: main.name,
          categorySlug: main.slug,
          optionId: sub.id,
          optionName: sub.displayName,
          description: sub.shortDescription ?? sub.description ?? undefined,
        });
      }
    }
  }
  return hits;
}

export function filterCatalogBySearch(
  catalog: MainServiceCatalogItem[],
  query: string,
): MainServiceCatalogItem[] {
  const q = query.trim().toLowerCase();
  if (!q) return catalog;

  return catalog.filter(main => {
    if (
      main.name.toLowerCase().includes(q) ||
      main.slug.toLowerCase().includes(q) ||
      (main.description?.toLowerCase().includes(q) ?? false)
    ) {
      return true;
    }
    return main.subServices.some(
      sub =>
        sub.displayName.toLowerCase().includes(q) ||
        sub.name.toLowerCase().includes(q) ||
        (sub.shortDescription?.toLowerCase().includes(q) ?? false),
    );
  });
}
