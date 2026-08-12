import { apiClient } from '@/services/api/client';
import { unwrapApiResponse, unwrapPaginated } from '@/services/api/types';
import type {
  Citizen,
  CitizenDetail,
  CitizenStatus,
  SendNotificationPayload,
  UsersStats,
} from '../types';

interface BackendCitizen {
  id: string;
  phone: string;
  email?: string | null;
  firstName?: string | null;
  lastName?: string | null;
  status: string;
  createdAt: string;
  updatedAt?: string;
  _count?: { applications: number };
}

function mapStatus(status: string): CitizenStatus {
  if (status === 'ACTIVE') return 'verified';
  if (status === 'SUSPENDED') return 'blocked';
  return 'unverified';
}

function mapCitizen(c: BackendCitizen): Citizen {
  const fullName = [c.firstName, c.lastName].filter(Boolean).join(' ') || 'Citizen';
  const initials = fullName
    .split(' ')
    .map(part => part[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();

  return {
    id: c.id,
    fullName,
    initials,
    aadhaarMasked: 'XXXX-XXXX-XXXX',
    mobile: c.phone,
    email: c.email ?? '—',
    district: '—',
    state: '—',
    servicesUsed: c._count?.applications ?? 0,
    status: mapStatus(c.status),
    lastActive: c.updatedAt ?? c.createdAt,
    joinedAt: c.createdAt,
    dob: '—',
    gender: 'Other',
    address: '—',
  };
}

export interface GetCitizensParams {
  search?: string;
  status?: CitizenStatus | 'all';
  district?: string;
  page?: number;
  pageSize?: number;
}

export interface GetCitizensResult {
  data: Citizen[];
  total: number;
  page: number;
  pageSize: number;
}

export async function getUsersStats(): Promise<UsersStats> {
  const result = await getCitizens({ page: 1, pageSize: 1 });
  return {
    totalCitizens: result.total,
    active: result.total,
    newThisMonth: 0,
    pendingVerification: 0,
  };
}

export async function getCitizens(params: GetCitizensParams = {}): Promise<GetCitizensResult> {
  const { search = '', page = 1, pageSize = 10, status = 'all' } = params;
  const response = await apiClient.get('/admin/citizens', {
    params: { page, limit: pageSize, search: search.trim() || undefined },
  });
  const { data, meta } = unwrapPaginated<BackendCitizen[]>(response);
  let citizens = data.map(mapCitizen);

  if (status !== 'all') {
    citizens = citizens.filter(c => c.status === status);
  }

  return {
    data: citizens,
    total: Number(meta?.total ?? citizens.length),
    page,
    pageSize,
  };
}

export async function getCitizenById(citizenId: string): Promise<CitizenDetail> {
  const response = await apiClient.get(`/admin/citizens/${citizenId}`);
  const raw = unwrapApiResponse<BackendCitizen>(response);
  const base = mapCitizen(raw);
  return {
    ...base,
    services: [],
    documents: [],
    transactions: [],
    activity: [],
    notes: [],
    totalAmountPaid: 0,
  };
}

export async function sendCitizenNotification(
  payload: SendNotificationPayload,
): Promise<{ success: true }> {
  await apiClient.post('/admin/notifications/send', {
    citizenIds: [payload.citizenId],
    title: payload.subject,
    body: payload.message,
  });
  return { success: true };
}

export const usersService = {
  getUsersStats,
  getCitizens,
  getCitizenById,
  sendCitizenNotification,
};
