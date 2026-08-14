/** Featured states for browse — mirrors web `lib/states.ts`. */
export const FEATURED_STATES = [
  {
    code: 'MH',
    name: 'Maharashtra',
    portal: 'Aaple Sarkar',
    tagline: 'RTPS notified services via MahaOnline',
    color: '#F97316',
    bg: '#FFF7ED',
  },
  {
    code: 'GJ',
    name: 'Gujarat',
    portal: 'Digital Gujarat',
    tagline: 'Single-window citizen services',
    color: '#2563EB',
    bg: '#EFF6FF',
  },
  {
    code: 'BR',
    name: 'Bihar',
    portal: 'Service Plus Bihar',
    tagline: '307+ online G2C services',
    color: '#10B981',
    bg: '#ECFDF5',
  },
  {
    code: 'KA',
    name: 'Karnataka',
    portal: 'Seva Sindhu',
    tagline: 'Unified state services portal',
    color: '#8B5CF6',
    bg: '#EDE9FE',
  },
  {
    code: 'TN',
    name: 'Tamil Nadu',
    portal: 'e-Sevai',
    tagline: 'Tamil Nadu e-District services',
    color: '#EF4444',
    bg: '#FEE2E2',
  },
  {
    code: 'DL',
    name: 'Delhi',
    portal: 'e-District Delhi',
    tagline: 'Certificates & licences online',
    color: '#6366F1',
    bg: '#E0E7FF',
  },
  {
    code: 'UP',
    name: 'Uttar Pradesh',
    portal: 'e-District UP',
    tagline: 'Largest state citizen portal',
    color: '#F59E0B',
    bg: '#FEF3C7',
  },
  {
    code: 'RJ',
    name: 'Rajasthan',
    portal: 'e-Mitra',
    tagline: 'Rajasthan integrated e-services',
    color: '#EC4899',
    bg: '#FCE7F3',
  },
] as const;

export function getFeaturedState(code: string) {
  return FEATURED_STATES.find(s => s.code === code.toUpperCase());
}

export function getStateName(code: string): string {
  return getFeaturedState(code)?.name ?? code.toUpperCase();
}
