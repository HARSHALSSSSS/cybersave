import { useMemo, useState } from 'react';
import { Link } from 'react-router';
import { useQuery } from '@tanstack/react-query';
import {
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Clock,
  Download,
  Shield,
  UserX,
} from 'lucide-react';
import { toast } from 'sonner';
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
  Button,
  Input,
  PageHeader,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  Skeleton,
} from '@/components/ui';
import { StatCard } from '@/components/data-display/stat-card';
import { DEPARTMENTS } from '../constants/mock-data';
import { OperatorCard } from '../components/OperatorCard';
import { getOperators, getOperatorsStats } from '../services/operators.service';
import type { OperatorStatus } from '../types';

const PAGE_SIZE = 9;

export function OperatorsPage() {
  const [search, setSearch] = useState('');
  const [department, setDepartment] = useState('all');
  const [status, setStatus] = useState<OperatorStatus | 'all'>('all');
  const [page, setPage] = useState(1);

  const { data: stats, isLoading: statsLoading } = useQuery({
    queryKey: ['operators', 'stats'],
    queryFn: getOperatorsStats,
  });

  const { data: result, isLoading } = useQuery({
    queryKey: ['operators', 'list', search, department, status, page],
    queryFn: () => getOperators({ search, department, status, page, pageSize: PAGE_SIZE }),
  });

  const operators = result?.data ?? [];
  const total = result?.total ?? 0;
  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));
  const rangeStart = total === 0 ? 0 : (page - 1) * PAGE_SIZE + 1;
  const rangeEnd = Math.min(total, page * PAGE_SIZE);

  const kpis = useMemo(
    () => [
      { title: 'Total Operators', value: stats?.total, icon: Shield, iconColor: '#2563EB', iconBg: '#EFF4FF', description: 'Across all departments' },
      { title: 'Active', value: stats?.active, icon: CheckCircle2, iconColor: '#16A34A', iconBg: '#EAF9EF', description: 'Online & verified' },
      { title: 'Pending Approval', value: stats?.pending, icon: Clock, iconColor: '#D97706', iconBg: '#FEF6E7', description: 'Awaiting review' },
      { title: 'Suspended', value: stats?.suspended, icon: UserX, iconColor: '#DC2626', iconBg: '#FDECEC', description: 'Access revoked' },
    ],
    [stats],
  );

  return (
    <div className="space-y-6">
      <Breadcrumb>
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink asChild>
              <Link to="/dashboard">Dashboard</Link>
            </BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbPage>Operators</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

      <PageHeader
        title="Operator Management Center"
        description="Manage, monitor and track all platform operators and their access levels."
        actions={
          <Button variant="outline" size="sm" className="gap-1.5" onClick={() => toast.info('Preparing export…')}>
            <Download className="h-4 w-4" />
            Export Report
          </Button>
        }
      />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {statsLoading
          ? Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-[104px] w-full rounded-xl" />)
          : kpis.map((kpi) => (
              <StatCard
                key={kpi.title}
                title={kpi.title}
                value={kpi.value?.toLocaleString('en-IN') ?? '—'}
                icon={kpi.icon}
                iconColor={kpi.iconColor}
                iconBg={kpi.iconBg}
                description={kpi.description}
              />
            ))}
      </div>

      <div className="flex flex-col gap-3 rounded-xl border border-border bg-card p-4 sm:flex-row sm:items-center">
        <Input
          value={search}
          onChange={(e) => {
            setSearch(e.target.value);
            setPage(1);
          }}
          placeholder="Filter operators..."
          className="sm:max-w-xs"
        />
        <Select
          value={department}
          onValueChange={(v) => {
            setDepartment(v);
            setPage(1);
          }}
        >
          <SelectTrigger className="sm:w-52">
            <SelectValue placeholder="Department" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Departments</SelectItem>
            {DEPARTMENTS.map((d) => (
              <SelectItem key={d} value={d}>
                {d}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select
          value={status}
          onValueChange={(v) => {
            setStatus(v as OperatorStatus | 'all');
            setPage(1);
          }}
        >
          <SelectTrigger className="sm:w-44">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Statuses</SelectItem>
            <SelectItem value="active">Active</SelectItem>
            <SelectItem value="pending">Pending</SelectItem>
            <SelectItem value="suspended">Suspended</SelectItem>
          </SelectContent>
        </Select>
        <p className="text-sm text-muted-foreground sm:ml-auto">
          Showing {rangeStart}-{rangeEnd} of {total}
        </p>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
          {Array.from({ length: 9 }).map((_, i) => (
            <Skeleton key={i} className="h-56 w-full rounded-xl" />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
          {operators.map((op) => (
            <OperatorCard key={op.id} operator={op} />
          ))}
        </div>
      )}

      <div className="flex flex-col items-center justify-between gap-3 sm:flex-row">
        <p className="text-sm text-muted-foreground">Showing {operators.length} active operators</p>
        <div className="flex items-center gap-1">
          <Button variant="outline" size="sm" disabled={page <= 1} onClick={() => setPage((p) => p - 1)}>
            <ChevronLeft className="h-4 w-4" />
            Previous
          </Button>
          {Array.from({ length: Math.min(3, totalPages) }).map((_, i) => {
            const n = i + 1;
            return (
              <Button
                key={n}
                size="sm"
                variant={page === n ? 'default' : 'outline'}
                onClick={() => setPage(n)}
              >
                {n}
              </Button>
            );
          })}
          <Button
            variant="outline"
            size="sm"
            disabled={page >= totalPages}
            onClick={() => setPage((p) => p + 1)}
          >
            Next
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}
