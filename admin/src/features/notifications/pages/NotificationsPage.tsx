import { useMemo, useState } from 'react';
import { Link } from 'react-router';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { AlertTriangle, Bell, CheckCircle2, Search, Settings, ShieldAlert } from 'lucide-react';
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
} from '@/components/ui';
import { StatCard } from '@/components/data-display/stat-card';
import { CATEGORY_OPTIONS, PRIORITY_OPTIONS } from '../constants/mock-data';
import {
  getNotifications,
  getNotificationsStats,
  markAllNotificationsRead,
  markNotificationRead,
} from '../services/notifications.service';
import type { NotificationCategory, NotificationItem, NotificationPriority } from '../types';
import { NotificationListItem } from '../components/NotificationListItem';

const PAGE_SIZE = 8;

export function NotificationsPage() {
  const queryClient = useQueryClient();
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState<NotificationCategory | 'all'>('all');
  const [priority, setPriority] = useState<NotificationPriority | 'all'>('all');
  const [page, setPage] = useState(1);

  const { data: stats, isLoading: statsLoading } = useQuery({
    queryKey: ['notifications', 'stats'],
    queryFn: getNotificationsStats,
  });

  const { data: result, isLoading } = useQuery({
    queryKey: ['notifications', 'list', search, category, priority, page],
    queryFn: () => getNotifications({ search, category, priority, page, pageSize: PAGE_SIZE }),
  });

  const notifications = result?.data ?? [];
  const total = result?.total ?? 0;
  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));
  const rangeStart = total === 0 ? 0 : (page - 1) * PAGE_SIZE + 1;
  const rangeEnd = Math.min(page * PAGE_SIZE, total);

  const kpis = useMemo(
    () => [
      { title: 'All Notifications', value: stats?.total, icon: Bell, iconColor: '#2563EB', iconBg: '#EFF4FF' },
      { title: 'Unread Alerts', value: stats?.unread, icon: ShieldAlert, iconColor: '#DC2626', iconBg: '#FEF2F2' },
      { title: 'Success Logs', value: stats?.successLogs, icon: CheckCircle2, iconColor: '#16A34A', iconBg: '#EAF9EF' },
      { title: 'Pending Checks', value: stats?.pendingChecks, icon: AlertTriangle, iconColor: '#D97706', iconBg: '#FEF6E7' },
    ],
    [stats],
  );

  function handleView(notification: NotificationItem) {
    toast.info(`Opening ${notification.id}`);
  }

  async function handleMarkRead(notification: NotificationItem) {
    await markNotificationRead(notification.id);
    await queryClient.invalidateQueries({ queryKey: ['notifications'] });
    toast.success('Notification marked as read');
  }

  async function handleMarkAllRead() {
    await markAllNotificationsRead();
    await queryClient.invalidateQueries({ queryKey: ['notifications'] });
    toast.success('All notifications marked as read');
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
            <BreadcrumbPage>Notifications</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

      <PageHeader
        title="Notification Center"
        description="Monitor system activity, security alerts, driver updates, and real-time operations."
        actions={
          <Button variant="outline" size="sm" className="gap-1.5" onClick={() => toast.info('Opening preference settings…')}>
            <Settings className="h-4 w-4" />
            Preferences Settings
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
        <CardContent className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex flex-1 flex-col gap-3 sm:flex-row sm:items-center">
            <div className="relative w-full sm:max-w-xs">
              <Search className="pointer-events-none absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search notifications…"
                className="pl-9"
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value);
                  setPage(1);
                }}
              />
            </div>
            <Select
              value={category}
              onValueChange={(value) => {
                setCategory(value as NotificationCategory | 'all');
                setPage(1);
              }}
            >
              <SelectTrigger className="w-full sm:w-[170px]">
                <SelectValue placeholder="Category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                {CATEGORY_OPTIONS.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select
              value={priority}
              onValueChange={(value) => {
                setPriority(value as NotificationPriority | 'all');
                setPage(1);
              }}
            >
              <SelectTrigger className="w-full sm:w-[150px]">
                <SelectValue placeholder="Priority" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Priorities</SelectItem>
                {PRIORITY_OPTIONS.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="flex shrink-0 items-center gap-3">
            <p className="text-sm leading-5 whitespace-nowrap text-muted-foreground">
              Showing <span className="font-medium text-foreground">{rangeStart}-{rangeEnd}</span> of{' '}
              <span className="font-medium text-foreground">{(stats?.total ?? total).toLocaleString('en-IN')}</span>
            </p>
            <Button variant="link" size="sm" className="h-auto p-0 text-sm" onClick={handleMarkAllRead}>
              Mark all as read
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="space-y-3">
          {isLoading || !result ? (
            Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-24 w-full rounded-xl" />)
          ) : notifications.length === 0 ? (
            <p className="py-10 text-center text-sm text-muted-foreground">No notifications match your filters.</p>
          ) : (
            notifications.map((notification) => (
              <NotificationListItem
                key={notification.id}
                notification={notification}
                onView={handleView}
                onMarkRead={handleMarkRead}
              />
            ))
          )}

          <div className="flex flex-col items-center justify-between gap-3 border-t border-border pt-4 sm:flex-row">
            <p className="text-sm leading-5 text-muted-foreground">Showing {notifications.length} active alerts.</p>
            <div className="flex items-center gap-1.5">
              <Button variant="outline" size="sm" disabled={page <= 1} onClick={() => setPage((p) => Math.max(1, p - 1))}>
                Previous
              </Button>
              {Array.from({ length: totalPages }).map((_, i) => {
                const pageNumber = i + 1;
                return (
                  <Button
                    key={pageNumber}
                    variant={pageNumber === page ? 'default' : 'outline'}
                    size="sm"
                    className="w-8 px-0"
                    onClick={() => setPage(pageNumber)}
                  >
                    {pageNumber}
                  </Button>
                );
              })}
              <Button
                variant="outline"
                size="sm"
                disabled={page >= totalPages}
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              >
                Next
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
