import type { ApplicationDetail, BackendApplicationStatus } from '@/services/api';

export function formatFieldDisplayValue(value: unknown): string {
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

export function extractApplicantFields(app: ApplicationDetail): Array<{
  key: string;
  label: string;
  value: string;
}> {
  const valuesMap = new Map(app.fieldValues.map(fv => [fv.fieldKey, fv.value]));
  const snapshotFields: Array<{ key?: string; label?: string }> = [];
  const payload = (app as ApplicationDetail & { configSnapshot?: { payload?: unknown } })
    .configSnapshot?.payload;

  if (payload && typeof payload === 'object') {
    const formPayload = payload as {
      form?: { fields?: Array<{ key?: string; label?: string }> };
      formVersion?: { fields?: Array<{ key?: string; label?: string }> };
    };
    const fields = formPayload.form?.fields ?? formPayload.formVersion?.fields;
    if (Array.isArray(fields)) snapshotFields.push(...fields);
  }

  const result: Array<{ key: string; label: string; value: string }> = [];

  for (const field of snapshotFields) {
    if (!field.key) continue;
    result.push({
      key: field.key,
      label: field.label ?? field.key.replace(/_/g, ' '),
      value: formatFieldDisplayValue(valuesMap.get(field.key)),
    });
  }

  for (const fv of app.fieldValues) {
    if (result.some(row => row.key === fv.fieldKey)) continue;
    result.push({
      key: fv.fieldKey,
      label: fv.fieldKey.replace(/_/g, ' '),
      value: formatFieldDisplayValue(fv.value),
    });
  }

  return result;
}

export function extractDocumentRequirements(app: ApplicationDetail): Array<{ id: string; name: string }> {
  const options = new Map<string, string>();

  for (const doc of app.documents) {
    const id = doc.documentRequirementId ?? doc.documentRequirement?.id;
    if (!id) continue;
    options.set(id, doc.documentRequirement?.name ?? 'Document');
  }

  const payload = (app as ApplicationDetail & { configSnapshot?: { payload?: unknown } })
    .configSnapshot?.payload;
  if (payload && typeof payload === 'object') {
    const requirements = (payload as { documentRequirements?: Array<{ id?: string; name?: string }> })
      .documentRequirements;
    if (Array.isArray(requirements)) {
      for (const req of requirements) {
        if (!req.id) continue;
        options.set(req.id, req.name ?? req.id);
      }
    }
  }

  return [...options.entries()].map(([id, name]) => ({ id, name }));
}

export function getExpectedCompletionDate(app: ApplicationDetail): Date | null {
  const base = app.submittedAt ?? app.createdAt;
  if (!base) return null;

  const processingTime = app.serviceVersion.overview?.processingTime ?? '';
  const match = processingTime.match(/(\d+)\s*[-–to]+\s*(\d+)/i);
  const days = match ? Number(match[2]) : Number(processingTime.match(/(\d+)/)?.[1] ?? 7);

  const date = new Date(base);
  date.setDate(date.getDate() + (Number.isFinite(days) ? days : 7));
  return date;
}

export function getStepDate(
  app: ApplicationDetail,
  stepKey: string,
): string | null {
  const history = [...app.statusHistory].reverse();
  const mapping: Record<string, BackendApplicationStatus[]> = {
    submitted: ['SUBMITTED'],
    verified: ['UNDER_REVIEW', 'PROCESSING'],
    review: ['UNDER_REVIEW', 'PROCESSING', 'ACTION_REQUIRED'],
    approval: ['APPROVED'],
    issued: ['COMPLETED', 'APPROVED'],
  };

  const statuses = mapping[stepKey] ?? [];
  const entry = history.find(h => statuses.includes(h.toStatus));
  return entry?.createdAt ?? null;
}

export const TRACKER_STEPS = [
  { key: 'submitted', label: 'Submitted', sub: 'Application received' },
  { key: 'verified', label: 'Documents Verified', sub: 'All docs checked' },
  { key: 'review', label: 'Under Review', sub: 'At Revenue Dept' },
  { key: 'approval', label: 'Approval', sub: 'Pending Signature' },
  { key: 'issued', label: 'Cert Generated', sub: 'Final Issuance' },
] as const;

export function getStepState(
  stepKey: string,
  status: BackendApplicationStatus,
): 'done' | 'active' | 'pending' {
  const order = TRACKER_STEPS.map(s => s.key);
  const idx = order.indexOf(stepKey as (typeof order)[number]);

  if (['APPROVED', 'COMPLETED'].includes(status)) return 'done';
  if (status === 'PAYMENT_PENDING') {
    if (stepKey === 'submitted') return 'done';
    return 'pending';
  }
  if (['SUBMITTED'].includes(status)) {
    if (idx === 0) return 'done';
    if (idx === 1) return 'active';
    return 'pending';
  }
  if (['UNDER_REVIEW', 'PROCESSING', 'ACTION_REQUIRED'].includes(status)) {
    if (idx <= 1) return 'done';
    if (idx === 2) return 'active';
    return 'pending';
  }
  if (idx === 0) return 'active';
  return 'pending';
}

export function statusHistoryLabel(entry: ApplicationDetail['statusHistory'][number]): string {
  const status = entry.toStatus.replace(/_/g, ' ');
  if (entry.comment) return entry.comment;
  if (entry.toStatus === 'UNDER_REVIEW') return 'Under Review at Revenue Department';
  if (entry.toStatus === 'SUBMITTED') return 'Application Form Submitted & Payment Settled';
  if (entry.toStatus === 'APPROVED') return 'Application Approved';
  if (entry.toStatus === 'COMPLETED') return 'Certificate Generated';
  return status.charAt(0) + status.slice(1).toLowerCase();
}
