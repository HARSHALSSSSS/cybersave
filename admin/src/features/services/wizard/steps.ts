export type WizardStepId =
  | 'main'
  | 'sub'
  | 'overview'
  | 'form-builder'
  | 'documents'
  | 'pricing'
  | 'fulfillment'
  | 'workflow'
  | 'publish';

export interface WizardStepMeta {
  id: WizardStepId;
  number: number;
  label: string;
  title: string;
  description: string;
  footerHint: string;
}

/** Visible stepper matching Figma (1–7 then 9 Publish). */
export const WIZARD_STEPS: WizardStepMeta[] = [
  {
    id: 'main',
    number: 1,
    label: 'Main Service',
    title: 'Main Service Configuration',
    description: 'Establish primary service container attributes.',
    footerHint: 'Step 1 of 9: Establish primary service container attributes.',
  },
  {
    id: 'sub',
    number: 2,
    label: 'Sub Service',
    title: 'Sub Service Configuration',
    description: 'Define and manage sub-services under this main service.',
    footerHint: 'Step 2 of 9: Create and manage sub-service entries.',
  },
  {
    id: 'overview',
    number: 3,
    label: 'Overview',
    title: 'Service Overview & Information',
    description: 'Document external public descriptors and metrics for end-users.',
    footerHint: 'Step 3 of 9: Establish core service details and tagging.',
  },
  {
    id: 'form-builder',
    number: 4,
    label: 'Form Builder',
    title: 'Interface Form Builder',
    description: 'Formulate and sequence data capture inputs required from applicants.',
    footerHint: 'Step 4 of 9: Establish input form design variables.',
  },
  {
    id: 'documents',
    number: 5,
    label: 'Documents',
    title: 'Required Documents Configuration',
    description: 'Identify physical file attachments applicants must upload.',
    footerHint: 'Step 5 of 9: Establish applicant document file checklist.',
  },
  {
    id: 'pricing',
    number: 6,
    label: 'Pricing',
    title: 'Service Pricing Configuration',
    description: 'Configure base fee, regional taxes, and additional processing charges for the service.',
    footerHint: 'Step 6 of 9: Configure citizen pricing and payment methods.',
  },
  {
    id: 'fulfillment',
    number: 7,
    label: 'Fulfillment',
    title: 'Assisted & Manual Apply',
    description: 'Configure dual CTAs, platform fees, and state portal URLs.',
    footerHint: 'Step 7 of 9: Set up Get it done by us and Apply on portal paths.',
  },
  {
    id: 'workflow',
    number: 8,
    label: 'Workflow',
    title: 'Approval Workflow Configuration',
    description: 'Review and adjust the application status steps and citizen notifications.',
    footerHint: 'Step 8 of 9: Confirm approval routing and notification rules.',
  },
  {
    id: 'publish',
    number: 9,
    label: 'Publish',
    title: 'Publish Service',
    description: 'Validate final system checks, set release parameters, and push the service to citizen portal.',
    footerHint: 'Step 9 of 9: Final validation and portal release.',
  },
];

export function getStepMeta(id: WizardStepId) {
  return WIZARD_STEPS.find((s) => s.id === id)!;
}

export function getStepIndex(id: WizardStepId) {
  return WIZARD_STEPS.findIndex((s) => s.id === id);
}
