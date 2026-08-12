export function fullName(
  firstName?: string | null,
  lastName?: string | null,
  fallback = 'Unknown',
): string {
  const name = [firstName, lastName].filter(Boolean).join(' ').trim();
  return name || fallback;
}

export function initials(firstName?: string | null, lastName?: string | null): string {
  const f = firstName?.[0] ?? '';
  const l = lastName?.[0] ?? '';
  const value = `${f}${l}`.toUpperCase();
  return value || '??';
}

export function shortId(id: string, length = 8): string {
  return id.slice(0, length).toUpperCase();
}

export function decimalToNumber(value: unknown): number {
  if (value == null) return 0;
  if (typeof value === 'number') return value;
  if (typeof value === 'string') return Number(value) || 0;
  if (typeof value === 'object' && value !== null && 'toString' in value) {
    return Number(String(value)) || 0;
  }
  return 0;
}
