import { useMemo } from 'react';
import { Link } from 'react-router';
import { useQuery } from '@tanstack/react-query';
import { AlertTriangle, Clock, Download, FileStack, ShieldCheck } from 'lucide-react';
import { toast } from 'sonner';
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
  Button,
  PageHeader,
  Skeleton,
} from '@/components/ui';
import { StatCard } from '@/components/data-display/stat-card';
import { getAnalyticsStats } from '../services/analytics.service';
import { DocumentActivityChart } from '../components/DocumentActivityChart';
import { CategoryBreakdownChart } from '../components/CategoryBreakdownChart';
import { StatusDistributionChart } from '../components/StatusDistributionChart';
import { ActivityLogTable } from '../components/ActivityLogTable';

export function AnalyticsPage() {
  const { data: stats, isLoading: statsLoading } = useQuery({
    queryKey: ['analytics', 'stats'],
    queryFn: getAnalyticsStats,
  });

  const kpis = useMemo(
    () => [
      {
        title: 'Total Documents Uploaded',
        value: stats?.totalUploaded,
        trend: stats?.totalUploadedTrend,
        icon: FileStack,
        iconColor: '#2563EB',
        iconBg: '#EFF4FF',
      },
      {
        title: 'Verified',
        value: stats?.verified,
        trend: stats?.verifiedTrend,
        icon: ShieldCheck,
        iconColor: '#16A34A',
        iconBg: '#EAF9EF',
      },
      {
        title: 'Pending Review',
        value: stats?.pendingReview,
        trend: stats?.pendingReviewTrend,
        icon: Clock,
        iconColor: '#D97706',
        iconBg: '#FEF6E7',
      },
      {
        title: 'Expired Documents',
        value: stats?.expired,
        trend: undefined,
        icon: AlertTriangle,
        iconColor: '#DC2626',
        iconBg: '#FEF2F2',
      },
    ],
    [stats],
  );

  return (
    <div className="space-y-6 pb-24">
      <Breadcrumb>
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink asChild>
              <Link to="/dashboard">Dashboard</Link>
            </BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbPage>Analytics</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

      <PageHeader
        title="Platform Analytics & Performance"
        description="Monitor document activity, verification health, and platform trends."
        actions={
          <Button variant="outline" size="sm" className="gap-1.5" onClick={() => toast.info('Preparing export…')}>
            <Download className="h-4 w-4" />
            Export Report
          </Button>
        }
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
                trend={kpi.trend}
              />
            ))}
      </div>

      <DocumentActivityChart />

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
        <CategoryBreakdownChart />
        <StatusDistributionChart />
      </div>

      <ActivityLogTable />
    </div>
  );
}
