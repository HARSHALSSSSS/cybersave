import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Link } from 'react-router';
import { RefreshCw } from 'lucide-react';
import {
  Badge,
  Button,
  Card,
  CardContent,
  PageHeader,
  Skeleton,
} from '@/components/ui';
import { formatDate } from '@/utils/format';
import {
  getBillPaymentsIntegrationStatus,
  triggerBillPaymentsSync,
} from '../services/bill-payments.service';

export function BillPaymentsIntegrationPage() {
  const queryClient = useQueryClient();
  const { data, isLoading } = useQuery({
    queryKey: ['bill-payments', 'integration'],
    queryFn: getBillPaymentsIntegrationStatus,
  });

  const syncMutation = useMutation({
    mutationFn: triggerBillPaymentsSync,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['bill-payments'] });
    },
  });

  return (
    <div className="space-y-6">
      <PageHeader
        title="Razorpay BBPS Integration"
        description="Provider connection status and biller catalogue synchronization."
        actions={
          <div className="flex gap-2">
            <Button
              onClick={() => syncMutation.mutate()}
              disabled={syncMutation.isPending}
            >
              <RefreshCw className="mr-2 size-4" />
              Sync now
            </Button>
            <Button variant="outline" asChild>
              <Link to="/bill-payments">Back</Link>
            </Button>
          </div>
        }
      />

      {isLoading || !data ? (
        <Skeleton className="h-64 w-full rounded-2xl" />
      ) : (
        <Card>
          <CardContent className="grid gap-4 pt-6 sm:grid-cols-2">
            <div>
              <p className="text-sm text-muted-foreground">Provider</p>
              <p className="font-medium">{data.provider}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Service</p>
              <p className="font-medium">{data.service}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Active provider</p>
              <p className="font-medium">{data.activeProvider}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Environment</p>
              <Badge variant="outline">{data.environment}</Badge>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Connection</p>
              <Badge>{data.connection}</Badge>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">API health</p>
              <Badge variant="outline">{data.apiHealth}</Badge>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Last successful API call</p>
              <p>{data.lastSuccessfulApiCall ? formatDate(data.lastSuccessfulApiCall, 'DD MMM YYYY, hh:mm A') : '—'}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Last biller sync</p>
              <p>
                {data.lastBillerSync ? formatDate(data.lastBillerSync, 'DD MMM YYYY, hh:mm A') : '—'}
                {data.lastSyncStatus ? ` (${data.lastSyncStatus})` : ''}
              </p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Catalogue</p>
              <p>{data.catalogue.categories} categories · {data.catalogue.billers} billers</p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
