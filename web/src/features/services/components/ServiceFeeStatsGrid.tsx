import { cn } from '@/lib/utils';

export type ServiceFeeStat = {
  key: string;
  label: string;
  value: string;
};

type ServiceFeeStatsGridProps = {
  stats: ServiceFeeStat[];
  className?: string;
};

/** Fee / timing summary — mirrors mobile ServiceFeeStatsGrid. */
export function ServiceFeeStatsGrid({ stats, className }: ServiceFeeStatsGridProps) {
  if (stats.length === 0) return null;

  return (
    <div className={cn('grid gap-3 sm:grid-cols-2', className)}>
      {stats.map((stat, index) => (
        <div
          key={stat.key}
          className={cn(
            'rounded-xl border border-[#E8EDF5] bg-[#F8FAFC] px-5 py-4',
            stats.length === 3 && index === 2 && 'sm:col-span-2',
          )}
        >
          <p className="text-xs font-medium text-[#64748B]">{stat.label}</p>
          <p className="mt-1 text-base font-semibold text-[#0A1629]">{stat.value}</p>
        </div>
      ))}
    </div>
  );
}
