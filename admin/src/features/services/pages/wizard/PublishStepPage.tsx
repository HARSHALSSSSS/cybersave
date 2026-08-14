import { useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router';
import { AlertTriangle, CheckCircle2 } from 'lucide-react';
import { toast } from 'sonner';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  Checkbox,
  Input,
  Label,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  Skeleton,
} from '@/components/ui';
import { servicesApi } from '../../services/services.api';
import { ServiceWizardShell } from '../../wizard/ServiceWizardShell';
import { decimalToNumber, usePublishVersion, useServiceVersionBundle } from '../../wizard/useServiceVersion';
import { getWizardVersionId } from '../../wizard/wizard-version';

export function PublishStepPage() {
  const { mainServiceId = '', subServiceId = '' } = useParams();
  const navigate = useNavigate();
  const [visibility, setVisibility] = useState('public');
  const [notify, setNotify] = useState(true);
  const [env, setEnv] = useState<'production' | 'staging'>('production');
  const [validationErrors, setValidationErrors] = useState<string[]>([]);

  const { data: bundle, isLoading, isError } = useServiceVersionBundle(mainServiceId, subServiceId);
  const { mutateAsync: publish, isPending } = usePublishVersion(mainServiceId, subServiceId);

  const mainServiceName = bundle?.subService?.mainService?.name ?? 'Main Service';

  const checklist = useMemo(() => {
    const fieldCount = bundle?.formVersion?.fields?.length ?? 0;
    const docCount = bundle?.documentRequirements?.length ?? 0;
    const fee = decimalToNumber(bundle?.pricingConfig?.baseFee);
    const stepCount = bundle?.workflowDefinition?.steps?.length ?? 0;
    const fulfillment = bundle?.fulfillmentConfig;
    const assisted = Boolean(fulfillment?.assistedEnabled ?? true);
    const manual = Boolean(fulfillment?.manualEnabled);
    const stateCount = fulfillment?.stateVariants?.length ?? 0;

    return [
      { label: 'Main Service definition registered', ok: Boolean(bundle?.subService?.mainService?.id) },
      { label: 'Sub Service configuration finalized', ok: Boolean(bundle?.subService?.id) },
      { label: 'Overview information complete', ok: Boolean(bundle?.overview?.displayName) },
      { label: `Citizen Form Schema validated (${fieldCount} inputs)`, ok: fieldCount > 0 || !assisted },
      { label: `Attachment requirements assigned (${docCount} files)`, ok: docCount >= 0 },
      { label: `Base pricing configured (₹${fee})`, ok: fee >= 0 },
      {
        label: `Fulfillment paths (${assisted ? 'assisted' : ''}${assisted && manual ? ' + ' : ''}${manual ? 'manual' : ''}${stateCount ? `, ${stateCount} states` : ''})`,
        ok: assisted || manual,
      },
      { label: `Approval routing workflow compiled (${stepCount} nodes)`, ok: stepCount > 0 },
    ];
  }, [bundle]);

  const handleValidate = async () => {
    const versionId = getWizardVersionId(subServiceId);
    if (!versionId) {
      toast.error('Missing wizard version');
      return;
    }
    try {
      const result = await servicesApi.validateVersion(versionId);
      setValidationErrors(result.errors ?? []);
      if (result.valid) {
        toast.success('Validation passed');
      } else {
        toast.error('Validation failed');
      }
    } catch {
      toast.error('Validation request failed');
    }
  };

  const handlePublish = async () => {
    try {
      await publish();
      toast.success('Service published to citizen portal');
      navigate('/services');
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Publish failed';
      toast.error(message);
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-8 w-64" />
        <Skeleton className="h-96 w-full rounded-xl" />
      </div>
    );
  }

  if (isError) {
    return <p className="text-sm text-danger">Failed to load publish checklist.</p>;
  }

  return (
    <ServiceWizardShell
      step="publish"
      crumbs={[
        { label: 'Dashboard', to: '/dashboard' },
        { label: 'Services', to: '/services' },
        { label: mainServiceName, to: `/services/new/${mainServiceId}/sub-services` },
        { label: 'Publish' },
      ]}
      footerLeft="Step 9 of 9: Final validation and portal release."
      secondaryLabel="Validate"
      onSecondary={handleValidate}
      onDraft={undefined}
      continueLabel={isPending ? 'Publishing…' : 'Publish Service'}
      onContinue={handlePublish}
      showBack
      onBack={() => navigate(`/services/new/${mainServiceId}/sub/${subServiceId}/workflow`)}
    >
      <div className="mb-4">
        <button
          type="button"
          className="text-sm font-medium text-primary hover:underline"
          onClick={() => navigate(`/services/new/${mainServiceId}/sub/${subServiceId}/overview`)}
        >
          ← Back to Preview
        </button>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Pre-Publish Readiness Checklist</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {checklist.map((item) => (
              <div key={item.label} className="flex items-start gap-2.5">
                <CheckCircle2 className={`mt-0.5 size-4 shrink-0 ${item.ok ? 'text-success' : 'text-muted-foreground'}`} />
                <p className="text-sm leading-5 text-foreground">{item.label}</p>
              </div>
            ))}
            {validationErrors.length > 0 ? (
              <div className="rounded-lg border border-danger/30 bg-danger/5 p-3 text-sm text-danger">
                {validationErrors.map((err) => (
                  <p key={err}>{err}</p>
                ))}
              </div>
            ) : null}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Publishing Options</CardTitle>
          </CardHeader>
          <CardContent className="space-y-5">
            <div className="space-y-1.5">
              <Label>Portal Visibility</Label>
              <Select value={visibility} onValueChange={setVisibility}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="public">All Citizens (Public Access)</SelectItem>
                  <SelectItem value="centres">Service Centres Only</SelectItem>
                  <SelectItem value="internal">Internal Staff Only</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label>Effective Date</Label>
              <Input value="Immediately upon publishing" readOnly />
            </div>
            <label className="flex items-start gap-3 rounded-lg border border-border px-4 py-3">
              <Checkbox checked={notify} onCheckedChange={(v) => setNotify(Boolean(v))} className="mt-0.5" />
              <span>
                <span className="block text-sm font-medium">Notify Citizens & Staff</span>
                <span className="text-xs text-muted-foreground">
                  Dispatches automatic SMS/Email updates about the new service.
                </span>
              </span>
            </label>
            <div className="space-y-2">
              <Label>Target Environment</Label>
              {(
                [
                  ['production', 'Production (Live Portal)'],
                  ['staging', 'Staging Sandbox'],
                ] as const
              ).map(([value, label]) => (
                <label key={value} className="flex items-center gap-2 text-sm">
                  <input
                    type="radio"
                    name="env"
                    checked={env === value}
                    onChange={() => setEnv(value)}
                    className="accent-[var(--color-primary)]"
                  />
                  {label}
                </label>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="mt-6 flex items-start gap-3 rounded-xl border border-warning-border bg-warning-bg px-4 py-3">
        <AlertTriangle className="mt-0.5 size-5 shrink-0 text-warning-text" />
        <p className="text-sm leading-5 text-warning-text">
          Warning: Publishing this service makes it visible and accessible to citizens on the main portal. Ensure all SLA
          constraints and verification authorities are properly configured.
        </p>
      </div>
    </ServiceWizardShell>
  );
}
