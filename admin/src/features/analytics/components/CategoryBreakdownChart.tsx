import { useQuery } from '@tanstack/react-query';
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { Card, CardContent, CardHeader, CardTitle, Skeleton } from '@/components/ui';
import { getCategoryBreakdown } from '../services/analytics.service';

export function CategoryBreakdownChart() {
  const { data, isLoading } = useQuery({
    queryKey: ['analytics', 'category-breakdown'],
    queryFn: getCategoryBreakdown,
  });

  return (
    <Card className="h-full border-border">
      <CardHeader>
        <CardTitle>Category Breakdown</CardTitle>
        <p className="text-sm leading-5 text-muted-foreground">Documents uploaded by category</p>
      </CardHeader>
      <CardContent>
        {isLoading || !data ? (
          <Skeleton className="h-[240px] w-full" />
        ) : (
          <ResponsiveContainer width="100%" height={240}>
            <BarChart
              data={data}
              layout="vertical"
              margin={{ top: 0, right: 24, left: 0, bottom: 0 }}
              barCategoryGap={14}
            >
              <CartesianGrid horizontal={false} stroke="#EEF1F5" />
              <XAxis type="number" axisLine={false} tickLine={false} tick={{ fill: '#94A3B8', fontSize: 12 }} />
              <YAxis
                type="category"
                dataKey="category"
                axisLine={false}
                tickLine={false}
                width={80}
                tick={{ fill: '#374151', fontSize: 12 }}
              />
              <Tooltip
                cursor={{ fill: 'rgba(37, 99, 235, 0.04)' }}
                contentStyle={{
                  borderRadius: 12,
                  border: '1px solid #E5E7EB',
                  boxShadow: '0 8px 24px rgba(15, 23, 42, 0.08)',
                  fontSize: 12,
                }}
              />
              <Bar dataKey="count" name="Documents" fill="#2563EB" radius={[0, 6, 6, 0]} maxBarSize={18} />
            </BarChart>
          </ResponsiveContainer>
        )}
      </CardContent>
    </Card>
  );
}
