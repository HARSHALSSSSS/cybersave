/** Featured states for home / services browse — mirrors backend seed FEATURED_STATE_CODES. */
export const FEATURED_STATES = [
  {
    code: 'MH',
    name: 'Maharashtra',
    portal: 'Aaple Sarkar',
    portalUrl: 'https://aaplesarkar.mahaonline.gov.in/en',
    tagline: 'RTPS notified services via MahaOnline',
    color: '#F97316',
    bg: '#FFF7ED',
    gradient: 'from-[#FF9933] via-white to-[#138808]',
  },
  {
    code: 'GJ',
    name: 'Gujarat',
    portal: 'Digital Gujarat',
    portalUrl: 'https://www.digitalgujarat.gov.in/',
    tagline: 'Single-window citizen services',
    color: '#2563EB',
    bg: '#EFF6FF',
    gradient: 'from-[#2563EB] to-[#1D4ED8]',
  },
  {
    code: 'BR',
    name: 'Bihar',
    portal: 'Service Plus Bihar',
    portalUrl: 'https://serviceonline.bihar.gov.in/',
    tagline: '307+ online G2C services',
    color: '#10B981',
    bg: '#ECFDF5',
    gradient: 'from-[#059669] to-[#047857]',
  },
  {
    code: 'KA',
    name: 'Karnataka',
    portal: 'Seva Sindhu',
    portalUrl: 'https://sevasindhu.karnataka.gov.in/',
    tagline: 'Unified state services portal',
    color: '#8B5CF6',
    bg: '#EDE9FE',
    gradient: 'from-[#7C3AED] to-[#6D28D9]',
  },
  {
    code: 'TN',
    name: 'Tamil Nadu',
    portal: 'e-Sevai',
    portalUrl: 'https://www.tnesevai.tn.gov.in/',
    tagline: 'Tamil Nadu e-District services',
    color: '#EF4444',
    bg: '#FEE2E2',
    gradient: 'from-[#DC2626] to-[#B91C1C]',
  },
  {
    code: 'DL',
    name: 'Delhi',
    portal: 'e-District Delhi',
    portalUrl: 'https://edistrict.delhigovt.nic.in/',
    tagline: 'Certificates & licences online',
    color: '#6366F1',
    bg: '#E0E7FF',
    gradient: 'from-[#4F46E5] to-[#4338CA]',
  },
  {
    code: 'UP',
    name: 'Uttar Pradesh',
    portal: 'e-District UP',
    portalUrl: 'https://edistrict.up.gov.in/',
    tagline: 'Largest state citizen portal',
    color: '#F59E0B',
    bg: '#FEF3C7',
    gradient: 'from-[#D97706] to-[#B45309]',
  },
  {
    code: 'RJ',
    name: 'Rajasthan',
    portal: 'e-Mitra',
    portalUrl: 'https://emitra.rajasthan.gov.in/',
    tagline: 'Rajasthan integrated e-services',
    color: '#EC4899',
    bg: '#FCE7F3',
    gradient: 'from-[#DB2777] to-[#BE185D]',
  },
] as const;

export function getFeaturedState(code: string) {
  return FEATURED_STATES.find(s => s.code === code);
}

export function getStateName(code: string): string {
  return getFeaturedState(code)?.name ?? code;
}
