/** Featured states for browse — mirrors web `lib/states.ts`. */
export const FEATURED_STATES = [
  {
    code: 'MH',
    name: 'Maharashtra',
    portal: 'Aaple Sarkar',
    portalUrl: 'https://aaplesarkar.mahaonline.gov.in/en',
    tagline: 'RTPS notified services via MahaOnline',
    color: '#F97316',
    bg: '#FFF7ED',
  },
  {
    code: 'GJ',
    name: 'Gujarat',
    portal: 'Digital Gujarat',
    portalUrl: 'https://www.digitalgujarat.gov.in/',
    tagline: 'Single-window citizen services',
    color: '#2563EB',
    bg: '#EFF6FF',
  },
  {
    code: 'BR',
    name: 'Bihar',
    portal: 'Service Plus Bihar',
    portalUrl: 'https://serviceonline.bihar.gov.in/',
    tagline: '307+ online G2C services',
    color: '#10B981',
    bg: '#ECFDF5',
  },
  {
    code: 'KA',
    name: 'Karnataka',
    portal: 'Seva Sindhu',
    portalUrl: 'https://sevasindhu.karnataka.gov.in/',
    tagline: 'Unified state services portal',
    color: '#8B5CF6',
    bg: '#EDE9FE',
  },
  {
    code: 'TN',
    name: 'Tamil Nadu',
    portal: 'e-Sevai',
    portalUrl: 'https://www.tnesevai.tn.gov.in/',
    tagline: 'Tamil Nadu e-District services',
    color: '#EF4444',
    bg: '#FEE2E2',
  },
  {
    code: 'DL',
    name: 'Delhi',
    portal: 'e-District Delhi',
    portalUrl: 'https://edistrict.delhigovt.nic.in/',
    tagline: 'Certificates & licences online',
    color: '#6366F1',
    bg: '#E0E7FF',
  },
  {
    code: 'UP',
    name: 'Uttar Pradesh',
    portal: 'e-District UP',
    portalUrl: 'https://edistrict.up.gov.in/',
    tagline: 'Largest state citizen portal',
    color: '#F59E0B',
    bg: '#FEF3C7',
  },
  {
    code: 'RJ',
    name: 'Rajasthan',
    portal: 'e-Mitra',
    portalUrl: 'https://emitra.rajasthan.gov.in/',
    tagline: 'Rajasthan integrated e-services',
    color: '#EC4899',
    bg: '#FCE7F3',
  },
] as const;

export const STATE_PREVIEW_COUNT = 4;

const STATE_PALETTE = [
  { color: '#F97316', bg: '#FFF7ED' },
  { color: '#2563EB', bg: '#EFF6FF' },
  { color: '#10B981', bg: '#ECFDF5' },
  { color: '#8B5CF6', bg: '#EDE9FE' },
  { color: '#EF4444', bg: '#FEE2E2' },
  { color: '#6366F1', bg: '#E0E7FF' },
  { color: '#F59E0B', bg: '#FEF3C7' },
  { color: '#EC4899', bg: '#FCE7F3' },
] as const;

export function getFeaturedState(code: string) {
  return FEATURED_STATES.find(s => s.code === code.toUpperCase());
}

export function getStateName(code: string): string {
  return getFeaturedState(code)?.name ?? code.toUpperCase();
}

export function getStateTheme(code: string) {
  const featured = getFeaturedState(code);
  if (featured) {
    return { color: featured.color, bg: featured.bg };
  }
  const index = Math.abs(code.toUpperCase().charCodeAt(0) + code.length) % STATE_PALETTE.length;
  return STATE_PALETTE[index];
}
