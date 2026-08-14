import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { ExternalLink, Globe } from 'lucide-react';
import {
  Badge,
  Button,
  Card,
  CardContent,
  PageHeader,
  Skeleton,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui';
import { formatCurrency, formatDate } from '@/utils/format';
import { manualApplyApi } from '../services/manual-apply.api';

const STATUS_VARIANT: Record<string, 'default' | 'secondary' | 'outline' | 'danger'> = {
  paid: 'secondary',
  redirected: 'default',
  user_confirmed: 'default',
  pending_payment: 'outline',
  cancelled: 'danger',
};

function citizenLabel(session: {
  citizen?: { firstName: string | null; lastName: string | null; phone: string };
}) {
  const name = [session.citizen?.firstName, session.citizen?.lastName]
    .filter(Boolean)
    .join(' ');
  return name || session.citizen?.phone || '—';
}

export function ManualApplySessionsPage() {
  const [page, setPage] = useState(1);

  const { data, isLoading } = useQuery({
    queryKey: ['manual-apply', 'sessions', page],
    queryFn: () => manualApplyApi.listManualApplySessions(page, 20),
  });

  const sessions = data?.data ?? [];
  const meta = data?.meta;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Manual Apply Sessions"
        description="Citizens who applied on official government portals via Cybersave redirect."
      />

      <Card className="border-gray-200">
        <CardContent className="pt-6">
          {isLoading ? (
            <div className="space-y-3">
              {Array.from({ length: 6 }).map((_, i) => (
                <Skeleton key={i} className="h-12 w-full" />
              ))}
            </div>
          ) : sessions.length === 0 ? (
            <div className="flex flex-col items-center gap-2 py-16 text-center">
              <Globe className="h-10 w-10 text-muted-foreground" />
              <p className="text-sm text-muted-foreground">No manual apply sessions yet.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Citizen</TableHead>
                    <TableHead>Service</TableHead>
                    <TableHead>State</TableHead>
                    <TableHead>Platform fee</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Created</TableHead>
                    <TableHead className="text-right">Portal</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {sessions.map((session) => (
                    <TableRow key={session.id}>
                      <TableCell>
                        <div>
                          <p className="font-medium text-gray-900">{citizenLabel(session)}</p>
                          <p className="text-xs text-muted-foreground">{session.citizen?.phone}</p>
                        </div>
                      </TableCell>
                      <TableCell className="font-medium">{session.serviceName}</TableCell>
                      <TableCell>
                        {session.stateCode ? (
                          <span>
                            {session.stateName} ({session.stateCode})
                          </span>
                        ) : (
                          'National'
                        )}
                      </TableCell>
                      <TableCell>{formatCurrency(session.platformFee)}</TableCell>
                      <TableCell>
                        <Badge variant={STATUS_VARIANT[session.status] ?? 'outline'}>
                          {session.status.replace(/_/g, ' ')}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {formatDate(session.createdAt)}
                      </TableCell>
                      <TableCell className="text-right">
                        <Button variant="ghost" size="sm" asChild>
                          <a
                            href={session.officialPortalUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                          >
                            <ExternalLink className="mr-1 h-4 w-4" />
                            Open
                          </a>
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}

          {meta && meta.totalPages > 1 ? (
            <div className="mt-4 flex items-center justify-between border-t pt-4">
              <p className="text-sm text-muted-foreground">
                Page {meta.page} of {meta.totalPages} · {meta.total} sessions
              </p>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  disabled={page <= 1}
                  onClick={() => setPage((p) => p - 1)}
                >
                  Previous
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  disabled={page >= meta.totalPages}
                  onClick={() => setPage((p) => p + 1)}
                >
                  Next
                </Button>
              </div>
            </div>
          ) : null}
        </CardContent>
      </Card>
    </div>
  );
}
