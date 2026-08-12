import { useState } from 'react';
import { Link, useParams } from 'react-router';
import { useQuery } from '@tanstack/react-query';
import dayjs from 'dayjs';
import {
  Ban,
  Bell,
  Calendar,
  Download,
  FileText,
  Mail,
  MapPin,
  MoreHorizontal,
  Pencil,
  Phone,
  ShieldCheck,
  Wallet,
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
  CardHeader,
  CardTitle,
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  Skeleton,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
  Textarea,
} from '@/components/ui';
import { formatCurrency, formatDate } from '@/utils/format';
import { getCitizenById } from '../services/users.service';
import { CitizenStatusBadge } from '../components/CitizenStatusBadge';
import { ActivityTimeline } from '../components/ActivityTimeline';
import { SendNotificationModal } from '../components/SendNotificationModal';
import type { ServiceRecordStatus } from '../types';

const SERVICE_STATUS_STYLES: Record<ServiceRecordStatus, string> = {
  completed: 'bg-emerald-50 text-emerald-700 border-emerald-100',
  processing: 'bg-blue-50 text-blue-700 border-blue-100',
  pending: 'bg-amber-50 text-amber-700 border-amber-100',
  rejected: 'bg-red-50 text-red-700 border-red-100',
};

export function CitizenDetailPage() {
  const { citizenId = '' } = useParams<{ citizenId: string }>();
  const [notifyOpen, setNotifyOpen] = useState(false);
  const [noteDraft, setNoteDraft] = useState('');

  const { data: citizen, isLoading } = useQuery({
    queryKey: ['users', 'citizen', citizenId],
    queryFn: () => getCitizenById(citizenId),
  });

  if (isLoading || !citizen) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-64" />
        <Skeleton className="h-32 w-full rounded-2xl" />
        <Skeleton className="h-96 w-full rounded-2xl" />
      </div>
    );
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
            <BreadcrumbLink asChild>
              <Link to="/users">Citizen Management</Link>
            </BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbPage>{citizen.fullName}</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

      <Card className="border-gray-200">
        <CardContent className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
          <div className="flex items-center gap-4">
            <Avatar className="h-16 w-16">
              <AvatarFallback className="bg-blue-100 text-lg font-semibold text-[#2563EB]">
                {citizen.initials}
              </AvatarFallback>
            </Avatar>
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <h1 className="text-xl font-bold text-gray-900">{citizen.fullName}</h1>
                <CitizenStatusBadge status={citizen.status} />
              </div>
              <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-gray-500">
                <span className="font-medium text-gray-600">{citizen.id}</span>
                <span className="flex items-center gap-1">
                  <Calendar className="h-3.5 w-3.5" />
                  Joined {formatDate(citizen.joinedAt, 'DD MMM YYYY')}
                </span>
              </div>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <Button variant="outline" size="sm" className="gap-1.5">
              <Pencil className="h-3.5 w-3.5" />
              Edit Profile
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="gap-1.5 text-red-600 hover:text-red-700"
              onClick={() => toast.success(`${citizen.fullName} has been blocked`)}
            >
              <Ban className="h-3.5 w-3.5" />
              Block Citizen
            </Button>
            <Button size="sm" className="gap-1.5 bg-[#2563EB] hover:bg-blue-700" onClick={() => setNotifyOpen(true)}>
              <Bell className="h-3.5 w-3.5" />
              Send Notification
            </Button>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon">
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem>Reset Password</DropdownMenuItem>
                <DropdownMenuItem>Merge Duplicate Profile</DropdownMenuItem>
                <DropdownMenuItem className="text-red-600">Delete Account</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </CardContent>
      </Card>

      <Tabs defaultValue="overview">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="services">Services Used</TabsTrigger>
          <TabsTrigger value="documents">Documents</TabsTrigger>
          <TabsTrigger value="transactions">Transactions</TabsTrigger>
          <TabsTrigger value="activity">Activity Log</TabsTrigger>
          <TabsTrigger value="notes">Notes</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="mt-6">
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
            <div className="space-y-6 lg:col-span-2">
              <Card className="border-gray-200">
                <CardHeader>
                  <CardTitle className="text-base font-semibold text-gray-900">Personal Information</CardTitle>
                </CardHeader>
                <CardContent>
                  <dl className="grid grid-cols-1 gap-x-6 gap-y-4 sm:grid-cols-2">
                    <InfoField label="Date of Birth" value={formatDate(citizen.dob, 'DD MMM YYYY')} icon={Calendar} />
                    <InfoField label="Gender" value={citizen.gender} icon={ShieldCheck} />
                    <InfoField label="Aadhaar Number" value={citizen.aadhaarMasked} icon={FileText} />
                    <InfoField label="Mobile Number" value={citizen.mobile} icon={Phone} />
                    <InfoField label="Email Address" value={citizen.email} icon={Mail} />
                    <InfoField label="District" value={`${citizen.district}, ${citizen.state}`} icon={MapPin} />
                    <InfoField label="Address" value={citizen.address} icon={MapPin} className="sm:col-span-2" />
                  </dl>
                </CardContent>
              </Card>

              <Card className="border-gray-200">
                <CardHeader>
                  <CardTitle className="text-base font-semibold text-gray-900">Recent Services</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {citizen.services.slice(0, 4).map((service) => (
                    <div
                      key={service.id}
                      className="flex items-center justify-between gap-3 rounded-xl border border-gray-100 px-4 py-3"
                    >
                      <div>
                        <p className="text-sm font-medium text-gray-900">{service.name}</p>
                        <p className="text-xs text-gray-500">{formatDate(service.date, 'DD MMM YYYY')}</p>
                      </div>
                      <Badge variant="outline" className={SERVICE_STATUS_STYLES[service.status]}>
                        {service.status.charAt(0).toUpperCase() + service.status.slice(1)}
                      </Badge>
                    </div>
                  ))}
                </CardContent>
              </Card>

              <Card className="border-gray-200">
                <CardHeader>
                  <CardTitle className="text-base font-semibold text-gray-900">Uploaded Documents</CardTitle>
                </CardHeader>
                <CardContent className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                  {citizen.documents.map((doc) => (
                    <div
                      key={doc.id}
                      className="flex items-center justify-between gap-3 rounded-xl border border-gray-100 px-4 py-3"
                    >
                      <div className="flex min-w-0 items-center gap-3">
                        <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-blue-50 text-[#2563EB]">
                          <FileText className="h-4 w-4" />
                        </span>
                        <div className="min-w-0">
                          <p className="truncate text-sm font-medium text-gray-900">{doc.name}</p>
                          <p className="text-xs text-gray-500">{doc.type}</p>
                        </div>
                      </div>
                      <Button variant="ghost" size="icon" className="h-8 w-8 shrink-0">
                        <Download className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </CardContent>
              </Card>
            </div>

            <div className="space-y-6">
              <Card className="border-gray-200">
                <CardHeader>
                  <CardTitle className="text-base font-semibold text-gray-900">Quick Stats</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <QuickStat icon={FileText} label="Services Used" value={String(citizen.servicesUsed)} />
                  <QuickStat icon={Wallet} label="Total Amount Paid" value={formatCurrency(citizen.totalAmountPaid)} />
                  <QuickStat icon={FileText} label="Documents Uploaded" value={String(citizen.documents.length)} />
                  <QuickStat
                    icon={Calendar}
                    label="Last Active"
                    value={dayjs(citizen.lastActive).fromNow()}
                  />
                </CardContent>
              </Card>

              <Card className="border-gray-200">
                <CardHeader>
                  <CardTitle className="text-base font-semibold text-gray-900">Recent Activity</CardTitle>
                </CardHeader>
                <CardContent>
                  <ActivityTimeline items={citizen.activity.slice(0, 4)} />
                </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="services" className="mt-6">
          <Card className="border-gray-200">
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Service</TableHead>
                    <TableHead>Category</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead className="text-right">Amount</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {citizen.services.map((service) => (
                    <TableRow key={service.id}>
                      <TableCell className="font-medium text-gray-900">{service.name}</TableCell>
                      <TableCell className="text-sm text-gray-600">{service.category}</TableCell>
                      <TableCell>
                        <Badge variant="outline" className={SERVICE_STATUS_STYLES[service.status]}>
                          {service.status.charAt(0).toUpperCase() + service.status.slice(1)}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-sm text-gray-500">{formatDate(service.date, 'DD MMM YYYY')}</TableCell>
                      <TableCell className="text-right text-sm text-gray-700">
                        {service.amount > 0 ? formatCurrency(service.amount) : '—'}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="documents" className="mt-6">
          <Card className="border-gray-200">
            <CardContent className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {citizen.documents.map((doc) => (
                <div key={doc.id} className="rounded-xl border border-gray-100 p-4">
                  <div className="flex items-start justify-between">
                    <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-50 text-[#2563EB]">
                      <FileText className="h-5 w-5" />
                    </span>
                    <Badge
                      variant="outline"
                      className={doc.verified ? 'border-emerald-100 bg-emerald-50 text-emerald-700' : 'border-amber-100 bg-amber-50 text-amber-700'}
                    >
                      {doc.verified ? 'Verified' : 'Pending'}
                    </Badge>
                  </div>
                  <p className="mt-3 truncate text-sm font-medium text-gray-900">{doc.name}</p>
                  <p className="mt-0.5 text-xs text-gray-500">
                    {doc.type} • {(doc.sizeKb / 1024).toFixed(1)} MB
                  </p>
                  <p className="mt-2 text-xs text-gray-400">
                    Uploaded {formatDate(doc.uploadedAt, 'DD MMM YYYY')}
                  </p>
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="transactions" className="mt-6">
          <Card className="border-gray-200">
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Transaction ID</TableHead>
                    <TableHead>Service</TableHead>
                    <TableHead>Mode</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead className="text-right">Amount</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {citizen.transactions.map((txn) => (
                    <TableRow key={txn.id}>
                      <TableCell className="font-medium text-gray-900">{txn.id}</TableCell>
                      <TableCell className="text-sm text-gray-600">{txn.service}</TableCell>
                      <TableCell className="text-sm text-gray-600">{txn.mode}</TableCell>
                      <TableCell>
                        <Badge
                          variant="outline"
                          className={
                            txn.status === 'success'
                              ? 'border-emerald-100 bg-emerald-50 text-emerald-700'
                              : txn.status === 'failed'
                                ? 'border-red-100 bg-red-50 text-red-700'
                                : 'border-amber-100 bg-amber-50 text-amber-700'
                          }
                        >
                          {txn.status.charAt(0).toUpperCase() + txn.status.slice(1)}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-sm text-gray-500">{formatDate(txn.date, 'DD MMM YYYY, hh:mm A')}</TableCell>
                      <TableCell className="text-right text-sm text-gray-700">{formatCurrency(txn.amount)}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="activity" className="mt-6">
          <Card className="border-gray-200">
            <CardContent>
              <ActivityTimeline items={citizen.activity} />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="notes" className="mt-6">
          <Card className="border-gray-200">
            <CardContent className="space-y-4">
              {citizen.notes.map((note) => (
                <div key={note.id} className="flex gap-3 rounded-xl border border-gray-100 p-4">
                  <Avatar className="h-8 w-8">
                    <AvatarFallback className="bg-gray-100 text-xs font-medium text-gray-600">
                      {note.authorInitials}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <p className="text-sm font-medium text-gray-900">{note.author}</p>
                      <p className="text-xs text-gray-400">{formatDate(note.createdAt, 'DD MMM YYYY, hh:mm A')}</p>
                    </div>
                    <p className="mt-1 text-sm text-gray-600">{note.content}</p>
                  </div>
                </div>
              ))}

              <div className="space-y-2 border-t border-gray-100 pt-4">
                <Textarea
                  placeholder="Add an internal note about this citizen…"
                  rows={3}
                  value={noteDraft}
                  onChange={(e) => setNoteDraft(e.target.value)}
                />
                <div className="flex justify-end">
                  <Button
                    size="sm"
                    className="bg-[#2563EB] hover:bg-blue-700"
                    disabled={!noteDraft.trim()}
                    onClick={() => {
                      toast.success('Note added');
                      setNoteDraft('');
                    }}
                  >
                    Add Note
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <SendNotificationModal citizen={citizen} open={notifyOpen} onOpenChange={setNotifyOpen} />
    </div>
  );
}

function InfoField({
  label,
  value,
  icon: Icon,
  className,
}: {
  label: string;
  value: string;
  icon: typeof Calendar;
  className?: string;
}) {
  return (
    <div className={className}>
      <dt className="flex items-center gap-1.5 text-xs font-medium uppercase tracking-wide text-gray-400">
        <Icon className="h-3.5 w-3.5" />
        {label}
      </dt>
      <dd className="mt-1 text-sm font-medium text-gray-900">{value}</dd>
    </div>
  );
}

function QuickStat({ icon: Icon, label, value }: { icon: typeof Calendar; label: string; value: string }) {
  return (
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-2 text-sm text-gray-500">
        <Icon className="h-4 w-4 text-gray-400" />
        {label}
      </div>
      <span className="text-sm font-semibold text-gray-900">{value}</span>
    </div>
  );
}
