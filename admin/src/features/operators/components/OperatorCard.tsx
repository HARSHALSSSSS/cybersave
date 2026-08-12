import { Link } from 'react-router';
import { Avatar, AvatarFallback, AvatarImage, Button, Card, CardContent } from '@/components/ui';
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

export function OperatorCard({ operator }: { operator: Operator }) {
  return (
    <Card className="h-full">
      <CardContent className="flex h-full flex-col gap-4">
        <div className="flex items-start justify-between gap-3">
          <div className="flex min-w-0 items-center gap-3">
            <Avatar className="size-12">
              <AvatarImage src={operator.avatarUrl} alt={operator.name} />
              <AvatarFallback>{initials(operator.name)}</AvatarFallback>
            </Avatar>
            <div className="min-w-0">
              <p className="truncate text-sm leading-5 font-semibold text-foreground">{operator.name}</p>
              <p className="truncate text-xs leading-4 text-muted-foreground">{operator.role}</p>
            </div>
          </div>
          <OperatorStatusBadge status={operator.status} />
        </div>

        <dl className="space-y-2.5 text-sm">
          <div className="flex items-center justify-between gap-3">
            <dt className="text-muted-foreground">Department</dt>
            <dd className="font-medium text-foreground">{operator.department}</dd>
          </div>
          <div className="flex items-center justify-between gap-3">
            <dt className="text-muted-foreground">Joined Date</dt>
            <dd className="font-medium text-foreground">{operator.joinedDate}</dd>
          </div>
          <div className="flex items-center justify-between gap-3">
            <dt className="text-muted-foreground">Last Active</dt>
            <dd className="font-medium text-foreground">{operator.lastActive}</dd>
          </div>
        </dl>

        <div className="mt-auto grid grid-cols-2 gap-2 pt-1">
          <Button variant="outline" size="sm" asChild>
            <Link to={`/operators/${operator.id}`}>View Profile</Link>
          </Button>
          <Button size="sm" asChild>
            <Link to={`/operators/${operator.id}?tab=permissions`}>Manage Access</Link>
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
