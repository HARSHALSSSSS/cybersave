import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle, Skeleton } from '@/components/ui';
import { formatCurrency } from '@/utils/format';
import { getCollectionsSummary } from '../services/dashboard.service';

export function CollectionsSummary() {
  const { data, isLoading } = useQuery({
    queryKey: ['dashboard', 'collections-summary'],
    queryFn: getCollectionsSummary,
    staleTime: 0,
  });

  return (
    <Card className="border-gray-200">
      <CardHeader>
        <CardTitle className="text-base font-semibold text-gray-900">Collections Summary</CardTitle>
        <p className="text-sm leading-5 text-muted-foreground">Payment mode breakdown for today</p>
      </CardHeader>
      <CardContent>
        {isLoading || !data ? (
          <Skeleton className="h-[160px] w-full" />
        ) : (
          <div className="space-y-5">
            <div className="flex flex-col gap-1">
              <p className="text-sm leading-5 text-muted-foreground">Total Collections</p>
              <p className="text-2xl leading-8 font-bold text-foreground">{formatCurrency(data.total)}</p>
            </div>

            <div className="h-2.5 w-full overflow-hidden rounded-full bg-gray-100">
              <div className="h-full rounded-full bg-[#2563EB]" style={{ width: `${data.onlinePercent}%` }} />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="rounded-xl border border-gray-100 bg-gray-50/60 p-3">
                <div className="flex items-center gap-2">
                  <span className="h-2.5 w-2.5 rounded-full bg-[#2563EB]" />
                  <span className="text-xs font-medium text-gray-500">Online</span>
                </div>
                <p className="mt-1.5 text-lg font-semibold text-gray-900">{data.onlinePercent}%</p>
                <p className="text-xs text-gray-500">{formatCurrency(data.onlineAmount)}</p>
              </div>
              <div className="rounded-xl border border-gray-100 bg-gray-50/60 p-3">
                <div className="flex items-center gap-2">
                  <span className="h-2.5 w-2.5 rounded-full bg-gray-300" />
                  <span className="text-xs font-medium text-gray-500">Cash</span>
                </div>
                <p className="mt-1.5 text-lg font-semibold text-gray-900">{data.cashPercent}%</p>
                <p className="text-xs text-gray-500">{formatCurrency(data.cashAmount)}</p>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
