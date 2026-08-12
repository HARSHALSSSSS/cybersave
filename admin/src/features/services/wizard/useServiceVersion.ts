import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { servicesApi } from '../services/services.api';
import { getWizardVersionId, setWizardVersionId } from './wizard-version';

export interface ServiceVersionBundle {
  id: string;
  lifecycleStatus?: string;
  overview?: {
    displayName?: string | null;
    shortDescription?: string | null;
    richDescription?: string | null;
    processingTime?: string | null;
    department?: string | null;
    seoTags?: string[];
  } | null;
  formVersion?: {
    fields?: Array<{
      id: string;
      key?: string | null;
      label: string;
      type: string;
      required?: boolean;
      placeholder?: string | null;
      sortOrder?: number;
      options?: Array<{
        id?: string;
        label: string;
        value: string;
        sortOrder?: number;
      }>;
    }>;
  } | null;
  documentRequirements?: Array<{
    id: string;
    name: string;
    required?: boolean;
    allowedFormats?: string[];
    maxFileSizeBytes?: number | null;
  }>;
  pricingConfig?: {
    baseFee?: unknown;
    taxEnabled?: boolean;
    taxRate?: unknown;
    currency?: string;
    additionalCharges?: Array<{
      id: string;
      name: string;
      amount: unknown;
      condition?: string | null;
    }>;
  } | null;
  workflowDefinition?: {
    steps?: Array<{
      id: string;
      stepKey: string;
      name: string;
      description?: string | null;
      sortOrder?: number;
      applicationStatus: string;
      isInitial?: boolean;
      isTerminal?: boolean;
      citizenVisible?: boolean;
      slaHours?: number | null;
    }>;
    transitions?: Array<{
      id: string;
      fromStepId: string;
      toStepId: string;
      actionKey: string;
      label: string;
      allowedRoleIds?: string[];
      requiredPermissions?: string[];
      requiresComment?: boolean;
      requiresAssignment?: boolean;
      createsActionRequest?: boolean;
      notifyCitizen?: boolean;
      guardConfig?: Record<string, unknown>;
    }>;
  } | null;
  subService?: { id: string; name: string; mainService?: { id: string; name: string } };
}

async function ensureDraftVersionId(
  mainServiceId: string,
  subServiceId: string,
): Promise<string | null> {
  const main = await servicesApi.getMainService(mainServiceId);
  const sub = main.subServices.find((s) => s.id === subServiceId);
  const latest = sub?.latestVersion;

  const stored = getWizardVersionId(subServiceId);
  if (stored) {
    try {
      const version = (await servicesApi.getServiceVersion(stored)) as {
        id?: string;
        lifecycleStatus?: string;
      };
      if (version?.lifecycleStatus === 'DRAFT' && version.id) {
        setWizardVersionId(subServiceId, version.id);
        return version.id;
      }
    } catch {
      // Stored id may be stale after publish; fall through to latest/clone.
    }
  }

  if (latest?.lifecycleStatus === 'DRAFT' && latest.id) {
    setWizardVersionId(subServiceId, latest.id);
    return latest.id;
  }

  if (!latest?.id) {
    return null;
  }

  // Latest is published (or otherwise non-draft) — clone a new editable draft.
  try {
    const cloned = await servicesApi.createVersion(subServiceId, {
      cloneFromVersionId: latest.id,
    });
    setWizardVersionId(subServiceId, cloned.id);
    return cloned.id;
  } catch {
    // Race: another draft may already exist; re-fetch and use it if present.
    const refreshed = await servicesApi.getMainService(mainServiceId);
    const refreshedSub = refreshed.subServices.find((s) => s.id === subServiceId);
    const draft = refreshedSub?.latestVersion;
    if (draft?.lifecycleStatus === 'DRAFT' && draft.id) {
      setWizardVersionId(subServiceId, draft.id);
      return draft.id;
    }
    throw new Error('Unable to create or resolve a draft version for this sub-service.');
  }
}

async function resolveVersionId(mainServiceId: string, subServiceId: string): Promise<string | null> {
  return ensureDraftVersionId(mainServiceId, subServiceId);
}

