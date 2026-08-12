import { useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router';
import { toast } from 'sonner';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  Checkbox,
  Input,
  Label,
  Skeleton,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui';
import { ServiceWizardShell } from '../../wizard/ServiceWizardShell';
import {
  useSaveWorkflow,
  useServiceVersionBundle,
  type ServiceVersionBundle,
} from '../../wizard/useServiceVersion';

type StepState = {
  id: string;
  stepKey: string;
  name: string;
  description?: string | null;
  sortOrder: number;
  applicationStatus: string;
  isInitial: boolean;
  isTerminal: boolean;
  citizenVisible: boolean;
  slaHours?: number | null;
};

type TransitionState = {
  id: string;
  fromStepId: string;
  toStepId: string;
  actionKey: string;
  label: string;
  allowedRoleIds: string[];
  requiredPermissions: string[];
  requiresComment: boolean;
  requiresAssignment: boolean;
  createsActionRequest: boolean;
  notifyCitizen: boolean;
  guardConfig?: Record<string, unknown>;
};

function mapBundleWorkflow(bundle?: ServiceVersionBundle | null) {
  const steps = (bundle?.workflowDefinition?.steps ?? []).map((s, index) => ({
    id: s.id,
    stepKey: s.stepKey,
    name: s.name,
    description: s.description ?? null,
    sortOrder: s.sortOrder ?? index,
    applicationStatus: s.applicationStatus,
    isInitial: Boolean(s.isInitial),
    isTerminal: Boolean(s.isTerminal),
    citizenVisible: s.citizenVisible !== false,
    slaHours: s.slaHours ?? null,
  }));

  const transitions = (bundle?.workflowDefinition?.transitions ?? []).map((t) => ({
    id: t.id,
    fromStepId: t.fromStepId,
    toStepId: t.toStepId,
    actionKey: t.actionKey,
    label: t.label,
    allowedRoleIds: t.allowedRoleIds ?? [],
    requiredPermissions: t.requiredPermissions ?? [],
    requiresComment: Boolean(t.requiresComment),
    requiresAssignment: Boolean(t.requiresAssignment),
    createsActionRequest: Boolean(t.createsActionRequest),
    notifyCitizen: Boolean(t.notifyCitizen),
    guardConfig: t.guardConfig,
  }));

  return { steps, transitions };
}

export function WorkflowStepPage() {
  const { mainServiceId = '', subServiceId = '' } = useParams();
  const navigate = useNavigate();
  const base = `/services/new/${mainServiceId}/sub/${subServiceId}`;

  const { data: bundle, isLoading, isError } = useServiceVersionBundle(mainServiceId, subServiceId);
  const { mutateAsync: saveWorkflow, isPending } = useSaveWorkflow(mainServiceId, subServiceId);

  const [steps, setSteps] = useState<StepState[]>([]);
  const [transitions, setTransitions] = useState<TransitionState[]>([]);

  useEffect(() => {
    const mapped = mapBundleWorkflow(bundle);
    setSteps(mapped.steps);
    setTransitions(mapped.transitions);
  }, [bundle]);

  const stepNameById = useMemo(() => {
    const map = new Map<string, string>();
    for (const step of steps) map.set(step.id, step.name);
    return map;
  }, [steps]);

  const stepKeyById = useMemo(() => {
    const map = new Map<string, string>();
    for (const step of steps) map.set(step.id, step.stepKey);
    return map;
  }, [steps]);

  const mainServiceName = bundle?.subService?.mainService?.name ?? 'Main Service';

  const persist = async () => {
    await saveWorkflow({
      steps: steps.map((s, index) => ({
        stepKey: s.stepKey,
        name: s.name,
        description: s.description ?? undefined,
        sortOrder: s.sortOrder ?? index,
        applicationStatus: s.applicationStatus,
        isInitial: s.isInitial,
        isTerminal: s.isTerminal,
        citizenVisible: s.citizenVisible,
        slaHours: s.slaHours ?? undefined,
      })),
      transitions: transitions.map((t) => {
        const fromStepKey = stepKeyById.get(t.fromStepId);
        const toStepKey = stepKeyById.get(t.toStepId);
        if (!fromStepKey || !toStepKey) {
          throw new Error('Workflow transition references a missing step');
        }
        return {
          fromStepKey,
          toStepKey,
          actionKey: t.actionKey,
          label: t.label,
          allowedRoleIds: t.allowedRoleIds,
          requiredPermissions: t.requiredPermissions,
          requiresComment: t.requiresComment,
          requiresAssignment: t.requiresAssignment,
          createsActionRequest: t.createsActionRequest,
          notifyCitizen: t.notifyCitizen,
          guardConfig: t.guardConfig,
        };
      }),
    });
  };

  const handleSave = async (next?: string) => {
    try {
      await persist();
      toast.success('Workflow saved');
      if (next) navigate(next);
    } catch {
      toast.error('Failed to save workflow');
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
    return <p className="text-sm text-danger">Failed to load workflow configuration.</p>;
  }

  return (
    <ServiceWizardShell
      step="workflow"
      crumbs={[
        { label: 'Dashboard', to: '/dashboard' },
        { label: 'Services', to: '/services' },
        { label: mainServiceName, to: `/services/new/${mainServiceId}/sub-services` },
        { label: 'Workflow' },
      ]}
      showBack
      onBack={() => navigate(`${base}/fulfillment`)}
      onDraft={() => handleSave()}
      onContinue={() => handleSave(`${base}/publish`)}
      continueLabel={isPending ? 'Saving…' : 'Save & Continue'}
    >
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Workflow Steps</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {steps.length === 0 ? (
              <p className="text-sm text-muted-foreground">No workflow steps found on this version.</p>
            ) : (
              steps.map((step) => (
                <div key={step.id} className="space-y-1.5 rounded-lg border border-border px-3 py-3">
                  <div className="flex items-center justify-between gap-2">
                    <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                      {step.stepKey}
                      {step.isInitial ? ' · initial' : ''}
                      {step.isTerminal ? ' · terminal' : ''}
                    </p>
                    <p className="text-xs text-muted-foreground">{step.applicationStatus}</p>
                  </div>
                  <Label className="sr-only">Display name for {step.stepKey}</Label>
                  <Input
                    value={step.name}
                    onChange={(e) =>
                      setSteps((prev) =>
                        prev.map((s) => (s.id === step.id ? { ...s, name: e.target.value } : s)),
                      )
                    }
                  />
                </div>
              ))
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Transitions</CardTitle>
          </CardHeader>
          <CardContent>
            {transitions.length === 0 ? (
              <p className="text-sm text-muted-foreground">No transitions defined.</p>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Action</TableHead>
                    <TableHead>From → To</TableHead>
                    <TableHead>Notify citizen</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {transitions.map((t) => (
                    <TableRow key={t.id}>
                      <TableCell className="font-medium">{t.label}</TableCell>
                      <TableCell className="text-muted-foreground">
                        {stepNameById.get(t.fromStepId) ?? t.fromStepId} →{' '}
                        {stepNameById.get(t.toStepId) ?? t.toStepId}
                      </TableCell>
                      <TableCell>
                        <label className="flex items-center gap-2 text-sm">
                          <Checkbox
                            checked={t.notifyCitizen}
                            onCheckedChange={(v) =>
                              setTransitions((prev) =>
                                prev.map((row) =>
                                  row.id === t.id ? { ...row, notifyCitizen: Boolean(v) } : row,
                                ),
                              )
                            }
                          />
                          Notify
                        </label>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </div>
    </ServiceWizardShell>
  );
}
