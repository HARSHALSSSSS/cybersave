import type { MainServiceCatalogItem } from '@services/api';

export function servicesForState(catalog: MainServiceCatalogItem[], stateCode: string) {
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

export function filterStateServices(
  items: ReturnType<typeof servicesForState>,
  query: string,
) {
  if (!query.trim()) return items;
  const q = query.trim().toLowerCase();
  return items.filter(({ main, sub }) => {
    const hay = `${main.name} ${sub.name} ${sub.displayName} ${sub.description ?? ''}`.toLowerCase();
    return hay.includes(q);
  });
}
