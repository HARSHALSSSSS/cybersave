import { Link, useParams, useSearchParams } from 'react-router';
import { useQuery } from '@tanstack/react-query';
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
  Card,
  CardContent,
  Skeleton,
} from '@/components/ui';
import { OperatorProfileHeader } from '../components/OperatorProfileHeader';
import { OperatorOverviewTab } from '../components/OperatorOverviewTab';
import { OperatorPermissionsTab } from '../components/OperatorPermissionsTab';
import { OperatorDocumentsTab } from '../components/OperatorDocumentsTab';
import {
  getOperator,
  getOperatorActivities,
  getOperatorDocuments,
  getOperatorPermissions,
} from '../services/operators.service';

export function OperatorDetailPage() {
  const { operatorId = '' } = useParams();
  const [params] = useSearchParams();
  const tab = params.get('tab') ?? 'overview';

  const { data: operator, isLoading } = useQuery({
    queryKey: ['operators', 'detail', operatorId],
    queryFn: () => getOperator(operatorId),
  });

  const { data: activities = [] } = useQuery({
    queryKey: ['operators', 'activities', operatorId],
    queryFn: () => getOperatorActivities(operatorId),
    enabled: !!operator,
  });

  const { data: permissions = [] } = useQuery({
    queryKey: ['operators', 'permissions', operatorId],
    queryFn: () => getOperatorPermissions(operatorId),
    enabled: !!operator && tab === 'permissions',
  });

  const { data: documents = [] } = useQuery({
    queryKey: ['operators', 'documents', operatorId],
    queryFn: getOperatorDocuments,
    enabled: !!operator && tab === 'documents',
  });

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-64" />
        <Skeleton className="h-40 w-full rounded-xl" />
        <Skeleton className="h-96 w-full rounded-xl" />
      </div>
    );
  }

  if (!operator) {
    return (
      <Card>
        <CardContent className="py-16 text-center">
          <p className="text-sm text-muted-foreground">Operator not found.</p>
          <Link to="/operators" className="mt-2 inline-block text-sm font-medium text-primary hover:underline">
            Back to Operators
          </Link>
        </CardContent>
      </Card>
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
              <Link to="/operators">Operators</Link>
            </BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbPage>
              {tab === 'documents' ? 'Documents' : tab === 'permissions' ? 'Permissions' : 'Operator Profile'}
            </BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

      <OperatorProfileHeader operator={operator} />

      {tab === 'overview' || tab === 'activity' ? (
        <OperatorOverviewTab operator={operator} activities={activities} />
      ) : null}
      {tab === 'permissions' ? (
        <OperatorPermissionsTab operator={operator} initialCategories={permissions} />
      ) : null}
      {tab === 'documents' ? (
        <OperatorDocumentsTab operator={operator} documents={documents} />
      ) : null}
    </div>
  );
}
