import { Link } from 'react-router';
import { useQuery } from '@tanstack/react-query';
import {
  ArrowLeftRight,
  CheckCircle2,
  Clock,
  IndianRupee,
  XCircle,
} from 'lucide-react';
import {
  Button,
  Card,
  CardContent,
  PageHeader,
  Skeleton,
} from '@/components/ui';
import { StatCard } from '@/components/data-display/stat-card';
import { formatCurrency } from '@/utils/format';
import { getBillPaymentsDashboard } from '../services/bill-payments.service';

export function BillPaymentsDashboardPage() {
  const { data: stats, isLoading } = useQuery({
    queryKey: ['bill-payments', 'dashboard'],
    queryFn: getBillPaymentsDashboard,
  });

  const kpis = [
    { title: 'Total Transactions', value: stats?.totalTransactions, icon: ArrowLeftRight, iconColor: '#2563EB', iconBg: '#EFF4FF' },
    { title: "Today's Transactions", value: stats?.todayTransactions, icon: Clock, iconColor: '#6366F1', iconBg: '#EEF2FF' },
    { title: 'Successful', value: stats?.successful, icon: CheckCircle2, iconColor: '#16A34A', iconBg: '#EAF9EF' },
    { title: 'Failed', value: stats?.failed, icon: XCircle, iconColor: '#DC2626', iconBg: '#FDECEC' },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Bill Payments"
        description="Monitor BBPS bill payment transactions, catalogue, and Razorpay integration."
        actions={
          <div className="flex flex-wrap gap-2">
            <Button variant="outline" asChild>
              <Link to="/bill-payments/categories">Categories</Link>
            </Button>
            <Button variant="outline" asChild>
              <Link to="/bill-payments/billers">Billers</Link>
            </Button>
            <Button variant="outline" asChild>
              <Link to="/bill-payments/transactions">Transactions</Link>
            </Button>
            <Button asChild>
              <Link to="/bill-payments/integration">Integration</Link>
            </Button>
          </div>
        }
      />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {isLoading || !stats
          ? Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-[104px] rounded-2xl" />)
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
        <CardContent className="flex flex-col gap-4 pt-6 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-sm text-muted-foreground">Total successful amount</p>
            <p className="text-2xl font-semibold">
              {isLoading ? '—' : formatCurrency(stats?.totalAmount ?? 0, true)}
            </p>
          </div>
          <div className="flex items-center gap-2 text-muted-foreground">
            <IndianRupee className="size-4" />
            <span className="text-sm">{stats?.pending ?? 0} pending confirmations</span>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
