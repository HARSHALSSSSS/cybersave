import { Link, useNavigate, useParams } from 'react-router';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useState } from 'react';
import {
  AlertTriangle,
  ArrowLeft,
  Check,
  CreditCard,
  Download,
  HelpCircle,
  Shield,
  Upload,
} from 'lucide-react';
import { toast } from 'sonner';
import {
  PortalCard,
  ProgressBar,
  StatusPill,
} from '@/components/ui/portal-primitives';
import { Button, Input, Label } from '@/components/ui/button';
import { LoadingBlock, EmptyState } from '@/components/ui/primitives';
import { buildApplyUrl } from '@/features/apply/utils/apply-flow';
import { getApplicationProgress } from '@/features/home/utils/home-utils';
import {
  applicationsApi,
  applicationsQueryKeys,
  type ApplicationDetail,
  type BackendApplicationStatus,
} from '@/services/api';
import { formatCurrency, formatDate } from '@/lib/utils';
import { cn } from '@/lib/utils';

const TRACKER_STEPS = [
  { key: 'submitted', label: 'Submitted', sub: 'Application received' },
  { key: 'verified', label: 'Documents Verified', sub: 'All docs checked' },
  { key: 'review', label: 'Under Review', sub: 'At Revenue Dept' },
  { key: 'approval', label: 'Approval', sub: 'Pending Signature' },
  { key: 'issued', label: 'Cert Generated', sub: 'Final Issuance' },
] as const;

