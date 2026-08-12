import { useQuery } from '@tanstack/react-query';
import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from 'recharts';
import { Card, CardContent, CardHeader, CardTitle, Skeleton } from '@/components/ui';
import { getStatusDistribution } from '../services/analytics.service';

export function StatusDistributionChart() {
  const { data, isLoading } = useQuery({
    queryKey: ['analytics', 'status-distribution'],
    queryFn: getStatusDistribution,
  });

  const total = data?.reduce((sum, item) => sum + item.value, 0) ?? 0;

  return (
    <Card className="h-full border-border">
      <CardHeader>
        <CardTitle>Status Distribution</CardTitle>
        <p className="text-sm leading-5 text-muted-foreground">Verified, pending, and expired documents</p>
      </CardHeader>
      <CardContent>
        {isLoading || !data ? (
          <Skeleton className="h-[240px] w-full" />
        ) : (
          <div className="flex flex-col items-center gap-4">
            <div className="relative h-[200px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={data}
                    dataKey="value"
                    nameKey="label"
                    innerRadius={62}
                    outerRadius={88}
                    paddingAngle={2}
                    strokeWidth={0}
                  >
                    {data.map((slice) => (
                      <Cell key={slice.status} fill={slice.color} />
                    ))}
                  </Pie>
                  <Tooltip
                    formatter={(value, name) => [value, name]}
                    contentStyle={{
                      borderRadius: 12,
                      border: '1px solid #E5E7EB',
                      boxShadow: '0 8px 24px rgba(15, 23, 42, 0.08)',
                      fontSize: 12,
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
              <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-2xl font-bold text-foreground">{total}</span>
                <span className="text-xs text-muted-foreground">Documents</span>
              </div>
            </div>
            <div className="grid w-full grid-cols-1 gap-2 sm:grid-cols-3">
              {data.map((slice) => (
                <div key={slice.status} className="flex items-center justify-between gap-2 text-sm">
                  <div className="flex min-w-0 items-center gap-2">
                    <span className="h-2.5 w-2.5 shrink-0 rounded-full" style={{ backgroundColor: slice.color }} />
                    <span className="truncate text-muted-foreground">{slice.label}</span>
                  </div>
                  <span className="font-semibold text-foreground">{slice.value}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
