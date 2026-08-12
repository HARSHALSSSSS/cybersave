import { decimalToNumber, fullName, initials } from '@/services/api/adapters';
import type {
  ApplicationCategory,
  ApplicationDetail,
  ApplicationPriority,
  ApplicationStatus,
  ApplicationSummary,
  ChecklistItem,
  InternalNote,
  PaymentInformation,
  PipelineStage,
  SupportingDocument,
  TimelineEvent,
} from '../types';

interface BackendApplicationListItem {
  id: string;
  publicRef?: string | null;
  citizenId: string;
  status: string;
  submittedAt?: string | null;
  createdAt: string;
  updatedAt: string;
  citizen?: {
    id: string;
    phone?: string;
    email?: string | null;
    firstName?: string | null;
    lastName?: string | null;
  };
  serviceVersion?: {
    overview?: { displayName?: string | null; processingTime?: string | null };
    subService?: { name?: string; mainService?: { name?: string } };
  };
  assignedOperator?: {
    id: string;
    email?: string;
    firstName?: string | null;
    lastName?: string | null;
  } | null;
  pricingSnapshot?: { totalAmount?: unknown };
}

interface BackendApplicationDetail extends BackendApplicationListItem {
  documents?: Array<{
    id: string;
    status: string;
    uploadedAt: string;
    documentRequirementId?: string | null;
    downloadUrl?: string | null;
    documentRequirement?: { id?: string; name?: string };
    storedFile?: { originalFileName?: string; mimeType?: string };
  }>;
  payment?: {
    status: string;
    amount?: unknown;
    provider?: string;
    id?: string;
    updatedAt?: string;
  } | null;
  statusHistory?: Array<{
    id: string;
    fromStatus: string;
    toStatus: string;
    comment?: string | null;
    createdAt: string;
    actorAdmin?: { firstName?: string | null; lastName?: string | null; email?: string };
  }>;
  internalNotes?: Array<{
    id: string;
    content: string;
    createdAt: string;
    authorAdmin?: { firstName?: string | null; lastName?: string | null; email?: string };
  }>;
  actionRequests?: Array<{ id: string; reason: string; status: string }>;
  fieldValues?: Array<{ fieldKey: string; value: unknown }>;
  configSnapshot?: { payload?: unknown } | null;
}

function formatFieldDisplayValue(value: unknown): string {
  if (value == null) return '—';
  if (typeof value === 'boolean') return value ? 'Yes' : 'No';
  if (typeof value === 'object') {
    try {
      const obj = value as Record<string, unknown>;
      if (typeof obj.name === 'string') return obj.name;
      return JSON.stringify(value);
    } catch {
      return String(value);
    }
  }
  return String(value);
}

function extractFormFields(app: BackendApplicationDetail): Array<{
  key: string;
  label: string;
  value: string;
  type?: string;
}> {
  const valuesMap = new Map(
    (app.fieldValues ?? []).map((fv) => [fv.fieldKey, fv.value]),
  );
  const snapshotFields: Array<{ key?: string; label?: string; type?: string }> = [];
  const payload = app.configSnapshot?.payload;

  if (payload && typeof payload === 'object') {
    const formVersion = (
      payload as { formVersion?: { fields?: Array<{ key?: string; label?: string; type?: string }> } }
    ).formVersion;
    if (Array.isArray(formVersion?.fields)) {
      snapshotFields.push(...formVersion.fields);
    }
  }

  const result: Array<{ key: string; label: string; value: string; type?: string }> = [];

  for (const field of snapshotFields) {
    if (!field.key) continue;
    const raw = valuesMap.get(field.key);
    if (raw == null || raw === '') continue;
    result.push({
      key: field.key,
      label: field.label ?? field.key,
      value: formatFieldDisplayValue(raw),
      type: field.type,
    });
  }

  for (const fv of app.fieldValues ?? []) {
    if (result.some((row) => row.key === fv.fieldKey)) continue;
    if (fv.value == null || fv.value === '') continue;
    result.push({
      key: fv.fieldKey,
      label: fv.fieldKey,
      value: formatFieldDisplayValue(fv.value),
    });
  }

  return result;
}

