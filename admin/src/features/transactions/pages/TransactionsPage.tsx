import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { ArrowLeftRight, CheckCircle2, ChevronLeft, ChevronRight, Clock, XCircle } from 'lucide-react';
import {
  Badge,
  Button,
  Card,
  CardContent,
  PageHeader,
  Skeleton,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui';
import { StatCard } from '@/components/data-display/stat-card';
import { formatCurrency, formatDate } from '@/utils/format';
import { getTransactions, getTransactionsStats } from '../services/transactions.service';
import type { TransactionStatus } from '../types';

const PAGE_SIZE = 10;

const STATUS_STYLES: Record<TransactionStatus, string> = {
  success: 'bg-emerald-50 text-emerald-700 border-emerald-100',
  pending: 'bg-amber-50 text-amber-700 border-amber-100',
  failed: 'bg-red-50 text-red-700 border-red-100',
};

const STATUS_LABELS: Record<TransactionStatus, string> = {
  success: 'Success',
  pending: 'Pending',
  failed: 'Failed',
};

export function TransactionsPage() {
  const [page, setPage] = useState(1);

  const { data: stats, isLoading: statsLoading } = useQuery({
    queryKey: ['transactions', 'stats'],
    queryFn: getTransactionsStats,
  });

  const { data: result, isLoading, isError } = useQuery({
    queryKey: ['transactions', 'list', page],
    queryFn: () => getTransactions({ page, pageSize: PAGE_SIZE }),
  });

  const transactions = result?.data ?? [];
  const total = result?.total ?? 0;
  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));

  const kpis = [
    { title: 'Total Transactions', value: stats?.total, icon: ArrowLeftRight, iconColor: '#2563EB', iconBg: '#EFF4FF' },
    { title: 'Successful', value: stats?.successful, icon: CheckCircle2, iconColor: '#16A34A', iconBg: '#EAF9EF' },
    { title: 'Pending', value: stats?.pending, icon: Clock, iconColor: '#D97706', iconBg: '#FEF6E7' },
    { title: 'Failed', value: stats?.failed, icon: XCircle, iconColor: '#DC2626', iconBg: '#FDECEC' },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Payment Transactions"
        description="View captured, pending, and failed citizen payments across all services."
      />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {statsLoading || !stats
          ? Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-[104px] w-full rounded-2xl" />)
          : kpis.map((kpi) => (
              <StatCard
                key={kpi.title}
                title={kpi.title}
                value={kpi.value?.toLocaleString('en-IN') ?? '—'}
                icon={kpi.icon}
                iconColor={kpi.iconColor}
                iconBg={kpi.iconBg}
              />
            ))}
      </div>

      <Card>
        <CardContent className="pt-6">
          {isLoading ? (
            <div className="space-y-2">
              {Array.from({ length: 6 }).map((_, i) => (
                <Skeleton key={i} className="h-12 w-full" />
              ))}
            </div>
          ) : isError ? (
            <p className="py-10 text-center text-sm text-danger">Failed to load transactions.</p>
          ) : transactions.length === 0 ? (
            <p className="py-10 text-center text-sm text-muted-foreground">No transactions found.</p>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Transaction</TableHead>
                    <TableHead>Application</TableHead>
                    <TableHead>Citizen</TableHead>
                    <TableHead>Amount</TableHead>
                    <TableHead>Method</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Date</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {transactions.map((txn) => (
                    <TableRow key={txn.id}>
                      <TableCell className="font-mono text-xs">{txn.shortId}</TableCell>
                      <TableCell className="text-sm">{txn.applicationRef}</TableCell>
                      <TableCell className="text-sm">{txn.citizenPhone}</TableCell>
                      <TableCell className="text-sm font-medium">{formatCurrency(txn.amount, true)}</TableCell>
                      <TableCell className="text-sm capitalize">{txn.method}</TableCell>
                      <TableCell>
                        <Badge variant="outline" className={STATUS_STYLES[txn.status]}>
                          {STATUS_LABELS[txn.status]}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {formatDate(txn.createdAt, 'DD MMM YYYY, hh:mm A')}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}

          <div className="mt-4 flex items-center justify-between border-t border-border pt-4">
            <p className="text-sm text-muted-foreground">
              Showing page {page} of {totalPages} ({total} total)
            </p>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" disabled={page <= 1} onClick={() => setPage((p) => Math.max(1, p - 1))}>
                <ChevronLeft className="size-4" />
              </Button>
              <Button variant="outline" size="sm" disabled={page >= totalPages} onClick={() => setPage((p) => p + 1)}>
                <ChevronRight className="size-4" />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
