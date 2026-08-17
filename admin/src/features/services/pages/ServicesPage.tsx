import { useMemo, useState } from 'react';
import { Link } from 'react-router';
import { useQuery } from '@tanstack/react-query';
import {
  Activity,
  ChevronLeft,
  ChevronRight,
  Eye,
  FileStack,
  HandHelping,
  Pencil,
  Plus,
  Search,
  Wrench,
} from 'lucide-react';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
  Badge,
  Button,
  Card,
  CardContent,
  Input,
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
} from '@/components/ui';
import { StatCard } from '@/components/data-display/stat-card';
import { formatCurrency } from '@/utils/format';
import { getServiceCategories, getServicesStats } from '../services/services.service';
import { ServiceStatusBadge } from '../components/ServiceStatusBadge';
import { ServicePreviewDialog } from '../components/ServicePreviewDialog';
import type { SubService } from '../types';

function ApplyModeBadges({ service }: { service: SubService }) {
  return (
    <div className="flex flex-wrap gap-1">
      {service.assistedEnabled ? (
        <Badge variant="secondary" className="gap-1 bg-blue-50 text-blue-700">
          <HandHelping className="h-3 w-3" />
          Assisted
        </Badge>
      ) : null}
      {service.manualEnabled ? (
        <Badge variant="outline" className="text-gray-700">
          Manual portal
        </Badge>
      ) : null}
      {!service.assistedEnabled && !service.manualEnabled ? (
        <Badge variant="outline" className="text-amber-700">
          Not configured
        </Badge>
      ) : null}
    </div>
  );
}

