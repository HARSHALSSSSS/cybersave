import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Navigate, useNavigate, useParams, useSearchParams } from 'react-router';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import {
  Bell,
  CheckCircle2,
  Download,
  Home,
} from 'lucide-react';
import { Breadcrumbs } from '@/components/layout/Breadcrumbs';
import { ApplyActionBar } from '@/features/apply/components/ApplyActionBar';
import { ApplyStepper, type ApplyStep } from '@/features/apply/components/ApplyStepper';
import {
  DynamicFormFields,
  validateFormFields,
} from '@/features/apply/components/DynamicFormFields';
import { DocumentUploadGrid } from '@/features/apply/components/DocumentUploadGrid';
import {
  SecurityNotice,
  SecurityNoticeFull,
} from '@/features/apply/components/SecurityNotice';
import {
  clampApplyStep,
  defaultApplyStepForStatus,
  randomIdempotencyKey,
} from '@/features/apply/utils/apply-flow';
import {
  extractErrorMessage,
  extractValidationIssues,
  issuesToFieldErrors,
} from '@/features/apply/utils/validation-errors';
import { getServiceDisplayName } from '@/features/apply/utils/service-helpers';
import { Button } from '@/components/ui/button';
import { LoadingBlock, EmptyState } from '@/components/ui/primitives';
import {
  applicationsApi,
  applicationsQueryKeys,
  paymentsQueryKeys,
  servicesApi,
  servicesQueryKeys,
  walletApi,
  walletQueryKeys,
  type ApplicationDetail,
  type BackendApplicationStatus,
} from '@/services/api';
import { useAuthStore } from '@/features/auth/store/auth.store';
import {
  isRazorpayUserCancelled,
  processApplicationPayment,
  type PaymentMethod,
} from '@/features/payments/utils/applicationPayment';
import { formatCurrency, formatDate } from '@/lib/utils';
import { openStorageDownloadUrl } from '@/lib/upload';
import { cn } from '@/lib/utils';

