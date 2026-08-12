import { Link } from 'react-router';
import { useQuery } from '@tanstack/react-query';
import { MoreHorizontal, ArrowUpRight } from 'lucide-react';
import {
  Avatar,
  AvatarFallback,
  Badge,
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
} from '@/components/ui';
import { formatCurrency, formatDate } from '@/utils/format';
import { getRecentApplications } from '../services/dashboard.service';
import type { ApplicationStatus } from '../types';

const STATUS_STYLES: Record<ApplicationStatus, string> = {
  completed: 'bg-emerald-50 text-emerald-700 border-emerald-100',
  pending: 'bg-amber-50 text-amber-700 border-amber-100',
  processing: 'bg-blue-50 text-blue-700 border-blue-100',
  rejected: 'bg-red-50 text-red-700 border-red-100',
};

const STATUS_LABELS: Record<ApplicationStatus, string> = {
  completed: 'Completed',
  pending: 'Pending',
  processing: 'Processing',
  rejected: 'Rejected',
};

export function RecentApplicationsTable() {
  const { data, isLoading } = useQuery({
    queryKey: ['dashboard', 'recent-applications'],
    queryFn: getRecentApplications,
  });

  return (
    <Card className="border-gray-200">
      <CardHeader className="flex flex-row items-center justify-between space-y-0">
        <div className="flex flex-col gap-1">
          <CardTitle className="text-base font-semibold text-foreground">Recent Service Applications</CardTitle>
          <p className="text-sm leading-5 text-muted-foreground">Latest submissions across all centres</p>
        </div>
        <Button variant="outline" size="sm" asChild>
          <Link to="/applications" className="flex items-center gap-1.5">
            View All
            <ArrowUpRight className="h-3.5 w-3.5" />
          </Link>
        </Button>
      </CardHeader>
      <CardContent>
        {isLoading || !data ? (
          <div className="space-y-2">
            {Array.from({ length: 5 }).map((_, i) => (
              <Skeleton key={i} className="h-12 w-full" />
            ))}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Application</TableHead>
                  <TableHead>Citizen</TableHead>
                  <TableHead>Service</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Submitted</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {data.map((application) => (
                  <TableRow key={application.id}>
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
                            {application.applicantInitials}
                          </AvatarFallback>
                        </Avatar>
                        <span className="text-sm text-gray-700">{application.applicantName}</span>
                      </div>
                    </TableCell>
                    <TableCell className="text-sm text-gray-600">{application.service}</TableCell>
                    <TableCell>
                      <Badge variant="outline" className={STATUS_STYLES[application.status]}>
                        {STATUS_LABELS[application.status]}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-sm text-gray-700">
                      {application.amount > 0 ? formatCurrency(application.amount) : '—'}
                    </TableCell>
                    <TableCell className="text-sm text-gray-500">
                      {formatDate(application.submittedAt, 'DD MMM, hh:mm A')}
                    </TableCell>
                    <TableCell className="text-right">
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
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