function extractFormFieldKeys(app: BackendApplicationDetail): string[] {
  return extractFormFields(app).map((field) => field.key);
}

function extractDocumentRequirementOptions(
  app: BackendApplicationDetail,
): Array<{ id: string; name: string }> {
  const options = new Map<string, string>();

  for (const doc of app.documents ?? []) {
    const id = doc.documentRequirementId ?? doc.documentRequirement?.id;
    if (!id) continue;
    const name =
      doc.documentRequirement?.name ?? doc.storedFile?.originalFileName ?? 'Document';
    if (!options.has(id)) {
      options.set(id, name);
    }
  }

  const payload = app.configSnapshot?.payload;
  if (payload && typeof payload === 'object') {
    const requirements = (
      payload as {
        documentRequirements?: Array<{ id?: string; name?: string }>;
      }
    ).documentRequirements;
    if (Array.isArray(requirements)) {
      for (const req of requirements) {
        if (!req.id || options.has(req.id)) continue;
        options.set(req.id, req.name ?? req.id);
      }
    }
  }

  return [...options.entries()].map(([id, name]) => ({ id, name }));
}

function mapStatus(status: string): ApplicationStatus {
  const map: Record<string, ApplicationStatus> = {
    SUBMITTED: 'submitted',
    UNDER_REVIEW: 'under_review',
    PROCESSING: 'processing',
    APPROVED: 'approved',
    COMPLETED: 'completed',
    REJECTED: 'rejected',
    ACTION_REQUIRED: 'under_review',
    PAYMENT_PENDING: 'submitted',
    DOCUMENTS_PENDING: 'submitted',
    FORM_IN_PROGRESS: 'submitted',
    DRAFT: 'submitted',
    CANCELLED: 'rejected',
  };
  return map[status] ?? 'submitted';
}

function inferCategory(app: BackendApplicationListItem): ApplicationCategory {
  const mainName = app.serviceVersion?.subService?.mainService?.name?.toLowerCase() ?? '';
  if (mainName.includes('aadhaar')) return 'Aadhaar Services';
  if (mainName.includes('pan')) return 'PAN Card';
  if (mainName.includes('certificate')) return 'Certificates';
  if (mainName.includes('bank')) return 'Banking';
  if (mainName.includes('insurance')) return 'Insurance';
  if (mainName.includes('utility')) return 'Utility';
  return 'Other';
}

function inferPriority(status: string): ApplicationPriority {
  if (status === 'ACTION_REQUIRED' || status === 'REJECTED') return 'high';
  if (status === 'UNDER_REVIEW') return 'medium';
  return 'low';
}

function operatorName(op?: BackendApplicationListItem['assignedOperator']): string | null {
  if (!op) return null;
  return fullName(op.firstName, op.lastName, op.email ?? 'Operator');
}

export function mapApplicationSummary(app: BackendApplicationListItem): ApplicationSummary {
  const citizenName = fullName(app.citizen?.firstName, app.citizen?.lastName, app.citizen?.phone ?? 'Citizen');
  const serviceName =
    app.serviceVersion?.overview?.displayName ??
    app.serviceVersion?.subService?.name ??
    'Service';

  return {
    id: app.publicRef ?? app.id,
    citizenId: app.citizenId,
    citizenName,
    citizenInitials: initials(app.citizen?.firstName, app.citizen?.lastName),
    service: serviceName,
    category: inferCategory(app),
    priority: inferPriority(app.status),
    status: mapStatus(app.status),
    assignedOperator: operatorName(app.assignedOperator),
    centre: '—',
    submittedAt: app.submittedAt ?? app.createdAt,
    slaHours: 48,
    slaRemainingHours: 24,
    amount: decimalToNumber(app.pricingSnapshot?.totalAmount),
  };
}

