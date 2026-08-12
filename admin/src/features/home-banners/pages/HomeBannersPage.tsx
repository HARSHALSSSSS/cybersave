import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router';
import { Pencil, Plus, Trash2 } from 'lucide-react';
import {
  Badge,
  Button,
  Card,
  CardContent,
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  Input,
  Label,
  PageHeader,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  Skeleton,
  Switch,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
  Textarea,
} from '@/components/ui';
import { listMainServices, getMainService } from '@/features/services/services/services.api';
import { useQuery } from '@tanstack/react-query';
import {
  useCreateHomeBanner,
  useDeleteHomeBanner,
  useHomeBanners,
  useUpdateHomeBanner,
} from '../hooks/useHomeBanners';
import type { AdminHomeBanner, CreateHomeBannerPayload } from '../services/home-banners.api';

const EMPTY_FORM: CreateHomeBannerPayload = {
  tag: 'NEW SCHEME',
  title: '',
  description: '',
  ctaLabel: 'Learn More',
  gradientStart: '#1E40AF',
  gradientMiddle: '#2563EB',
  gradientEnd: '#3B82F6',
  mainServiceId: '',
  subServiceId: '',
  placement: 'home',
  displayOrder: 0,
  isActive: true,
};

export function HomeBannersPage() {
  const { data: banners = [], isLoading } = useHomeBanners();
  const createMutation = useCreateHomeBanner();
  const updateMutation = useUpdateHomeBanner();
  const deleteMutation = useDeleteHomeBanner();

  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<AdminHomeBanner | null>(null);
  const [form, setForm] = useState<CreateHomeBannerPayload>(EMPTY_FORM);

  const { data: mainServicesPage } = useQuery({
    queryKey: ['main-services', 'banner-picker'],
    queryFn: () => listMainServices(1, 100),
  });

  const mainServices = mainServicesPage?.data ?? [];

  const { data: mainServiceDetail } = useQuery({
    queryKey: ['main-service', form.mainServiceId],
    queryFn: () => getMainService(form.mainServiceId),
    enabled: Boolean(form.mainServiceId),
  });

  const subServices = mainServiceDetail?.subServices ?? [];

  useEffect(() => {
    if (!dialogOpen) {
      setEditing(null);
      setForm(EMPTY_FORM);
    }
  }, [dialogOpen]);

  const openCreate = () => {
    setEditing(null);
    setForm(EMPTY_FORM);
    setDialogOpen(true);
  };

  const openEdit = (banner: AdminHomeBanner) => {
    setEditing(banner);
    setForm({
      tag: banner.tag ?? '',
      title: banner.title,
      description: banner.description ?? '',
      ctaLabel: banner.ctaLabel,
      gradientStart: banner.gradientStart,
      gradientMiddle: banner.gradientMiddle ?? '',
      gradientEnd: banner.gradientEnd,
      mainServiceId: banner.mainServiceId,
      subServiceId: banner.subServiceId,
      placement: banner.placement,
      displayOrder: banner.displayOrder,
      isActive: banner.isActive,
    });
    setDialogOpen(true);
  };

  const handleSubmit = async () => {
    if (!form.title.trim() || !form.mainServiceId || !form.subServiceId) return;

    const payload: CreateHomeBannerPayload = {
      ...form,
      tag: form.tag?.trim() || undefined,
      description: form.description?.trim() || undefined,
      gradientMiddle: form.gradientMiddle?.trim() || undefined,
    };

    if (editing) {
      await updateMutation.mutateAsync({ id: editing.id, payload });
    } else {
      await createMutation.mutateAsync(payload);
    }
    setDialogOpen(false);
  };

  const sortedBanners = useMemo(
    () => [...banners].sort((a, b) => a.displayOrder - b.displayOrder || a.title.localeCompare(b.title)),
    [banners],
  );

  return (
    <div className="space-y-6">
      <PageHeader
        title="Home Banners"
        description="Promotional banners on the mobile home screen. Each banner links to a published service — users see the same service detail page with assisted and manual apply options."
        actions={
          <div className="flex gap-2">
            <Button variant="outline" asChild>
              <Link to="/services">Manage Services</Link>
            </Button>
            <Button onClick={openCreate}>
              <Plus className="mr-2 h-4 w-4" />
              New Banner
            </Button>
          </div>
        }
      />

      <Card>
        <CardContent className="pt-6">
          {isLoading ? (
            <Skeleton className="h-64 w-full" />
          ) : sortedBanners.length === 0 ? (
            <div className="py-12 text-center text-sm text-muted-foreground">
              No banners yet. Create a service in Services, publish it, then link a banner here.
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Banner</TableHead>
                  <TableHead>Linked Service</TableHead>
                  <TableHead>Placement</TableHead>
                  <TableHead>Order</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {sortedBanners.map((banner) => (
                  <TableRow key={banner.id}>
                    <TableCell>
                      <div className="space-y-1">
                        {banner.tag ? <Badge variant="secondary">{banner.tag}</Badge> : null}
                        <div className="font-medium">{banner.title}</div>
                        <div className="max-w-xs truncate text-xs text-muted-foreground">
                          {banner.description}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="text-sm">{banner.servicePath ?? `${banner.mainServiceName} → ${banner.subServiceName}`}</div>
                      {!banner.isPublished ? (
                        <Badge variant="destructive" className="mt-1">Not published</Badge>
                      ) : (
                        <Badge variant="outline" className="mt-1">Published</Badge>
                      )}
                    </TableCell>
                    <TableCell>{banner.placement}</TableCell>
                    <TableCell>{banner.displayOrder}</TableCell>
                    <TableCell>
                      <Badge variant={banner.isActive ? 'default' : 'outline'}>
                        {banner.isActive ? 'Active' : 'Inactive'}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button variant="ghost" size="icon" onClick={() => openEdit(banner)}>
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => deleteMutation.mutate(banner.id)}
                        >
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-xl">
          <DialogHeader>
            <DialogTitle>{editing ? 'Edit Banner' : 'Create Banner'}</DialogTitle>
          </DialogHeader>

          <div className="grid gap-4 py-2">
            <div className="grid gap-2">
              <Label htmlFor="title">Title</Label>
              <Input
                id="title"
                value={form.title}
                onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
                placeholder="PM-Kisan Samman Nidhi"
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="tag">Tag badge</Label>
              <Input
                id="tag"
                value={form.tag ?? ''}
                onChange={(e) => setForm((f) => ({ ...f, tag: e.target.value }))}
                placeholder="NEW SCHEME"
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={form.description ?? ''}
                onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
                rows={3}
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="cta">CTA label</Label>
              <Input
                id="cta"
                value={form.ctaLabel ?? ''}
                onChange={(e) => setForm((f) => ({ ...f, ctaLabel: e.target.value }))}
              />
            </div>

            <div className="grid gap-2">
              <Label>Main service category</Label>
              <Select
                value={form.mainServiceId}
                onValueChange={(value) =>
                  setForm((f) => ({ ...f, mainServiceId: value, subServiceId: '' }))
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  {mainServices.map((service) => (
                    <SelectItem key={service.id} value={service.id}>
                      {service.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="grid gap-2">
              <Label>Sub-service (banner destination)</Label>
              <Select
                value={form.subServiceId}
                onValueChange={(value) => setForm((f) => ({ ...f, subServiceId: value }))}
                disabled={!form.mainServiceId}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select service" />
                </SelectTrigger>
                <SelectContent>
                  {subServices.map((service) => (
                    <SelectItem key={service.id} value={service.id}>
                      {service.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <p className="text-xs text-muted-foreground">
                Tapping the banner opens this service detail page (assisted + manual apply flow).
              </p>
            </div>

            <div className="grid grid-cols-3 gap-3">
              <div className="grid gap-2">
                <Label>Gradient start</Label>
                <Input
                  value={form.gradientStart ?? ''}
                  onChange={(e) => setForm((f) => ({ ...f, gradientStart: e.target.value }))}
                />
              </div>
              <div className="grid gap-2">
                <Label>Middle</Label>
                <Input
                  value={form.gradientMiddle ?? ''}
                  onChange={(e) => setForm((f) => ({ ...f, gradientMiddle: e.target.value }))}
                />
              </div>
              <div className="grid gap-2">
                <Label>End</Label>
                <Input
                  value={form.gradientEnd ?? ''}
                  onChange={(e) => setForm((f) => ({ ...f, gradientEnd: e.target.value }))}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="grid gap-2">
                <Label>Placement</Label>
                <Select
                  value={form.placement ?? 'home'}
                  onValueChange={(value) => setForm((f) => ({ ...f, placement: value }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="home">Home</SelectItem>
                    <SelectItem value="schemes">Schemes</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-2">
                <Label>Display order</Label>
                <Input
                  type="number"
                  value={form.displayOrder ?? 0}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, displayOrder: Number(e.target.value) }))
                  }
                />
              </div>
            </div>

            <div className="flex items-center justify-between rounded-lg border p-3">
              <Label htmlFor="active">Active on mobile</Label>
              <Switch
                id="active"
                checked={form.isActive ?? true}
                onCheckedChange={(checked) => setForm((f) => ({ ...f, isActive: checked }))}
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>
              Cancel
            </Button>
            <Button
              onClick={handleSubmit}
              disabled={
                createMutation.isPending ||
                updateMutation.isPending ||
                !form.title ||
                !form.mainServiceId ||
                !form.subServiceId
              }
            >
              {editing ? 'Save changes' : 'Create banner'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
