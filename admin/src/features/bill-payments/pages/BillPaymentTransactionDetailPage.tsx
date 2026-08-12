import { useParams, Link } from 'react-router';
import { useQuery } from '@tanstack/react-query';
import {
  Badge,
  Button,
  Card,
  CardContent,
  PageHeader,
  Skeleton,
} from '@/components/ui';
import { formatCurrency, formatDate } from '@/utils/format';
import { getBillPaymentTransaction } from '../services/bill-payments.service';

export function BillPaymentTransactionDetailPage() {
  const { transactionId = '' } = useParams();
  const { data: txn, isLoading } = useQuery({
    queryKey: ['bill-payments', 'transaction', transactionId],
    queryFn: () => getBillPaymentTransaction(transactionId),
    enabled: Boolean(transactionId),
  });

  if (isLoading) {
    return <Skeleton className="h-96 w-full rounded-2xl" />;
  }

  if (!txn) {
    return <p className="text-sm text-muted-foreground">Transaction not found.</p>;
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Bill Payment Detail"
        description={`Transaction ${txn.id}`}
        actions={
          <Button variant="outline" asChild>
            <Link to="/bill-payments/transactions">Back to list</Link>
          </Button>
        }
      />

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardContent className="space-y-3 pt-6 text-sm">
            <h3 className="font-semibold">Payment</h3>
            <p>Status: <Badge variant="outline">{txn.status}</Badge></p>
            <p>Bill amount: {formatCurrency(Number(txn.billAmount), true)}</p>
            <p>Fee: {formatCurrency(Number(txn.convenienceFee), true)}</p>
            <p>Total: {formatCurrency(Number(txn.totalAmount), true)}</p>
            <p>Account: {txn.accountHolderMasked}</p>
            <p>Created: {formatDate(txn.createdAt, 'DD MMM YYYY, hh:mm A')}</p>
            {txn.paidAt ? <p>Paid: {formatDate(txn.paidAt, 'DD MMM YYYY, hh:mm A')}</p> : null}
          </CardContent>
        </Card>

        <Card>
          <CardContent className="space-y-3 pt-6 text-sm">
            <h3 className="font-semibold">References</h3>
            <p className="font-mono text-xs break-all">Order: {txn.razorpayOrderId ?? '—'}</p>
            <p className="font-mono text-xs break-all">Payment: {txn.razorpayPaymentId ?? '—'}</p>
            <p className="font-mono text-xs break-all">BBPS: {txn.razorpayBillPaymentId ?? '—'}</p>
            {txn.errorMessage ? <p className="text-danger">Error: {txn.errorMessage}</p> : null}
          </CardContent>
        </Card>

        <Card className="lg:col-span-2">
          <CardContent className="space-y-3 pt-6 text-sm">
            <h3 className="font-semibold">Citizen & Biller</h3>
            <p>
              Citizen: {txn.citizen.firstName} {txn.citizen.lastName} ({txn.citizen.phone})
            </p>
            <p>Biller: {txn.biller.name} · {txn.biller.providerCategory}</p>
            {txn.billRequest ? (
              <pre className="max-h-64 overflow-auto rounded-lg bg-muted p-3 text-xs">
                {JSON.stringify(txn.billRequest.billDetails ?? {}, null, 2)}
              </pre>
            ) : null}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
