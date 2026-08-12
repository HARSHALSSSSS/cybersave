export type CitizenStatus = 'verified' | 'unverified' | 'blocked';

export interface Citizen {
  id: string;
  fullName: string;
  initials: string;
  aadhaarMasked: string;
  mobile: string;
  email: string;
  district: string;
  state: string;
  servicesUsed: number;
  status: CitizenStatus;
  lastActive: string;
  joinedAt: string;
  dob: string;
  gender: 'Male' | 'Female' | 'Other';
  address: string;
}

export interface UsersStats {
  totalCitizens: number;
  active: number;
  newThisMonth: number;
  pendingVerification: number;
}

export type ServiceRecordStatus = 'completed' | 'processing' | 'pending' | 'rejected';

export interface CitizenServiceRecord {
  id: string;
  name: string;
  category: string;
  status: ServiceRecordStatus;
  date: string;
  amount: number;
}

export interface CitizenDocument {
  id: string;
  name: string;
  type: string;
  uploadedAt: string;
  sizeKb: number;
  verified: boolean;
}

export interface CitizenTransaction {
  id: string;
  service: string;
  amount: number;
  mode: 'Online' | 'Cash';
  status: 'success' | 'failed' | 'pending';
  date: string;
}

export interface CitizenActivity {
  id: string;
  action: string;
  description: string;
  timestamp: string;
}

export interface CitizenNote {
  id: string;
  author: string;
  authorInitials: string;
  content: string;
  createdAt: string;
}

export interface CitizenDetail extends Citizen {
  services: CitizenServiceRecord[];
  documents: CitizenDocument[];
  transactions: CitizenTransaction[];
  activity: CitizenActivity[];
  notes: CitizenNote[];
  totalAmountPaid: number;
}

export type NotificationType = 'email' | 'sms' | 'push';

export interface SendNotificationPayload {
  citizenId: string;
  type: NotificationType;
  subject: string;
  message: string;
}
