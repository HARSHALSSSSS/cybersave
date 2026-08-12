import { useMemo, useState } from 'react';
import { Link } from 'react-router';
import { useQuery } from '@tanstack/react-query';
import { AlertTriangle, CheckCircle2, ChevronLeft, ChevronRight, Clock, Download, Inbox } from 'lucide-react';
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
import { TICKET_CATEGORIES, TICKET_PRIORITIES, TICKET_STATUSES } from '../constants/mock-data';
import { getTickets, getTicketsStats } from '../services/tickets.service';
import type { TicketCategory, TicketPriority, TicketStatus } from '../types';
import { TicketCard } from '../components/TicketCard';

const PAGE_SIZE = 9;

const STATUS_LABELS: Record<TicketStatus, string> = {
  open: 'Open',
  in_progress: 'In Progress',
  resolved: 'Resolved',
  escalated: 'Escalated',
};

const PRIORITY_LABELS: Record<TicketPriority, string> = {
  critical: 'Critical',
  high: 'High',
  medium: 'Medium',
  low: 'Low',
};

export function SupportTicketsPage() {
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState<TicketCategory | 'all'>('all');
  const [status, setStatus] = useState<TicketStatus | 'all'>('all');
  const [priority, setPriority] = useState<TicketPriority | 'all'>('all');
  const [page, setPage] = useState(1);

  const { data: stats, isLoading: statsLoading } = useQuery({
    queryKey: ['support-tickets', 'stats'],
    queryFn: getTicketsStats,
  });

  const { data: result, isLoading } = useQuery({
    queryKey: ['support-tickets', 'list', search, category, status, priority, page],
    queryFn: () => getTickets({ search, category, status, priority, page, pageSize: PAGE_SIZE }),
  });

  const tickets = result?.data ?? [];
  const total = result?.total ?? 0;
  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));
  const rangeStart = total === 0 ? 0 : (page - 1) * PAGE_SIZE + 1;
  const rangeEnd = Math.min(total, page * PAGE_SIZE);

  const kpis = useMemo(
    () => [
      { title: 'Total Tickets', value: stats?.total, icon: Inbox, iconColor: '#2563EB', iconBg: '#EFF4FF' },
      { title: 'Open', value: stats?.open, icon: AlertTriangle, iconColor: '#0369A1', iconBg: '#F0F9FF' },
      { title: 'In Progress', value: stats?.inProgress, icon: Clock, iconColor: '#D97706', iconBg: '#FEF6E7' },
      { title: 'Resolved', value: stats?.resolved, icon: CheckCircle2, iconColor: '#16A34A', iconBg: '#EAF9EF' },
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
            <BreadcrumbPage>Support Tickets</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

      <PageHeader
        title="Support Ticket Management"
        description="Track, respond to, and resolve citizen support requests."
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
              />
            ))}
      </div>

      <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex flex-1 flex-wrap items-center gap-2">
          <Input
            placeholder="Filter tickets..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            className="w-full sm:w-56"
          />
          <Select
            value={category}
            onValueChange={(value) => {
              setCategory(value as TicketCategory | 'all');
              setPage(1);
            }}
          >
            <SelectTrigger className="w-[160px]">
              <SelectValue placeholder="Category" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Categories</SelectItem>
              {TICKET_CATEGORIES.map((c) => (
                <SelectItem key={c} value={c}>
                  {c}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select
            value={status}
            onValueChange={(value) => {
              setStatus(value as TicketStatus | 'all');
              setPage(1);
            }}
          >
            <SelectTrigger className="w-[150px]">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Statuses</SelectItem>
              {TICKET_STATUSES.map((s) => (
                <SelectItem key={s} value={s}>
                  {STATUS_LABELS[s]}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select
            value={priority}
            onValueChange={(value) => {
              setPriority(value as TicketPriority | 'all');
              setPage(1);
            }}
          >
            <SelectTrigger className="w-[140px]">
              <SelectValue placeholder="Priority" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Priorities</SelectItem>
              {TICKET_PRIORITIES.map((p) => (
                <SelectItem key={p} value={p}>
                  {PRIORITY_LABELS[p]}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <p className="shrink-0 text-sm leading-5 text-muted-foreground">
          Showing {rangeStart}-{rangeEnd} of {total.toLocaleString('en-IN')}
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
        {isLoading
          ? Array.from({ length: 9 }).map((_, i) => <Skeleton key={i} className="h-[280px] w-full rounded-2xl" />)
          : tickets.length === 0
            ? (
                <div className="col-span-full py-16 text-center text-sm text-muted-foreground">
                  No tickets match the selected filters.
                </div>
              )
            : tickets.map((ticket) => <TicketCard key={ticket.id} ticket={ticket} />)}
      </div>

      <div className="flex flex-col items-center justify-between gap-3 border-t border-border-subtle pt-4 sm:flex-row">
        <p className="text-sm leading-5 text-muted-foreground">
          Page <span className="font-medium text-foreground">{page}</span> of{' '}
          <span className="font-medium text-foreground">{totalPages}</span>
        </p>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" disabled={page <= 1} onClick={() => setPage((p) => Math.max(1, p - 1))}>
            <ChevronLeft className="h-4 w-4" />
          </Button>
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
    </div>
  );
}
