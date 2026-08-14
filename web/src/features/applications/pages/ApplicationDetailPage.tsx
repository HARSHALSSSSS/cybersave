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
import { RaiseTicketModal } from '@/features/help/components/RaiseTicketModal';
import { getApplicationProgress } from '@/features/home/utils/home-utils';
import {
  TRACKER_STEPS,
  extractApplicantFields,
  extractDocumentRequirements,
  getExpectedCompletionDate,
  getStepDate,
  getStepState,
  statusHistoryLabel,
} from '@/features/applications/utils/application-detail.utils';
import {
  applicationsApi,
  applicationsQueryKeys,
  type ApplicationDetail,
  type BackendApplicationStatus,
} from '@/services/api';
import { downloadPaymentReceipt } from '@/lib/receipt';
import { openStorageDownloadUrl } from '@/lib/upload';
import { useAuthStore } from '@/features/auth/store/auth.store';
import { getProfileDisplayName } from '@/lib/profile';
import { formatCurrency, formatDate } from '@/lib/utils';
import { cn } from '@/lib/utils';

function statusPillTone(status: BackendApplicationStatus) {
  if (['APPROVED', 'COMPLETED'].includes(status)) return 'green' as const;
  if (status === 'ACTION_REQUIRED' || status === 'PAYMENT_PENDING') return 'amber' as const;
  if (status === 'REJECTED') return 'red' as const;
  return 'blue' as const;
}

export function ApplicationDetailPage() {
  const { id = '' } = useParams();
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
      correctionValues={correctionValues}
      setCorrectionValues={setCorrectionValues}
      onSubmitCorrection={() => submitCorrection.mutate()}
      correctionLoading={submitCorrection.isPending}
    />
  );
}

