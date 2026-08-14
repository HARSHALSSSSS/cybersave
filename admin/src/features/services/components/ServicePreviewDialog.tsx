import { useQuery } from '@tanstack/react-query';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  Skeleton,
} from '@/components/ui';
import { servicesApi } from '../services/services.api';
import { formatCurrency } from '@/utils/format';

type ServicePreviewDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  serviceName: string;
  versionId?: string;
};

export function ServicePreviewDialog({
  open,
  onOpenChange,
  serviceName,
  versionId,
}: ServicePreviewDialogProps) {
  const { data, isLoading, isError } = useQuery({
    queryKey: ['service-preview', versionId],
    queryFn: () => servicesApi.previewVersion(versionId!),
    enabled: open && Boolean(versionId),
  });

  const fulfillment = data?.fulfillment as Record<string, unknown> | undefined;
  const pricing = data?.pricing as Record<string, unknown> | undefined;
  const form = data?.form as { fields?: unknown[] } | undefined;
  const documents = (data?.documentRequirements as unknown[]) ?? [];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[85vh] max-w-2xl overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Citizen preview — {serviceName}</DialogTitle>
        </DialogHeader>

        {isLoading ? (
          <div className="space-y-3">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-3/4" />
            <Skeleton className="h-24 w-full" />
          </div>
        ) : isError || !data ? (
          <p className="text-sm text-muted-foreground">
            Could not load preview. Publish the service or save a draft version first.
          </p>
        ) : (
          <div className="space-y-4 text-sm">
            <div className="grid gap-3 sm:grid-cols-2">
              <div className="rounded-lg border p-3">
                <p className="text-xs font-medium uppercase text-muted-foreground">Assisted apply</p>
                <p className="mt-1 font-medium">
                  {fulfillment?.assistedEnabled !== false ? 'Enabled' : 'Disabled'}
                </p>
                <p className="text-muted-foreground">
                  {String(fulfillment?.assistedCtaLabel ?? 'Get it done by us')}
                </p>
              </div>
              <div className="rounded-lg border p-3">
                <p className="text-xs font-medium uppercase text-muted-foreground">Manual apply</p>
                <p className="mt-1 font-medium">
                  {fulfillment?.manualEnabled ? 'Enabled' : 'Disabled'}
                </p>
                <p className="text-muted-foreground">
                  {String(fulfillment?.manualCtaLabel ?? 'Apply on official portal')}
                </p>
              </div>
            </div>

            <div className="rounded-lg border p-3">
              <p className="text-xs font-medium uppercase text-muted-foreground">Pricing</p>
              <p className="mt-1">
                Base fee:{' '}
                <span className="font-medium">
                  {formatCurrency(Number(pricing?.baseFee ?? 0))}
                </span>
              </p>
            </div>

            <div className="rounded-lg border p-3">
              <p className="text-xs font-medium uppercase text-muted-foreground">Form fields</p>
              <p className="mt-1">{form?.fields?.length ?? 0} citizen inputs configured</p>
            </div>

            <div className="rounded-lg border p-3">
              <p className="text-xs font-medium uppercase text-muted-foreground">Documents</p>
              <p className="mt-1">{documents.length} upload requirements</p>
            </div>

            {fulfillment?.requiresStateSelection ? (
              <div className="rounded-lg border p-3">
                <p className="text-xs font-medium uppercase text-muted-foreground">States</p>
                <p className="mt-1">
                  {((fulfillment.availableStates as unknown[]) ?? []).length} states configured
                </p>
              </div>
            ) : null}
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