export function useServiceVersionBundle(mainServiceId: string, subServiceId: string) {
  return useQuery({
    queryKey: ['service-version', mainServiceId, subServiceId],
    queryFn: async () => {
      const versionId = await resolveVersionId(mainServiceId, subServiceId);
      if (!versionId) {
        throw new Error('No draft version found for this sub-service. Create one from the Sub Service step.');
      }
      return (await servicesApi.getServiceVersion(versionId)) as unknown as ServiceVersionBundle;
    },
    enabled: Boolean(mainServiceId && subServiceId),
  });
}

export function useWizardVersionId(subServiceId: string) {
  return useQuery({
    queryKey: ['wizard-version-id', subServiceId],
    queryFn: () => getWizardVersionId(subServiceId),
    enabled: Boolean(subServiceId),
  });
}

export function useSaveOverview(mainServiceId: string, subServiceId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (payload: Record<string, unknown>) => {
      const versionId = await resolveVersionId(mainServiceId, subServiceId);
      if (!versionId) throw new Error('Missing wizard version');
      return servicesApi.updateOverview(versionId, payload);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['service-version', mainServiceId, subServiceId] });
    },
  });
}

export function useSaveForm(mainServiceId: string, subServiceId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (payload: { fields: unknown[]; conditions?: unknown[] }) => {
      const versionId = await resolveVersionId(mainServiceId, subServiceId);
      if (!versionId) throw new Error('Missing wizard version');
      return servicesApi.saveForm(versionId, payload);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['service-version', mainServiceId, subServiceId] });
    },
  });
}

export function useSaveDocuments(mainServiceId: string, subServiceId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (payload: { requirements: unknown[] }) => {
      const versionId = await resolveVersionId(mainServiceId, subServiceId);
      if (!versionId) throw new Error('Missing wizard version');
      return servicesApi.saveDocuments(versionId, payload);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['service-version', mainServiceId, subServiceId] });
    },
  });
}

export function useSavePricing(mainServiceId: string, subServiceId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (payload: Record<string, unknown>) => {
      const versionId = await resolveVersionId(mainServiceId, subServiceId);
      if (!versionId) throw new Error('Missing wizard version');
      return servicesApi.savePricing(versionId, payload);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['service-version', mainServiceId, subServiceId] });
    },
  });
}

export function useSaveWorkflow(mainServiceId: string, subServiceId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (payload: { steps: unknown[]; transitions: unknown[] }) => {
      const versionId = await resolveVersionId(mainServiceId, subServiceId);
      if (!versionId) throw new Error('Missing wizard version');
      return servicesApi.saveWorkflow(versionId, payload);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['service-version', mainServiceId, subServiceId] });
    },
  });
}

export function usePublishVersion(mainServiceId: string, subServiceId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async () => {
      const versionId = await resolveVersionId(mainServiceId, subServiceId);
      if (!versionId) throw new Error('Missing wizard version');
      const validation = await servicesApi.validateVersion(versionId);
      if (!validation.valid) {
        throw new Error(validation.errors.join(', ') || 'Validation failed');
      }
      return servicesApi.publishVersion(versionId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['service-version', mainServiceId, subServiceId] });
    },
  });
}

export function decimalToNumber(value: unknown): number {
  if (value == null) return 0;
  return Number(String(value)) || 0;
}

const UI_TO_API_FIELD_TYPE: Record<string, string> = {
  'Text Input': 'TEXT',
  'Number Input': 'NUMBER',
  'Email Address': 'EMAIL',
  'Phone Field': 'PHONE',
  'Date Picker': 'DATE',
  'Dropdown Select': 'DROPDOWN',
  'File Upload': 'FILE',
  'Checkbox Option': 'CHECKBOX',
  'Radio Control': 'RADIO',
  'Text Area': 'TEXTAREA',
  'Multi Select': 'MULTI_SELECT',
};

const API_TO_UI_FIELD_TYPE: Record<string, string> = Object.fromEntries(
  Object.entries(UI_TO_API_FIELD_TYPE).map(([ui, api]) => [api, ui]),
);

export function uiFieldTypeToApi(type: string): string {
  return UI_TO_API_FIELD_TYPE[type] ?? type.toUpperCase().replace(/\s+/g, '_');
}

export function apiFieldTypeToUi(type: string): string {
  return API_TO_UI_FIELD_TYPE[type] ?? type.replace(/_/g, ' ');
}

export function formatBytes(bytes?: number | null): string {
  if (!bytes) return '2 MB';
  if (bytes >= 1024 * 1024) return `${Math.round(bytes / (1024 * 1024))} MB`;
  return `${Math.round(bytes / 1024)} KB`;
}
