import type { ServiceCategory, ServicesStats, SubService, WorkflowStage } from '../types';

function mockSub(partial: Pick<SubService, 'id' | 'name' | 'categoryName' | 'slaHours' | 'govtFee' | 'status'> & { slug?: string }): SubService {
  return {
    slug: partial.slug ?? partial.id,
    versionStatus: partial.status === 'active' ? 'PUBLISHED' : 'DRAFT',
    assistedEnabled: true,
    manualEnabled: true,
    requiresStateSelection: false,
    stateCount: 0,
    formFieldCount: 4,
    documentCount: 2,
    ...partial,
  };
}

export const SERVICES_STATS: ServicesStats = {
  total: 32,
  active: 28,
  underMaintenance: 4,
  totalRequestsYtd: 148291,
};

export const SERVICE_CATEGORIES: ServiceCategory[] = [
  {
    id: 'cat-aadhaar',
    name: 'Aadhaar Services',
    description: 'Enrollment, updates, and corrections for Aadhaar cards',
    status: 'active',
    subServices: [
      mockSub({ id: 'svc-1', slug: 'aadhaar-address-update', name: 'Aadhaar Address Update', categoryName: 'Aadhaar Services', slaHours: 48, govtFee: 50, status: 'active' }),
      mockSub({ id: 'svc-2', slug: 'aadhaar-mobile-update', name: 'Aadhaar Mobile Number Update', categoryName: 'Aadhaar Services', slaHours: 24, govtFee: 50, status: 'active' }),
      mockSub({ id: 'svc-3', slug: 'aadhaar-new-enrollment', name: 'Aadhaar New Enrollment', categoryName: 'Aadhaar Services', slaHours: 72, govtFee: 0, status: 'active' }),
      mockSub({ id: 'svc-4', slug: 'aadhaar-biometric-update', name: 'Aadhaar Biometric Update', categoryName: 'Aadhaar Services', slaHours: 48, govtFee: 100, status: 'active' }),
      mockSub({ id: 'svc-5', slug: 'aadhaar-reprint', name: 'Aadhaar Card Reprint', categoryName: 'Aadhaar Services', slaHours: 24, govtFee: 50, status: 'active' }),
      mockSub({ id: 'svc-6', slug: 'aadhaar-name-correction', name: 'Aadhaar Name Correction', categoryName: 'Aadhaar Services', slaHours: 48, govtFee: 50, status: 'active' }),
    ],
  },
  {
    id: 'cat-pan',
    name: 'PAN Card Services',
    description: 'New PAN applications, corrections, and reprints',
    status: 'active',
    subServices: [
      mockSub({ id: 'svc-7', slug: 'pan-new', name: 'PAN Card - New Application', categoryName: 'PAN Card Services', slaHours: 72, govtFee: 107, status: 'active' }),
      mockSub({ id: 'svc-8', slug: 'pan-correction', name: 'PAN Card - Correction', categoryName: 'PAN Card Services', slaHours: 48, govtFee: 110, status: 'active' }),
      mockSub({ id: 'svc-9', slug: 'epan-download', name: 'e-PAN Download', categoryName: 'PAN Card Services', slaHours: 4, govtFee: 8, status: 'active' }),
      mockSub({ id: 'svc-10', slug: 'pan-reprint', name: 'PAN Card Reprint', categoryName: 'PAN Card Services', slaHours: 48, govtFee: 50, status: 'active' }),
    ],
  },
  {
    id: 'cat-passport',
    name: 'Passport Services',
    description: 'Fresh passport applications, renewals, and reissues',
    status: 'active',
    subServices: [
      mockSub({ id: 'svc-11', slug: 'passport-new', name: 'Passport - New Application', categoryName: 'Passport Services', slaHours: 240, govtFee: 1500, status: 'active' }),
      mockSub({ id: 'svc-12', slug: 'passport-renewal', name: 'Passport Renewal', categoryName: 'Passport Services', slaHours: 168, govtFee: 1500, status: 'active' }),
      mockSub({ id: 'svc-13', slug: 'passport-reissue', name: 'Passport Reissue (Lost/Damaged)', categoryName: 'Passport Services', slaHours: 240, govtFee: 3000, status: 'active' }),
    ],
  },
  {
    id: 'cat-birth-death',
    name: 'Birth & Death Certificates',
    description: 'Registration and correction of birth and death records',
    status: 'maintenance',
    subServices: [
      mockSub({ id: 'svc-14', slug: 'birth-certificate', name: 'Birth Certificate', categoryName: 'Birth & Death Certificates', slaHours: 24, govtFee: 50, status: 'maintenance' }),
      mockSub({ id: 'svc-15', slug: 'death-certificate', name: 'Death Certificate', categoryName: 'Birth & Death Certificates', slaHours: 24, govtFee: 50, status: 'maintenance' }),
      mockSub({ id: 'svc-16', slug: 'certificate-correction', name: 'Certificate Correction', categoryName: 'Birth & Death Certificates', slaHours: 48, govtFee: 30, status: 'maintenance' }),
    ],
  },
  {
    id: 'cat-income-asset',
    name: 'Income & Asset Certificates',
    description: 'Income, caste, domicile, and asset certification services',
    status: 'active',
    subServices: [
      mockSub({ id: 'svc-17', slug: 'income-certificate', name: 'Income Certificate', categoryName: 'Income & Asset Certificates', slaHours: 24, govtFee: 30, status: 'active' }),
      mockSub({ id: 'svc-18', slug: 'caste-certificate', name: 'Caste Certificate', categoryName: 'Income & Asset Certificates', slaHours: 48, govtFee: 30, status: 'active' }),
      mockSub({ id: 'svc-19', slug: 'domicile-certificate', name: 'Domicile Certificate', categoryName: 'Income & Asset Certificates', slaHours: 48, govtFee: 30, status: 'active' }),
      mockSub({ id: 'svc-20', slug: 'asset-certificate', name: 'Asset Certificate', categoryName: 'Income & Asset Certificates', slaHours: 72, govtFee: 50, status: 'active' }),
    ],
  },
];

export const SERVICE_CATEGORY_OPTIONS = SERVICE_CATEGORIES.map((category) => category.name);

export const DEFAULT_WORKFLOW_STAGES: WorkflowStage[] = [
  {
    id: 'stage-1',
    title: 'Application Submission',
    description: 'Citizen submits the application with required details and documents online or at a centre.',
  },
  {
    id: 'stage-2',
    title: 'Document Verification',
    description: 'Operator verifies uploaded documents against the required checklist.',
  },
  {
    id: 'stage-3',
    title: 'Processing',
    description: 'Application is processed and validated by the back-office team.',
  },
  {
    id: 'stage-4',
    title: 'Approval',
    description: 'Supervisor reviews and approves the processed application.',
  },
  {
    id: 'stage-5',
    title: 'Completion & Dispatch',
    description: 'Final document is generated and dispatched or made available for download.',
  },
];
