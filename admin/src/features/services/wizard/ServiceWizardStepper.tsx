import { Check } from 'lucide-react';
import { cn } from '@/lib/utils';
import { WIZARD_STEPS, type WizardStepId, getStepIndex } from './steps';

export function ServiceWizardStepper({ current }: { current: WizardStepId }) {
  const currentIndex = getStepIndex(current);

  return (
    <ol className="flex flex-wrap items-center gap-2 border-b border-border pb-5">
      {WIZARD_STEPS.map((step, index) => {
        const done = index < currentIndex;
        const active = step.id === current;
        return (
          <li key={step.id} className="flex items-center gap-2">
            {index > 0 ? (
              <span
                className={cn(
                  'hidden h-px w-6 sm:block',
                  done || active ? 'bg-success' : 'bg-border',
                )}
              />
            ) : null}
            <div className="flex items-center gap-2">
              <span
                className={cn(
                  'flex size-7 items-center justify-center rounded-full text-xs font-semibold',
                  done && 'bg-success text-success-foreground',
                  active && 'bg-primary text-primary-foreground',
                  !done && !active && 'bg-muted text-muted-foreground',
                )}
              >
                {done ? <Check className="size-3.5" strokeWidth={3} /> : step.number}
              </span>
              <span
                className={cn(
                  'text-sm font-medium',
                  active && 'text-primary',
                  done && 'text-success-text',
                  !done && !active && 'text-muted-foreground',
                )}
              >
                {step.label}
              </span>
            </div>
          </li>
        );
      })}
    </ol>
  );
}
