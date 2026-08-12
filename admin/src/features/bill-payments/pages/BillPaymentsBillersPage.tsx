import { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Link } from 'react-router';
import {
  Badge,
  Button,
  Card,
  CardContent,
  Input,
  PageHeader,
  Skeleton,
  Switch,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui';
import { formatDate } from '@/utils/format';
import {
  listBillPaymentBillers,
  updateBillPaymentBiller,
} from '../services/bill-payments.service';

export function BillPaymentsBillersPage() {
  const [search, setSearch] = useState('');
  const queryClient = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ['bill-payments', 'billers', search],
    queryFn: () => listBillPaymentBillers({ search: search || undefined, limit: 100 }),
  });

  const mutation = useMutation({
    mutationFn: ({ id, isVisible }: { id: string; isVisible: boolean }) =>
      updateBillPaymentBiller(id, { isVisible }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['bill-payments', 'billers'] }),
  });

  const billers = data?.data ?? [];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Billers"
        description="Synced BBPS biller catalogue. Toggle visibility without changing provider configuration."
        actions={
          <Button variant="outline" asChild>
            <Link to="/bill-payments">Back to dashboard</Link>
          </Button>
        }
      />

      <Input
        placeholder="Search billers..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className="max-w-md"
      />

      <Card>
        <CardContent className="pt-6">
          {isLoading ? (
            <Skeleton className="h-64 w-full" />
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Biller</TableHead>
                    <TableHead>Category</TableHead>
                    <TableHead>State</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Last Synced</TableHead>
                    <TableHead>Visible</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {billers.map((biller) => (
                    <TableRow key={biller.id}>
                      <TableCell>
                        <div className="font-medium">{biller.name}</div>
                        {biller.aliasName ? (
                          <div className="text-xs text-muted-foreground">{biller.aliasName}</div>
                        ) : null}
                      </TableCell>
                      <TableCell>{biller.category?.displayName ?? biller.providerCategory}</TableCell>
                      <TableCell>{biller.state ?? '—'}</TableCell>
                      <TableCell>
                        <Badge variant="outline">{biller.providerStatus}</Badge>
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {biller.lastSyncedAt ? formatDate(biller.lastSyncedAt) : '—'}
                      </TableCell>
                      <TableCell>
                        <Switch
                          checked={biller.isVisible}
                          onCheckedChange={(checked) =>
                            mutation.mutate({ id: biller.id, isVisible: checked })
                          }
                        />
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
