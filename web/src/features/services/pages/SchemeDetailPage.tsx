import { Link, useParams } from 'react-router';
import { useQuery } from '@tanstack/react-query';
import { ArrowLeft, ExternalLink } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { EmptyState, LoadingBlock } from '@/components/ui/primitives';
import { schemesApi, schemesQueryKeys } from '@/services/api';

export function SchemeDetailPage() {
  const { schemeId = '' } = useParams();
  const { data: scheme, isLoading, isError } = useQuery({
    queryKey: schemesQueryKeys.detail(schemeId),
    queryFn: () => schemesApi.getGovernmentScheme(schemeId),
    enabled: Boolean(schemeId),
  });

  if (isLoading) return <LoadingBlock />;
  if (isError || !scheme) {
    return (
      <EmptyState
        title="Scheme not found"
        description="This scheme is no longer listed."
        action={
          <Link to="/schemes">
            <Button variant="outline">Back to schemes</Button>
          </Link>
        }
      />
    );
  }

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <Link to="/schemes" className="inline-flex items-center gap-1 text-sm font-semibold text-[#2563EB]">
        <ArrowLeft className="h-4 w-4" />
        All schemes
      </Link>

      <span className="inline-flex rounded-full bg-[#EFF6FF] px-2.5 py-0.5 text-[10px] font-bold tracking-wide text-[#2563EB] uppercase">
        {scheme.category}
      </span>
      <h1 className="font-display text-3xl font-bold tracking-tight text-[#0A1629]">{scheme.name}</h1>
      {scheme.ministry ? <p className="text-sm font-medium text-[#64748B]">{scheme.ministry}</p> : null}

      <section className="rounded-2xl border border-[#E5E7EB] bg-white p-6 shadow-sm">
        <h2 className="text-base font-bold text-[#0A1629]">About this scheme</h2>
        <p className="mt-2 text-sm leading-6 text-[#334155]">{scheme.description}</p>
      </section>

      <section className="rounded-2xl border border-[#E5E7EB] bg-white p-6 shadow-sm">
        <h2 className="text-base font-bold text-[#0A1629]">Who can apply</h2>
        <p className="mt-2 text-sm leading-6 text-[#334155]">{scheme.whoCanApply}</p>
        <h3 className="mt-5 text-sm font-bold text-[#0A1629]">Eligibility</h3>
        <p className="mt-2 text-sm leading-6 text-[#334155]">{scheme.eligibility}</p>
      </section>

      <section className="rounded-2xl border border-[#E5E7EB] bg-white p-6 shadow-sm">
        <h2 className="text-base font-bold text-[#0A1629]">Documents required</h2>
        {scheme.documentsRequired.length === 0 ? (
          <p className="mt-2 text-sm text-[#64748B]">Check the official portal for document requirements.</p>
        ) : (
          <ul className="mt-3 list-disc space-y-1 pl-5 text-sm leading-6 text-[#334155]">
            {scheme.documentsRequired.map((doc) => (
              <li key={doc}>{doc}</li>
            ))}
          </ul>
        )}
      </section>

      <a href={scheme.officialPortalUrl} target="_blank" rel="noopener noreferrer">
        <Button className="gap-2">
          Apply on {scheme.officialPortalLabel}
          <ExternalLink className="h-4 w-4" />
        </Button>
      </a>
    </div>
  );
}
