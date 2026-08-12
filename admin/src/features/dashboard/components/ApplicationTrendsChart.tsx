import { useQuery } from '@tanstack/react-query';
import { Bar, BarChart, CartesianGrid, Legend, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { Card, CardContent, CardHeader, CardTitle, Skeleton } from '@/components/ui';
import { getApplicationTrends } from '../services/dashboard.service';

const SERIES = [
  { key: 'completed', name: 'Completed', color: '#16A34A' },
  { key: 'pending', name: 'Pending', color: '#D97706' },
  { key: 'rejected', name: 'Rejected', color: '#DC2626' },
];

export function ApplicationTrendsChart() {
  const { data, isLoading } = useQuery({
    queryKey: ['dashboard', 'application-trends'],
    queryFn: getApplicationTrends,
  });

  return (
    <Card className="border-gray-200">
      <CardHeader>
        <CardTitle className="text-base font-semibold text-gray-900">Application Trends</CardTitle>
        <p className="text-sm leading-5 text-muted-foreground">Completed vs. pending vs. rejected this week</p>
      </CardHeader>
      <CardContent>
        {isLoading || !data ? (
          <Skeleton className="h-[280px] w-full" />
        ) : (
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={data} margin={{ top: 8, right: 8, left: 0, bottom: 0 }} barGap={4}>
              <CartesianGrid vertical={false} stroke="#EEF1F5" />
              <XAxis dataKey="label" axisLine={false} tickLine={false} tick={{ fill: '#94A3B8', fontSize: 12 }} />
              <YAxis axisLine={false} tickLine={false} tick={{ fill: '#94A3B8', fontSize: 12 }} width={40} />
              <Tooltip
                cursor={{ fill: 'rgba(37, 99, 235, 0.04)' }}
                contentStyle={{
                  borderRadius: 12,
                  border: '1px solid #E5E7EB',
                  boxShadow: '0 8px 24px rgba(15, 23, 42, 0.08)',
                  fontSize: 12,
                }}
              />
              <Legend
                iconType="circle"
                iconSize={8}
                wrapperStyle={{ fontSize: 12, color: '#64748B', paddingTop: 12 }}
              />
              {SERIES.map((series) => (
                <Bar key={series.key} dataKey={series.key} name={series.name} fill={series.color} radius={[4, 4, 0, 0]} maxBarSize={18} />
              ))}
            </BarChart>
          </ResponsiveContainer>
        )}
      </CardContent>
    </Card>
  );
}
