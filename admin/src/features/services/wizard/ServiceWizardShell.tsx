import { Link } from 'react-router';
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
  Button,
} from '@/components/ui';
import { ServiceWizardStepper } from './ServiceWizardStepper';
import { getStepMeta, type WizardStepId } from './steps';

type Props = {
  step: WizardStepId;
  crumbs: Array<{ label: string; to?: string }>;
  children: React.ReactNode;
  onDraft?: () => void;
  onContinue?: () => void;
  continueLabel?: string;
  showBack?: boolean;
  onBack?: () => void;
  secondaryLabel?: string;
  onSecondary?: () => void;
  footerLeft?: React.ReactNode;
};

export function ServiceWizardShell({
  step,
  crumbs,
  children,
  onDraft,
  onContinue,
  continueLabel = 'Save & Continue',
  showBack,
  onBack,
  secondaryLabel,
  onSecondary,
  footerLeft,
}: Props) {
  const meta = getStepMeta(step);

  return (
    <div className="space-y-6 pb-28">
      <Breadcrumb>
        <BreadcrumbList>
          {crumbs.map((c, i) => (
            <span key={`${c.label}-${i}`} className="contents">
              {i > 0 ? <BreadcrumbSeparator /> : null}
              <BreadcrumbItem>
                {c.to ? (
                  <BreadcrumbLink asChild>
                    <Link to={c.to}>{c.label}</Link>
                  </BreadcrumbLink>
                ) : (
                  <BreadcrumbPage>{c.label}</BreadcrumbPage>
                )}
              </BreadcrumbItem>
            </span>
          ))}
        </BreadcrumbList>
      </Breadcrumb>

      <div className="space-y-1">
        <h1 className="text-2xl leading-8 font-semibold tracking-tight text-foreground">{meta.title}</h1>
        <p className="text-sm leading-5 text-muted-foreground">{meta.description}</p>
      </div>

      <ServiceWizardStepper current={step} />

      {children}

      <div className="fixed right-0 bottom-0 left-0 z-20 border-t border-border bg-card/95 backdrop-blur sm:left-[260px]">
        <div className="mx-auto flex max-w-[1600px] flex-col gap-3 px-4 py-3 sm:flex-row sm:items-center sm:justify-between sm:px-6 lg:px-8">
          <p className="text-sm leading-5 text-muted-foreground">
            {footerLeft ?? meta.footerHint}
          </p>
          <div className="flex flex-wrap items-center gap-2">
            {showBack ? (
              <Button variant="outline" onClick={onBack}>
                Back
              </Button>
            ) : null}
            {secondaryLabel ? (
              <Button variant="outline" onClick={onSecondary}>
                {secondaryLabel}
              </Button>
            ) : null}
            {onDraft ? (
              <Button variant="outline" onClick={onDraft}>
                Save as Draft
              </Button>
            ) : null}
            {onContinue ? <Button onClick={onContinue}>{continueLabel}</Button> : null}
          </div>
        </div>
      </div>
    </div>
  );
}
