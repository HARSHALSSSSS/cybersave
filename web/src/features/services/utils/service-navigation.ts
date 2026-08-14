import type { SubServiceCatalogItem } from '@/services/api';

type SubServiceNavInput = Pick<
  SubServiceCatalogItem,
  'requiresStateSelection' | 'availableStates'
>;

/** Build the correct service detail URL (handles state selection like mobile). */
export function buildServiceDetailPath(
  mainSlug: string,
  subSlug: string,
  sub: SubServiceNavInput,
  existing?: { stateCode?: string; stateName?: string },
): string {
  const base = `/services/${mainSlug}/${subSlug}`;

  if (!sub.requiresStateSelection) {
    return base;
  }

  if (existing?.stateCode) {
    const params = new URLSearchParams({ state: existing.stateCode });
    if (existing.stateName) {
      params.set('stateName', existing.stateName);
    }
    return `${base}?${params.toString()}`;
  }

  const states = sub.availableStates ?? [];
  if (states.length === 1) {
    const params = new URLSearchParams({
      state: states[0].code,
      stateName: states[0].name,
    });
    return `${base}?${params.toString()}`;
  }

  return `${base}/select-state`;
}

export function buildApplyPath(
  mainSlug: string,
  subSlug: string,
  stateCode?: string,
  stateName?: string,
): string {
  const base = `/services/${mainSlug}/${subSlug}/apply`;
  if (!stateCode) return base;
  const params = new URLSearchParams({ state: stateCode });
  if (stateName) params.set('stateName', stateName);
  return `${base}?${params.toString()}`;
}
