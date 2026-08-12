/** UI metadata for Indian states — colors for cards; code shown as badge. */
export const STATE_UI: Record<
  string,
  { color: string; bg: string; short: string }
> = {
  AN: { color: '#0D9488', bg: '#CCFBF1', short: 'AN' },
  AP: { color: '#DC2626', bg: '#FEE2E2', short: 'AP' },
  AR: { color: '#2563EB', bg: '#DBEAFE', short: 'AR' },
  AS: { color: '#059669', bg: '#D1FAE5', short: 'AS' },
  BR: { color: '#7C3AED', bg: '#EDE9FE', short: 'BR' },
  CH: { color: '#0891B2', bg: '#CFFAFE', short: 'CH' },
  CT: { color: '#EA580C', bg: '#FFEDD5', short: 'CG' },
  DL: { color: '#BE123C', bg: '#FFE4E6', short: 'DL' },
  GA: { color: '#16A34A', bg: '#DCFCE7', short: 'GA' },
  GJ: { color: '#D97706', bg: '#FEF3C7', short: 'GJ' },
  HR: { color: '#CA8A04', bg: '#FEF9C3', short: 'HR' },
  HP: { color: '#0284C7', bg: '#E0F2FE', short: 'HP' },
  JK: { color: '#4F46E5', bg: '#E0E7FF', short: 'JK' },
  JH: { color: '#B45309', bg: '#FDE68A', short: 'JH' },
  KA: { color: '#C026D3', bg: '#FAE8FF', short: 'KA' },
  KL: { color: '#059669', bg: '#D1FAE5', short: 'KL' },
  MP: { color: '#9333EA', bg: '#F3E8FF', short: 'MP' },
  MH: { color: '#2563EB', bg: '#DBEAFE', short: 'MH' },
  MN: { color: '#DB2777', bg: '#FCE7F3', short: 'MN' },
  ML: { color: '#0F766E', bg: '#CCFBF1', short: 'ML' },
  MZ: { color: '#0369A1', bg: '#E0F2FE', short: 'MZ' },
  NL: { color: '#B91C1C', bg: '#FEE2E2', short: 'NL' },
  OD: { color: '#EA580C', bg: '#FFEDD5', short: 'OD' },
  PY: { color: '#7C3AED', bg: '#EDE9FE', short: 'PY' },
  PB: { color: '#15803D', bg: '#DCFCE7', short: 'PB' },
  RJ: { color: '#C2410C', bg: '#FFEDD5', short: 'RJ' },
  SK: { color: '#0891B2', bg: '#CFFAFE', short: 'SK' },
  TN: { color: '#1D4ED8', bg: '#DBEAFE', short: 'TN' },
  TG: { color: '#BE185D', bg: '#FCE7F3', short: 'TS' },
  TR: { color: '#047857', bg: '#D1FAE5', short: 'TR' },
  UP: { color: '#A16207', bg: '#FEF9C3', short: 'UP' },
  UK: { color: '#4338CA', bg: '#E0E7FF', short: 'UK' },
  WB: { color: '#0E7490', bg: '#CFFAFE', short: 'WB' },
};

export function getStateUi(code: string) {
  return (
    STATE_UI[code] ?? {
      color: '#2563EB',
      bg: '#EFF6FF',
      short: code.slice(0, 2).toUpperCase(),
    }
  );
}
