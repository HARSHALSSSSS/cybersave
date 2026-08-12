export function slugify(value: string): string {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 80);
}

export async function uniqueSlug(
  base: string,
  exists: (slug: string) => Promise<boolean>,
): Promise<string> {
  let slug = slugify(base) || 'item';
  let suffix = 0;

  while (await exists(suffix === 0 ? slug : `${slug}-${suffix}`)) {
    suffix += 1;
  }

  return suffix === 0 ? slug : `${slug}-${suffix}`;
}
