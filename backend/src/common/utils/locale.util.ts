export type LocalizedStrings = Record<
  string,
  Record<string, string | undefined>
>;

export function normalizeLocale(header?: string): string {
  if (!header) return 'en';
  const primary = header.split(',')[0]?.trim().toLowerCase() ?? 'en';
  return primary.split('-')[0] || 'en';
}

export function pickLocalized(
  locale: string,
  fallback: string | null | undefined,
  translations?: unknown,
  field?: string,
): string | null | undefined {
  if (!field || locale === 'en') return fallback;
  if (!translations || typeof translations !== 'object') return fallback;
  const map = translations as LocalizedStrings;
  const localized = map[locale]?.[field];
  return localized ?? fallback;
}

export function applyBannerLocale<T extends {
  tag: string | null;
  title: string;
  description: string | null;
  ctaLabel: string;
  translations?: unknown;
}>(
  banner: T,
  locale: string,
): T {
  if (locale === 'en') return banner;
  const tr = banner.translations;
  return {
    ...banner,
    tag: pickLocalized(locale, banner.tag, tr, 'tag') ?? banner.tag,
    title: pickLocalized(locale, banner.title, tr, 'title') ?? banner.title,
    description:
      pickLocalized(locale, banner.description, tr, 'description') ??
      banner.description,
    ctaLabel:
      pickLocalized(locale, banner.ctaLabel, tr, 'ctaLabel') ?? banner.ctaLabel,
  };
}

export function applyOverviewLocale<
  T extends {
    displayName: string;
    shortDescription?: string | null;
    richDescription?: string | null;
    instructions?: string | null;
    translations?: unknown;
  },
>(overview: T, locale: string): T {
  if (locale === 'en') return overview;
  const tr = overview.translations;
  return {
    ...overview,
    displayName:
      pickLocalized(locale, overview.displayName, tr, 'displayName') ??
      overview.displayName,
    shortDescription:
      pickLocalized(locale, overview.shortDescription, tr, 'shortDescription') ??
      overview.shortDescription,
    richDescription:
      pickLocalized(locale, overview.richDescription, tr, 'richDescription') ??
      overview.richDescription,
    instructions:
      pickLocalized(locale, overview.instructions, tr, 'instructions') ??
      overview.instructions,
  };
}
