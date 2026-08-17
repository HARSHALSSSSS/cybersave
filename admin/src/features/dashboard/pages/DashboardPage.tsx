import { useQuery } from '@tanstack/react-query';
import dayjs from 'dayjs';
import { Skeleton } from '@/components/ui';
import { StatCard } from '@/components/data-display/stat-card';
import type { AdminProfile } from '@/features/authentication/services/auth.service';
import { getMe } from '@/features/authentication/services/auth.service';
import { fullName } from '@/services/api/adapters';
import { getGreeting } from '@/utils/greeting';
import { getDashboardKpis } from '../services/dashboard.service';
import { RevenueChart } from '../components/RevenueChart';
import { ApplicationTrendsChart } from '../components/ApplicationTrendsChart';
import { ServiceShareChart } from '../components/ServiceShareChart';
import { CollectionsSummary } from '../components/CollectionsSummary';
import { OperatorLogs } from '../components/OperatorLogs';
import { RecentApplicationsTable } from '../components/RecentApplicationsTable';

const TODAY = dayjs();

function getGreetingName(user: AdminProfile | null | undefined): string {
  if (!user) return 'Admin';
  const name = fullName(user.firstName, user.lastName, '');
  if (name) return name;
  return user.email.split('@')[0] || 'Admin';
}

export function DashboardPage() {
  const { data: profile } = useQuery({
    queryKey: ['admin', 'me'],
    queryFn: getMe,
  });
  const { data: kpis, isLoading } = useQuery({
    queryKey: ['dashboard', 'kpis'],
    queryFn: getDashboardKpis,
    staleTime: 0,
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
        <div className="flex flex-col gap-1">
          <h1 className="text-2xl leading-8 font-bold tracking-tight text-foreground">
            {getGreeting()}, {getGreetingName(profile)}
          </h1>
          <p className="text-sm leading-5 text-muted-foreground">
            Here's what's happening across your service centres today.
          </p>
        </div>
        <span className="inline-flex h-9 w-fit items-center rounded-full border border-border bg-card px-4 text-sm leading-none font-medium text-muted-foreground shadow-sm">
          {TODAY.format('dddd, D MMMM YYYY')}
        </span>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-6">
        {isLoading || !kpis
          ? Array.from({ length: 6 }).map((_, i) => <Skeleton key={i} className="h-[112px] w-full rounded-2xl" />)
          : kpis.map((kpi) => (
              <StatCard
                key={kpi.id}
                title={kpi.title}
                value={kpi.value}
                icon={kpi.icon}
                iconColor={kpi.iconColor}
                iconBg={kpi.iconBg}
                trend={kpi.trend}
                description={kpi.description}
              />
            ))}
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <RevenueChart />
        </div>
        <ServiceShareChart />
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <ApplicationTrendsChart />
        </div>
        <CollectionsSummary />
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <OperatorLogs />
        <div className="lg:col-span-2">
          <RecentApplicationsTable />
        </div>
      </div>
    </div>
  );
}
