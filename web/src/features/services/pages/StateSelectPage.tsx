import { useEffect } from 'react';
import { useNavigate, useParams } from 'react-router';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Breadcrumbs } from '@/components/layout/Breadcrumbs';
import { LoadingBlock, EmptyState } from '@/components/ui/primitives';
import { getServiceDisplayName } from '@/features/apply/utils/service-helpers';
import { servicesApi, servicesQueryKeys } from '@/services/api';

export function StateSelectPage() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { mainSlug = '', subSlug = '' } = useParams();

  const { data: catalog = [], isLoading: catalogLoading } = useQuery({
    queryKey: servicesQueryKeys.catalog(),
    queryFn: () => servicesApi.getServicesCatalog(),
  });

  const match = catalog
    .find(m => m.slug === mainSlug)
    ?.subServices.find(s => s.slug === subSlug);

  const { data: config, isLoading: configLoading } = useQuery({
    queryKey: servicesQueryKeys.configuration(match?.id ?? '', undefined),
    queryFn: () => servicesApi.getSubServiceConfiguration(match!.id),
    enabled: Boolean(match?.id),
  });

  const states = config?.fulfillment?.availableStates ?? [];
  const displayName = config ? getServiceDisplayName(config) : 'Service';

  useEffect(() => {
    if (states.length === 1) {
      const s = states[0];
      navigate(
        `/services/${mainSlug}/${subSlug}?state=${s.code}&stateName=${encodeURIComponent(s.name)}`,
        { replace: true },
      );
    }
  }, [states, mainSlug, subSlug, navigate]);

  if ((catalogLoading && catalog.length === 0) || (configLoading && !config)) {
    return <LoadingBlock className="h-96" />;
  }

  if (!match || !config) {
    return <EmptyState title="Service not found" description="Return to the services catalog." />;
  }

  if (states.length === 0) {
    return (
      <EmptyState
        title="Not available in your region"
        description="This service has no assisted states configured yet."
      />
    );
  }

  if (states.length === 1) return <LoadingBlock className="h-64" />;

  return (
    <div className="space-y-6">
      <Breadcrumbs
        items={[
          { label: 'Services', to: '/services' },
          { label: displayName, to: `/services/${mainSlug}/${subSlug}` },
          { label: 'Select State' },
        ]}
      />

      <div>
        <h1 className="font-display text-2xl font-bold text-[#0A1629]">Select Your State</h1>
        <p className="mt-2 text-sm text-[#6B7280]">
          {displayName} availability and fees vary by state. Choose where you want to apply.
        </p>
      </div>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {states.map(state => (
          <button
            key={state.code}
            type="button"
            onClick={() => {
              if (match?.id) {
                void queryClient.prefetchQuery({
                  queryKey: servicesQueryKeys.configuration(match.id, state.code),
                  queryFn: () => servicesApi.getSubServiceConfiguration(match.id, state.code),
                });
                void import('@/features/apply/pages/ServiceApplyPage');
              }
              navigate(
                `/services/${mainSlug}/${subSlug}/apply?state=${state.code}&stateName=${encodeURIComponent(state.name)}`,
              );
            }}
            className="rounded-2xl border border-[#E5E7EB] bg-white px-5 py-4 text-left shadow-sm transition hover:border-[#2563EB] hover:bg-[#EFF6FF]/40"
          >
            <p className="font-semibold text-[#0A1629]">{state.name}</p>
            <p className="mt-1 text-xs text-[#6B7280]">{state.code}</p>
          </button>
        ))}
      </div>
    </div>
  );
}
