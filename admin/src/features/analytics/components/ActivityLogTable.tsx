import { Link } from 'react-router';
import { useQuery } from '@tanstack/react-query';
import { ArrowUpRight } from 'lucide-react';
import {
  Badge,
  Button,
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  Skeleton,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui';
import { formatDate } from '@/utils/format';
import { getActivityLog } from '../services/analytics.service';
import type { DocumentStatus } from '../types';

const STATUS_CONFIG: Record<DocumentStatus, { label: string; className: string }> = {
  verified: { label: 'Verified', className: 'border-success-border bg-success-bg text-success-text' },
  pending: { label: 'Pending', className: 'border-warning-border bg-warning-bg text-warning-text' },
  expired: { label: 'Expired', className: 'border-danger-border bg-danger-bg text-danger-text' },
};

export function ActivityLogTable() {
  const { data, isLoading } = useQuery({
    queryKey: ['analytics', 'activity-log'],
    queryFn: getActivityLog,
  });

  return (
    <Card className="border-border">
      <CardHeader className="flex flex-row items-center justify-between space-y-0">
        <div className="flex flex-col gap-1">
          <CardTitle>Recent Activity Log</CardTitle>
          <p className="text-sm leading-5 text-muted-foreground">Latest document uploads and verification events</p>
        </div>
        <Button variant="outline" size="sm" asChild>
          <Link to="/audit-logs" className="flex items-center gap-1.5">
            View Audit Trail
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
                  <TableHead>Document ID</TableHead>
                  <TableHead>Name</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead>User</TableHead>
                  <TableHead>Uploaded</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {data.map((entry) => (
                  <TableRow key={entry.id}>
                    <TableCell className="font-medium text-muted-foreground">{entry.documentId}</TableCell>
                    <TableCell className="text-sm text-foreground">{entry.name}</TableCell>
                    <TableCell className="text-sm text-muted-foreground">{entry.category}</TableCell>
                    <TableCell className="text-sm text-foreground">{entry.userName}</TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {formatDate(entry.uploadedAt, 'DD MMM, hh:mm A')}
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className={STATUS_CONFIG[entry.status].className}>
                        {STATUS_CONFIG[entry.status].label}
                      </Badge>
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
