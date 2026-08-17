import { useMemo, useState } from 'react';
import { Link } from 'react-router';
import { useQuery } from '@tanstack/react-query';
import { ExternalLink } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { EmptyState, LoadingBlock } from '@/components/ui/primitives';
import { HomeBannerStrip } from '@/features/home/components/HomeBannerStrip';
import { schemesApi, schemesQueryKeys } from '@/services/api';

export function SchemesPage() {
  const [filter, setFilter] = useState('All');
  const { data: schemes = [], isLoading } = useQuery({
    queryKey: schemesQueryKeys.list(),
    queryFn: () => schemesApi.getGovernmentSchemes(),
  });

  const categories = useMemo(
    () => ['All', ...Array.from(new Set(schemes.map((scheme) => scheme.category)))],
    [schemes],
  );

  const schemeCards = useMemo(
    () => (filter === 'All' ? schemes : schemes.filter((scheme) => scheme.category === filter)),
    [filter, schemes],
  );

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-3xl font-bold tracking-tight text-[#0A1629]">
          Government Schemes
        </h1>
        <p className="mt-2 max-w-2xl text-sm leading-6 text-[#6B7280]">
          Central and state welfare schemes listed by Cybersave. Open a scheme for eligibility,
          documents required, and the official government portal.
        </p>
      </div>

      <HomeBannerStrip placement="schemes" />

      {categories.length > 1 ? (
        <div className="flex flex-wrap gap-2">
          {categories.map((item) => (
            <button
              key={item}
              type="button"
              onClick={() => setFilter(item)}
              className={
                filter === item
                  ? 'rounded-full bg-[#2563EB] px-4 py-2 text-sm font-medium text-white'
                  : 'rounded-full border border-[#E5E7EB] bg-white px-4 py-2 text-sm font-medium text-[#4B5563]'
              }
            >
              {item}
            </button>
          ))}
        </div>
      ) : null}

      {isLoading ? (
        <LoadingBlock />
      ) : schemeCards.length === 0 ? (
        <EmptyState
          title="No schemes available"
          description="Schemes added by Cybersave admin will appear here."
        />
      ) : (
        <div className="space-y-4">
          {schemeCards.map((scheme) => (
            <article
              key={scheme.id}
              className="flex flex-col gap-4 rounded-2xl border border-[#E5E7EB] bg-white p-6 shadow-sm lg:flex-row lg:items-start lg:justify-between"
            >
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="rounded-full bg-[#EFF6FF] px-2.5 py-0.5 text-[10px] font-bold tracking-wide text-[#2563EB] uppercase">
                    {scheme.category}
                  </span>
                </div>
                <h3 className="mt-2 text-xl font-bold text-[#0A1629]">{scheme.name}</h3>
                {scheme.ministry ? (
                  <p className="mt-1 text-sm font-medium text-[#64748B]">{scheme.ministry}</p>
                ) : null}
                <p className="mt-3 rounded-xl bg-[#F8FAFC] px-4 py-3 text-sm leading-6 text-[#334155]">
                  {scheme.description}
                </p>
                <p className="mt-3 text-sm text-[#64748B]">
                  <span className="font-semibold text-[#475569]">Who can apply: </span>
                  {scheme.whoCanApply}
                </p>
              </div>

              <div className="flex shrink-0 flex-col gap-2 sm:flex-row lg:flex-col">
                <Link to={`/schemes/${scheme.slug}`}>
                  <Button variant="outline" className="w-full sm:w-auto">
                    View details
                  </Button>
                </Link>
                <a href={scheme.officialPortalUrl} target="_blank" rel="noopener noreferrer">
                  <Button className="w-full gap-2 sm:w-auto">
                    {scheme.officialPortalLabel}
                    <ExternalLink className="h-4 w-4" />
                  </Button>
                </a>
              </div>
            </article>
          ))}
        </div>
      )}
    </div>
  );
}
