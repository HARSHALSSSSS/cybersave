import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { Card, CardContent, CardHeader, CardTitle, Skeleton } from '@/components/ui';
import { cn } from '@/lib/utils';
import { getRevenueOverview } from '../services/dashboard.service';

type Range = '7d' | '30d';

const RANGE_OPTIONS: { value: Range; label: string }[] = [
  { value: '7d', label: '7 Days' },
  { value: '30d', label: '30 Days' },
];

function formatCompactCurrency(value: number) {
  if (value >= 100000) return `₹${(value / 100000).toFixed(1)}L`;
  if (value >= 1000) return `₹${(value / 1000).toFixed(0)}K`;
  return `₹${value}`;
}

export function RevenueChart() {
  const [range, setRange] = useState<Range>('7d');
  const { data, isLoading } = useQuery({
    queryKey: ['dashboard', 'revenue-overview', range],
    queryFn: () => getRevenueOverview(range),
    staleTime: 0,
  });

  return (
    <Card className="border-gray-200">
      <CardHeader className="flex flex-row items-center justify-between space-y-0">
        <div className="flex flex-col gap-1">
          <CardTitle className="text-base font-semibold text-foreground">Revenue Overview</CardTitle>
          <p className="text-sm leading-5 text-muted-foreground">Track collection performance over time</p>
        </div>
        <div className="flex items-center gap-1 rounded-lg bg-gray-100 p-1">
          {RANGE_OPTIONS.map((option) => (
            <button
              key={option.value}
              type="button"
              onClick={() => setRange(option.value)}
              className={cn(
                'rounded-md px-3 py-1.5 text-xs font-medium transition-colors',
                range === option.value ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700',
              )}
            >
              {option.label}
            </button>
          ))}
        </div>
      </CardHeader>
      <CardContent>
        {isLoading || !data ? (
          <Skeleton className="h-[280px] w-full" />
        ) : (
          <ResponsiveContainer width="100%" height={280}>
            <AreaChart data={data} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
              <defs>
                <linearGradient id="revenueFill" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#2563EB" stopOpacity={0.28} />
                  <stop offset="100%" stopColor="#2563EB" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid vertical={false} stroke="#EEF1F5" />
              <XAxis
                dataKey="label"
                axisLine={false}
                tickLine={false}
                tick={{ fill: '#94A3B8', fontSize: 12 }}
                interval={range === '30d' ? 4 : 0}
              />
              <YAxis
                axisLine={false}
                tickLine={false}
                tick={{ fill: '#94A3B8', fontSize: 12 }}
                tickFormatter={formatCompactCurrency}
                width={56}
              />
              <Tooltip
                cursor={{ stroke: '#2563EB', strokeWidth: 1, strokeDasharray: '4 4' }}
                formatter={(value) => [formatCompactCurrency(Number(value)), 'Revenue']}
                contentStyle={{
                  borderRadius: 12,
                  border: '1px solid #E5E7EB',
                  boxShadow: '0 8px 24px rgba(15, 23, 42, 0.08)',
                  fontSize: 12,
                }}
              />
              <Area
                type="monotone"
                dataKey="revenue"
                stroke="#2563EB"
                strokeWidth={2.5}
                fill="url(#revenueFill)"
                activeDot={{ r: 5 }}
              />
            </AreaChart>
          </ResponsiveContainer>
        )}
      </CardContent>
    </Card>
  );
}
