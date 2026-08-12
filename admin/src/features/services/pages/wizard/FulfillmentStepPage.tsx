import { useCallback, useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router';
import { Link2, Plus, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  Button,
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  Input,
  Label,
  Skeleton,
  Switch,
  Textarea,
} from '@/components/ui';
import { ServiceWizardShell } from '../../wizard/ServiceWizardShell';
import { useServiceVersionBundle } from '../../wizard/useServiceVersion';
import { servicesApi } from '../../services/services.api';
import { INDIAN_STATES } from '@/constants/indian-states';
import {
  buildRecommendedFulfillment,
  getRecommendedDefaultPortalUrl,
  isStateBasedManualService,
} from '../../constants/manual-portal-presets';

type StateRow = {
  stateCode: string;
  stateName: string;
  officialPortalUrl: string;
  platformFee: number;
  baseFeeOverride?: number;
};

export function FulfillmentStepPage() {
  const { mainServiceId = '', subServiceId = '' } = useParams();
  const navigate = useNavigate();
  const base = `/services/new/${mainServiceId}/sub/${subServiceId}`;
  const queryClient = useQueryClient();

  const { data: mainService } = useQuery({
    queryKey: ['main-service', mainServiceId],
    queryFn: () => servicesApi.getMainService(mainServiceId),
    enabled: Boolean(mainServiceId),
  });

  const subServiceSlug = useMemo(
    () => mainService?.subServices.find(s => s.id === subServiceId)?.slug ?? '',
    [mainService, subServiceId],
  );

  const { data: bundle, isLoading, isError } = useServiceVersionBundle(
    mainServiceId,
    subServiceId,
  );
  const versionId = bundle?.id;

  const [assistedEnabled, setAssistedEnabled] = useState(true);
  const [manualEnabled, setManualEnabled] = useState(false);
  const [requiresState, setRequiresState] = useState(false);
  const [defaultPlatformFee, setDefaultPlatformFee] = useState(49);
  const [defaultPortalUrl, setDefaultPortalUrl] = useState('');
  const [manualInstructions, setManualInstructions] = useState('');
  const [stateVariants, setStateVariants] = useState<StateRow[]>([]);
  const [autoFilled, setAutoFilled] = useState(false);

  const mainServiceName = bundle?.subService?.mainService?.name ?? 'Main Service';
  const subServiceName = bundle?.subService?.name ?? 'Sub Service';

  const applyRecommendedPortals = useCallback(
    (platformFee = defaultPlatformFee) => {
      if (!subServiceSlug) {
        toast.error('Sub-service slug not found');
        return;
      }
      const recommended = buildRecommendedFulfillment(subServiceSlug, platformFee);
      if (!recommended) {
        toast.error('No recommended portal links for this service');
        return;
      }
      setManualEnabled(true);
      setRequiresState(recommended.requiresStateSelection);
      setDefaultPortalUrl(recommended.defaultPortalUrl);
      setManualInstructions(recommended.manualInstructions);
      setStateVariants(recommended.stateVariants);
      toast.success('Recommended portal links applied');
    },
    [defaultPlatformFee, subServiceSlug],
  );

  useEffect(() => {
    const f = (bundle as { fulfillmentConfig?: Record<string, unknown> })?.fulfillmentConfig;
    if (!f) return;
    setAssistedEnabled(Boolean(f.assistedEnabled ?? true));
    setManualEnabled(Boolean(f.manualEnabled));
    setRequiresState(Boolean(f.requiresStateSelection));
    setDefaultPlatformFee(Number(f.defaultPlatformFee ?? 49));
    setDefaultPortalUrl(String(f.defaultPortalUrl ?? ''));
    setManualInstructions(String(f.manualInstructions ?? ''));
    const variants = (f as { stateVariants?: StateRow[] }).stateVariants ?? [];
    setStateVariants(
      variants.map(v => ({
        stateCode: v.stateCode,
        stateName: v.stateName,
        officialPortalUrl: v.officialPortalUrl ?? '',
        platformFee: Number(v.platformFee ?? 49),
        baseFeeOverride: v.baseFeeOverride ? Number(v.baseFeeOverride) : undefined,
      })),
    );
    setAutoFilled(false);
  }, [bundle]);

  useEffect(() => {
    if (!subServiceSlug || autoFilled || !bundle) return;
    const f = (bundle as { fulfillmentConfig?: Record<string, unknown> })?.fulfillmentConfig;
    if (!f?.manualEnabled) return;

    const hasDefault = Boolean(String(f.defaultPortalUrl ?? '').trim());
    const variants = (f as { stateVariants?: StateRow[] }).stateVariants ?? [];
    const hasStateUrls = variants.some(v => v.officialPortalUrl?.trim());

    if (!hasDefault && !hasStateUrls) {
      applyRecommendedPortals(Number(f.defaultPlatformFee ?? 49));
      setAutoFilled(true);
    }
  }, [applyRecommendedPortals, autoFilled, bundle, subServiceSlug]);

  const saveMutation = useMutation({
    mutationFn: () =>
      servicesApi.saveFulfillment(versionId!, {
        assistedEnabled,
        manualEnabled,
        requiresStateSelection: requiresState,
        defaultPlatformFee,
        defaultPortalUrl: defaultPortalUrl.trim() || undefined,
        manualInstructions: manualInstructions.trim() || undefined,
        stateVariants: stateVariants.map(v => ({
          stateCode: v.stateCode,
          stateName: v.stateName,
          officialPortalUrl: v.officialPortalUrl.trim(),
          platformFee: v.platformFee,
          baseFeeOverride: v.baseFeeOverride,
        })),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['service-version', subServiceId] });
    },
  });

  const validateManualPortals = (): boolean => {
    if (!manualEnabled) return true;

    if (requiresState) {
      if (stateVariants.length === 0) {
        toast.error('Add at least one state with a portal URL for manual apply');
        return false;
      }
      for (const row of stateVariants) {
        if (!row.stateCode.trim() || !row.stateName.trim()) {
          toast.error('Each state needs a valid code and name');
          return false;
        }
        if (!row.officialPortalUrl.trim()) {
          toast.error(`Portal URL is required for ${row.stateName || 'each state'}`);
          return false;
        }
      }
      return true;
    }

    if (!defaultPortalUrl.trim()) {
      toast.error('Default portal URL is required when manual apply is enabled');
      return false;
    }

    return true;
  };

  const handleSave = async (next?: string) => {
    if (!versionId) return;
    if (!validateManualPortals()) return;

    try {
      await saveMutation.mutateAsync();
      toast.success('Fulfillment settings saved');
      if (next) navigate(next);
    } catch {
      toast.error('Failed to save fulfillment settings');
    }
  };

  const addState = () => {
    setStateVariants(rows => [
      ...rows,
      { stateCode: '', stateName: '', officialPortalUrl: '', platformFee: defaultPlatformFee },
    ]);
  };

  const pickState = (index: number, code: string) => {
    const match = INDIAN_STATES.find(s => s.code === code);
    if (!match) return;
    setStateVariants(rows => {
      const next = [...rows];
      next[index] = {
        ...next[index],
        stateCode: match.code,
        stateName: match.name,
      };
      return next;
    });
  };

  const usedStateCodes = new Set(
    stateVariants.map(row => row.stateCode).filter(Boolean),
  );

  const recommendedHint = subServiceSlug
    ? isStateBasedManualService(subServiceSlug)
      ? 'State-wise e-District / department portals'
      : getRecommendedDefaultPortalUrl(subServiceSlug)
        ? `Official portal: ${getRecommendedDefaultPortalUrl(subServiceSlug)}`
        : null
    : null;

  if (isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-8 w-64" />
        <Skeleton className="h-96 w-full rounded-xl" />
      </div>
    );
  }

  if (isError) {
    return <p className="text-sm text-danger">Failed to load fulfillment configuration.</p>;
  }

  return (
    <ServiceWizardShell
      step="fulfillment"
      crumbs={[
        { label: 'Dashboard', to: '/dashboard' },
        { label: 'Services', to: '/services' },
        { label: mainServiceName, to: `/services/new/${mainServiceId}/sub-services` },
        { label: 'Fulfillment' },
      ]}
      showBack
      onBack={() => navigate(`${base}/pricing`)}
      onDraft={() => handleSave()}
      onContinue={() => handleSave(`${base}/workflow`)}
      continueLabel={saveMutation.isPending ? 'Saving…' : 'Save & Continue'}
    >
      <Card>
        <CardHeader className="flex flex-row flex-wrap items-start justify-between gap-3">
          <div>
            <CardTitle>Fulfillment paths</CardTitle>
            <p className="mt-1 text-sm text-muted-foreground">
              {subServiceName}
              {subServiceSlug ? ` · ${subServiceSlug}` : ''}
            </p>
          </div>
          {subServiceSlug ? (
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => applyRecommendedPortals()}
            >
              <Link2 className="mr-1 size-4" />
              Apply recommended links
            </Button>
          ) : null}
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center justify-between">
            <Label>Get it done by us (assisted)</Label>
            <Switch checked={assistedEnabled} onCheckedChange={setAssistedEnabled} />
          </div>
          <div className="flex items-center justify-between">
            <Label>Apply on official portal (manual)</Label>
            <Switch checked={manualEnabled} onCheckedChange={setManualEnabled} />
          </div>
          <div className="flex items-center justify-between">
            <Label>Requires state selection</Label>
            <Switch checked={requiresState} onCheckedChange={setRequiresState} />
          </div>

          {manualEnabled && recommendedHint ? (
            <p className="rounded-lg border border-dashed bg-muted/40 px-3 py-2 text-sm text-muted-foreground">
              Recommended redirect: {recommendedHint}
            </p>
          ) : null}

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <Label>Assisted platform fee (₹) — “Get it done by us” only</Label>
              <Input
                type="number"
                value={defaultPlatformFee}
                onChange={e => setDefaultPlatformFee(Number(e.target.value))}
              />
            </div>
            <div>
              <Label>
                Default portal URL
                {manualEnabled && !requiresState ? (
                  <span className="text-danger"> *</span>
                ) : null}
              </Label>
              <Input
                value={defaultPortalUrl}
                onChange={e => setDefaultPortalUrl(e.target.value)}
                placeholder="https://official-portal.gov.in/"
                disabled={requiresState}
              />
              {requiresState ? (
                <p className="mt-1 text-xs text-muted-foreground">
                  For state-based services, set portal URLs per state below.
                </p>
              ) : null}
            </div>
          </div>
          <div>
            <Label>Manual apply instructions</Label>
            <Textarea
              value={manualInstructions}
              onChange={e => setManualInstructions(e.target.value)}
              rows={3}
              placeholder="Tell citizens what to do on the official portal after redirect…"
            />
          </div>

          {requiresState ? (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <Label className="text-base font-semibold">
                    State portal links
                    {manualEnabled ? <span className="text-danger"> *</span> : null}
                  </Label>
                  <p className="text-sm text-muted-foreground">
                    Each state must have an official redirect URL for manual apply.
                  </p>
                </div>
                <Button type="button" variant="outline" size="sm" onClick={addState}>
                  <Plus className="mr-1 size-4" /> Add state
                </Button>
              </div>
              {stateVariants.length === 0 ? (
                <p className="rounded-lg border border-dashed p-4 text-sm text-muted-foreground">
                  No states configured. Use “Apply recommended links” or add states manually.
                </p>
              ) : null}
              {stateVariants.map((row, index) => (
                <div key={index} className="grid gap-2 rounded-lg border p-3 sm:grid-cols-2">
                  <div>
                    <Label className="text-xs text-muted-foreground">State</Label>
                    <select
                      className="mt-1 flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                      value={row.stateCode}
                      onChange={e => pickState(index, e.target.value)}
                    >
                      <option value="">Select state</option>
                      {INDIAN_STATES.map(state => (
                        <option
                          key={state.code}
                          value={state.code}
                          disabled={
                            usedStateCodes.has(state.code) && row.stateCode !== state.code
                          }
                        >
                          {state.name} ({state.code})
                        </option>
                      ))}
                    </select>
                  </div>
                  <Input placeholder="State name" value={row.stateName} readOnly />
                  <div className="sm:col-span-2">
                    <Label className="text-xs text-muted-foreground">
                      Official redirect URL
                      {manualEnabled ? <span className="text-danger"> *</span> : null}
                    </Label>
                    <Input
                      className="mt-1"
                      placeholder="https://state-portal.gov.in/"
                      value={row.officialPortalUrl}
                      onChange={e => {
                        const next = [...stateVariants];
                        next[index].officialPortalUrl = e.target.value;
                        setStateVariants(next);
                      }}
                    />
                  </div>
                  <Input
                    type="number"
                    placeholder="Platform fee"
                    value={row.platformFee}
                    onChange={e => {
                      const next = [...stateVariants];
                      next[index].platformFee = Number(e.target.value);
                      setStateVariants(next);
                    }}
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() =>
                      setStateVariants(stateVariants.filter((_, i) => i !== index))
                    }
                  >
                    <Trash2 className="size-4" />
                  </Button>
                </div>
              ))}
            </div>
          ) : null}
        </CardContent>
      </Card>
    </ServiceWizardShell>
  );
}
