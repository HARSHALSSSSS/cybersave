import { useQuery } from '@tanstack/react-query';
import { AlertTriangle, CheckCircle2, Clock3, FileClock, FileSearch, Loader2 } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, Skeleton } from '@/components/ui';
import { getPipelineStages } from '../services/applications.service';
import type { ApplicationStatus } from '../types';

const STAGE_ICONS: Record<ApplicationStatus, typeof Clock3> = {
  submitted: FileClock,
  under_review: FileSearch,
  action_required: AlertTriangle,
  processing: Loader2,
  approved: CheckCircle2,
  completed: CheckCircle2,
  rejected: Clock3,
};

const STAGE_COLORS: Record<ApplicationStatus, { bg: string; color: string }> = {
  submitted: { bg: '#F3F4F6', color: '#6B7280' },
  under_review: { bg: '#EFF4FF', color: '#2563EB' },
  action_required: { bg: '#FFFBEB', color: '#D97706' },
  processing: { bg: '#F3EEFF', color: '#7C3AED' },
  approved: { bg: '#E7F8FB', color: '#0891B2' },
  completed: { bg: '#EAF9EF', color: '#16A34A' },
  rejected: { bg: '#FDECEC', color: '#DC2626' },
};

export function PipelineStepper() {
  const { data, isLoading } = useQuery({
    queryKey: ['applications', 'pipeline'],
    queryFn: getPipelineStages,
  });

  return (
    <Card className="border-gray-200">
      <CardHeader>
        <CardTitle className="text-base font-semibold text-gray-900">Live Application Pipeline</CardTitle>
        <p className="text-sm leading-5 text-muted-foreground">Real-time distribution across processing stages</p>
      </CardHeader>
      <CardContent>
        {isLoading || !data ? (
          <Skeleton className="h-24 w-full" />
        ) : (
          <div className="flex flex-col gap-0 sm:flex-row sm:items-center">
            {data.map((stage, index) => {
              const Icon = STAGE_ICONS[stage.key];
              const colors = STAGE_COLORS[stage.key];
              const isLast = index === data.length - 1;
              return (
                <div key={stage.key} className="flex flex-1 items-center">
                  <div className="flex flex-1 flex-col items-center gap-2 px-2 text-center">
                    <span
                      className="flex h-11 w-11 items-center justify-center rounded-full"
                      style={{ backgroundColor: colors.bg, color: colors.color }}
                    >
                      <Icon className="h-5 w-5" />
                    </span>
                    <div>
                      <p className="text-lg font-bold text-gray-900">{stage.count.toLocaleString('en-IN')}</p>
                      <p className="text-xs font-medium text-gray-500">{stage.label}</p>
                    </div>
                  </div>
                  {!isLast ? <div className="hidden h-px flex-1 bg-gray-200 sm:block" /> : null}
                </div>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
