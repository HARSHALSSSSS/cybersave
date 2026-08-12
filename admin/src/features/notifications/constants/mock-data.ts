import type { NotificationItem, NotificationsStats } from '../types';

export const NOTIFICATIONS_STATS: NotificationsStats = {
  total: 156,
  unread: 12,
  successLogs: 118,
  pendingChecks: 26,
};

export const CATEGORY_OPTIONS: { value: NotificationItem['category']; label: string }[] = [
  { value: 'security', label: 'Security Alerts' },
  { value: 'expiry', label: 'Expiry Warnings' },
  { value: 'document', label: 'Document Updates' },
  { value: 'support', label: 'Support Requests' },
];

export const PRIORITY_OPTIONS: { value: NotificationItem['priority']; label: string }[] = [
  { value: 'high', label: 'High' },
  { value: 'medium', label: 'Medium' },
  { value: 'low', label: 'Low' },
];

export const NOTIFICATIONS: NotificationItem[] = [
  {
    id: 'NTF-2024-96',
    category: 'security',
    categoryLabel: 'SECURITY ALERT',
    priority: 'high',
    title: 'Suspicious Login Attempt Detected',
    description:
      'Multiple failed login attempts detected on operator account akumar@cybersave.gov from an unrecognised device in Warangal.',
    timestamp: '2026-08-06T21:58:00',
    read: false,
  },
  {
    id: 'NTF-2024-95',
    category: 'expiry',
    categoryLabel: 'EXPIRY WARNING',
    priority: 'high',
    title: 'Aadhaar Card Expiring Soon',
    description:
      'Citizen Priya Sharma\u2019s Aadhaar address proof document is set to expire in 5 days and requires re-verification.',
    timestamp: '2026-08-06T20:40:00',
    read: false,
  },
  {
    id: 'NTF-2024-94',
    category: 'document',
    categoryLabel: 'DOCUMENT UPDATE',
    priority: 'medium',
    title: 'Document Verification Completed',
    description:
      'PAN card upload for application APP-2026-8470 has been verified and approved by the review team.',
    timestamp: '2026-08-06T19:15:00',
    read: false,
  },
  {
    id: 'NTF-2024-93',
    category: 'support',
    categoryLabel: 'SUPPORT REQUEST',
    priority: 'medium',
    title: 'New Support Ticket Raised',
    description:
      'Citizen Rahul Verma raised a ticket regarding a delayed refund for a rejected Income Certificate application.',
    timestamp: '2026-08-06T18:02:00',
    read: false,
  },
  {
    id: 'NTF-2024-92',
    category: 'security',
    categoryLabel: 'SECURITY ALERT',
    priority: 'high',
    title: 'Failed Login Attempts Blocked',
    description:
      'Account temporarily locked after 5 consecutive failed login attempts from IP 203.0.113.24. Manual unlock required.',
    timestamp: '2026-08-06T16:47:00',
    read: false,
  },
  {
    id: 'NTF-2024-91',
    category: 'document',
    categoryLabel: 'DOCUMENT UPDATE',
    priority: 'low',
    title: 'PAN Card Upload Verified',
    description:
      'Automated OCR verification confirmed the uploaded PAN card image matches submitted applicant details.',
    timestamp: '2026-08-06T15:20:00',
    read: false,
  },
  {
    id: 'NTF-2024-90',
    category: 'expiry',
    categoryLabel: 'EXPIRY WARNING',
    priority: 'medium',
    title: 'Passport Renewal Reminder',
    description:
      'Passport renewal window closes in 15 days for 3 pending applications assigned to the Adilabad centre.',
    timestamp: '2026-08-06T13:55:00',
    read: true,
  },
  {
    id: 'NTF-2024-89',
    category: 'support',
    categoryLabel: 'SUPPORT REQUEST',
    priority: 'low',
    title: 'Citizen Feedback Submitted',
    description:
      'A 4-star service rating with comments was submitted for the Banjara Hills service centre counter 3.',
    timestamp: '2026-08-06T11:30:00',
    read: true,
  },
  {
    id: 'NTF-2024-88',
    category: 'security',
    categoryLabel: 'SECURITY ALERT',
    priority: 'medium',
    title: 'Password Policy Updated',
    description:
      'Portal-wide password policy updated to require 12+ characters. All operators must reset credentials within 7 days.',
    timestamp: '2026-08-06T10:05:00',
    read: true,
  },
  {
    id: 'NTF-2024-87',
    category: 'document',
    categoryLabel: 'DOCUMENT UPDATE',
    priority: 'medium',
    title: 'Bulk Document Sync Completed',
    description:
      'Nightly sync uploaded 342 new supporting documents from field kiosks to the central document store.',
    timestamp: '2026-08-06T06:00:00',
    read: true,
  },
  {
    id: 'NTF-2024-86',
    category: 'expiry',
    categoryLabel: 'EXPIRY WARNING',
    priority: 'high',
    title: 'Service Licence Renewal Due',
    description:
      'The Khammam service centre operating licence expires in 3 days. Renewal paperwork has not yet been filed.',
    timestamp: '2026-08-05T22:18:00',
    read: true,
  },
  {
    id: 'NTF-2024-85',
    category: 'support',
    categoryLabel: 'SUPPORT REQUEST',
    priority: 'low',
    title: 'Callback Request Scheduled',
    description:
      'Citizen Sunita Patel requested a callback to discuss a pending Bank Account Opening application status.',
    timestamp: '2026-08-05T19:42:00',
    read: true,
  },
  {
    id: 'NTF-2024-84',
    category: 'security',
    categoryLabel: 'SECURITY ALERT',
    priority: 'low',
    title: 'New Device Login Confirmed',
    description:
      'Operator Meena Iyer successfully verified a new device login via OTP from the Medak service centre.',
    timestamp: '2026-08-05T17:10:00',
    read: true,
  },
  {
    id: 'NTF-2024-83',
    category: 'document',
    categoryLabel: 'DOCUMENT UPDATE',
    priority: 'low',
    title: 'Address Proof Re-uploaded',
    description:
      'Citizen Deepika Rao re-uploaded an updated electricity bill as address proof for pending verification.',
    timestamp: '2026-08-05T14:33:00',
    read: true,
  },
  {
    id: 'NTF-2024-82',
    category: 'expiry',
    categoryLabel: 'EXPIRY WARNING',
    priority: 'medium',
    title: 'Insurance Policy Lapsing',
    description:
      'Health insurance policy linked to application APP-2026-8465 lapses in 10 days pending premium confirmation.',
    timestamp: '2026-08-05T11:05:00',
    read: true,
  },
  {
    id: 'NTF-2024-81',
    category: 'support',
    categoryLabel: 'SUPPORT REQUEST',
    priority: 'medium',
    title: 'Escalation Acknowledged',
    description:
      'Supervisor Ravi Teja acknowledged the escalated ticket regarding delayed Passport Renewal processing.',
    timestamp: '2026-08-05T09:20:00',
    read: true,
  },
  {
    id: 'NTF-2024-80',
    category: 'security',
    categoryLabel: 'SECURITY ALERT',
    priority: 'medium',
    title: 'Role Permissions Modified',
    description:
      'Admin Kavita Joshi updated role permissions for the Operator group, granting document export access.',
    timestamp: '2026-08-04T20:55:00',
    read: true,
  },
  {
    id: 'NTF-2024-79',
    category: 'document',
    categoryLabel: 'DOCUMENT UPDATE',
    priority: 'high',
    title: 'Document Rejected — Action Needed',
    description:
      'Birth Certificate submission for CIT-00478 was rejected due to a mismatched applicant name; resubmission required.',
    timestamp: '2026-08-04T18:12:00',
    read: true,
  },
  {
    id: 'NTF-2024-78',
    category: 'expiry',
    categoryLabel: 'EXPIRY WARNING',
    priority: 'low',
    title: 'Certificate Validity Ending',
    description:
      'Income Certificate for citizen Manoj Kumar reaches its 1-year validity limit in 20 days.',
    timestamp: '2026-08-04T15:47:00',
    read: true,
  },
  {
    id: 'NTF-2024-77',
    category: 'support',
    categoryLabel: 'SUPPORT REQUEST',
    priority: 'high',
    title: 'Payment Dispute Raised',
    description:
      'Citizen Arjun Mehta disputed a duplicate government fee charge on a Utility service application.',
    timestamp: '2026-08-04T13:02:00',
    read: true,
  },
  {
    id: 'NTF-2024-76',
    category: 'security',
    categoryLabel: 'SECURITY ALERT',
    priority: 'low',
    title: 'Scheduled Security Audit Completed',
    description:
      'Quarterly security audit of the citizen portal completed with no critical vulnerabilities found.',
    timestamp: '2026-08-04T09:30:00',
    read: true,
  },
  {
    id: 'NTF-2024-75',
    category: 'document',
    categoryLabel: 'DOCUMENT UPDATE',
    priority: 'medium',
    title: 'Digital Signature Applied',
    description:
      'Approved certificates for 28 applications were digitally signed and queued for citizen download.',
    timestamp: '2026-08-03T22:14:00',
    read: true,
  },
  {
    id: 'NTF-2024-74',
    category: 'expiry',
    categoryLabel: 'EXPIRY WARNING',
    priority: 'medium',
    title: 'Vendor Contract Renewal Due',
    description:
      'The biometric scanner maintenance contract for Nalgonda centre is due for renewal within 30 days.',
    timestamp: '2026-08-03T19:00:00',
    read: true,
  },
  {
    id: 'NTF-2024-73',
    category: 'support',
    categoryLabel: 'SUPPORT REQUEST',
    priority: 'low',
    title: 'Onboarding Query Resolved',
    description:
      'A new operator\u2019s onboarding query about workflow assignment permissions was resolved by IT support.',
    timestamp: '2026-08-03T16:25:00',
    read: true,
  },
];
