import { Link } from 'react-router';
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
  Badge,
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  Switch,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui';
import type { Operator, OperatorActivity } from '../types';
import { Star } from 'lucide-react';

const STATUS_BADGE = {
  success: 'completed' as const,
  warning: 'pending' as const,
  error: 'rejected' as const,
};

export function OperatorOverviewTab({
  operator,
  activities,
}: {
  operator: Operator;
  activities: OperatorActivity[];
}) {
  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
      <div className="space-y-6 lg:col-span-2">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Personal Information</CardTitle>
            <button type="button" className="text-sm font-medium text-primary hover:underline">
              Verify Identity
            </button>
          </CardHeader>
          <CardContent>
            <dl className="grid grid-cols-1 gap-x-6 gap-y-4 sm:grid-cols-2">
              {[
                ['Full Name', operator.name],
                ['Date of Birth', operator.dateOfBirth],
                ['Email Address', operator.email],
                ['Phone Number', operator.phone],
                ['Residential Address', operator.address],
              ].map(([label, value]) => (
                <div key={label} className={label === 'Residential Address' ? 'sm:col-span-2' : undefined}>
                  <dt className="text-xs leading-4 text-muted-foreground">{label}</dt>
                  <dd className="mt-1 text-sm leading-5 font-medium text-foreground">{value}</dd>
                </div>
              ))}
            </dl>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Access & Security Settings</CardTitle>
            <span className="text-xs text-muted-foreground">Security Policy V2.1</span>
          </CardHeader>
          <CardContent className="space-y-5">
            <div className="flex items-center justify-between gap-4 rounded-lg border border-border px-4 py-3">
              <div>
                <p className="text-sm leading-5 font-medium text-foreground">Two-Factor Authentication (2FA)</p>
                <p className="text-xs leading-4 text-muted-foreground">
                  Require a second factor at every privileged login.
                </p>
              </div>
              <Switch checked={operator.twoFactorEnabled} />
            </div>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
              <div>
                <p className="text-xs text-muted-foreground">Last Login Date/Time</p>
                <p className="mt-1 text-sm font-medium text-foreground">{operator.lastLogin}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Active Sessions</p>
                <p className="mt-1 text-sm font-medium text-foreground">
                  {operator.activeSessions} open sessions
                </p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">IP Whitelisting</p>
                <p className="mt-1 text-sm font-medium text-success-text">
                  {operator.ipWhitelisting ? 'Enabled' : 'Disabled'}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Recent Activity Logs</CardTitle>
            <Badge variant="info">Live Audit</Badge>
          </CardHeader>
          <CardContent className="space-y-4">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Date / Time</TableHead>
                  <TableHead>Action Performed</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>IP Address</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {activities.map((row) => (
                  <TableRow key={row.id}>
                    <TableCell className="text-muted-foreground">{row.dateTime}</TableCell>
                    <TableCell className="font-medium">{row.action}</TableCell>
                    <TableCell>
                      <Badge variant={STATUS_BADGE[row.status]}>{row.status.toUpperCase()}</Badge>
                    </TableCell>
                    <TableCell className="font-mono text-xs">{row.ip}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Showing last 5 security records</span>
              <Link to="/audit-logs" className="font-medium text-primary hover:underline">
                View All Logs →
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Performance Metrics</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Metric
              label="Tasks Completed"
              value={String(operator.metrics.tasksCompleted)}
              badge={operator.metrics.tasksTrend}
              badgeVariant="completed"
            />
            <Metric
              label="Avg. Response Time"
              value={operator.metrics.avgResponseTime}
              badge={operator.metrics.responseBadge}
              badgeVariant="info"
            />
            <div className="rounded-lg border border-border px-4 py-3">
              <p className="text-xs text-muted-foreground">Client Satisfaction Rating</p>
              <div className="mt-2 flex items-center gap-2">
                <div className="flex items-center gap-0.5">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star
                      key={i}
                      className={`size-4 ${i < Math.floor(operator.metrics.satisfaction) ? 'fill-warning text-warning' : 'text-border'}`}
                    />
                  ))}
                </div>
                <span className="text-sm font-semibold">{operator.metrics.satisfaction} / 5</span>
              </div>
            </div>
            <Metric
              label="Documents Processed"
              value={operator.metrics.documentsProcessed.toLocaleString('en-IN')}
              badge={operator.metrics.accuracy}
              badgeVariant="pending"
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Reporting Structure</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-3">
              <Avatar className="size-10">
                <AvatarImage src={operator.avatarUrl} />
                <AvatarFallback>RK</AvatarFallback>
              </Avatar>
              <div>
                <p className="text-sm font-semibold text-foreground">{operator.supervisorName}</p>
                <p className="text-xs text-muted-foreground">{operator.supervisorRole}</p>
              </div>
            </div>
            <div className="rounded-lg bg-muted px-3 py-2.5 text-xs leading-4 text-muted-foreground">
              Primary Shift: {operator.shift}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function Metric({
  label,
  value,
  badge,
  badgeVariant,
}: {
  label: string;
  value: string;
  badge: string;
  badgeVariant: 'completed' | 'info' | 'pending';
}) {
  return (
    <div className="flex items-center justify-between gap-3 rounded-lg border border-border px-4 py-3">
      <div>
        <p className="text-xs text-muted-foreground">{label}</p>
        <p className="mt-1 text-xl leading-7 font-semibold text-foreground">{value}</p>
      </div>
      <Badge variant={badgeVariant}>{badge}</Badge>
    </div>
  );
}
