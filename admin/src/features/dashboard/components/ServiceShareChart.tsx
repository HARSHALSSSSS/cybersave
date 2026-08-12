import { useQuery } from '@tanstack/react-query';
import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from 'recharts';
import { Card, CardContent, CardHeader, CardTitle, Skeleton } from '@/components/ui';
import { getServiceShare } from '../services/dashboard.service';

export function ServiceShareChart() {
  const { data, isLoading } = useQuery({
    queryKey: ['dashboard', 'service-share'],
    queryFn: getServiceShare,
  });

  return (
    <Card className="border-gray-200">
      <CardHeader>
        <CardTitle className="text-base font-semibold text-gray-900">Service Share</CardTitle>
        <p className="text-sm leading-5 text-muted-foreground">Distribution by service category</p>
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
                    nameKey="name"
                    innerRadius={62}
                    outerRadius={88}
                    paddingAngle={2}
                    strokeWidth={0}
                  >
                    {data.map((slice) => (
                      <Cell key={slice.name} fill={slice.color} />
                    ))}
                  </Pie>
                  <Tooltip
                    formatter={(value, name) => [`${value}%`, name]}
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
                <span className="text-2xl font-bold text-gray-900">{data.length}</span>
                <span className="text-xs text-gray-500">Categories</span>
              </div>
            </div>
            <div className="grid w-full grid-cols-1 gap-2 sm:grid-cols-2">
              {data.map((slice) => (
                <div key={slice.name} className="flex items-center justify-between gap-2 text-sm">
                  <div className="flex min-w-0 items-center gap-2">
                    <span className="h-2.5 w-2.5 shrink-0 rounded-full" style={{ backgroundColor: slice.color }} />
                    <span className="truncate text-gray-600">{slice.name}</span>
                  </div>
                  <span className="font-semibold text-gray-900">{slice.value}%</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
