import { useMemo, useState } from 'react';
import { Link } from 'react-router';
import { useQuery } from '@tanstack/react-query';
import dayjs from 'dayjs';
import {
  ChevronLeft,
  ChevronRight,
  Download,
  MoreHorizontal,
  Plus,
  ShieldOff,
  Upload,
  UserCheck,
  UserCog,
  UserPlus,
  Users as UsersIcon,
} from 'lucide-react';
import { toast } from 'sonner';
import {
  Avatar,
  AvatarFallback,
  Badge,
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
import { getCitizens, getUsersStats } from '../services/users.service';
import type { Citizen, CitizenStatus } from '../types';
import { CitizenStatusBadge } from '../components/CitizenStatusBadge';
import { BulkActionBar } from '../components/BulkActionBar';
import { SendNotificationModal } from '../components/SendNotificationModal';

type TabValue = CitizenStatus | 'all';

const PAGE_SIZE = 8;
const SERVICE_OPTIONS = ['Aadhaar Services', 'PAN Card', 'Certificates', 'Banking'];

export function UsersPage() {
  const [tab, setTab] = useState<TabValue>('all');
  const [page, setPage] = useState(1);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [notifyCitizen, setNotifyCitizen] = useState<Citizen | null>(null);

  const { data: stats, isLoading: statsLoading } = useQuery({
    queryKey: ['users', 'stats'],
    queryFn: getUsersStats,
  });

  const { data: citizensResult, isLoading: citizensLoading } = useQuery({
    queryKey: ['users', 'citizens', tab, page],
    queryFn: () =>
      getCitizens({
        status: tab,
        page,
        pageSize: PAGE_SIZE,
      }),
  });

  const citizens = citizensResult?.data ?? [];
  const total = citizensResult?.total ?? 0;
  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));

  const allSelected = citizens.length > 0 && citizens.every((c) => selectedIds.has(c.id));

  const kpis = useMemo(
    () => [
      { title: 'Total Citizens', value: stats?.totalCitizens, icon: UsersIcon, iconColor: '#2563EB', iconBg: '#EFF4FF' },
      { title: 'Active', value: stats?.active, icon: UserCheck, iconColor: '#16A34A', iconBg: '#EAF9EF' },
      { title: 'New This Month', value: stats?.newThisMonth, icon: UserPlus, iconColor: '#7C3AED', iconBg: '#F3EEFF' },
      { title: 'Pending Verification', value: stats?.pendingVerification, icon: UserCog, iconColor: '#D97706', iconBg: '#FEF6E7' },
    ],
    [stats],
  );

  function toggleAll() {
    setSelectedIds((prev) => {
      if (allSelected) {
        const next = new Set(prev);
        citizens.forEach((c) => next.delete(c.id));
        return next;
      }
      const next = new Set(prev);
      citizens.forEach((c) => next.add(c.id));
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
            <BreadcrumbPage>User Management</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

      <PageHeader
        title="User Management"
        description="Manage citizen accounts, verification status, and engagement."
        actions={
          <div className="flex flex-wrap items-center gap-2">
            <Button variant="outline" size="sm" className="gap-1.5" onClick={() => toast.info('Import started')}>
              <Upload className="h-4 w-4" />
              Import
            </Button>
            <Button variant="outline" size="sm" className="gap-1.5" onClick={() => toast.info('Exporting citizens…')}>
              <Download className="h-4 w-4" />
              Export
            </Button>
            <Button size="sm" className="gap-1.5 bg-[#2563EB] hover:bg-blue-700">
              <Plus className="h-4 w-4" />
              Add Citizen
            </Button>
          </div>
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

      <Card className="border-gray-200">
        <CardContent className="space-y-4">
          <div className="flex flex-col justify-between gap-4 lg:flex-row lg:items-center">
            <Tabs
              value={tab}
              onValueChange={(value) => {
                setTab(value as TabValue);
                setPage(1);
              }}
            >
              <TabsList>
                <TabsTrigger value="all">All Citizens</TabsTrigger>
                <TabsTrigger value="verified">Verified</TabsTrigger>
                <TabsTrigger value="unverified">Unverified</TabsTrigger>
                <TabsTrigger value="blocked">Blocked</TabsTrigger>
              </TabsList>
            </Tabs>

            <div className="flex flex-wrap items-center gap-2">
              <Select defaultValue="30d">
                <SelectTrigger className="w-[150px]">
                  <SelectValue placeholder="Last 30 Days" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="7d">Last 7 Days</SelectItem>
                  <SelectItem value="30d">Last 30 Days</SelectItem>
                  <SelectItem value="90d">Last 90 Days</SelectItem>
                </SelectContent>
              </Select>
              <Select defaultValue="all">
                <SelectTrigger className="w-[150px]">
                  <SelectValue placeholder="Service" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Services</SelectItem>
                  {SERVICE_OPTIONS.map((s) => (
                    <SelectItem key={s} value={s}>
                      {s}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-10">
                    <Checkbox checked={allSelected} onCheckedChange={toggleAll} aria-label="Select all" />
                  </TableHead>
                  <TableHead>Citizen ID</TableHead>
                  <TableHead>Full Name</TableHead>
                  <TableHead>Aadhaar</TableHead>
                  <TableHead>Mobile</TableHead>
                  <TableHead>District</TableHead>
                  <TableHead>Services Used</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Last Active</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {citizensLoading ? (
                  Array.from({ length: 6 }).map((_, i) => (
                    <TableRow key={i}>
                      <TableCell colSpan={10}>
                        <Skeleton className="h-10 w-full" />
                      </TableCell>
                    </TableRow>
                  ))
                ) : citizens.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={10} className="py-10 text-center text-sm text-gray-500">
                      No citizens match the selected filters.
                    </TableCell>
                  </TableRow>
                ) : (
                  citizens.map((citizen) => (
                    <TableRow key={citizen.id} className="cursor-pointer">
                      <TableCell onClick={(e) => e.stopPropagation()}>
                        <Checkbox
                          checked={selectedIds.has(citizen.id)}
                          onCheckedChange={() => toggleOne(citizen.id)}
                          aria-label={`Select ${citizen.fullName}`}
                        />
                      </TableCell>
                      <TableCell className="font-medium text-gray-500">{citizen.id}</TableCell>
                      <TableCell>
                        <Link to={`/users/${citizen.id}`} className="flex items-center gap-2.5 hover:underline">
                          <Avatar className="h-8 w-8">
                            <AvatarFallback className="bg-blue-50 text-xs font-semibold text-[#2563EB]">
                              {citizen.initials}
                            </AvatarFallback>
                          </Avatar>
                          <span className="font-medium text-gray-900">{citizen.fullName}</span>
                        </Link>
                      </TableCell>
                      <TableCell className="text-sm text-gray-500">{citizen.aadhaarMasked}</TableCell>
                      <TableCell className="text-sm text-gray-600">{citizen.mobile}</TableCell>
                      <TableCell className="text-sm text-gray-600">{citizen.district}</TableCell>
                      <TableCell>
                        <Badge variant="secondary">{citizen.servicesUsed}</Badge>
                      </TableCell>
                      <TableCell>
                        <CitizenStatusBadge status={citizen.status} />
                      </TableCell>
                      <TableCell className="text-sm text-gray-500">{dayjs(citizen.lastActive).fromNow()}</TableCell>
                      <TableCell className="text-right" onClick={(e) => e.stopPropagation()}>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-8 w-8">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem asChild>
                              <Link to={`/users/${citizen.id}`}>View Profile</Link>
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => setNotifyCitizen(citizen)}>
                              Send Notification
                            </DropdownMenuItem>
                            <DropdownMenuItem className="text-red-600">
                              <ShieldOff className="mr-2 h-3.5 w-3.5" />
                              Block Citizen
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>

          <div className="flex flex-col items-center justify-between gap-3 border-t border-gray-100 pt-4 sm:flex-row">
            <p className="text-sm text-gray-500">
              Showing <span className="font-medium text-gray-700">{citizens.length}</span> of{' '}
              <span className="font-medium text-gray-700">{total.toLocaleString('en-IN')}</span> citizens
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
        onVerifyAll={() => {
          toast.success(`${selectedIds.size} citizens verified`);
          setSelectedIds(new Set());
        }}
        onExportSelected={() => toast.info(`Exporting ${selectedIds.size} citizens…`)}
        onSendNotification={() => toast.info('Composing notification for selected citizens…')}
        onBlockSelected={() => {
          toast.success(`${selectedIds.size} citizens blocked`);
          setSelectedIds(new Set());
        }}
      />

      {notifyCitizen ? (
        <SendNotificationModal
          citizen={notifyCitizen}
          open={Boolean(notifyCitizen)}
          onOpenChange={(open) => {
            if (!open) setNotifyCitizen(null);
          }}
        />
      ) : null}
    </div>
  );
}
