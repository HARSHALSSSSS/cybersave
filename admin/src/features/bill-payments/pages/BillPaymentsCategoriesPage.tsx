import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Link } from 'react-router';
import {
  Badge,
  Button,
  Card,
  CardContent,
  PageHeader,
  Skeleton,
  Switch,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui';
import {
  listBillPaymentCategories,
  updateBillPaymentCategory,
} from '../services/bill-payments.service';

export function BillPaymentsCategoriesPage() {
  const queryClient = useQueryClient();
  const { data: categories = [], isLoading } = useQuery({
    queryKey: ['bill-payments', 'categories'],
    queryFn: listBillPaymentCategories,
  });

  const mutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: { appStatus?: string; isFeatured?: boolean } }) =>
      updateBillPaymentCategory(id, data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['bill-payments', 'categories'] }),
  });

  return (
    <div className="space-y-6">
      <PageHeader
        title="Bill Payment Categories"
        description="Control which BBPS categories are visible in the mobile app."
        actions={
          <Button variant="outline" asChild>
            <Link to="/bill-payments">Back to dashboard</Link>
          </Button>
        }
      />

      <Card>
        <CardContent className="pt-6">
          {isLoading ? (
            <Skeleton className="h-64 w-full" />
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Category</TableHead>
                  <TableHead>Provider ID</TableHead>
                  <TableHead>Billers</TableHead>
                  <TableHead>Featured</TableHead>
                  <TableHead>Visible</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {categories.map((cat) => (
                  <TableRow key={cat.id}>
                    <TableCell className="font-medium">{cat.displayName}</TableCell>
                    <TableCell className="font-mono text-xs">{cat.providerCategory}</TableCell>
                    <TableCell>{cat._count?.billers ?? 0}</TableCell>
                    <TableCell>
                      <Switch
                        checked={cat.isFeatured}
                        onCheckedChange={(checked) =>
                          mutation.mutate({ id: cat.id, data: { isFeatured: checked } })
                        }
                      />
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Switch
                          checked={cat.appStatus === 'active'}
                          onCheckedChange={(checked) =>
                            mutation.mutate({
                              id: cat.id,
                              data: { appStatus: checked ? 'active' : 'inactive' },
                            })
                          }
                        />
                        <Badge variant="outline">{cat.appStatus}</Badge>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
