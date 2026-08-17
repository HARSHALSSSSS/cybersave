import type { MainServiceCatalogItem } from '@services/api';

export type StateCatalogHit = {
  main: MainServiceCatalogItem;
  sub: MainServiceCatalogItem['subServices'][number];
};

/** Mirrors web `StateServicesPage` — state-gated services only. */
export function servicesForState(
  catalog: MainServiceCatalogItem[],
  stateCode: string,
): StateCatalogHit[] {
  const code = stateCode.toUpperCase();
  return catalog.flatMap(main =>
    main.subServices
      .filter(
        sub =>
          sub.requiresStateSelection &&
          sub.availableStates?.some(s => s.code.toUpperCase() === code),
      )
      .map(sub => ({ main, sub })),
  );
}

export function countServicesForState(
  catalog: MainServiceCatalogItem[],
  stateCode: string,
) {
  return servicesForState(catalog, stateCode).length;
}

export function filterStateServices(items: StateCatalogHit[], query: string) {
  if (!query.trim()) return items;
  const q = query.trim().toLowerCase();
  return items.filter(({ main, sub }) => {
    const hay = `${main.name} ${sub.name} ${sub.displayName} ${sub.description ?? ''}`.toLowerCase();
    return hay.includes(q);
  });
}

export function groupStateServicesByCategory(items: StateCatalogHit[]) {
  const map = new Map<string, StateCatalogHit[]>();
  for (const item of items) {
    const list = map.get(item.main.slug) ?? [];
    list.push(item);
    map.set(item.main.slug, list);
  }
  return map;
}