function mapPaymentStatus(status: string): PaymentInformation['status'] {
  if (status === 'CAPTURED') return 'paid';
  if (status === 'FAILED' || status === 'CANCELLED') return 'failed';
  return 'pending';
}

function mapDocStatus(status: string): SupportingDocument['status'] {
  if (status === 'ACCEPTED') return 'verified';
  if (status === 'REJECTED') return 'rejected';
  return 'pending';
}

export function mapApplicationDetail(app: BackendApplicationDetail): ApplicationDetail {
  const summary = mapApplicationSummary(app);

  const documents: SupportingDocument[] = (app.documents ?? []).map((doc) => ({
    id: doc.id,
    name: doc.documentRequirement?.name ?? doc.storedFile?.originalFileName ?? 'Document',
    type: doc.storedFile?.mimeType ?? 'file',
    status: mapDocStatus(doc.status),
    uploadedAt: doc.uploadedAt,
    downloadUrl: doc.downloadUrl ?? null,
    documentRequirementId: doc.documentRequirementId ?? doc.documentRequirement?.id,
  }));

  const checklist: ChecklistItem[] = (app.actionRequests ?? []).map((ar) => ({
    id: ar.id,
    label: ar.reason,
    completed: ar.status === 'RESOLVED',
  }));

  const payment: PaymentInformation = app.payment
    ? {
        status: mapPaymentStatus(app.payment.status),
        amount: decimalToNumber(app.payment.amount),
        method: app.payment.provider ?? 'Online',
        transactionId: app.payment.id ?? '—',
        paidAt: app.payment.status === 'CAPTURED' ? (app.payment.updatedAt ?? null) : null,
      }
    : {
        status: 'pending',
        amount: summary.amount,
        method: '—',
        transactionId: '—',
        paidAt: null,
      };

  const timeline: TimelineEvent[] = (app.statusHistory ?? []).map((entry) => ({
    id: entry.id,
    title: entry.toStatus.replace(/_/g, ' '),
    description: entry.comment ?? `Status changed from ${entry.fromStatus} to ${entry.toStatus}`,
    timestamp: entry.createdAt,
    actor: fullName(entry.actorAdmin?.firstName, entry.actorAdmin?.lastName, 'System'),
    completed: true,
  }));

  const notes: InternalNote[] = (app.internalNotes ?? []).map((note) => ({
    id: note.id,
    author: fullName(note.authorAdmin?.firstName, note.authorAdmin?.lastName, 'Admin'),
    authorInitials: initials(note.authorAdmin?.firstName, note.authorAdmin?.lastName),
    content: note.content,
    createdAt: note.createdAt,
  }));

  return {
    ...summary,
    documents,
    checklist: checklist.length > 0 ? checklist : [{ id: 'default', label: 'Application received', completed: true }],
    payment,
    timeline,
    notes,
    formFieldKeys: extractFormFieldKeys(app),
    formFields: extractFormFields(app),
    documentRequirementOptions: extractDocumentRequirementOptions(app),
  };
}

export function buildPipelineStages(items: BackendApplicationListItem[]): PipelineStage[] {
  const counts: Record<ApplicationStatus, number> = {
    submitted: 0,
    under_review: 0,
    processing: 0,
    approved: 0,
    completed: 0,
    rejected: 0,
  };

  for (const item of items) {
    const status = mapStatus(item.status);
    counts[status] += 1;
  }

  return [
    { key: 'submitted', label: 'Submitted', count: counts.submitted },
    { key: 'under_review', label: 'Under Review', count: counts.under_review },
    { key: 'processing', label: 'Processing', count: counts.processing },
    { key: 'approved', label: 'Approved', count: counts.approved },
    { key: 'completed', label: 'Completed', count: counts.completed },
    { key: 'rejected', label: 'Rejected', count: counts.rejected },
  ];
}
