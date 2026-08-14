import { Link, useNavigate, useParams, useSearchParams } from 'react-router';
import { useEffect, useMemo, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { toast } from 'sonner';
import { CheckCircle2, FileText, Shield } from 'lucide-react';
import { Breadcrumbs } from '@/components/layout/Breadcrumbs';
import { ServiceFeeStatsGrid, type ServiceFeeStat } from '@/features/services/components/ServiceFeeStatsGrid';
import {
  formatBytes,
  formatIncludedFee,
  formatServiceFee,
} from '@/features/services/utils/service-pricing';
import { buildApplyPath } from '@/features/services/utils/service-navigation';
import { Button } from '@/components/ui/button';
import { LoadingBlock, EmptyState } from '@/components/ui/primitives';
import { getServiceDisplayName } from '@/features/apply/utils/service-helpers';
import { useRequireAuth, useRequireAuthNavigate } from '@/features/auth/hooks/useRequireAuth';
import { openManualApplyPortal } from '@/lib/manual-apply';
import { servicesApi, servicesQueryKeys, type DocumentRequirement } from '@/services/api';
import { cn, formatCurrency } from '@/lib/utils';

function DocumentRequirementCard({ doc }: { doc: DocumentRequirement }) {
  const formats =
    doc.allowedFormats?.length ? doc.allowedFormats.join(', ').toUpperCase() : null;
  const maxSize = formatBytes(doc.maxFileSizeBytes);

  return (
    <div className="flex items-start gap-3 rounded-xl border border-[#F1F5F9] bg-[#F8FAFC] p-4">
      <CheckCircle2
        className={cn(
          'mt-0.5 h-5 w-5 shrink-0',
          doc.required ? 'text-emerald-500' : 'text-[#94A3B8]',
        )}
      />
      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-2">
          <p className="text-sm font-semibold text-[#0A1629]">{doc.name}</p>
          {doc.required ? (
            <span className="rounded-full bg-[#FEF2F2] px-2 py-0.5 text-[10px] font-bold text-[#DC2626]">
              Required
            </span>
          ) : (
            <span className="rounded-full bg-[#F1F5F9] px-2 py-0.5 text-[10px] font-bold text-[#64748B]">
              Optional
            </span>
          )}
        </div>
        {doc.description ? (
          <p className="mt-1 text-sm leading-6 text-[#64748B]">{doc.description}</p>
        ) : null}
        {doc.instructions ? (
          <p className="mt-1 text-xs leading-5 text-[#94A3B8]">{doc.instructions}</p>
        ) : null}
        {formats || maxSize ? (
          <p className="mt-2 text-xs text-[#94A3B8]">
            {[formats, maxSize].filter(Boolean).join(' · ')}
          </p>
        ) : null}
      </div>
    </div>
  );
}

export function ServiceDetailPage() {
  const navigate = useNavigate();
  const requireAuthNavigate = useRequireAuthNavigate();
  const requireAuth = useRequireAuth();
  const { mainSlug = '', subSlug = '' } = useParams();
  const [searchParams] = useSearchParams();
  const stateCode = searchParams.get('state') ?? undefined;
  const stateName = searchParams.get('stateName') ?? undefined;
  const [manualOpening, setManualOpening] = useState(false);

  const { data: catalog = [], isLoading: catalogLoading } = useQuery({
    queryKey: servicesQueryKeys.catalog(),
    queryFn: () => servicesApi.getServicesCatalog(),
  });

  const match = catalog
    .find(m => m.slug === mainSlug)
    ?.subServices.find(s => s.slug === subSlug);

  const { data: config, isLoading: configLoading } = useQuery({
    queryKey: servicesQueryKeys.configuration(match?.id ?? '', stateCode),
    queryFn: () => servicesApi.getSubServiceConfiguration(match!.id, stateCode),
    enabled: Boolean(match?.id),
  });

  useEffect(() => {
    if (!config?.fulfillment?.requiresStateSelection || stateCode) return;
    const states = config.fulfillment.availableStates ?? [];
    if (states.length === 1) {
      navigate(
        `/services/${mainSlug}/${subSlug}?state=${states[0].code}&stateName=${encodeURIComponent(states[0].name)}`,
        { replace: true },
      );
      return;
    }
    if (states.length > 1) {
      navigate(`/services/${mainSlug}/${subSlug}/select-state`, { replace: true });
    }
  }, [config, stateCode, mainSlug, subSlug, navigate]);

  const feeStats: ServiceFeeStat[] = useMemo(() => {
    if (!config) return [];
    const fulfillment = config.fulfillment;
    const assistedEnabled = fulfillment?.assistedEnabled !== false;
    const governmentFee = Number(config.pricing?.baseFee ?? 0);
    const platformFee = Number(
      config.pricing?.platformFee ?? fulfillment?.platformFee ?? 0,
    );
    const processingTime = config.overview?.processingTime ?? '—';
    const stats: ServiceFeeStat[] = [];

    if (assistedEnabled) {
      stats.push({
        key: 'government',
        label: 'Government fee',
        value: formatServiceFee(governmentFee),
      });
      stats.push({
        key: 'platform',
        label: 'Cybersave service fee',
        value: formatIncludedFee(platformFee),
      });
      const additional = config.pricing?.additionalCharges ?? [];
      for (const charge of additional) {
        stats.push({
          key: charge.name,
          label: charge.name,
          value: formatCurrency(Number(charge.amount)),
        });
      }
    }

    stats.push({
      key: 'processing',
      label: 'Processing time',
      value: processingTime,
    });

    if (config.overview?.department) {
      stats.push({
        key: 'department',
        label: 'Issuing department',
        value: config.overview.department,
      });
    }

    return stats;
  }, [config]);

  if (catalogLoading || configLoading) return <LoadingBlock className="h-96" />;

  if (
    config?.fulfillment?.requiresStateSelection &&
    !stateCode &&
    (config.fulfillment.availableStates?.length ?? 0) > 0
  ) {
    return <LoadingBlock className="h-64" />;
  }

  if (
    config?.fulfillment?.requiresStateSelection &&
    !stateCode &&
    (config.fulfillment.availableStates?.length ?? 0) === 0
  ) {
    return (
      <EmptyState
        title="Not available yet"
        description="This service has no states configured in the admin portal yet."
      />
    );
  }

  if (!match || !config) {
    return (
      <EmptyState
        title="Service not found"
        description="This service may have been unpublished or the link is incorrect."
      />
    );
  }

  const displayName = getServiceDisplayName(config);
  const fulfillment = config.fulfillment;
  const assistedEnabled = fulfillment?.assistedEnabled !== false;
  const manualEnabled = fulfillment?.manualEnabled === true;
  const governmentFee = Number(config.pricing?.baseFee ?? 0);
  const platformFee = Number(config.pricing?.platformFee ?? fulfillment?.platformFee ?? 0);
  const totalAssisted = Number(config.pricing?.totalAmount ?? governmentFee + platformFee);
  const about =
    config.overview?.richDescription ??
    config.overview?.shortDescription ??
    match.shortDescription ??
    match.description ??
    '';
  const instructions = config.instructions ?? config.overview?.instructions;
  const documents = config.documentRequirements ?? [];
  const formFieldCount = config.form?.fields?.length ?? 0;
  const selectedStateLabel =
    stateName ?? fulfillment?.selectedState?.name ?? undefined;

  function handleAssistedApply() {
    const path =
      config?.fulfillment?.requiresStateSelection && !stateCode
        ? `/services/${mainSlug}/${subSlug}/select-state`
        : buildApplyPath(mainSlug, subSlug, stateCode, stateName ?? undefined);

    requireAuthNavigate(path, { requireProfile: true });
  }

  async function handleManualApply() {
    requireAuth(async () => {
      const portalUrl = config!.fulfillment?.officialPortalUrl;
      if (!portalUrl) {
        toast.error('Official portal URL is not configured for this service.');
        return;
      }
      setManualOpening(true);
      try {
        await openManualApplyPortal({ subServiceId: match!.id, stateCode, portalUrl });
      } catch {
        toast.error('Could not open the official portal.');
      } finally {
        setManualOpening(false);
      }
    }, { requireProfile: true, profileMandatory: true });
  }

  const assistedLabel = fulfillment?.assistedCtaLabel ?? 'Get it done by us';
  const manualLabel = fulfillment?.manualCtaLabel ?? 'Apply on official portal';

  return (
    <div className="mx-auto max-w-3xl space-y-6 pb-10">
      <Breadcrumbs
        items={[
          { label: 'Home', to: '/' },
          { label: 'Services', to: '/services' },
          { label: config.mainService.name, to: `/services/category/${mainSlug}` },
          { label: displayName },
        ]}
      />

      {selectedStateLabel ? (
        <span className="inline-flex rounded-full bg-[#EFF6FF] px-3 py-1 text-xs font-semibold text-[#2563EB]">
          {decodeURIComponent(selectedStateLabel)}
        </span>
      ) : null}

      {/* Hero — same as mobile gradient header */}
      <div className="overflow-hidden rounded-2xl bg-gradient-to-br from-[#0A1629] via-[#1A3B8B] to-[#2563EB] p-6 text-white shadow-lg sm:p-8">
        <div className="flex items-start gap-4">
          <div className="min-w-0 flex-1">
            <p className="text-xs font-semibold tracking-wide text-blue-200 uppercase">
              {config.mainService.name}
            </p>
            <h1 className="font-display mt-2 text-2xl font-bold sm:text-3xl">{displayName}</h1>
            <p className="mt-3 text-sm leading-7 text-blue-100">
              {config.overview?.shortDescription ?? match.shortDescription ?? match.description}
            </p>
          </div>
          <Shield className="h-10 w-10 shrink-0 text-white/90" aria-hidden />
        </div>
      </div>

      {/* About */}
      {about ? (
        <section className="rounded-2xl border border-[#E8EDF5] bg-white p-6 shadow-sm">
          <h2 className="font-display text-lg font-bold text-[#0A1629]">About this service</h2>
          <p className="mt-3 whitespace-pre-line text-sm leading-7 text-[#64748B]">{about}</p>
        </section>
      ) : null}

      {/* Instructions from admin */}
      {instructions ? (
        <section className="rounded-2xl border border-[#E8EDF5] bg-white p-6 shadow-sm">
          <h2 className="font-display text-lg font-bold text-[#0A1629]">Instructions</h2>
          <div className="mt-3 flex items-start gap-3">
            <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-emerald-500" />
            <p className="text-sm leading-7 text-[#64748B]">{instructions}</p>
          </div>
        </section>
      ) : null}

      {/* Documents — from admin document requirements */}
      {documents.length > 0 && assistedEnabled ? (
        <section className="rounded-2xl border border-[#E8EDF5] bg-white p-6 shadow-sm">
          <div className="mb-4 flex items-center gap-2">
            <FileText className="h-5 w-5 text-[#2563EB]" />
            <h2 className="font-display text-lg font-bold text-[#0A1629]">Documents required</h2>
          </div>
          <p className="mb-4 text-sm text-[#64748B]">
            Keep these ready before you start your application. All requirements are configured by
            the admin for this service.
          </p>
          <div className="grid gap-3 sm:grid-cols-2">
            {documents.map(doc => (
              <DocumentRequirementCard key={doc.id} doc={doc} />
            ))}
          </div>
        </section>
      ) : null}

      {/* Form summary — fields filled on apply page (like mobile) */}
      {assistedEnabled && formFieldCount > 0 ? (
        <section className="rounded-2xl border border-dashed border-[#BFDBFE] bg-[#EFF6FF]/40 p-5">
          <p className="text-sm text-[#334155]">
            <span className="font-semibold text-[#0A1629]">{formFieldCount} application fields</span>{' '}
            configured by admin — you will fill these on the next step after choosing &quot;Get it
            done by us&quot;.
          </p>
        </section>
      ) : null}

      {/* Pricing & timing from API */}
      <ServiceFeeStatsGrid stats={feeStats} />

      {/* Terms from admin */}
      {config.termsAndConditions ? (
        <section className="rounded-2xl border border-[#E8EDF5] bg-white p-6 shadow-sm">
          <h2 className="font-display text-lg font-bold text-[#0A1629]">Terms & conditions</h2>
          <p className="mt-3 whitespace-pre-line text-sm leading-7 text-[#64748B]">
            {config.termsAndConditions}
          </p>
        </section>
      ) : null}

      {/* Manual apply instructions from admin fulfillment config */}
      {manualEnabled && fulfillment?.manualInstructions ? (
        <section className="rounded-2xl border border-[#E8EDF5] bg-[#FFFBEB] p-6">
          <h2 className="font-display text-lg font-bold text-[#0A1629]">Official portal guidance</h2>
          <p className="mt-3 text-sm leading-7 text-[#64748B]">{fulfillment.manualInstructions}</p>
        </section>
      ) : null}

      {/* CTAs — same as mobile: assisted + manual */}
      <div className="space-y-3 pt-2">
        {assistedEnabled ? (
          <Button size="lg" className="h-14 w-full rounded-xl text-base" onClick={handleAssistedApply}>
            {assistedLabel}
            {totalAssisted > 0 ? ` — ${formatCurrency(totalAssisted)}` : ''}
          </Button>
        ) : null}

        {manualEnabled ? (
          <Button
            size="lg"
            variant="outline"
            className="h-14 w-full rounded-xl border-[#E2E8F0] bg-white text-base"
            disabled={manualOpening}
            onClick={() => void handleManualApply()}
          >
            {manualOpening ? 'Opening official portal…' : manualLabel}
          </Button>
        ) : null}

        {!assistedEnabled && !manualEnabled ? (
          <div className="rounded-xl border border-dashed border-[#E2E8F0] bg-[#F8FAFC] p-6 text-center">
            <p className="text-sm text-[#64748B]">
              Online apply is not enabled for this service. Contact support or check back later.
            </p>
            <Link to="/help" className="mt-3 inline-block text-sm font-semibold text-[#2563EB]">
              Get help
            </Link>
          </div>
        ) : null}
      </div>
    </div>
  );
}