function getStepState(
  stepKey: string,
  status: BackendApplicationStatus,
): 'done' | 'active' | 'pending' {
  const order = ['submitted', 'verified', 'review', 'approval', 'issued'];
  const idx = order.indexOf(stepKey);

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

function statusPillTone(status: BackendApplicationStatus) {
  if (['APPROVED', 'COMPLETED'].includes(status)) return 'green' as const;
  if (status === 'ACTION_REQUIRED' || status === 'PAYMENT_PENDING') return 'amber' as const;
  if (status === 'REJECTED') return 'red' as const;
  return 'blue' as const;
}

export function ApplicationDetailPage() {
  const { id = '' } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [correctionValues, setCorrectionValues] = useState<Record<string, string>>({});

  const { data: app, isLoading, isError } = useQuery({
    queryKey: applicationsQueryKeys.detail(id),
    queryFn: () => applicationsApi.getApplicationById(id),
    enabled: Boolean(id),
  });

  const submitCorrection = useMutation({
    mutationFn: () => applicationsApi.submitCorrection(id, correctionValues),
    onSuccess: () => {
      toast.success('Corrections submitted');
      void queryClient.invalidateQueries({ queryKey: applicationsQueryKeys.detail(id) });
    },
    onError: () => toast.error('Could not submit corrections'),
  });

  if (isLoading) return <LoadingBlock className="h-96" />;
  if (isError || !app) {
    return (
      <EmptyState title="Application not found" description="This application may have been removed." />
    );
  }

  return (
    <ApplicationDetailContent
      app={app}
      navigate={navigate}
      correctionValues={correctionValues}
      setCorrectionValues={setCorrectionValues}
      onSubmitCorrection={() => submitCorrection.mutate()}
      correctionLoading={submitCorrection.isPending}
    />
  );
}

function ApplicationDetailContent({
  app,
  navigate,
  correctionValues,
  setCorrectionValues,
  onSubmitCorrection,
  correctionLoading,
}: {
  app: ApplicationDetail;
  navigate: ReturnType<typeof useNavigate>;
  correctionValues: Record<string, string>;
  setCorrectionValues: React.Dispatch<React.SetStateAction<Record<string, string>>>;
  onSubmitCorrection: () => void;
  correctionLoading: boolean;
}) {
  const title = app.serviceVersion.overview?.displayName ?? app.serviceVersion.subService.name;
  const ref = app.publicRef ?? `CS-${app.id.slice(0, 8).toUpperCase()}`;
  const needsPayment = app.status === 'PAYMENT_PENDING';
  const isCompleted = ['APPROVED', 'COMPLETED'].includes(app.status);
  const total = Number(app.pricingSnapshot?.totalAmount ?? app.payment?.amount ?? 0);
  const openAction = app.actionRequests?.find(r => r.status === 'OPEN');
  const sub = app.serviceVersion.subService;
  const progress = getApplicationProgress(app.status);
  const missingDocs = openAction?.requiredDocumentIds ?? [];

  return (
    <div className="space-y-8 pb-4">
      <Link
        to="/applications"
        className="inline-flex items-center gap-2 text-sm font-semibold text-[#2563EB]"
      >
        <ArrowLeft className="h-4 w-4" /> Back to Applications
      </Link>

      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <div className="flex flex-wrap items-center gap-3">
            <h1 className="font-display text-3xl font-bold text-[#0A1629]">{title}</h1>
            <StatusPill tone={statusPillTone(app.status)}>
              {app.status.replace(/_/g, ' ')}
            </StatusPill>
          </div>
          <p className="mt-2 text-sm text-[#64748B]">Application ID: {ref}</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button variant="outline" size="sm">
            <Download className="mr-2 h-4 w-4" />
            Download Receipt
          </Button>
          <Link to="/help">
            <Button size="sm">
              <HelpCircle className="mr-2 h-4 w-4" />
              Contact Support
            </Button>
          </Link>
        </div>
      </div>

      {/* Action required banner */}
      {openAction || app.status === 'ACTION_REQUIRED' ? (
        <PortalCard className="border-amber-200 bg-amber-50/60">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div className="flex items-start gap-3">
              <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0 text-amber-600" />
              <div>
                <p className="font-semibold text-[#0A1629]">Action needed on your application</p>
                <p className="mt-1 text-sm text-[#64748B]">
                  {openAction?.instructions ??
                    openAction?.reason ??
                    'Please update the requested details so processing can continue.'}
                </p>
                {openAction?.deadline ? (
                  <p className="mt-2 text-sm font-semibold text-amber-800">
                    Please update by {formatDate(openAction.deadline, 'long')}
                  </p>
                ) : null}
              </div>
            </div>
            <div className="flex flex-wrap gap-2">
              {(openAction?.requiredDocumentIds.length ?? 0) > 0 || missingDocs.length > 0 ? (
                <Button
                  size="sm"
                  className="bg-amber-600 hover:bg-amber-700"
                  onClick={() =>
                    navigate(buildApplyUrl(sub.mainService.slug, sub.slug, app.id, 'documents'))
                  }
                >
                  <Upload className="mr-2 h-4 w-4" />
                  Update Documents
                </Button>
              ) : null}
              {(openAction?.requiredFieldKeys.length ?? 0) > 0 ? (
                <Button
                  size="sm"
                  variant="outline"
                  className="border-amber-300"
                  onClick={() =>
                    navigate(buildApplyUrl(sub.mainService.slug, sub.slug, app.id, 'form'))
                  }
                >
                  Update Form
                </Button>
              ) : null}
            </div>
          </div>
        </PortalCard>
      ) : null}

      {/* Summary banner */}
      <PortalCard className="bg-[#F8FAFC]">
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          <div>
            <p className="text-xs font-semibold text-[#64748B] uppercase">Submission Date</p>
            <p className="mt-1 font-semibold text-[#0A1629]">
              {formatDate(app.submittedAt ?? app.createdAt, 'long')}
            </p>
          </div>
          <div>
            <p className="text-xs font-semibold text-[#64748B] uppercase">Expected Completion</p>
            <p className="mt-1 font-semibold text-[#0A1629]">
              {formatDate(app.updatedAt, 'long')}
            </p>
          </div>
          <div className="sm:col-span-2">
            <div className="flex items-center justify-between">
              <p className="text-xs font-semibold text-[#64748B] uppercase">Verification Progress</p>
              <span className="text-sm font-bold text-[#2563EB]">{progress}%</span>
            </div>
            <ProgressBar value={progress} className="mt-2" />
          </div>
        </div>
        <p className="mt-4 flex items-center gap-2 text-xs text-[#64748B]">
          <Shield className="h-3.5 w-3.5 text-[#2563EB]" />
          Central Government secure verification standard
        </p>
      </PortalCard>

      {/* Status stepper */}
      <PortalCard>
        <h2 className="font-display text-lg font-bold text-[#0A1629]">Application Status History</h2>
        <ol className="mt-6 flex flex-wrap justify-between gap-4">
          {TRACKER_STEPS.map((step, index) => {
            const state = getStepState(step.key, app.status);
            return (
              <li key={step.key} className="flex min-w-[100px] flex-1 flex-col items-center text-center">
                <div className="flex w-full items-center">
                  {index > 0 ? (
                    <div className={cn('h-0.5 flex-1', state !== 'pending' ? 'bg-[#2563EB]' : 'bg-[#E8EDF5]')} />
                  ) : (
                    <div className="flex-1" />
                  )}
                  <span
                    className={cn(
                      'flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-sm font-bold',
                      state === 'done' && 'bg-[#2563EB] text-white',
                      state === 'active' && 'bg-[#0A1629] text-white ring-4 ring-[#2563EB]/20',
                      state === 'pending' && 'border-2 border-[#E2E8F0] bg-white text-[#94A3B8]',
                    )}
                  >
                    {state === 'done' ? <Check className="h-4 w-4" strokeWidth={3} /> : index + 1}
                  </span>
                  {index < TRACKER_STEPS.length - 1 ? (
                    <div className={cn('h-0.5 flex-1', state === 'done' ? 'bg-[#2563EB]' : 'bg-[#E8EDF5]')} />
                  ) : (
                    <div className="flex-1" />
                  )}
                </div>
                <p className="mt-2 text-xs font-semibold text-[#0A1629]">{step.label}</p>
                <p className="text-[10px] text-[#94A3B8]">{step.sub}</p>
              </li>
            );
          })}
        </ol>
      </PortalCard>

      {/* Details grid */}
      <div className="grid gap-6 lg:grid-cols-2">
        {app.fieldValues.length > 0 ? (
          <PortalCard>
            <h2 className="font-display text-lg font-bold text-[#0A1629]">Applicant Details</h2>
            <dl className="mt-4 space-y-4">
              {app.fieldValues.slice(0, 8).map(fv => (
                <div key={fv.id} className="border-b border-[#F1F5F9] pb-3 last:border-0">
                  <dt className="text-xs font-semibold text-[#94A3B8] uppercase">
                    {fv.fieldKey.replace(/_/g, ' ')}
                  </dt>
                  <dd className="mt-1 text-sm font-semibold text-[#0A1629]">
                    {String(fv.value ?? '—')}
                  </dd>
                </div>
              ))}
            </dl>
          </PortalCard>
        ) : null}

        <PortalCard>
          <h2 className="font-display text-lg font-bold text-[#0A1629]">Service & Fee Details</h2>
          <dl className="mt-4 space-y-4">
            <div className="border-b border-[#F1F5F9] pb-3">
              <dt className="text-xs font-semibold text-[#94A3B8] uppercase">Service Requested</dt>
              <dd className="mt-1 text-sm font-semibold text-[#0A1629]">{title}</dd>
            </div>
            <div className="border-b border-[#F1F5F9] pb-3">
              <dt className="text-xs font-semibold text-[#94A3B8] uppercase">Department</dt>
              <dd className="mt-1 text-sm font-semibold text-[#0A1629]">
                {app.serviceVersion.overview?.department ?? sub.mainService.name}
              </dd>
            </div>
            <div className="border-b border-[#F1F5F9] pb-3">
              <dt className="text-xs font-semibold text-[#94A3B8] uppercase">Administrative Fee</dt>
              <dd className="mt-1 flex items-center gap-2">
                <span className="text-sm font-semibold text-[#0A1629]">{formatCurrency(total)}</span>
                {app.payment?.status === 'CAPTURED' || isCompleted ? (
                  <StatusPill tone="green">PAID</StatusPill>
                ) : needsPayment ? (
                  <StatusPill tone="amber">PENDING</StatusPill>
                ) : null}
              </dd>
            </div>
          </dl>
        </PortalCard>
      </div>

      {/* Documents */}
      <PortalCard>
        <h2 className="font-display text-lg font-bold text-[#0A1629]">Submitted Documents</h2>
        <ul className="mt-4 space-y-3">
          {app.documents.length === 0 ? (
            <li className="text-sm text-[#94A3B8]">No documents uploaded yet</li>
          ) : (
            app.documents.map(doc => (
              <li
                key={doc.id}
                className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-[#F1F5F9] bg-[#F8FAFC] px-4 py-3"
              >
                <div className="flex items-center gap-3">
                  <Check className="h-5 w-5 text-emerald-500" />
                  <div>
                    <p className="text-sm font-semibold text-[#0A1629]">
                      {doc.documentRequirement?.name ?? 'Document'}
                    </p>
                    <p className="text-xs text-[#94A3B8]">
                      {doc.storedFile?.originalFileName ?? 'Uploaded file'}
                    </p>
                  </div>
                </div>
                <button type="button" className="text-sm font-semibold text-[#2563EB]">
                  View Document
                </button>
              </li>
            ))
          )}
        </ul>

        {(openAction || missingDocs.length > 0) && app.status !== 'ACTION_REQUIRED' ? (
          <div className="mt-4 flex flex-wrap items-center justify-between gap-4 rounded-xl border border-amber-200 bg-amber-50 p-4">
            <div className="flex items-start gap-3">
              <AlertTriangle className="mt-0.5 h-5 w-5 text-amber-600" />
              <div>
                <p className="font-semibold text-[#0A1629]">Additional document needed</p>
                <p className="mt-1 text-sm text-[#64748B]">
                  {openAction?.reason ?? 'Please upload the missing document to proceed.'}
                </p>
              </div>
            </div>
            <Button
              size="sm"
              className="bg-amber-600 hover:bg-amber-700"
              onClick={() =>
                navigate(buildApplyUrl(sub.mainService.slug, sub.slug, app.id, 'documents'))
              }
            >
              <Upload className="mr-2 h-4 w-4" />
              Upload Document
            </Button>
          </div>
        ) : null}
      </PortalCard>

      {/* Corrections form fields */}
      {openAction && openAction.requiredFieldKeys.length > 0 ? (
        <PortalCard className="border-amber-200 bg-amber-50/30">
          <h2 className="font-semibold text-[#0A1629]">Corrections Required</h2>
          <p className="mt-2 text-sm text-[#64748B]">{openAction.instructions ?? openAction.reason}</p>
          <div className="mt-4 space-y-3">
            {openAction.requiredFieldKeys.map(key => (
              <div key={key}>
                <Label htmlFor={key}>{key.replace(/_/g, ' ')}</Label>
                <Input
                  id={key}
                  value={correctionValues[key] ?? ''}
                  onChange={e =>
                    setCorrectionValues(prev => ({ ...prev, [key]: e.target.value }))
                  }
                  className="mt-1.5"
                />
              </div>
            ))}
          </div>
          <Button className="mt-4" disabled={correctionLoading} onClick={onSubmitCorrection}>
            Submit Corrections
          </Button>
        </PortalCard>
      ) : null}

      {/* Payment */}
      {app.payment ? (
        <PortalCard>
          <div className="flex flex-wrap items-start justify-between gap-4">
            <h2 className="font-display text-lg font-bold text-[#0A1629]">Payment Information</h2>
            <button type="button" className="text-sm font-semibold text-[#2563EB]">
              Download Official Receipt
            </button>
          </div>
          <dl className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <div>
              <dt className="text-xs text-[#94A3B8]">Transaction ID</dt>
              <dd className="mt-1 text-sm font-semibold">{app.payment.providerRef ?? app.payment.id ?? '—'}</dd>
            </div>
            <div>
              <dt className="text-xs text-[#94A3B8]">Amount</dt>
              <dd className="mt-1 text-sm font-semibold">{formatCurrency(app.payment.amount)}</dd>
            </div>
            <div>
              <dt className="text-xs text-[#94A3B8]">Payment Method</dt>
              <dd className="mt-1 text-sm font-semibold">UPI</dd>
            </div>
            <div>
              <dt className="text-xs text-[#94A3B8]">Status</dt>
              <dd className="mt-1">
                <StatusPill tone={app.payment.status === 'CAPTURED' ? 'green' : 'amber'}>
                  {app.payment.status}
                </StatusPill>
              </dd>
            </div>
          </dl>
        </PortalCard>
      ) : null}

      {needsPayment ? (
        <PortalCard className="border-amber-200 bg-amber-50/50">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <p className="font-semibold text-[#0A1629]">Payment Required</p>
              <p className="mt-1 text-sm text-[#64748B]">
                Complete payment to proceed with processing.
              </p>
            </div>
            <Button
              onClick={() =>
                navigate(buildApplyUrl(sub.mainService.slug, sub.slug, app.id, 'payment'))
              }
            >
              <CreditCard className="mr-2 h-4 w-4" />
              Pay Now {formatCurrency(total)}
            </Button>
          </div>
        </PortalCard>
      ) : null}

      {/* Activity timeline */}
      {app.statusHistory.length > 0 ? (
        <PortalCard>
          <h2 className="font-display text-lg font-bold text-[#0A1629]">Activity History</h2>
          <ol className="relative mt-6 space-y-6 border-l-2 border-[#E8EDF5] pl-6">
            {app.statusHistory.map(entry => (
              <li key={entry.id} className="relative">
                <span className="absolute -left-[31px] top-1 h-3 w-3 rounded-full bg-[#2563EB] ring-4 ring-white" />
                <p className="font-semibold text-[#0A1629]">
                  {entry.toStatus.replace(/_/g, ' ')}
                </p>
                <p className="mt-1 text-xs text-[#94A3B8]">{formatDate(entry.createdAt, 'long')}</p>
                {entry.comment ? (
                  <p className="mt-1 text-sm text-[#64748B]">{entry.comment}</p>
                ) : null}
              </li>
            ))}
          </ol>
        </PortalCard>
      ) : null}

      {isCompleted ? (
        <div className="flex justify-end">
          <Button
            onClick={async () => {
              try {
                const cert = await applicationsApi.getApplicationCertificate(app.id);
                if (cert.downloadUrl) window.open(cert.downloadUrl, '_blank');
                else toast.message('Certificate not ready yet.');
              } catch {
                toast.message('Certificate not available yet.');
              }
            }}
          >
            <Download className="mr-2 h-4 w-4" />
            Download Certificate
          </Button>
        </div>
      ) : null}
    </div>
  );
}
