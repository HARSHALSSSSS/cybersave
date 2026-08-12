import { useQuery } from '@tanstack/react-query';
import { Area, CartesianGrid, ComposedChart, Legend, Line, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { Card, CardContent, CardHeader, CardTitle, Skeleton } from '@/components/ui';
import { getDocumentActivityTrends } from '../services/analytics.service';

export function DocumentActivityChart() {
  const { data, isLoading } = useQuery({
    queryKey: ['analytics', 'document-activity-trends'],
    queryFn: getDocumentActivityTrends,
  });

  return (
    <Card className="border-border">
      <CardHeader>
        <CardTitle>Document Activity Trends</CardTitle>
        <p className="text-sm leading-5 text-muted-foreground">Uploads vs. verifications, Jan–Sep</p>
      </CardHeader>
      <CardContent>
        {isLoading || !data ? (
          <Skeleton className="h-[300px] w-full" />
        ) : (
          <ResponsiveContainer width="100%" height={300}>
            <ComposedChart data={data} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
              <defs>
                <linearGradient id="uploadsFill" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#2563EB" stopOpacity={0.28} />
                  <stop offset="100%" stopColor="#2563EB" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid vertical={false} stroke="#EEF1F5" />
              <XAxis dataKey="label" axisLine={false} tickLine={false} tick={{ fill: '#94A3B8', fontSize: 12 }} />
              <YAxis axisLine={false} tickLine={false} tick={{ fill: '#94A3B8', fontSize: 12 }} width={36} />
              <Tooltip
                cursor={{ stroke: '#2563EB', strokeWidth: 1, strokeDasharray: '4 4' }}
                contentStyle={{
                  borderRadius: 12,
                  border: '1px solid #E5E7EB',
                  boxShadow: '0 8px 24px rgba(15, 23, 42, 0.08)',
                  fontSize: 12,
                }}
              />
              <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: 12, color: '#64748B', paddingTop: 12 }} />
              <Area
                type="monotone"
                dataKey="uploads"
                name="Uploads"
                stroke="#2563EB"
                strokeWidth={2.5}
                fill="url(#uploadsFill)"
                activeDot={{ r: 5 }}
              />
              <Line
                type="monotone"
                dataKey="verifications"
                name="Verifications"
                stroke="#16A34A"
                strokeWidth={2.5}
                strokeDasharray="6 4"
                dot={{ r: 3, fill: '#16A34A', strokeWidth: 0 }}
                activeDot={{ r: 5 }}
              />
            </ComposedChart>
          </ResponsiveContainer>
        )}
      </CardContent>
    </Card>
  );
}
