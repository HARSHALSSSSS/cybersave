import { useSearchParams } from 'react-router';
import { toast } from 'sonner';
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
  Button,
  Card,
  CardContent,
  Tabs,
  TabsList,
  TabsTrigger,
} from '@/components/ui';
import type { Operator } from '../types';
import { OperatorStatusBadge } from './OperatorStatusBadge';

function initials(name: string) {
  return name
    .split(/\s+/)
    .slice(0, 2)
    .map((p) => p[0])
    .join('')
    .toUpperCase();
}

export function OperatorProfileHeader({ operator }: { operator: Operator }) {
  const [params, setParams] = useSearchParams();
  const tab = params.get('tab') ?? 'overview';

  return (
    <Card>
      <CardContent className="space-y-5">
        <div className="flex flex-col justify-between gap-4 lg:flex-row lg:items-center">
          <div className="flex items-center gap-4">
            <Avatar className="size-20">
              <AvatarImage src={operator.avatarUrl} alt={operator.name} />
              <AvatarFallback className="text-lg">{initials(operator.name)}</AvatarFallback>
            </Avatar>
            <div className="space-y-1">
              <div className="flex flex-wrap items-center gap-2">
                <h1 className="text-2xl leading-8 font-semibold tracking-tight text-foreground">
                  {operator.name}
                </h1>
                <OperatorStatusBadge status={operator.status} />
              </div>
              <p className="text-sm leading-5 text-muted-foreground">
                {operator.role} • {operator.department}
              </p>
              <p className="text-xs leading-4 text-muted-foreground">
                Employee ID: {operator.employeeId} • Joined: {operator.joinedDate}
              </p>
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <Button size="sm" onClick={() => toast.info('Edit profile coming soon')}>
              Edit Profile
            </Button>
            <Button variant="outline" size="sm" onClick={() => toast.info('Password reset queued')}>
              Reset Password
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="border-danger-border text-danger-text hover:bg-danger-bg"
              onClick={() => toast.error('Suspend flow coming soon')}
            >
              Suspend Account
            </Button>
          </div>
        </div>

        <Tabs
          value={tab}
          onValueChange={(value) => {
            const next = new URLSearchParams(params);
            next.set('tab', value);
            setParams(next, { replace: true });
          }}
        >
          <TabsList className="bg-transparent p-0">
            <TabsTrigger
              value="overview"
              className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-none"
            >
              Overview
            </TabsTrigger>
            <TabsTrigger
              value="activity"
              className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-none"
            >
              Activity Log
            </TabsTrigger>
            <TabsTrigger
              value="permissions"
              className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-none"
            >
              Permissions
            </TabsTrigger>
            <TabsTrigger
              value="documents"
              className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-none"
            >
              Documents
            </TabsTrigger>
          </TabsList>
        </Tabs>
      </CardContent>
    </Card>
  );
}
