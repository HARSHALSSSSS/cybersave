export const APPLICATION_FILTERS = [
  'All',
  'Pending',
  'Approved',
  'Rejected',
] as const;

export type ApplicationFilter = (typeof APPLICATION_FILTERS)[number];

export type ApplicationStatus =
  | 'in_progress'
  | 'approved'
  | 'rejected'
  | 'pending';

export type TimelineStep = {
  id: string;
  label: string;
  timestamp?: string;
  subtext?: string;
  state: 'completed' | 'active' | 'pending';
};

export type ApplicationRecord = {
  id: string;
  ref: string;
  title: string;
  submittedShort: string;
  submittedFull: string;
  status: ApplicationStatus;
  department: string;
  applicantName: string;
  phone: string;
  address?: string;
  feePaid?: string;
  assignedOfficer?: string;
  rejectionReason?: string;
  submittedDocuments?: Array<{ name: string; size: string }>;
  certificateNo?: string;
  certificateIssuedOn?: string;
  timeline?: TimelineStep[];
  categoryId?: string;
  optionId?: string;
  stateCode?: string;
  stateName?: string;
};

export const APPLICATIONS: ApplicationRecord[] = [
  {
    id: '1',
    ref: 'CS9824719',
    title: 'Birth Certificate',
    submittedShort: '12 May',
    submittedFull: '12 May 2024, 10:30 AM',
    status: 'in_progress',
    department: 'Municipal Health Department',
    applicantName: 'Rajesh Kumar',
    phone: '+91 98765 43210',
    feePaid: '₹55.00 (Success)',
    assignedOfficer: 'Officer Mehta (Municipal)',
    categoryId: 'certificates',
    optionId: 'birth',
    timeline: [
      {
        id: '1',
        label: 'Application Submitted',
        timestamp: '12 May 2024, 10:30 AM',
        state: 'completed',
      },
      {
        id: '2',
        label: 'Document Verification',
        timestamp: '13 May 2024, 04:15 PM',
        state: 'completed',
      },
      {
        id: '3',
        label: 'Under Processing',
        subtext: 'Est. Completion: 18 May 2024',
        state: 'active',
      },
      {
        id: '4',
        label: 'Official Approval',
        state: 'pending',
      },
      {
        id: '5',
        label: 'Certificate Generated',
        state: 'pending',
      },
    ],
  },
  {
    id: '2',
    ref: 'CS9824720',
    title: 'PAN Card',
    submittedShort: '10 May',
    submittedFull: '10 May 2024, 02:20 PM',
    status: 'approved',
    department: 'Income Tax Department',
    applicantName: 'Rajesh Kumar',
    phone: '+91 98765 43210',
    feePaid: '₹107.00 (Success)',
    certificateNo: 'PAN-8812A-98',
    certificateIssuedOn: '12 May 2024',
    categoryId: 'pan',
    optionId: 'apply-new',
  },
  {
    id: '3',
    ref: 'CS9824721',
    title: 'Income Certificate',
    submittedShort: '08 May',
    submittedFull: '08 May 2024, 11:45 AM',
    status: 'rejected',
    department: 'Revenue Department',
    applicantName: 'Rajesh Kumar',
    phone: '+91 98765 43210',
    rejectionReason:
      'Document mismatch. The signature on the submitted Aadhaar Card does not match the signature on the self-declaration form. Please re-submit with clear signatures.',
    submittedDocuments: [{ name: 'Aadhaar_Card.pdf', size: '840 KB' }],
    categoryId: 'certificates',
    optionId: 'income',
  },
  {
    id: '4',
    ref: 'CS9824722',
    title: 'Aadhaar Address Update',
    submittedShort: '05 May',
    submittedFull: '05 May 2024, 09:15 AM',
    status: 'pending',
    department: 'UIDAI',
    applicantName: 'Rajesh Kumar',
    phone: '+91 98765 43210',
    address: 'Sector 4, New Delhi',
    feePaid: '₹50.00 (Success)',
    assignedOfficer: 'Officer Sharma (SDM)',
    categoryId: 'aadhaar',
    optionId: 'update-address',
  },
];

export const STATUS_LABELS: Record<ApplicationStatus, string> = {
  in_progress: 'In Progress',
  approved: 'Approved',
  rejected: 'Rejected',
  pending: 'Pending',
};

export const STATUS_COLORS: Record<ApplicationStatus, string> = {
  in_progress: '#F59E0B',
  approved: '#10B981',
  rejected: '#EF4444',
  pending: '#2563EB',
};

export function getApplication(id: string): ApplicationRecord | undefined {
  return APPLICATIONS.find(app => app.id === id);
}

export function getFilteredApplications(
  filter: ApplicationFilter,
  query?: string,
): ApplicationRecord[] {
  let list = APPLICATIONS;

  if (filter === 'Pending') {
    list = list.filter(app => app.status === 'pending');
  } else if (filter === 'Approved') {
    list = list.filter(app => app.status === 'approved');
  } else if (filter === 'Rejected') {
    list = list.filter(app => app.status === 'rejected');
  }

  if (query?.trim()) {
    const q = query.toLowerCase();
    list = list.filter(
      app =>
        app.title.toLowerCase().includes(q) ||
        app.ref.toLowerCase().includes(q),
    );
  }

  return list;
}

export function getStatusBannerConfig(status: ApplicationStatus) {
  switch (status) {
    case 'in_progress':
      return {
        title: 'Application In Progress',
        bg: ['#2563EB', '#3B82F6'] as const,
        icon: 'progress' as const,
      };
    case 'approved':
      return {
        title: 'Application Approved',
        bg: ['#10B981', '#34D399'] as const,
        icon: 'success' as const,
      };
    case 'rejected':
      return {
        title: 'Application Rejected',
        bg: ['#EF4444', '#F87171'] as const,
        icon: 'rejected' as const,
      };
    case 'pending':
      return {
        title: 'Application Pending',
        bg: ['#2563EB', '#3B82F6'] as const,
        icon: 'pending' as const,
      };
  }
}
