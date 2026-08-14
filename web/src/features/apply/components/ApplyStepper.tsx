import { Check } from 'lucide-react';
import { cn } from '@/lib/utils';

export type ApplyStep = 'form' | 'documents' | 'payment' | 'confirmation';

const STEPS: { id: ApplyStep; label: string; desc: string }[] = [
  { id: 'form', label: 'Personal Details', desc: 'Fill application form' },
  { id: 'documents', label: 'Document Upload', desc: 'Upload required proofs' },
  { id: 'payment', label: 'Payment', desc: 'Pay official fees' },
  { id: 'confirmation', label: 'Confirmation', desc: 'Receive confirmation' },
];

function stepIndex(step: ApplyStep) {
  return STEPS.findIndex(s => s.id === step);
}

export function ApplyStepper({ current }: { current: ApplyStep }) {
  const currentIdx = stepIndex(current);

  return (
    <div className="mb-8 rounded-2xl border border-[#E8EDF5] bg-white p-6 shadow-sm">
      <ol className="flex flex-wrap items-start justify-between gap-4">
        {STEPS.map((step, index) => {
          const done = index < currentIdx;
          const active = index === currentIdx;
          const pending = index > currentIdx;

          return (
            <li key={step.id} className="flex min-w-[120px] flex-1 flex-col items-center text-center">
              <div className="flex w-full items-center">
                {index > 0 ? (
                  <div className={cn('h-0.5 flex-1', done || active ? 'bg-[#2563EB]' : 'bg-[#E8EDF5]')} />
                ) : (
                  <div className="flex-1" />
                )}
                <span
                  className={cn(
                    'flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-sm font-bold transition',
                    done && 'bg-[#2563EB] text-white',
                    active && 'bg-[#0A1629] text-white ring-4 ring-[#2563EB]/20',
                    pending && 'border-2 border-[#E2E8F0] bg-white text-[#94A3B8]',
                  )}
                >
                  {done ? <Check className="h-4 w-4" strokeWidth={3} /> : index + 1}
                </span>
                {index < STEPS.length - 1 ? (
                  <div className={cn('h-0.5 flex-1', done ? 'bg-[#2563EB]' : 'bg-[#E8EDF5]')} />
                ) : (
                  <div className="flex-1" />
                )}
              </div>
              <p className={cn('mt-2 text-sm font-semibold', active || done ? 'text-[#0A1629]' : 'text-[#94A3B8]')}>
                {step.label}
              </p>
              <p className="text-[10px] text-[#94A3B8]">{active ? 'Active step' : done ? 'Completed' : step.desc}</p>
            </li>
          );
        })}
      </ol>
    </div>
  );
}

export { STEPS as APPLY_STEPS };
