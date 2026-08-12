import { useMemo, useState } from 'react';
import { Link } from 'react-router';
import { useQuery } from '@tanstack/react-query';
import {
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Clock,
  Download,
  FileStack,
  Loader2,
  MoreHorizontal,
  Plus,
  TimerReset,
} from 'lucide-react';
import { toast } from 'sonner';
import {
  Avatar,
  AvatarFallback,
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
  Button,
  Card,
  CardContent,
  Checkbox,
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
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
  Tabs,
  TabsList,
  TabsTrigger,
} from '@/components/ui';
import { StatCard } from '@/components/data-display/stat-card';
import { cn } from '@/lib/utils';
import { formatCurrency, formatDate } from '@/utils/format';
import { CATEGORY_TABS } from '../constants/mock-data';
import { getApplications, getApplicationsStats } from '../services/applications.service';
import { getOperators } from '@/features/operators/services/operators.service';
import type { ApplicationCategory, ApplicationPriority, ApplicationStatus } from '../types';
import { ApplicationStatusBadge } from '../components/ApplicationStatusBadge';
import { PriorityIndicator } from '../components/PriorityIndicator';
import { BulkActionBar } from '../components/BulkActionBar';

const PAGE_SIZE = 8;

export function ApplicationsPage() {
  const [category, setCategory] = useState<(typeof CATEGORY_TABS)[number]>('All Applications');
  const [status, setStatus] = useState<ApplicationStatus | 'all'>('all');
  const [priority, setPriority] = useState<ApplicationPriority | 'all'>('all');
  const [assigned, setAssigned] = useState<string>('all');
  const [page, setPage] = useState(1);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

  const { data: stats, isLoading: statsLoading } = useQuery({
    queryKey: ['applications', 'stats'],
    queryFn: getApplicationsStats,
  });

  const { data: operatorsResult } = useQuery({
    queryKey: ['operators', 'filter-list'],
    queryFn: () => getOperators({ page: 1, pageSize: 100 }),
  });
  const operators = operatorsResult?.data ?? [];

  const { data: result, isLoading } = useQuery({
    queryKey: ['applications', 'list', category, status, priority, assigned, page],
    queryFn: () =>
      getApplications({
        category: category as ApplicationCategory | 'All Applications',
        status,
        priority,
        assigned,
        page,
        pageSize: PAGE_SIZE,
      }),
  });

  const applications = result?.data ?? [];
  const total = result?.total ?? 0;
  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));
  const allSelected = applications.length > 0 && applications.every((a) => selectedIds.has(a.id));

  const kpis = useMemo(
    () => [
      { title: 'Total Applications', value: stats?.total, icon: FileStack, iconColor: '#2563EB', iconBg: '#EFF4FF' },
      { title: "Today's Received", value: stats?.todayReceived, icon: TimerReset, iconColor: '#7C3AED', iconBg: '#F3EEFF' },
      { title: 'Pending Review', value: stats?.pendingReview, icon: Clock, iconColor: '#D97706', iconBg: '#FEF6E7' },
      { title: 'In Processing', value: stats?.inProcessing, icon: Loader2, iconColor: '#0891B2', iconBg: '#E7F8FB' },
      { title: 'Completed Today', value: stats?.completedToday, icon: CheckCircle2, iconColor: '#16A34A', iconBg: '#EAF9EF' },
    ],
    [stats],
  );

  function toggleAll() {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (allSelected) {
        applications.forEach((a) => next.delete(a.id));
      } else {
        applications.forEach((a) => next.add(a.id));
      }
      return next;
    });
  }

  function toggleOne(id: string) {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

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
            <BreadcrumbPage>Applications</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

      <PageHeader
        title="Applications"
        description="Track, review, and process service applications across all centres."
        actions={
          <div className="flex flex-wrap items-center gap-2">
            <Button variant="outline" size="sm" className="gap-1.5" onClick={() => toast.info('Preparing export…')}>
              <Download className="h-4 w-4" />
              Export Report
            </Button>
            <Button size="sm" className="gap-1.5 bg-[#2563EB] hover:bg-blue-700">
              <Plus className="h-4 w-4" />
              New Application
            </Button>
          </div>
        }
      />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-5">
        {statsLoading || !stats
          ? Array.from({ length: 5 }).map((_, i) => <Skeleton key={i} className="h-[104px] w-full rounded-2xl" />)
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

      <Card className="border-gray-200">
        <CardContent className="space-y-4">
          <Tabs
            value={category}
            onValueChange={(value) => {
              setCategory(value as (typeof CATEGORY_TABS)[number]);
              setPage(1);
            }}
          >
            <TabsList className="flex-wrap">
              {CATEGORY_TABS.map((tabValue) => (
                <TabsTrigger key={tabValue} value={tabValue}>
                  {tabValue}
                </TabsTrigger>
              ))}
            </TabsList>
          </Tabs>

          <div className="flex flex-wrap items-center gap-2">
            <Select
              value={status}
              onValueChange={(value) => {
                setStatus(value as ApplicationStatus | 'all');
                setPage(1);
              }}
            >
              <SelectTrigger className="w-[150px]">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                <SelectItem value="submitted">Submitted</SelectItem>
                <SelectItem value="under_review">Under Review</SelectItem>
                <SelectItem value="processing">Processing</SelectItem>
                <SelectItem value="approved">Approved</SelectItem>
                <SelectItem value="completed">Completed</SelectItem>
                <SelectItem value="rejected">Rejected</SelectItem>
              </SelectContent>
            </Select>

            <Select
              value={priority}
              onValueChange={(value) => {
                setPriority(value as ApplicationPriority | 'all');
                setPage(1);
              }}
            >
              <SelectTrigger className="w-[140px]">
                <SelectValue placeholder="Priority" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Priorities</SelectItem>
                <SelectItem value="high">High</SelectItem>
                <SelectItem value="medium">Medium</SelectItem>
                <SelectItem value="low">Low</SelectItem>
              </SelectContent>
            </Select>

            <Button variant="outline" size="sm" className="gap-1.5 text-gray-600">
              Custom Date
            </Button>

            <Select
              value={assigned}
              onValueChange={(value) => {
                setAssigned(value);
                setPage(1);
              }}
            >
              <SelectTrigger className="w-[160px]">
                <SelectValue placeholder="Assigned" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Operators</SelectItem>
                {operators.map((operator) => (
                  <SelectItem key={operator.id} value={operator.name}>
                    {operator.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-10">
                    <Checkbox checked={allSelected} onCheckedChange={toggleAll} aria-label="Select all" />
                  </TableHead>
                  <TableHead>APP ID</TableHead>
                  <TableHead>Citizen</TableHead>
                  <TableHead>Service Type</TableHead>
                  <TableHead>Priority</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Assigned</TableHead>
                  <TableHead>Submitted</TableHead>
                  <TableHead>SLA</TableHead>
                  <TableHead className="text-right">Amount</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  Array.from({ length: 6 }).map((_, i) => (
                    <TableRow key={i}>
                      <TableCell colSpan={11}>
                        <Skeleton className="h-10 w-full" />
                      </TableCell>
                    </TableRow>
                  ))
                ) : applications.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={11} className="py-10 text-center text-sm text-gray-500">
                      No applications match the selected filters.
                    </TableCell>
                  </TableRow>
                ) : (
                  applications.map((application) => {
                    const isOverdue = application.slaRemainingHours <= 6 && application.status !== 'completed';
                    return (
                      <TableRow key={application.id}>
                        <TableCell onClick={(e) => e.stopPropagation()}>
                          <Checkbox
                            checked={selectedIds.has(application.id)}
                            onCheckedChange={() => toggleOne(application.id)}
                            aria-label={`Select ${application.id}`}
                          />
                        </TableCell>
                        <TableCell>
                          <Link
                            to={`/applications/${application.id}`}
                            className="font-medium text-[#2563EB] hover:underline"
                          >
                            {application.id}
                          </Link>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Avatar className="h-7 w-7">
                              <AvatarFallback className="bg-blue-50 text-xs font-medium text-[#2563EB]">
                                {application.citizenInitials}
                              </AvatarFallback>
                            </Avatar>
                            <span className="text-sm text-gray-700">{application.citizenName}</span>
                          </div>
                        </TableCell>
                        <TableCell className="text-sm text-gray-600">{application.service}</TableCell>
                        <TableCell>
                          <PriorityIndicator priority={application.priority} />
                        </TableCell>
                        <TableCell>
                          <ApplicationStatusBadge status={application.status} />
                        </TableCell>
                        <TableCell className="text-sm text-gray-600">
                          {application.assignedOperator ?? <span className="text-gray-400">Unassigned</span>}
                        </TableCell>
                        <TableCell className="text-sm text-gray-500">
                          {formatDate(application.submittedAt, 'DD MMM, hh:mm A')}
                        </TableCell>
                        <TableCell>
                          <span className={cn('text-sm font-medium', isOverdue ? 'text-red-600' : 'text-gray-600')}>
                            {application.status === 'completed'
                              ? 'Met'
                              : `${application.slaRemainingHours}h left`}
                          </span>
                        </TableCell>
                        <TableCell className="text-right text-sm text-gray-700">
                          {application.amount > 0 ? formatCurrency(application.amount) : '—'}
                        </TableCell>
                        <TableCell className="text-right" onClick={(e) => e.stopPropagation()}>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon" className="h-8 w-8">
                                <MoreHorizontal className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem asChild>
                                <Link to={`/applications/${application.id}`}>View Details</Link>
                              </DropdownMenuItem>
                              <DropdownMenuItem>Assign Operator</DropdownMenuItem>
                              <DropdownMenuItem className="text-red-600">Escalate</DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    );
                  })
                )}
              </TableBody>
            </Table>
          </div>

          <div className="flex flex-col items-center justify-between gap-3 border-t border-gray-100 pt-4 sm:flex-row">
            <p className="text-sm text-gray-500">
              Showing <span className="font-medium text-gray-700">{applications.length}</span> of{' '}
              <span className="font-medium text-gray-700">{total.toLocaleString('en-IN')}</span> applications
            </p>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                disabled={page <= 1}
                onClick={() => setPage((p) => Math.max(1, p - 1))}
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <span className="text-sm text-gray-600">
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

      <BulkActionBar
        selectedCount={selectedIds.size}
        onClear={() => setSelectedIds(new Set())}
        onBatchAssign={() => toast.info(`Assigning ${selectedIds.size} applications…`)}
        onEscalate={() => toast.success(`${selectedIds.size} applications escalated`)}
        onBulkApprove={() => {
          toast.success(`${selectedIds.size} applications approved`);
          setSelectedIds(new Set());
        }}
      />
    </div>
  );
}
