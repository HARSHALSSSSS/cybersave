import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle, Skeleton } from '@/components/ui';
import { OPERATOR_LOG_ICONS } from '../constants/mock-data';
import { getOperatorLogs } from '../services/dashboard.service';
import type { OperatorLogType } from '../types';

const TYPE_STYLES: Record<OperatorLogType, { bg: string; color: string }> = {
  verification: { bg: '#EAF9EF', color: '#16A34A' },
  application: { bg: '#EFF4FF', color: '#2563EB' },
  payment: { bg: '#F3EEFF', color: '#7C3AED' },
  alert: { bg: '#FDECEC', color: '#DC2626' },
  centre: { bg: '#E7F8FB', color: '#0891B2' },
};

export function OperatorLogs() {
  const { data, isLoading } = useQuery({
    queryKey: ['dashboard', 'operator-logs'],
    queryFn: getOperatorLogs,
  });

  return (
    <Card className="border-gray-200">
      <CardHeader>
        <CardTitle className="text-base font-semibold text-gray-900">Operator Logs</CardTitle>
        <p className="text-sm leading-5 text-muted-foreground">Recent activity across your centres</p>
      </CardHeader>
      <CardContent>
        {isLoading || !data ? (
          <div className="space-y-3">
            {Array.from({ length: 5 }).map((_, i) => (
              <Skeleton key={i} className="h-12 w-full" />
            ))}
          </div>
        ) : (
          <ul className="space-y-1">
            {data.map((log) => {
              const Icon = OPERATOR_LOG_ICONS[log.type];
              const style = TYPE_STYLES[log.type];
              return (
                <li key={log.id} className="flex items-start gap-3 rounded-lg px-1 py-2.5 hover:bg-gray-50">
                  <span
                    className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full"
                    style={{ backgroundColor: style.bg, color: style.color }}
                  >
                    <Icon className="h-4 w-4" strokeWidth={2} />
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm leading-snug text-gray-700">
                      <span className="font-medium text-gray-900">{log.actorName}</span> {log.message}
                    </p>
                    <p className="mt-0.5 text-xs text-gray-400">{log.timestamp}</p>
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </CardContent>
    </Card>
  );
}
