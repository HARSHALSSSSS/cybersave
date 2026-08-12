import { decimalToNumber, fullName, initials } from '@/services/api/adapters';
import type {
  Citizen,
  CitizenDetail,
  CitizenStatus,
  CitizenServiceRecord,
  ServiceRecordStatus,
} from '../types';

interface BackendCitizen {
  id: string;
  phone: string;
  email?: string | null;
  firstName?: string | null;
  lastName?: string | null;
  status: string;
  createdAt: string;
  updatedAt: string;
  _count?: { applications?: number };
  applications?: BackendCitizenApplication[];
}

interface BackendCitizenApplication {
  id: string;
  publicRef?: string | null;
  status: string;
  createdAt: string;
  submittedAt?: string | null;
  serviceVersion?: {
    overview?: { displayName?: string | null };
    subService?: { name?: string; mainService?: { name?: string } };
  };
  pricingSnapshot?: { totalAmount?: unknown };
}

function mapCitizenStatus(status: string): CitizenStatus {
  if (status === 'SUSPENDED') return 'blocked';
  if (status === 'ACTIVE') return 'verified';
  return 'unverified';
}

function mapApplicationStatus(status: string): ServiceRecordStatus {
  switch (status) {
    case 'COMPLETED':
    case 'APPROVED':
      return 'completed';
    case 'REJECTED':
    case 'CANCELLED':
      return 'rejected';
    case 'PROCESSING':
    case 'UNDER_REVIEW':
      return 'processing';
    default:
      return 'pending';
  }
}

export function mapCitizen(row: BackendCitizen): Citizen {
  const name = fullName(row.firstName, row.lastName, row.phone);
  return {
    id: row.id,
    fullName: name,
    initials: initials(row.firstName, row.lastName),
    aadhaarMasked: 'XXXX-XXXX-XXXX',
    mobile: row.phone,
    email: row.email ?? '—',
    district: '—',
    state: '—',
    servicesUsed: row._count?.applications ?? 0,
    status: mapCitizenStatus(row.status),
    lastActive: row.updatedAt,
    joinedAt: row.createdAt,
    dob: '—',
    gender: 'Other',
    address: '—',
  };
}

function mapServiceRecord(app: BackendCitizenApplication): CitizenServiceRecord {
  const category =
    app.serviceVersion?.subService?.mainService?.name ??
    app.serviceVersion?.subService?.name ??
    'General';
  const name =
    app.serviceVersion?.overview?.displayName ??
    app.serviceVersion?.subService?.name ??
    'Service';

  return {
    id: app.publicRef ?? app.id,
    name,
    category,
    status: mapApplicationStatus(app.status),
    date: app.submittedAt ?? app.createdAt,
    amount: decimalToNumber(app.pricingSnapshot?.totalAmount),
  };
}

export function mapCitizenDetail(row: BackendCitizen): CitizenDetail {
  const base = mapCitizen(row);
  const services = (row.applications ?? []).map(mapServiceRecord);
  const totalAmountPaid = services.reduce((sum, s) => sum + s.amount, 0);

  return {
    ...base,
    services,
    documents: [],
    transactions: [],
    activity: [],
    notes: [],
    totalAmountPaid,
  };
}