function ApplicationDetailContent({
  app,
  correctionValues,
  setCorrectionValues,
  onSubmitCorrection,
  correctionLoading,
}: {
  app: ApplicationDetail;
  correctionValues: Record<string, string>;
  setCorrectionValues: React.Dispatch<React.SetStateAction<Record<string, string>>>;
  onSubmitCorrection: () => void;
  correctionLoading: boolean;
}) {
  const navigate = useNavigate();
  const citizen = useAuthStore(s => s.citizen);
  const [supportOpen, setSupportOpen] = useState(false);

  const title = app.serviceVersion.overview?.displayName ?? app.serviceVersion.subService.name;
  const ref = app.publicRef ?? `CS-${app.id.slice(0, 8).toUpperCase()}`;
  const needsPayment = app.status === 'PAYMENT_PENDING';
  const isCompleted = ['APPROVED', 'COMPLETED'].includes(app.status);
  const total = Number(app.pricingSnapshot?.totalAmount ?? app.payment?.amount ?? 0);
  const openAction = app.actionRequests?.find(r => r.status === 'OPEN');
  const sub = app.serviceVersion.subService;
  const progress = getApplicationProgress(app.status);
  const applicantFields = extractApplicantFields(app);
  const allRequirements = extractDocumentRequirements(app);
  const uploadedIds = new Set(app.documents.map(d => d.documentRequirementId));
  const missingRequirementIds =
    openAction?.requiredDocumentIds?.filter(id => !uploadedIds.has(id)) ??
    allRequirements.filter(r => !uploadedIds.has(r.id)).map(r => r.id);
  const missingDocNames = missingRequirementIds
    .map(id => allRequirements.find(r => r.id === id)?.name ?? 'Document')
    .filter(Boolean);
  const expectedCompletion = getExpectedCompletionDate(app);
  const paymentCaptured = app.payment?.status === 'CAPTURED';

  async function handleViewDocument(documentId: string) {
    try {
      const { downloadUrl } = await applicationsApi.getApplicationDocumentDownload(
        app.id,
        documentId,
      );
      openStorageDownloadUrl(downloadUrl);
    } catch {
      toast.error('Could not open document');
    }
  }

  function handleDownloadReceipt() {
    if (!app.payment || !paymentCaptured) {
      toast.error('Receipt available after payment is captured');
      return;
    }
    downloadPaymentReceipt({
      publicRef: ref,
      serviceName: title,
      transactionId: app.payment.providerRef ?? app.payment.id ?? ref,
      amount: app.payment.amount,
      paymentMethod: 'UPI',
      status: app.payment.status,
      paidAt: app.submittedAt ?? app.updatedAt,
      citizenName: getProfileDisplayName(citizen),
    });
  }

  return (
    <div className="space-y-6 pb-8 sm:space-y-8">
      <Link
        to="/applications"
        className="inline-flex items-center gap-2 text-sm font-semibold text-[#2563EB] hover:underline"
      >
        <ArrowLeft className="h-4 w-4" /> Back to Applications
      </Link>

      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-3">
            <h1 className="font-display text-2xl font-bold text-[#0A1629] sm:text-3xl">{title}</h1>
            <StatusPill tone={statusPillTone(app.status)}>
              {app.status.replace(/_/g, ' ')}
            </StatusPill>
          </div>
          <p className="mt-2 text-sm text-[#64748B]">Application ID: {ref}</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button
            variant="outline"
            size="sm"
            disabled={!paymentCaptured}
            onClick={handleDownloadReceipt}
          >
            <Download className="mr-2 h-4 w-4" />
            Download Receipt
          </Button>
          <Button size="sm" onClick={() => setSupportOpen(true)}>
            <HelpCircle className="mr-2 h-4 w-4" />
            Contact Support
          </Button>
        </div>
      </div>

      {(openAction || app.status === 'ACTION_REQUIRED') && (
        <PortalCard className="border-amber-200 bg-amber-50/70">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
            <div className="flex items-start gap-3">
              <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0 text-amber-600" />
              <div>
                <p className="font-semibold text-[#0A1629]">Action needed on your application</p>
                <p className="mt-1 text-sm leading-6 text-[#64748B]">
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
              {missingRequirementIds.length > 0 ? (
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
              ) : null}
              {(openAction?.requiredFieldKeys.length ?? 0) > 0 ? (
                <Button
                  size="sm"
                  variant="outline"
                  className="border-amber-300 bg-white"
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
      )}

      <PortalCard className="bg-[#F8FAFC]">
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          <div>
            <p className="text-xs font-semibold tracking-wide text-[#64748B] uppercase">
              Submission Date
            </p>
            <p className="mt-1 font-semibold text-[#0A1629]">
              {formatDate(app.submittedAt ?? app.createdAt, 'long')}
            </p>
          </div>
          <div>
            <p className="text-xs font-semibold tracking-wide text-[#64748B] uppercase">
              Expected Completion
            </p>
            <p className="mt-1 font-semibold text-[#0A1629]">
              {expectedCompletion ? formatDate(expectedCompletion.toISOString(), 'long') : '—'}
            </p>
          </div>
          <div className="sm:col-span-2">
            <div className="flex items-center justify-between">
              <p className="text-xs font-semibold tracking-wide text-[#64748B] uppercase">
                Verification Progress
              </p>
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

      <PortalCard>
        <h2 className="font-display text-lg font-bold text-[#0A1629]">Application Status History</h2>
        <ol className="mt-6 flex flex-col gap-6 lg:flex-row lg:justify-between lg:gap-2">
          {TRACKER_STEPS.map((step, index) => {
            const state = getStepState(step.key, app.status);
            const stepDate = getStepDate(app, step.key);
            return (
              <li
                key={step.key}
                className="flex min-w-0 flex-1 flex-col items-center text-center lg:max-w-[140px]"
              >
                <div className="flex w-full items-center">
                  {index > 0 ? (
                    <div
                      className={cn(
                        'hidden h-0.5 flex-1 lg:block',
                        state !== 'pending' ? 'bg-[#2563EB]' : 'bg-[#E8EDF5]',
                      )}
                    />
                  ) : (
                    <div className="hidden flex-1 lg:block" />
                  )}
                  <span
                    className={cn(
                      'mx-auto flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-sm font-bold',
                      state === 'done' && 'bg-[#2563EB] text-white',
                      state === 'active' && 'bg-[#0A1629] text-white ring-4 ring-[#2563EB]/20',
                      state === 'pending' && 'border-2 border-[#E2E8F0] bg-white text-[#94A3B8]',
                    )}
                  >
                    {state === 'done' ? <Check className="h-4 w-4" strokeWidth={3} /> : index + 1}
                  </span>
                  {index < TRACKER_STEPS.length - 1 ? (
                    <div
                      className={cn(
                        'hidden h-0.5 flex-1 lg:block',
                        state === 'done' ? 'bg-[#2563EB]' : 'bg-[#E8EDF5]',
                      )}
                    />
                  ) : (
                    <div className="hidden flex-1 lg:block" />
                  )}
                </div>
                <p className="mt-2 text-xs font-semibold text-[#0A1629]">{step.label}</p>
                <p className={cn('text-[10px]', state === 'active' ? 'text-[#2563EB]' : 'text-[#94A3B8]')}>
                  {stepDate ? formatDate(stepDate, 'long') : step.sub}
                </p>
              </li>
            );
          })}
        </ol>
      </PortalCard>

      <div className="grid gap-6 lg:grid-cols-2">
        <PortalCard>
          <h2 className="font-display text-lg font-bold text-[#0A1629]">Applicant Details</h2>
          {applicantFields.length === 0 ? (
            <p className="mt-4 text-sm text-[#94A3B8]">No applicant details on file yet.</p>
          ) : (
            <dl className="mt-4 space-y-4">
              {applicantFields.map(fv => (
                <div key={fv.key} className="border-b border-[#F1F5F9] pb-3 last:border-0">
                  <dt className="text-xs font-semibold tracking-wide text-[#94A3B8] uppercase">
                    {fv.label}
                  </dt>
                  <dd className="mt-1 text-sm font-semibold text-[#0A1629]">{fv.value}</dd>
                </div>
              ))}
            </dl>
          )}
        </PortalCard>

        <PortalCard>
          <h2 className="font-display text-lg font-bold text-[#0A1629]">Service & Fee Details</h2>
          <dl className="mt-4 space-y-4">
            <div className="border-b border-[#F1F5F9] pb-3">
              <dt className="text-xs font-semibold tracking-wide text-[#94A3B8] uppercase">
                Service Requested
              </dt>
              <dd className="mt-1 text-sm font-semibold text-[#0A1629]">{title}</dd>
            </div>
            <div className="border-b border-[#F1F5F9] pb-3">
              <dt className="text-xs font-semibold tracking-wide text-[#94A3B8] uppercase">
                Department
              </dt>
              <dd className="mt-1 text-sm font-semibold text-[#0A1629]">
                {app.serviceVersion.overview?.department ?? sub.mainService.name}
              </dd>
            </div>
            {app.stateName ? (
              <div className="border-b border-[#F1F5F9] pb-3">
                <dt className="text-xs font-semibold tracking-wide text-[#94A3B8] uppercase">
                  Jurisdiction District
                </dt>
                <dd className="mt-1 text-sm font-semibold text-[#0A1629]">{app.stateName}</dd>
              </div>
            ) : null}
            <div className="border-b border-[#F1F5F9] pb-3 last:border-0">
              <dt className="text-xs font-semibold tracking-wide text-[#94A3B8] uppercase">
                Administrative Fee
              </dt>
              <dd className="mt-1 flex flex-wrap items-center gap-2">
                <span className="text-sm font-semibold text-[#0A1629]">{formatCurrency(total)}</span>
                {paymentCaptured || isCompleted ? (
                  <StatusPill tone="green">PAID</StatusPill>
                ) : needsPayment ? (
                  <StatusPill tone="amber">PENDING</StatusPill>
                ) : null}
              </dd>
            </div>
          </dl>
        </PortalCard>
      </div>

      <PortalCard>
        <h2 className="font-display text-lg font-bold text-[#0A1629]">Submitted Documents</h2>
        <ul className="mt-4 space-y-3">
          {app.documents.length === 0 ? (
            <li className="text-sm text-[#94A3B8]">No documents uploaded yet</li>
          ) : (
            app.documents.map(doc => (
              <li
                key={doc.id}
                className="flex flex-col gap-3 rounded-xl border border-[#F1F5F9] bg-[#F8FAFC] px-4 py-3 sm:flex-row sm:items-center sm:justify-between"
              >
                <div className="flex items-start gap-3">
                  <Check className="mt-0.5 h-5 w-5 shrink-0 text-emerald-500" />
                  <div>
                    <p className="text-sm font-semibold text-[#0A1629]">
                      {doc.documentRequirement?.name ?? 'Document'}
                    </p>
                    <p className="text-xs text-[#94A3B8]">
                      {doc.storedFile?.originalFileName ?? 'Uploaded file'}
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  className="text-left text-sm font-semibold text-[#2563EB] hover:underline sm:text-right"
                  onClick={() => void handleViewDocument(doc.id)}
                >
                  View Document
                </button>
              </li>
            ))
          )}
        </ul>

        {missingDocNames.length > 0 && (
          <div className="mt-4 flex flex-col gap-4 rounded-xl border border-amber-200 bg-amber-50 p-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-start gap-3">
              <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0 text-amber-600" />
              <div>
                <p className="font-semibold text-[#0A1629]">
                  {missingDocNames[0]} Required
                </p>
                <p className="mt-1 text-sm leading-6 text-[#64748B]">
                  {missingDocNames.join(', ')} — missing. Please upload a valid document to
                  continue processing.
                </p>
              </div>
            </div>
            <Button
              size="sm"
              className="shrink-0 bg-amber-600 hover:bg-amber-700"
              onClick={() =>
                navigate(buildApplyUrl(sub.mainService.slug, sub.slug, app.id, 'documents'))
              }
            >
              <Upload className="mr-2 h-4 w-4" />
              Upload Document
            </Button>
          </div>
        )}
      </PortalCard>

      {openAction && openAction.requiredFieldKeys.length > 0 ? (
        <PortalCard className="border-amber-200 bg-amber-50/30">
          <h2 className="font-semibold text-[#0A1629]">Corrections Required</h2>
          <p className="mt-2 text-sm text-[#64748B]">
            {openAction.instructions ?? openAction.reason}
          </p>
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

      {app.payment ? (
        <PortalCard>
          <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
            <h2 className="font-display text-lg font-bold text-[#0A1629]">Payment Information</h2>
            <button
              type="button"
              className="text-sm font-semibold text-[#2563EB] hover:underline disabled:opacity-50"
              disabled={!paymentCaptured}
              onClick={handleDownloadReceipt}
            >
              Download Official Receipt
            </button>
          </div>
          <dl className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <div>
              <dt className="text-xs text-[#94A3B8]">Transaction ID</dt>
              <dd className="mt-1 break-all text-sm font-semibold">
                {app.payment.providerRef ?? app.payment.id ?? '—'}
              </dd>
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
                <StatusPill tone={paymentCaptured ? 'green' : 'amber'}>
                  {paymentCaptured ? 'SUCCESS' : app.payment.status}
                </StatusPill>
              </dd>
            </div>
          </dl>
        </PortalCard>
      ) : null}

      {needsPayment ? (
        <PortalCard className="border-amber-200 bg-amber-50/50">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
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

      {app.statusHistory.length > 0 ? (
        <PortalCard>
          <h2 className="font-display text-lg font-bold text-[#0A1629]">Activity History</h2>
          <ol className="relative mt-6 space-y-6 border-l-2 border-[#E8EDF5] pl-6">
            {[...app.statusHistory].reverse().map(entry => (
              <li key={entry.id} className="relative">
                <span className="absolute -left-[31px] top-1 h-3 w-3 rounded-full bg-[#2563EB] ring-4 ring-white" />
                <p className="font-semibold text-[#0A1629]">{statusHistoryLabel(entry)}</p>
                <p className="mt-1 text-xs text-[#94A3B8]">{formatDate(entry.createdAt, 'long')}</p>
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
                if (cert.downloadUrl) openStorageDownloadUrl(cert.downloadUrl);
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

      <RaiseTicketModal
        open={supportOpen}
        onOpenChange={setSupportOpen}
        defaultSubject={`Help with application ${ref}`}
        defaultContent={`Service: ${title}\nApplication ID: ${ref}\n\nI need assistance with:\n`}
      />
    </div>
  );
}
