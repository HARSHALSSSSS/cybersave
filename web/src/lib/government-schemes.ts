/**
 * Curated central & state government welfare schemes shown on Home and Schemes pages.
 * Services with catalog slugs link into the Cybersave apply flow; others open official portals.
 */

export type SchemeCategory =
  | 'Housing'
  | 'Agriculture'
  | 'Health'
  | 'Education'
  | 'Social Welfare'
  | 'Women & Child'
  | 'Financial Inclusion'
  | 'Employment';

export type GovernmentScheme = {
  id: string;
  name: string;
  ministry: string;
  category: SchemeCategory;
  benefit: string;
  eligibility: string;
  matchLabel?: string;
  /** Apply through Cybersave when both slugs are set */
  mainServiceSlug?: string;
  subServiceSlug?: string;
  /** Official government portal when not offered as a Cybersave service yet */
  officialUrl?: string;
};

export const SCHEME_CATEGORIES: readonly ['All', ...SchemeCategory[]] = [
  'All',
  'Housing',
  'Agriculture',
  'Health',
  'Education',
  'Social Welfare',
  'Women & Child',
  'Financial Inclusion',
  'Employment',
] as const;

export const GOVERNMENT_SCHEMES: GovernmentScheme[] = [
  {
    id: 'pmay',
    name: 'Pradhan Mantri Awas Yojana (PMAY)',
    ministry: 'Ministry of Housing and Urban Affairs',
    category: 'Housing',
    benefit: 'Interest subsidy up to ₹2.67 lakh on home loans; affordable pucca housing for eligible families',
    eligibility: 'EWS / LIG / MIG households without a pucca house in India',
    matchLabel: '95% MATCH',
    mainServiceSlug: 'social-welfare',
    subServiceSlug: 'pm-awas-yojna',
  },
  {
    id: 'pm-kisan',
    name: 'PM-KISAN Samman Nidhi',
    ministry: 'Ministry of Agriculture & Farmers Welfare',
    category: 'Agriculture',
    benefit: '₹6,000 per year in three instalments directly to eligible farmer families',
    eligibility: 'Small and marginal farmer families with cultivable land (as per scheme rules)',
    matchLabel: 'HIGH LIKELIHOOD',
    mainServiceSlug: 'agriculture-rural',
    subServiceSlug: 'pm-kisan-registration',
  },
  {
    id: 'pm-jay',
    name: 'Ayushman Bharat — PM-JAY',
    ministry: 'Ministry of Health & Family Welfare',
    category: 'Health',
    benefit: 'Health cover up to ₹5 lakh per family per year for secondary & tertiary hospitalisation',
    eligibility: 'Families identified under SECC / Ayushman Bharat eligibility criteria',
    matchLabel: 'PRE-APPROVED',
    officialUrl: 'https://pmjay.gov.in/',
  },
  {
    id: 'pm-ujjwala',
    name: 'Pradhan Mantri Ujjwala Yojana',
    ministry: 'Ministry of Petroleum and Natural Gas',
    category: 'Social Welfare',
    benefit: 'Free LPG connection with financial assistance for eligible women from BPL households',
    eligibility: 'Adult woman from poor household without an LPG connection',
    officialUrl: 'https://pmuy.gov.in/',
  },
  {
    id: 'nsp',
    name: 'National Scholarship Portal',
    ministry: 'Ministry of Education',
    category: 'Education',
    benefit: 'Central & state scholarships for school, college and technical education students',
    eligibility: 'Students meeting income, merit and category criteria of respective scholarships',
    mainServiceSlug: 'education-services',
    subServiceSlug: 'scholarship-application',
  },
  {
    id: 'pm-svanidhi',
    name: 'PM SVANidhi',
    ministry: 'Ministry of Housing and Urban Affairs',
    category: 'Employment',
    benefit: 'Working capital loan up to ₹20,000 for street vendors with interest subsidy',
    eligibility: 'Street vendors vending in urban areas with valid identity / vending certificate',
    officialUrl: 'https://pmsvanidhi.mohua.gov.in/',
  },
  {
    id: 'mudra',
    name: 'MUDRA Loan (PMMY)',
    ministry: 'Ministry of Finance',
    category: 'Financial Inclusion',
    benefit: 'Collateral-free loans up to ₹10 lakh for micro & small enterprise activities',
    eligibility: 'Non-corporate small business units and entrepreneurs',
    officialUrl: 'https://www.mudra.org.in/',
  },
  {
    id: 'apy',
    name: 'Atal Pension Yojana (APY)',
    ministry: 'Ministry of Finance',
    category: 'Social Welfare',
    benefit: 'Guaranteed minimum pension from ₹1,000 to ₹5,000 per month after 60 years of age',
    eligibility: 'Indian citizens aged 18–40 with a bank / post office account',
    officialUrl: 'https://npscra.nsdl.co.in/apy-introduction.php',
  },
  {
    id: 'pm-jdy',
    name: 'Pradhan Mantri Jan Dhan Yojana',
    ministry: 'Ministry of Finance',
    category: 'Financial Inclusion',
    benefit: 'Zero-balance bank account with RuPay debit card, accident insurance & overdraft facility',
    eligibility: 'Any Indian citizen without a bank account',
    officialUrl: 'https://www.pmjdy.gov.in/',
  },
  {
    id: 'standup-india',
    name: 'Stand-Up India',
    ministry: 'Ministry of Finance',
    category: 'Women & Child',
    benefit: 'Bank loans between ₹10 lakh and ₹1 crore for SC/ST and women entrepreneurs',
    eligibility: 'Women or SC/ST entrepreneurs setting up greenfield enterprises',
    officialUrl: 'https://www.standupmitra.in/',
  },
  {
    id: 'pm-vishwakarma',
    name: 'PM Vishwakarma',
    ministry: 'Ministry of Micro, Small and Medium Enterprises',
    category: 'Employment',
    benefit: 'Skill training, toolkit incentive and collateral-free credit support for artisans',
    eligibility: 'Traditional artisans and craftspeople in 18 listed trades',
    officialUrl: 'https://pmvishwakarma.gov.in/',
  },
  {
    id: 'pm-fby',
    name: 'PM Fasal Bima Yojana',
    ministry: 'Ministry of Agriculture & Farmers Welfare',
    category: 'Agriculture',
    benefit: 'Crop insurance at low premium with timely claim settlement for notified crops',
    eligibility: 'Farmers growing notified crops in notified areas during crop season',
    officialUrl: 'https://pmfby.gov.in/',
  },
  {
    id: 'widow-pension',
    name: 'Widow Pension Scheme',
    ministry: 'Ministry of Social Justice & Empowerment (State schemes)',
    category: 'Social Welfare',
    benefit: 'Monthly financial assistance to eligible widows through state social welfare departments',
    eligibility: 'Widows meeting age and income criteria as per respective state rules',
    mainServiceSlug: 'social-welfare',
    subServiceSlug: 'widow-pension',
  },
  {
    id: 'kanya-vivah-bihar',
    name: 'Mukhyamantri Kanya Vivah Yojana (Bihar)',
    ministry: 'Government of Bihar — Social Welfare Department',
    category: 'Women & Child',
    benefit: 'Financial assistance for marriage of daughters of eligible BPL families',
    eligibility: 'Resident of Bihar meeting income and documentation criteria',
    mainServiceSlug: 'state-portal-services',
    subServiceSlug: 'mukhyamantri-kanya-vivah-yojana',
  },
  {
    id: 'ssy',
    name: 'Sukanya Samriddhi Yojana',
    ministry: 'Ministry of Finance',
    category: 'Women & Child',
    benefit: 'High-interest small savings scheme for girl child with tax benefits under 80C',
    eligibility: 'Account for girl child below 10 years; maximum two accounts per family',
    officialUrl: 'https://www.india.gov.in/spotlight/sukanya-samriddhi-yojana',
  },
];

export function getSchemeHref(scheme: GovernmentScheme): string {
  if (scheme.mainServiceSlug && scheme.subServiceSlug) {
    return `/services/${scheme.mainServiceSlug}/${scheme.subServiceSlug}`;
  }
  return scheme.officialUrl ?? '/schemes';
}

export function isSchemeExternal(scheme: GovernmentScheme): boolean {
  return !scheme.mainServiceSlug && Boolean(scheme.officialUrl);
}

export function filterSchemes(
  schemes: GovernmentScheme[],
  category: (typeof SCHEME_CATEGORIES)[number],
): GovernmentScheme[] {
  if (category === 'All') return schemes;
  return schemes.filter(s => s.category === category);
}