export function ServiceApplyPage() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { mainSlug = '', subSlug = '', applicationId: routeAppId } = useParams();
  const [searchParams, setSearchParams] = useSearchParams();
  const stateCode = searchParams.get('state') ?? undefined;
  const stateName = searchParams.get('stateName') ?? undefined;
  const requestedStep = (searchParams.get('step') as ApplyStep) || 'form';

  const [applicationId, setApplicationId] = useState<string | undefined>(routeAppId);
  const [formValues, setFormValues] = useState<Record<string, unknown>>({});
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('razorpay');
  const [busy, setBusy] = useState(false);
  const [draftFailed, setDraftFailed] = useState(false);
  const [draftErrorMessage, setDraftErrorMessage] = useState<string | null>(null);
  const draftRequestedRef = useRef(false);
  const paymentKeyRef = useRef<string | null>(null);
  const [submittedLocally, setSubmittedLocally] = useState(false);

  const citizen = useAuthStore(s => s.citizen);

  const { data: wallet } = useQuery({
    queryKey: walletQueryKeys.summary(),
    queryFn: () => walletApi.getWalletSummary(),
    enabled: requestedStep === 'payment' || requestedStep === 'documents',
  });

  const { data: catalog = [], isLoading: catalogLoading } = useQuery({
    queryKey: servicesQueryKeys.catalog(),
    queryFn: () => servicesApi.getServicesCatalog(),
  });

  const match = useMemo(
    () =>
      catalog
        .find(m => m.slug === mainSlug)
        ?.subServices.find(s => s.slug === subSlug),
    [catalog, mainSlug, subSlug],
  );

  const { data: application, isError: appError, error: appQueryError } = useQuery({
    queryKey: applicationsQueryKeys.detail(applicationId ?? ''),
    queryFn: () => applicationsApi.getApplicationById(applicationId!),
    enabled: Boolean(applicationId),
    retry: (failureCount, error) => {
      const status = (error as { response?: { status?: number } })?.response?.status;
      if (status === 404) return false;
      return failureCount < 2;
    },
  });

  const subServiceId = useMemo(
    () => match?.id ?? application?.serviceVersion?.subService?.id,
    [match?.id, application?.serviceVersion?.subService?.id],
  );

  const {
    data: config,
    isLoading: configLoading,
    isError: configError,
  } = useQuery({
    queryKey: servicesQueryKeys.configuration(subServiceId ?? '', stateCode),
    queryFn: () => servicesApi.getSubServiceConfiguration(subServiceId!, stateCode),
    enabled: Boolean(subServiceId),
  });

  const createDraft = useMutation({
    mutationFn: () =>
      applicationsApi.createDraftApplication(
        match!.id,
        stateCode,
        stateName ? decodeURIComponent(stateName) : undefined,
      ),
    onSuccess: data => {
      setApplicationId(data.id);
      setDraftFailed(false);
      setDraftErrorMessage(null);
      queryClient.setQueryData(applicationsQueryKeys.detail(data.id), data);
      const params = new URLSearchParams(searchParams);
      params.set('step', 'form');
      navigate(`/services/${mainSlug}/${subSlug}/apply/${data.id}?${params.toString()}`, {
        replace: true,
      });
    },
    onError: (error: unknown) => {
      setDraftFailed(true);
      let friendly = 'Could not start application. Sign in and try again.';
      if (error && typeof error === 'object' && 'response' in error) {
        const data = (error as {
          response?: { data?: { error?: { message?: string | string[] }; message?: string | string[] } };
        }).response?.data;
        const raw = data?.error?.message ?? data?.message;
        if (typeof raw === 'string' && raw.trim()) friendly = raw;
        else if (Array.isArray(raw) && typeof raw[0] === 'string') friendly = raw[0];
      } else if (error instanceof Error && error.message) {
        friendly = error.message;
      }
      setDraftErrorMessage(friendly);
      toast.error(friendly);
    },
  });

  function retryDraft() {
    setDraftFailed(false);
    setDraftErrorMessage(null);
    draftRequestedRef.current = false;
    createDraft.mutate();
  }

  const needsStateSelection =
    Boolean(config?.fulfillment?.requiresStateSelection) && !stateCode;
  const availableStates = config?.fulfillment?.availableStates ?? [];

  const serviceKey = `${mainSlug}/${subSlug}/${stateCode ?? ''}`;

  useEffect(() => {
    setApplicationId(routeAppId);
    setDraftFailed(false);
    setDraftErrorMessage(null);
    setFormValues({});
    setFieldErrors({});
    draftRequestedRef.current = false;
    setSubmittedLocally(false);
  }, [serviceKey, routeAppId]);

  useEffect(() => {
    if (!match?.id || !config || routeAppId || applicationId || draftFailed || needsStateSelection) {
      return;
    }
    if (draftRequestedRef.current) return;

    draftRequestedRef.current = true;
    createDraft.mutate(undefined, {
      onSettled: () => {
        draftRequestedRef.current = false;
      },
    });
  }, [
    serviceKey,
    match?.id,
    config,
    routeAppId,
    applicationId,
    draftFailed,
    needsStateSelection,
  ]);

  // Recovery: if draft never starts within 8s, surface an error instead of infinite spinner
  useEffect(() => {
    if (!match?.id || !config || applicationId || routeAppId || draftFailed || needsStateSelection) {
      return;
    }
    if (createDraft.isPending) return;

    const timer = window.setTimeout(() => {
      if (!applicationId && !createDraft.isPending && !draftFailed) {
        setDraftFailed(true);
        setDraftErrorMessage(
          'Could not connect to the server to start your application. Make sure you are signed in and the backend is running on port 8000.',
        );
      }
    }, 5000);

    return () => window.clearTimeout(timer);
  }, [
    match?.id,
    config,
    applicationId,
    routeAppId,
    draftFailed,
    needsStateSelection,
    createDraft.isPending,
  ]);

  useEffect(() => {
    const status = (appQueryError as { response?: { status?: number } })?.response?.status;
    if (!routeAppId || !appError || status !== 404) return;
    toast.message('Previous draft expired. Starting a new application.');
    setApplicationId(undefined);
    draftRequestedRef.current = false;
    const params = new URLSearchParams(searchParams);
    params.set('step', 'form');
    navigate(`/services/${mainSlug}/${subSlug}/apply?${params.toString()}`, { replace: true });
  }, [appError, appQueryError, routeAppId, mainSlug, subSlug, navigate, searchParams]);

  useEffect(() => {
    if (!config?.form?.fields) return;
    const defaults: Record<string, unknown> = {};
    config.form.fields.forEach(f => {
      if (f.defaultValue != null && f.defaultValue !== '') defaults[f.key] = f.defaultValue;
    });
    setFormValues(prev => ({ ...defaults, ...prev }));
  }, [config]);

  useEffect(() => {
    if (!application?.fieldValues) return;
    const fromApi: Record<string, unknown> = {};
    application.fieldValues.forEach(fv => {
      fromApi[fv.fieldKey] = fv.value;
    });
    setFormValues(prev => ({ ...prev, ...fromApi }));
  }, [application]);

  const displayName = config ? getServiceDisplayName(config) : 'Service';
  const totalAmount = Number(
    config?.pricing?.totalAmount ?? application?.pricingSnapshot?.totalAmount ?? 0,
  );
  const requiresPayment = totalAmount > 0;
  const walletBalance = wallet?.balance ?? 0;
  const walletCovers = walletBalance >= totalAmount && totalAmount > 0;

  const allowedStep = useMemo((): ApplyStep => {
    if (submittedLocally) return 'confirmation';
    if (!application) return 'form';
    const status = application.status as BackendApplicationStatus;
    return defaultApplyStepForStatus(status);
  }, [application, submittedLocally]);

  const step = clampApplyStep(requestedStep, allowedStep);

  useEffect(() => {
    if (requestedStep !== step) {
      const params = new URLSearchParams(searchParams);
      params.set('step', step);
      setSearchParams(params, { replace: true });
    }
  }, [requestedStep, step, searchParams, setSearchParams]);

  const goToStep = useCallback(
    (s: ApplyStep) => {
      const params = new URLSearchParams(searchParams);
      params.set('step', s);
      setSearchParams(params, { replace: true });
    },
    [searchParams, setSearchParams],
  );

  const handleFieldChange = useCallback((key: string, value: unknown) => {
    setFormValues(prev => ({ ...prev, [key]: value }));
  }, []);

  const handleApplicationCacheUpdate = useCallback(
    (updated: ApplicationDetail) => {
      queryClient.setQueryData(applicationsQueryKeys.detail(updated.id), updated);
    },
    [queryClient],
  );

  const requiredDocs = useMemo(
    () => (config?.documentRequirements ?? []).filter(d => d.required),
    [config],
  );

  const uploadedDocs = application?.documents ?? [];

  const formFields = config?.form?.fields ?? [];

  async function handleSaveDraft() {
    if (!applicationId || formFields.length === 0) return;
    setBusy(true);
    try {
      await applicationsApi.saveApplicationFormValues(applicationId, formValues);
      toast.success('Draft saved');
    } catch {
      toast.error('Could not save draft');
    } finally {
      setBusy(false);
    }
  }

  async function handleFormNext() {
    if (!applicationId || formFields.length === 0) return;
    const errors = validateFormFields(formFields, formValues);
    setFieldErrors(errors);
    if (Object.keys(errors).length > 0) {
      toast.error('Please fill all required fields');
      return;
    }
    setBusy(true);
    try {
      await applicationsApi.saveApplicationFormValues(applicationId, formValues);
      const validation = await applicationsApi.validateApplication(applicationId, 'form');
      if (!validation.valid) {
        const apiErrors = issuesToFieldErrors(validation.errors);
        setFieldErrors(apiErrors);
        const first = validation.errors[0]?.message ?? 'Please fix the highlighted fields';
        toast.error(first);
        return;
      }
      goToStep('documents');
    } catch (error) {
      const issues = extractValidationIssues(error);
      if (issues.length > 0) {
        setFieldErrors(issuesToFieldErrors(issues));
        toast.error(issues[0]?.message ?? 'Please fix the highlighted fields');
        return;
      }
      const status = (error as { response?: { status?: number } })?.response?.status;
      if (status === 404) {
        toast.error('This application draft expired. Starting a new one — fill the form again.');
        setApplicationId(undefined);
        draftRequestedRef.current = false;
        const params = new URLSearchParams(searchParams);
        navigate(`/services/${mainSlug}/${subSlug}/apply?${params.toString()}`, { replace: true });
        return;
      }
      toast.error(
        extractErrorMessage(error, 'Could not save form. Try again after signing in.'),
      );
    } finally {
      setBusy(false);
    }
  }

  async function handleDocumentsNext() {
    const missing = requiredDocs.filter(
      req => !uploadedDocs.some(d => d.documentRequirementId === req.id),
    );
    if (missing.length > 0) {
      toast.error(`Upload required: ${missing.map(d => d.name).join(', ')}`);
      return;
    }
    if (requiresPayment) {
      goToStep('payment');
    } else {
      await handleSubmitApplication();
    }
  }

  async function handleSubmitApplication() {
    if (!applicationId) return;
    if (requiresPayment && paymentMethod === 'wallet' && !walletCovers) {
      toast.error('Insufficient wallet balance. Recharge your wallet to continue.');
      return;
    }
    setBusy(true);
    try {
      const validation = await applicationsApi.validateApplication(applicationId);
      if (!validation.valid) {
        toast.error('Application validation failed. Review form and documents.');
        goToStep('form');
        return;
      }
      if (requiresPayment) {
        if (!paymentKeyRef.current) {
          paymentKeyRef.current = randomIdempotencyKey(`pay-${applicationId}`);
        }
        await processApplicationPayment({
          applicationId,
          method: paymentMethod,
          idempotencyKey: paymentKeyRef.current,
          amount: totalAmount,
          serviceName: displayName,
          prefill: {
            contact: citizen?.phone,
            email: citizen?.email ?? undefined,
            name: [citizen?.firstName, citizen?.lastName].filter(Boolean).join(' ') || undefined,
          },
        });
      }
      const submitted = await applicationsApi.submitApplication(applicationId);
      queryClient.setQueryData(applicationsQueryKeys.detail(applicationId), submitted);
      setSubmittedLocally(true);
      void Promise.all([
        queryClient.invalidateQueries({ queryKey: applicationsQueryKeys.all }),
        queryClient.invalidateQueries({ queryKey: paymentsQueryKeys.all }),
        queryClient.invalidateQueries({ queryKey: walletQueryKeys.summary() }),
      ]);
      goToStep('confirmation');
      toast.success('Application submitted successfully');
    } catch (error) {
      if (isRazorpayUserCancelled(error)) return;
      toast.error('Could not submit application');
    } finally {
      setBusy(false);
    }
  }

  async function handleDownloadReceipt() {
    if (!applicationId) return;
    try {
      const cert = await applicationsApi.getApplicationCertificate(applicationId);
      if (cert.downloadUrl) openStorageDownloadUrl(cert.downloadUrl);
      else toast.message('Receipt will be available once processing completes.');
    } catch {
      toast.message('Receipt not available yet for this application.');
    }
  }

  const isBootstrapping =
    (!subServiceId && catalogLoading && catalog.length === 0) ||
    (Boolean(subServiceId) && configLoading && !config);
  const isCreatingDraft = createDraft.isPending || (!applicationId && !draftFailed && !needsStateSelection && !routeAppId);

  if (isBootstrapping) {
    return (
      <LoadingBlock
        className="min-h-[420px]"
        message="Loading service…"
      />
    );
  }

  if (!match && !application && !catalogLoading) {
    return (
      <EmptyState
        title="Service not found"
        description="This service may have been removed. Return to the services catalog."
        action={
          <Button type="button" onClick={() => navigate('/services')}>
            Browse services
          </Button>
        }
      />
    );
  }

  if (configError || !config) {
    const needsState = match.requiresStateSelection && !stateCode;
    return (
      <EmptyState
        title="Service configuration unavailable"
        description={
          needsState
            ? 'Please select your state before applying.'
            : 'We could not load this service from the server. Try again in a moment.'
        }
        action={
          needsState ? (
            <Button
              type="button"
              onClick={() => navigate(`/services/${mainSlug}/${subSlug}/select-state`)}
            >
              Select state
            </Button>
          ) : (
            <Button type="button" onClick={() => window.location.reload()}>
              Retry
            </Button>
          )
        }
      />
    );
  }

  if (needsStateSelection) {
    if (availableStates.length === 1) {
      const only = availableStates[0];
      const params = new URLSearchParams(searchParams);
      params.set('state', only.code);
      params.set('stateName', only.name);
      return (
        <Navigate
          to={`/services/${mainSlug}/${subSlug}/apply?${params.toString()}`}
          replace
        />
      );
    }
    return <Navigate to={`/services/${mainSlug}/${subSlug}/select-state`} replace />;
  }

  if (draftFailed) {
    const needsState = config.fulfillment?.requiresStateSelection && !stateCode;
    return (
      <EmptyState
        title="Could not start application"
        description={
          draftErrorMessage ??
          (needsState
            ? 'This service requires a state before we can create your application draft.'
            : 'The server could not create an application draft. Check that you are signed in and try again.')
        }
        action={
          <div className="flex flex-wrap justify-center gap-3">
            {needsState ? (
              <Button
                type="button"
                onClick={() => navigate(`/services/${mainSlug}/${subSlug}/select-state`)}
              >
                Select state
              </Button>
            ) : (
              <Button type="button" onClick={retryDraft}>
                Try again
              </Button>
            )}
            <Button type="button" variant="outline" onClick={() => navigate(`/services/${mainSlug}/${subSlug}`)}>
              Back to service
            </Button>
          </div>
        }
      />
    );
  }

  const breadcrumbApply = step === 'form' ? 'Apply' : step === 'documents' ? 'Document Upload' : step === 'payment' ? 'Payment Portal' : 'Confirmation';

  return (
    <div className="space-y-6 pb-4">
      {isCreatingDraft ? (
        <div className="flex items-center gap-3 rounded-xl border border-[#BFDBFE] bg-[#EFF6FF] px-4 py-3 text-sm text-[#1D4ED8]">
          <div className="h-4 w-4 animate-spin rounded-full border-2 border-[#BFDBFE] border-t-[#2563EB]" />
          Starting your application draft…
        </div>
      ) : null}
      <Breadcrumbs
        items={[
          { label: 'Home', to: '/' },
          { label: 'Services', to: '/services' },
          { label: config.mainService.name, to: `/services/category/${mainSlug}` },
          { label: displayName, to: `/services/${mainSlug}/${subSlug}` },
          { label: breadcrumbApply },
        ]}
      />

      <div className="rounded-2xl border border-[#E8EDF5] bg-gradient-to-br from-[#F8FAFC] to-white p-6 sm:p-8">
        <h1 className="font-display text-2xl font-bold text-[#0A1629] sm:text-3xl">
          Application for {displayName}
        </h1>
        <p className="mt-2 max-w-2xl text-sm leading-7 text-[#64748B]">
          {step === 'form' &&
            'Please fill in the required details accurately. All fields marked with * are mandatory.'}
          {step === 'documents' &&
            'Upload clear, legible scanned copies of all required documents (PDF or JPEG).'}
          {step === 'payment' &&
            'Securely pay the required registration and portal handling fees to submit your application.'}
          {step === 'confirmation' &&
            'Your application has been submitted. Download your receipt and track status anytime.'}
        </p>
      </div>

      <ApplyStepper current={step} />

      <div className="rounded-2xl border border-[#E8EDF5] bg-white p-6 shadow-sm sm:p-8">
        {step === 'form' ? (
          <>
            <div className="mb-6 border-l-4 border-[#2563EB] pl-4">
              <h2 className="text-base font-semibold text-[#0A1629]">Application Details</h2>
              <p className="mt-1 text-sm text-[#64748B]">
                {formFields.length > 0
                  ? `${formFields.length} fields configured for ${displayName}`
                  : 'Complete the details below to proceed.'}
              </p>
            </div>
            {Object.keys(fieldErrors).length > 0 ? (
              <div className="mb-5 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                <p className="font-semibold">Fix these fields to continue:</p>
                <ul className="mt-2 list-inside list-disc space-y-1">
                  {Object.entries(fieldErrors).map(([key, message]) => (
                    <li key={key}>{message}</li>
                  ))}
                </ul>
              </div>
            ) : null}
            {formFields.length > 0 ? (
              <DynamicFormFields
                fields={formFields}
                values={formValues}
                errors={fieldErrors}
                onChange={handleFieldChange}
              />
            ) : (
              <EmptyState
                title="Application form not configured"
                description="This service does not have form fields in admin yet. Use manual apply on the official portal or contact support."
                action={
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => navigate(`/services/${mainSlug}/${subSlug}`)}
                  >
                    Back to service
                  </Button>
                }
              />
            )}
            {formFields.length > 0 ? (
              <>
                <SecurityNotice className="mt-8" />
                <ApplyActionBar
                  showPrevious={false}
                  onSaveDraft={() => void handleSaveDraft()}
                  onNext={() => void handleFormNext()}
                  loading={busy || isCreatingDraft}
                />
              </>
            ) : null}
          </>
        ) : null}

        {step === 'documents' ? (
          <>
            <div className="mb-6 border-l-4 border-[#2563EB] pl-4">
              <h2 className="text-base font-semibold text-[#0A1629]">
                Required Support Certificates / Identity Proofs
              </h2>
            </div>
            {applicationId ? (
              <DocumentUploadGrid
                applicationId={applicationId}
                requirements={config.documentRequirements}
                uploaded={uploadedDocs}
                onApplicationUpdated={handleApplicationCacheUpdate}
              />
            ) : null}
            <SecurityNotice className="mt-8" />
            <ApplyActionBar
              onPrevious={() => goToStep('form')}
              onSaveDraft={() => void handleSaveDraft()}
              onNext={() => void handleDocumentsNext()}
              loading={busy}
            />
          </>
        ) : null}

        {step === 'payment' ? (
          <>
            <div className="grid gap-6 lg:grid-cols-[1fr_340px]">
              <div>
                <h2 className="mb-4 text-base font-semibold text-[#0A1629]">Select Payment Method</h2>
                <div className="space-y-3">
                  <label
                    className={cn(
                      'block cursor-pointer rounded-2xl border p-4 transition',
                      paymentMethod === 'razorpay'
                        ? 'border-[#2563EB] bg-[#EFF6FF]/50 ring-1 ring-[#2563EB]/30'
                        : 'border-[#E5E7EB] bg-white',
                    )}
                  >
                    <div className="flex items-start gap-3">
                      <input
                        type="radio"
                        name="payment"
                        checked={paymentMethod === 'razorpay'}
                        onChange={() => setPaymentMethod('razorpay')}
                        className="mt-1"
                      />
                      <div className="flex-1">
                        <p className="font-semibold text-[#0A1629]">Pay via Razorpay</p>
                        <p className="mt-1 text-xs text-[#6B7280]">
                          UPI, debit/credit cards, net banking &amp; wallets — secure checkout opens on pay.
                        </p>
                        <span className="mt-2 inline-flex rounded-full bg-[#EFF6FF] px-2.5 py-0.5 text-[10px] font-semibold text-[#2563EB]">
                          Secured by Razorpay
                        </span>
                      </div>
                    </div>
                  </label>

                  <label
                    className={cn(
                      'block rounded-2xl border p-4 transition',
                      walletCovers ? 'cursor-pointer' : 'cursor-not-allowed opacity-55 blur-[0.3px]',
                      paymentMethod === 'wallet' && walletCovers
                        ? 'border-[#2563EB] bg-[#EFF6FF]/50 ring-1 ring-[#2563EB]/30'
                        : 'border-[#E5E7EB] bg-white',
                    )}
                  >
                    <div className="flex items-start gap-3">
                      <input
                        type="radio"
                        name="payment"
                        checked={paymentMethod === 'wallet'}
                        disabled={!walletCovers}
                        onChange={() => walletCovers && setPaymentMethod('wallet')}
                        className="mt-1"
                      />
                      <div className="flex-1">
                        <p className="font-semibold text-[#0A1629]">Cybersave Wallet</p>
                        <p className="mt-1 text-xs text-[#6B7280]">
                          {walletCovers
                            ? 'Instant payment from your wallet balance.'
                            : 'Insufficient balance — recharge wallet to enable this option.'}
                        </p>
                        <p
                          className={cn(
                            'mt-2 text-xs font-semibold',
                            walletCovers ? 'text-[#2563EB]' : 'text-amber-700',
                          )}
                        >
                          Available: {formatCurrency(walletBalance)}
                        </p>
                      </div>
                    </div>
                  </label>
                </div>
              </div>

              <div className="rounded-2xl border border-[#E5E7EB] bg-[#FAFBFC] p-5">
                <h3 className="border-l-4 border-[#2563EB] pl-3 text-sm font-semibold text-[#0A1629]">
                  Fee Summary
                </h3>
                <dl className="mt-4 space-y-3 text-sm">
                  <div className="flex justify-between">
                    <dt className="text-[#6B7280]">Application Type</dt>
                    <dd className="font-medium text-[#0A1629]">{displayName}</dd>
                  </div>
                  <div className="flex justify-between">
                    <dt className="text-[#6B7280]">Government Certificate Fee</dt>
                    <dd>{formatCurrency(config.pricing?.baseFee ?? 0)}</dd>
                  </div>
                  <div className="flex justify-between">
                    <dt className="text-[#6B7280]">Portal Processing Fee</dt>
                    <dd>{formatCurrency(config.pricing?.platformFee ?? 0)}</dd>
                  </div>
                  <div className="flex justify-between border-t border-[#E5E7EB] pt-3">
                    <dt className="font-semibold text-[#0A1629]">Total Amount</dt>
                    <dd className="text-xl font-bold text-[#2563EB]">{formatCurrency(totalAmount)}</dd>
                  </div>
                </dl>
              </div>
            </div>
            <SecurityNoticeFull className="mt-8" />
            <ApplyActionBar
              onPrevious={() => goToStep('documents')}
              onSaveDraft={() => void handleSaveDraft()}
              onNext={() => void handleSubmitApplication()}
              nextLabel="Pay Now"
              loading={busy}
            />
          </>
        ) : null}

        {step === 'confirmation' ? (
          application ? (
          <>
            <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
              <div className="rounded-2xl border border-emerald-200 bg-emerald-50/40 p-8 text-center">
                <CheckCircle2 className="mx-auto h-16 w-16 text-emerald-500" />
                <h2 className="mt-4 text-xl font-bold text-emerald-700">
                  Application Submitted Successfully
                </h2>
                <p className="mt-2 text-sm text-[#6B7280]">
                  Your {displayName.toLowerCase()} application has been received and is being
                  processed.
                </p>
                <div className="mx-auto mt-6 max-w-sm rounded-xl border border-[#E5E7EB] bg-white px-6 py-4">
                  <p className="text-[10px] font-semibold uppercase tracking-wide text-[#9CA3AF]">
                    Official Application ID
                  </p>
                  <p className="mt-1 font-display text-2xl font-bold text-[#0A1629]">
                    {application.publicRef ?? application.id.slice(0, 12).toUpperCase()}
                  </p>
                </div>
                <div className="mx-auto mt-4 flex max-w-lg items-center gap-2 rounded-xl bg-[#EFF6FF] px-4 py-3 text-left text-xs text-[#2563EB]">
                  <Bell className="h-4 w-4 shrink-0" />
                  An SMS and Email notification with receipt details have been dispatched to your
                  registered contact.
                </div>
              </div>

              <div className="rounded-2xl border border-[#E5E7EB] bg-white p-5">
                <h3 className="border-l-4 border-[#2563EB] pl-3 text-sm font-semibold">
                  Application Summary
                </h3>
                <dl className="mt-4 space-y-3 text-sm">
                  <div>
                    <dt className="text-[10px] font-semibold uppercase text-[#9CA3AF]">Application Date</dt>
                    <dd className="font-medium">{formatDate(application.submittedAt ?? application.createdAt, 'long')}</dd>
                  </div>
                  <div>
                    <dt className="text-[10px] font-semibold uppercase text-[#9CA3AF]">Expected Turnaround</dt>
                    <dd className="font-medium text-amber-600">
                      {config.overview?.processingTime ?? '7–10 working days'}
                    </dd>
                  </div>
                  <div className="border-t border-[#E5E7EB] pt-3">
                    <dt className="text-[10px] font-semibold uppercase text-[#9CA3AF]">Fee Status</dt>
                    <dd>
                      <span className="rounded-full bg-emerald-50 px-2 py-0.5 text-xs font-medium text-emerald-700">
                        Paid
                      </span>
                    </dd>
                  </div>
                  <div>
                    <dt className="text-[10px] font-semibold uppercase text-[#9CA3AF]">Amount Charged</dt>
                    <dd className="text-2xl font-bold text-[#2563EB]">{formatCurrency(totalAmount)}</dd>
                  </div>
                </dl>
              </div>
            </div>

            <SecurityNoticeFull className="mt-8" />

            <div className="mt-6 flex flex-wrap items-center justify-between gap-3">
              <Button type="button" variant="outline" onClick={() => void handleDownloadReceipt()}>
                <Download className="mr-2 h-4 w-4" />
                Download Receipt
              </Button>
              <div className="flex gap-3">
                <Button type="button" variant="ghost" onClick={() => navigate('/')}>
                  <Home className="mr-2 h-4 w-4" />
                  Back to Home
                </Button>
                <Button
                  type="button"
                  onClick={() => navigate(`/applications/${applicationId}`)}
                >
                  Track Application
                </Button>
              </div>
            </div>
          </>
          ) : (
            <LoadingBlock message="Loading confirmation…" />
          )
        ) : null}
      </div>
    </div>
  );
}
