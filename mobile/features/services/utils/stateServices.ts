import type { MainServiceCatalogItem } from '@services/api';

export type StateCatalogHit = {
  main: MainServiceCatalogItem;
  sub: MainServiceCatalogItem['subServices'][number];
  scope: 'state' | 'national';
};

/** State-configured services plus All-India (no state picker) services. */
export function servicesForState(
  catalog: MainServiceCatalogItem[],
  stateCode: string,
): StateCatalogHit[] {
  const code = stateCode.toUpperCase();
  return catalog.flatMap(main =>
    main.subServices
      .filter(sub => {
        if (!sub.requiresStateSelection) return true;
        return Boolean(sub.availableStates?.some(s => s.code.toUpperCase() === code));
      })
      .map(sub => ({
        main,
        sub,
        scope: sub.requiresStateSelection ? ('state' as const) : ('national' as const),
      })),
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
