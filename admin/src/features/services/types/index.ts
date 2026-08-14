export type ServiceStatus = 'active' | 'maintenance' | 'inactive';

export interface SubService {
  id: string;
  name: string;
  slug: string;
  categoryName: string;
  slaHours: number;
  govtFee: number;
  status: ServiceStatus;
  versionStatus: string;
  publishedVersionId?: string;
  processingTime?: string;
  assistedEnabled: boolean;
  manualEnabled: boolean;
  requiresStateSelection: boolean;
  stateCount: number;
  formFieldCount: number;
  documentCount: number;
}

export interface ServiceCategory {
  id: string;
  name: string;
  description: string;
  status: ServiceStatus;
  subServices: SubService[];
}

export interface ServicesStats {
  total: number;
  active: number;
  underMaintenance: number;
  totalRequestsYtd: number;
}

export type ProcessingMode = 'online' | 'offline' | 'hybrid';
export type ServicePriority = 'low' | 'medium' | 'high';

export interface RequiredDocument {
  name: string;
  mandatory: boolean;
}

export type FormFieldType = 'text' | 'number' | 'date' | 'select' | 'file' | 'textarea';

export interface ApplicationFormField {
  label: string;
  type: FormFieldType;
  required: boolean;
}

export interface WorkflowStage {
  id: string;
  title: string;
  description: string;
}

export interface CreateServicePayload {
  name: string;
  category: string;
  description: string;
  govtFee: number;
  serviceFee: number;
  processingMode: ProcessingMode;
  slaHours: number;
  priority: ServicePriority;
  documents: RequiredDocument[];
  formFields: ApplicationFormField[];
  status: 'draft' | 'active';
}
