/** Official redirect URLs for manual apply — mirrors backend seed catalog. */
export const STATE_EDISTRICT_PORTALS: Record<string, { name: string; url: string }> = {
  MH: { name: 'Maharashtra', url: 'https://aaplesarkar.mahaonline.gov.in/' },
  KA: { name: 'Karnataka', url: 'https://sevasindhu.karnataka.gov.in/' },
  DL: { name: 'Delhi', url: 'https://edistrict.delhigovt.nic.in/' },
  UP: { name: 'Uttar Pradesh', url: 'https://edistrict.up.gov.in/' },
  TN: { name: 'Tamil Nadu', url: 'https://www.tnesevai.tn.gov.in/' },
  GJ: { name: 'Gujarat', url: 'https://digitalgujarat.gov.in/' },
};

const PARIVAHAN = 'https://parivahan.gov.in/';
const PMAY = 'https://pmaymis.gov.in/';

/** National services — single default portal URL (no state selection). */
export const NATIONAL_MANUAL_PORTAL_URLS: Record<string, string> = {
  'pan-card': 'https://www.onlineservices.nsdl.com/paam/endUserRegisterContact.html',
  'aadhaar-update': 'https://myaadhaar.uidai.gov.in/',
  'voter-id': 'https://voters.eci.gov.in/',
  'disability-certificate': 'https://www.swavlambancard.gov.in/',
  'pm-kisan-registration': 'https://pmkisan.gov.in/',
  'labour-card': 'https://eshram.gov.in/',
  'scholarship-application': 'https://scholarships.gov.in/',
};

/** State-based services — per-state official portal URLs. */
export const STATE_MANUAL_PORTAL_PRESETS: Record<
  string,
  Record<string, string> | 'edistrict' | 'parivahan' | 'pmay'
> = {
  'income-certificate': 'edistrict',
  'caste-certificate': 'edistrict',
  'domicile-certificate': 'edistrict',
  'ews-certificate': 'edistrict',
  'character-certificate': 'edistrict',
  'solvency-certificate': 'edistrict',
  'nativity-certificate': 'edistrict',
  'birth-certificate': 'edistrict',
  'death-certificate': 'edistrict',
  'marriage-certificate': 'edistrict',
  'driving-licence-renewal': 'parivahan',
  'learners-licence': 'parivahan',
  'vehicle-registration': 'parivahan',
  'duplicate-rc': 'parivahan',
  'senior-citizen-certificate': 'edistrict',
  'widow-pension': 'edistrict',
  'pm-awas-yojna': 'pmay',
  'farmer-certificate': 'edistrict',
  'land-records-extract': 'edistrict',
  'experience-certificate': 'edistrict',
  'government-job-noc': 'edistrict',
  'bonafide-certificate': 'edistrict',
  'transfer-certificate': 'edistrict',
};

export type PortalPresetRow = {
  stateCode: string;
  stateName: string;
  officialPortalUrl: string;
  platformFee: number;
};

function edistrictRows(platformFee = 49): PortalPresetRow[] {
  return Object.entries(STATE_EDISTRICT_PORTALS).map(([code, { name, url }]) => ({
    stateCode: code,
    stateName: name,
    officialPortalUrl: url,
    platformFee,
  }));
}

function parivahanRows(platformFee = 49): PortalPresetRow[] {
  return ['MH', 'KA', 'DL', 'UP'].map(code => ({
    stateCode: code,
    stateName: STATE_EDISTRICT_PORTALS[code]?.name ?? code,
    officialPortalUrl: PARIVAHAN,
    platformFee,
  }));
}

function pmayRows(platformFee = 49): PortalPresetRow[] {
  return edistrictRows(platformFee).map(row => ({
    ...row,
    officialPortalUrl: PMAY,
  }));
}

export function getRecommendedDefaultPortalUrl(subServiceSlug: string): string | undefined {
  return NATIONAL_MANUAL_PORTAL_URLS[subServiceSlug];
}

export function getRecommendedStateVariants(
  subServiceSlug: string,
  platformFee = 49,
): PortalPresetRow[] | null {
  const preset = STATE_MANUAL_PORTAL_PRESETS[subServiceSlug];
  if (!preset) return null;
  if (preset === 'edistrict') return edistrictRows(platformFee);
  if (preset === 'parivahan') return parivahanRows(platformFee);
  if (preset === 'pmay') return pmayRows(platformFee);
  return Object.entries(preset).map(([code, url]) => ({
    stateCode: code,
    stateName: STATE_EDISTRICT_PORTALS[code]?.name ?? code,
    officialPortalUrl: url,
    platformFee,
  }));
}

export function isStateBasedManualService(subServiceSlug: string): boolean {
  return subServiceSlug in STATE_MANUAL_PORTAL_PRESETS;
}

export function getRecommendedManualInstructions(subServiceSlug: string): string | undefined {
  if (subServiceSlug in NATIONAL_MANUAL_PORTAL_URLS) {
    return 'Complete your application on the official government portal, then return here to confirm.';
  }
  if (STATE_MANUAL_PORTAL_PRESETS[subServiceSlug] === 'parivahan') {
    return 'Login to Parivahan Sewa, complete the service, and save your application reference number.';
  }
  if (STATE_MANUAL_PORTAL_PRESETS[subServiceSlug] === 'pmay') {
    return 'Apply on the PMAY portal using your Aadhaar-linked mobile number.';
  }
  if (subServiceSlug in STATE_MANUAL_PORTAL_PRESETS) {
    return 'Select your state portal, submit the application, and keep the acknowledgment receipt.';
  }
  return undefined;
}

/** Apply catalog presets to fulfillment form state. */
export function buildRecommendedFulfillment(subServiceSlug: string, platformFee = 49) {
  const nationalUrl = getRecommendedDefaultPortalUrl(subServiceSlug);
  const stateRows = getRecommendedStateVariants(subServiceSlug, platformFee);
  const instructions = getRecommendedManualInstructions(subServiceSlug);

  if (nationalUrl) {
    return {
      manualEnabled: true,
      requiresStateSelection: false,
      defaultPortalUrl: nationalUrl,
      stateVariants: [] as PortalPresetRow[],
      manualInstructions: instructions ?? '',
    };
  }

  if (stateRows?.length) {
    return {
      manualEnabled: true,
      requiresStateSelection: true,
      defaultPortalUrl:
        STATE_MANUAL_PORTAL_PRESETS[subServiceSlug] === 'parivahan' ? PARIVAHAN : '',
      stateVariants: stateRows,
      manualInstructions: instructions ?? '',
    };
  }

  return null;
}
