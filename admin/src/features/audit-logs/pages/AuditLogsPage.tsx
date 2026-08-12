import { useMemo, useState } from 'react';
import { Link } from 'react-router';
import { useQuery } from '@tanstack/react-query';
import { ChevronLeft, ChevronRight, Download, FileText, KeyRound, ScrollText, Settings2 } from 'lucide-react';
import { toast } from 'sonner';
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
  Button,
  Card,
  CardContent,
  Input,
  PageHeader,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  Skeleton,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui';
import { StatCard } from '@/components/data-display/stat-card';
import { formatDateTime } from '@/utils/format';
import { CATEGORY_OPTIONS, DATE_RANGE_OPTIONS, USER_OPTIONS } from '../constants/mock-data';
import { exportAuditLog, getAuditLogs, getAuditLogsStats } from '../services/audit-logs.service';
import type { AuditEventCategory } from '../types';
import { AuditStatusBadge } from '../components/AuditStatusBadge';

const PAGE_SIZE = 8;

export function AuditLogsPage() {
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState<AuditEventCategory | 'all'>('all');
  const [user, setUser] = useState('all');
  const [dateRange, setDateRange] = useState('24h');
  const [page, setPage] = useState(1);

  const { data: stats, isLoading: statsLoading } = useQuery({
    queryKey: ['audit-logs', 'stats'],
    queryFn: getAuditLogsStats,
  });

  const { data: result, isLoading } = useQuery({
    queryKey: ['audit-logs', 'list', search, category, user, page],
    queryFn: () => getAuditLogs({ search, category, user, page, pageSize: PAGE_SIZE }),
  });

  const logs = result?.data ?? [];
  const total = stats?.totalEvents ?? result?.total ?? 0;
  const rangeStart = logs.length === 0 ? 0 : (page - 1) * PAGE_SIZE + 1;
  const rangeEnd = (page - 1) * PAGE_SIZE + logs.length;
  const totalPages = Math.max(1, Math.ceil((result?.total ?? 0) / PAGE_SIZE));

  const kpis = useMemo(
    () => [
      { title: 'Total Events', value: stats?.totalEvents, icon: ScrollText, iconColor: '#2563EB', iconBg: '#EFF4FF' },
      { title: 'Login Activities', value: stats?.loginActivities, icon: KeyRound, iconColor: '#7C3AED', iconBg: '#F3EEFF' },
      { title: 'Document Actions', value: stats?.documentActions, icon: FileText, iconColor: '#16A34A', iconBg: '#EAF9EF' },
      { title: 'System Changes', value: stats?.systemChanges, icon: Settings2, iconColor: '#D97706', iconBg: '#FEF6E7' },
    ],
    [stats],
  );

  async function handleExport() {
    toast.promise(exportAuditLog(), {
      loading: 'Preparing audit log export…',
      success: 'Audit log exported successfully',
      error: 'Failed to export audit log',
    });
  }

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
            <BreadcrumbPage>Audit Log</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

      <PageHeader
        title="System Audit Log"
        description="Track every login, document action, and configuration change for compliance and security auditing."
        actions={
          <Button size="sm" className="gap-1.5" onClick={handleExport}>
            <Download className="h-4 w-4" />
            Export Audit Log
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
              />
            ))}
      </div>

      <Card>
        <CardContent className="space-y-4">
          <div className="flex flex-col flex-wrap gap-3 sm:flex-row sm:items-center">
            <Input
              placeholder="Search logs…"
              className="w-full sm:max-w-xs"
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
            />
            <Select
              value={category}
              onValueChange={(value) => {
                setCategory(value as AuditEventCategory | 'all');
                setPage(1);
              }}
            >
              <SelectTrigger className="w-full sm:w-[170px]">
                <SelectValue placeholder="Category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Events</SelectItem>
                {CATEGORY_OPTIONS.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select
              value={user}
              onValueChange={(value) => {
                setUser(value);
                setPage(1);
              }}
            >
              <SelectTrigger className="w-full sm:w-[170px]">
                <SelectValue placeholder="User" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Users</SelectItem>
                {USER_OPTIONS.map((option) => (
                  <SelectItem key={option} value={option}>
                    {option}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={dateRange} onValueChange={setDateRange}>
              <SelectTrigger className="w-full sm:w-[170px]">
                <SelectValue placeholder="Date Range" />
              </SelectTrigger>
              <SelectContent>
                {DATE_RANGE_OPTIONS.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Timestamp</TableHead>
                  <TableHead>User</TableHead>
                  <TableHead>Action</TableHead>
                  <TableHead>Resource</TableHead>
                  <TableHead>IP Address</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  Array.from({ length: 6 }).map((_, i) => (
                    <TableRow key={i}>
                      <TableCell colSpan={6}>
                        <Skeleton className="h-10 w-full" />
                      </TableCell>
                    </TableRow>
                  ))
                ) : logs.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="py-10 text-center text-sm text-muted-foreground">
                      No audit events match the selected filters.
                    </TableCell>
                  </TableRow>
                ) : (
                  logs.map((log) => (
                    <TableRow key={log.id}>
                      <TableCell className="text-sm text-muted-foreground">
                        {formatDateTime(log.timestamp)}
                      </TableCell>
                      <TableCell>
                        <p className="text-sm font-medium text-foreground">{log.userName}</p>
                        <p className="text-xs text-muted-foreground">{log.userRole}</p>
                      </TableCell>
                      <TableCell className="text-sm text-foreground">{log.action}</TableCell>
                      <TableCell className="text-sm text-muted-foreground">{log.resource}</TableCell>
                      <TableCell className="font-mono text-xs text-muted-foreground">{log.ipAddress}</TableCell>
                      <TableCell>
                        <AuditStatusBadge status={log.status} />
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>

          <div className="flex flex-col items-center justify-between gap-3 border-t border-border pt-4 sm:flex-row">
            <p className="text-sm text-muted-foreground">
              Showing <span className="font-medium text-foreground">{rangeStart}-{rangeEnd}</span> of{' '}
              <span className="font-medium text-foreground">{total.toLocaleString('en-IN')}</span>
            </p>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" disabled={page <= 1} onClick={() => setPage((p) => Math.max(1, p - 1))}>
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <span className="text-sm text-muted-foreground">
                Page {page} of {totalPages}
              </span>
              <Button
                variant="outline"
                size="sm"
                disabled={page >= totalPages}
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
