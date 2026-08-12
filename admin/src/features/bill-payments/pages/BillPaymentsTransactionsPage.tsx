import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router';
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
import { formatCurrency, formatDate } from '@/utils/format';
import { listBillPaymentTransactions } from '../services/bill-payments.service';

const STATUS_STYLES: Record<string, string> = {
  success: 'bg-emerald-50 text-emerald-700 border-emerald-100',
  pending: 'bg-amber-50 text-amber-700 border-amber-100',
  processing: 'bg-blue-50 text-blue-700 border-blue-100',
  failed: 'bg-red-50 text-red-700 border-red-100',
};

export function BillPaymentsTransactionsPage() {
  const [page] = useState(1);

  const { data, isLoading } = useQuery({
    queryKey: ['bill-payments', 'transactions', page],
    queryFn: () => listBillPaymentTransactions({ page, limit: 50 }),
  });

  const transactions = data?.data ?? [];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Bill Payment Transactions"
        description="All citizen BBPS bill payments with payment and NPCI references."
        actions={
          <Button variant="outline" asChild>
            <Link to="/bill-payments">Back to dashboard</Link>
          </Button>
        }
      />

      <Card>
        <CardContent className="pt-6">
          {isLoading ? (
            <Skeleton className="h-64 w-full" />
          ) : transactions.length === 0 ? (
            <p className="py-10 text-center text-sm text-muted-foreground">No transactions yet.</p>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Transaction</TableHead>
                    <TableHead>User</TableHead>
                    <TableHead>Biller</TableHead>
                    <TableHead>Amount</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Created</TableHead>
                    <TableHead />
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {transactions.map((txn) => (
                    <TableRow key={txn.id}>
                      <TableCell className="font-mono text-xs">{txn.id.slice(0, 8)}…</TableCell>
                      <TableCell className="text-sm">{txn.citizen.phone}</TableCell>
                      <TableCell className="text-sm">{txn.biller.name}</TableCell>
                      <TableCell className="font-medium">
                        {formatCurrency(Number(txn.totalAmount), true)}
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className={STATUS_STYLES[txn.status.toLowerCase()] ?? ''}>
                          {txn.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {formatDate(txn.createdAt, 'DD MMM YYYY, hh:mm A')}
                      </TableCell>
                      <TableCell>
                        <Button variant="ghost" size="sm" asChild>
                          <Link to={`/bill-payments/transactions/${txn.id}`}>View</Link>
                        </Button>
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