export function ServicesPage() {
  const [search, setSearch] = useState('');
  const [viewMode, setViewMode] = useState<'all' | 'active' | 'maintenance'>('all');
  const [page, setPage] = useState(1);
  const [preview, setPreview] = useState<{ name: string; versionId?: string } | null>(null);

  const { data: stats, isLoading: statsLoading } = useQuery({
    queryKey: ['services', 'stats'],
    queryFn: getServicesStats,
  });

  const { data: categories, isLoading } = useQuery({
    queryKey: ['services', 'categories'],
    queryFn: getServiceCategories,
  });

  const filteredCategories = useMemo(() => {
    if (!categories) return [];
    const query = search.trim().toLowerCase();
    return categories
      .filter((category) => (viewMode === 'all' ? true : category.status === viewMode))
      .map((category) => ({
        ...category,
        subServices: query
          ? category.subServices.filter(
              (s) =>
                s.name.toLowerCase().includes(query) ||
                s.slug.toLowerCase().includes(query),
            )
          : category.subServices,
      }))
      .filter((category) =>
        query
          ? category.subServices.length > 0 || category.name.toLowerCase().includes(query)
          : true,
      );
  }, [categories, search, viewMode]);

  const kpis = [
    { title: 'Total Services', value: stats?.total, icon: FileStack, iconColor: '#2563EB', iconBg: '#EFF4FF' },
    { title: 'Published', value: stats?.active, icon: Activity, iconColor: '#16A34A', iconBg: '#EAF9EF' },
    { title: 'Draft / Unpublished', value: stats?.underMaintenance, icon: Wrench, iconColor: '#D97706', iconBg: '#FEF6E7' },
    { title: 'Categories', value: categories?.length, icon: FileStack, iconColor: '#7C3AED', iconBg: '#F3EEFF' },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Government Services Directory"
        description="All citizen-facing services on web and mobile. Configure forms, states, assisted apply, and manual portal redirects."
        actions={
          <div className="flex flex-wrap gap-2">
            <Button asChild size="sm" variant="outline" className="gap-1.5">
              <Link to="/schemes">
                <Plus className="h-4 w-4" />
                Add Scheme
              </Link>
            </Button>
            <Button asChild size="sm" className="gap-1.5 bg-[#2563EB] hover:bg-blue-700">
              <Link to="/services/new">
                <Plus className="h-4 w-4" />
                Add New Service
              </Link>
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
          <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
            <div className="relative w-full max-w-sm">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
              <Input
                placeholder="Search categories or services…"
                className="pl-9"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
            <Select value={viewMode} onValueChange={(value) => setViewMode(value as typeof viewMode)}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="All Services Mode" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Services</SelectItem>
                <SelectItem value="active">Published Only</SelectItem>
                <SelectItem value="maintenance">Draft / Unpublished</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {isLoading || !categories ? (
            <div className="space-y-3">
              {Array.from({ length: 4 }).map((_, i) => (
                <Skeleton key={i} className="h-16 w-full" />
              ))}
            </div>
          ) : filteredCategories.length === 0 ? (
            <p className="py-10 text-center text-sm text-gray-500">No services match your search.</p>
          ) : (
            <Accordion type="multiple" defaultValue={filteredCategories.map((c) => c.id)} className="space-y-3">
              {filteredCategories.map((category) => (
                <AccordionItem
                  key={category.id}
                  value={category.id}
                  className="rounded-xl border border-gray-200 px-4"
                >
                  <AccordionTrigger className="hover:no-underline">
                    <div className="flex flex-1 flex-wrap items-center justify-between gap-2 pr-4">
                      <div className="text-left">
                        <p className="text-sm font-semibold text-gray-900">{category.name}</p>
                        <p className="text-xs text-gray-500">{category.description}</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant="secondary">{category.subServices.length} services</Badge>
                        <ServiceStatusBadge status={category.status} />
                      </div>
                    </div>
                  </AccordionTrigger>
                  <AccordionContent>
                    <div className="overflow-x-auto pb-2">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Service</TableHead>
                            <TableHead>Apply modes</TableHead>
                            <TableHead>States</TableHead>
                            <TableHead>Form / Docs</TableHead>
                            <TableHead>Base fee</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead className="text-right">Actions</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {category.subServices.map((service) => (
                            <TableRow key={service.id}>
                              <TableCell>
                                <div>
                                  <p className="font-medium text-gray-900">{service.name}</p>
                                  <p className="text-xs text-muted-foreground">{service.slug}</p>
                                </div>
                              </TableCell>
                              <TableCell>
                                <ApplyModeBadges service={service} />
                              </TableCell>
                              <TableCell className="text-sm text-gray-600">
                                {service.requiresStateSelection
                                  ? `${service.stateCount} states`
                                  : 'National'}
                              </TableCell>
                              <TableCell className="text-sm text-gray-600">
                                {service.formFieldCount} fields · {service.documentCount} docs
                              </TableCell>
                              <TableCell className="text-sm text-gray-600">
                                {service.govtFee > 0 ? formatCurrency(service.govtFee) : 'Free'}
                              </TableCell>
                              <TableCell>
                                <ServiceStatusBadge status={service.status} />
                              </TableCell>
                              <TableCell className="text-right">
                                <div className="flex items-center justify-end gap-1">
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    className="h-8 w-8"
                                    disabled={!service.publishedVersionId}
                                    onClick={() =>
                                      setPreview({
                                        name: service.name,
                                        versionId: service.publishedVersionId,
                                      })
                                    }
                                  >
                                    <Eye className="h-4 w-4" />
                                  </Button>
                                  <Button variant="ghost" size="icon" className="h-8 w-8" asChild>
                                    <Link to={`/services/new/${category.id}/sub/${service.id}/overview`}>
                                      <Pencil className="h-4 w-4" />
                                    </Link>
                                  </Button>
                                </div>
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          )}

          <div className="flex items-center justify-between border-t border-gray-100 pt-4">
            <p className="text-sm text-gray-500">
              Showing <span className="font-medium text-gray-700">{filteredCategories.length}</span> categories
            </p>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" disabled={page <= 1} onClick={() => setPage((p) => Math.max(1, p - 1))}>
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <span className="text-sm text-gray-600">Page {page} of 1</span>
              <Button variant="outline" size="sm" disabled onClick={() => setPage((p) => p + 1)}>
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      <ServicePreviewDialog
        open={Boolean(preview)}
        onOpenChange={(open) => !open && setPreview(null)}
        serviceName={preview?.name ?? ''}
        versionId={preview?.versionId}
      />
    </div>
  );
}
