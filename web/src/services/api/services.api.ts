import { apiClient } from './client';
import { unwrapApiResponse } from './types';

export interface SubServiceStateOption {
  code: string;
  name: string;
}

export interface SubServiceCatalogItem {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  publishedVersionId: string;
  displayName: string;
  shortDescription?: string | null;
  processingTime?: string | null;
  baseFee: string;
  currency: string;
  requiresStateSelection?: boolean;
  availableStates?: SubServiceStateOption[];
  assistedEnabled?: boolean;
  manualEnabled?: boolean;
}

export interface IndianState {
  code: string;
  name: string;
}

export interface ServiceFulfillmentConfig {
  assistedEnabled: boolean;
  manualEnabled: boolean;
  assistedCtaLabel: string;
  manualCtaLabel: string;
  requiresStateSelection: boolean;
  platformFee: number;
  officialPortalUrl: string | null;
  manualInstructions: string | null;
  selectedState: { code: string; name: string } | null;
  availableStates: Array<{
    code: string;
    name: string;
    assistedEnabled: boolean;
    manualEnabled: boolean;
    platformFee: number;
    officialPortalUrl: string | null;
  }>;
}

export interface MainServiceCatalogItem {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  iconUrl: string | null;
  subServices: SubServiceCatalogItem[];
}

export type FormFieldType =
  | 'TEXT'
  | 'TEXTAREA'
  | 'NUMBER'
  | 'EMAIL'
  | 'PHONE'
  | 'DATE'
  | 'TIME'
  | 'DATETIME'
  | 'DROPDOWN'
  | 'RADIO'
  | 'CHECKBOX'
  | 'MULTI_SELECT'
  | 'FILE'
  | 'IMAGE'
  | 'DOCUMENT'
  | 'ADDRESS'
  | 'PINCODE'
  | 'STATE'
  | 'DISTRICT'
  | 'CITY'
  | 'COUNTRY';

export interface FormFieldOption {
  id: string;
  label: string;
  value: string;
  sortOrder: number;
}

export interface FormFieldConfig {
  id: string;
  key: string;
  label: string;
  type: FormFieldType;
  sortOrder: number;
  required: boolean;
  visible: boolean;
  placeholder?: string | null;
  helpText?: string | null;
  defaultValue?: string | null;
  config: Record<string, unknown>;
  validation: Record<string, unknown>;
  options: FormFieldOption[];
}

export interface DocumentRequirement {
  id: string;
  name: string;
  description?: string | null;
  required: boolean;
  instructions?: string | null;
  sortOrder: number;
  allowedFormats?: string[];
  allowedMimeTypes?: string[];
  maxFileSizeBytes?: number;
}

export interface ServiceConfiguration {
  serviceVersionId: string;
  versionNumber: number;
  lifecycleStatus: string;
  mainService: { id: string; name: string; slug: string };
  subService: { id: string; name: string; slug: string };
  overview: {
    displayName: string;
    shortDescription?: string | null;
    richDescription?: string | null;
    instructions?: string | null;
    termsAndConditions?: string | null;
    processingTime?: string | null;
    department?: string | null;
  } | null;
  form: {
    id: string;
    versionNumber: number;
    fields: FormFieldConfig[];
    conditions: unknown[];
  } | null;
  documentRequirements: DocumentRequirement[];
  pricing: {
    baseFee: string;
    taxEnabled: boolean;
    taxRate: string;
    taxAmount: string;
    currency: string;
    platformFee?: string;
    totalAmount: string;
    additionalCharges: Array<{ name: string; amount: string; condition?: string | null }>;
  } | null;
  workflow: { id: string; steps: unknown[] } | null;
  termsAndConditions?: string | null;
  instructions?: string | null;
  fulfillment?: ServiceFulfillmentConfig;
}

export async function getServicesCatalog() {
  const response = await apiClient.get('/services');
  return unwrapApiResponse<MainServiceCatalogItem[]>(response);
}

export async function getIndianStates() {
  const response = await apiClient.get('/services/states');
  return unwrapApiResponse<IndianState[]>(response);
}

export async function getSubServiceConfiguration(subServiceId: string, stateCode?: string) {
  const response = await apiClient.get(`/services/sub/${subServiceId}/configuration`, {
    params: stateCode ? { state: stateCode } : undefined,
  });
  return unwrapApiResponse<ServiceConfiguration>(response);
}

export const servicesApi = {
  getServicesCatalog,
  getIndianStates,
  getSubServiceConfiguration,
};

export const servicesQueryKeys = {
  all: ['services'] as const,
  catalog: () => [...servicesQueryKeys.all, 'catalog'] as const,
  states: () => [...servicesQueryKeys.all, 'states'] as const,
  configuration: (subServiceId: string, stateCode?: string) =>
    [...servicesQueryKeys.all, 'configuration', subServiceId, stateCode ?? ''] as const,
};
