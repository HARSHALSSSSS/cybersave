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
import {
  SCHEME_CATEGORIES,
  type GovernmentScheme,
  type SchemePayload,
} from '../services/schemes.api';
import {
  useAdminSchemes,
  useCreateScheme,
  useDeleteScheme,
  useUpdateScheme,
} from '../hooks/useSchemes';

const EMPTY_FORM: SchemePayload = {
  name: '',
  ministry: '',
  category: 'Housing',
  description: '',
  whoCanApply: '',
  eligibility: '',
  documentsRequired: [],
  officialPortalUrl: '',
  officialPortalLabel: 'Official Portal',
  displayOrder: 0,
  isActive: true,
};

export function SchemesPage() {
  const { data: schemes = [], isLoading } = useAdminSchemes();
  const createMutation = useCreateScheme();
  const updateMutation = useUpdateScheme();
  const deleteMutation = useDeleteScheme();

  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<GovernmentScheme | null>(null);
  const [form, setForm] = useState<SchemePayload>(EMPTY_FORM);
  const [documentsText, setDocumentsText] = useState('');

  useEffect(() => {
    if (!dialogOpen) {
      setEditing(null);
      setForm(EMPTY_FORM);
      setDocumentsText('');
    }
  }, [dialogOpen]);

  const openCreate = () => {
    setEditing(null);
    setForm(EMPTY_FORM);
    setDocumentsText('');
    setDialogOpen(true);
  };

  const openEdit = (scheme: GovernmentScheme) => {
    setEditing(scheme);
    setForm({
      name: scheme.name,
      ministry: scheme.ministry ?? '',
      category: scheme.category,
      description: scheme.description,
      whoCanApply: scheme.whoCanApply,
      eligibility: scheme.eligibility,
      documentsRequired: scheme.documentsRequired,
      officialPortalUrl: scheme.officialPortalUrl,
      officialPortalLabel: scheme.officialPortalLabel,
      displayOrder: scheme.displayOrder,
      isActive: scheme.isActive,
    });
    setDocumentsText(scheme.documentsRequired.join('\n'));
    setDialogOpen(true);
  };

  const handleSubmit = async () => {
    if (
      !form.name.trim() ||
      !form.category.trim() ||
      !form.description.trim() ||
      !form.whoCanApply.trim() ||
      !form.eligibility.trim() ||
      !form.officialPortalUrl.trim()
    ) {
      return;
    }

    const payload: SchemePayload = {
      ...form,
      ministry: form.ministry?.trim() || undefined,
      documentsRequired: documentsText
        .split('\n')
        .map((item) => item.trim())
        .filter(Boolean),
    };

    if (editing) {
      await updateMutation.mutateAsync({ id: editing.id, payload });
    } else {
      await createMutation.mutateAsync(payload);
    }
    setDialogOpen(false);
  };

  const sorted = useMemo(
    () =>
      [...schemes].sort(
        (a, b) => a.displayOrder - b.displayOrder || a.name.localeCompare(b.name),
      ),
    [schemes],
  );

  return (
    <div className="space-y-6">
      <PageHeader
        title="Government Schemes"
        description="Add scheme cards shown on web (Schemes) and mobile (Government Schemes). Each scheme opens the official government portal — Cybersave services are not mixed here."
        actions={
          <div className="flex gap-2">
            <Button variant="outline" asChild>
              <Link to="/services">Services</Link>
            </Button>
            <Button onClick={openCreate}>
              <Plus className="mr-2 h-4 w-4" />
              Add Scheme
            </Button>
          </div>
        }
      />

      <Card>
        <CardContent className="pt-6">
          {isLoading ? (
            <Skeleton className="h-64 w-full" />
          ) : sorted.length === 0 ? (
            <div className="py-12 text-center text-sm text-muted-foreground">
              No schemes yet. Add a scheme to show it on citizen web and the mobile app.
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Scheme</TableHead>
                  <TableHead>Who can apply</TableHead>
                  <TableHead>Portal</TableHead>
                  <TableHead>Order</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {sorted.map((scheme) => (
                  <TableRow key={scheme.id}>
                    <TableCell>
                      <div className="space-y-1">
                        <Badge variant="secondary">{scheme.category}</Badge>
                        <div className="font-medium">{scheme.name}</div>
                        <div className="max-w-sm truncate text-xs text-muted-foreground">
                          {scheme.ministry || scheme.description}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="max-w-xs text-sm">{scheme.whoCanApply}</TableCell>
                    <TableCell>
                      <a
                        href={scheme.officialPortalUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-sm text-primary hover:underline"
                      >
                        {scheme.officialPortalLabel}
                      </a>
                    </TableCell>
                    <TableCell>{scheme.displayOrder}</TableCell>
                    <TableCell>
                      <Badge variant={scheme.isActive ? 'default' : 'outline'}>
                        {scheme.isActive ? 'Live' : 'Hidden'}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button variant="ghost" size="icon" onClick={() => openEdit(scheme)}>
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => deleteMutation.mutate(scheme.id)}
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
            <DialogTitle>{editing ? 'Edit Scheme' : 'Add Scheme'}</DialogTitle>
          </DialogHeader>

          <div className="grid gap-4 py-2">
            <div className="grid gap-2">
              <Label htmlFor="scheme-name">Scheme name</Label>
              <Input
                id="scheme-name"
                value={form.name}
                onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                placeholder="Pradhan Mantri Awas Yojana"
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="scheme-ministry">Ministry / department</Label>
              <Input
                id="scheme-ministry"
                value={form.ministry ?? ''}
                onChange={(e) => setForm((f) => ({ ...f, ministry: e.target.value }))}
                placeholder="Ministry of Housing and Urban Affairs"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="grid gap-2">
                <Label>Category</Label>
                <Select
                  value={form.category}
                  onValueChange={(value) => setForm((f) => ({ ...f, category: value }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {SCHEME_CATEGORIES.map((category) => (
                      <SelectItem key={category} value={category}>
                        {category}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="scheme-order">Display order</Label>
                <Input
                  id="scheme-order"
                  type="number"
                  value={form.displayOrder ?? 0}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, displayOrder: Number(e.target.value) }))
                  }
                />
              </div>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="scheme-description">Description</Label>
              <Textarea
                id="scheme-description"
                rows={4}
                value={form.description}
                onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
                placeholder="What this scheme provides..."
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="scheme-who">Who can apply</Label>
              <Input
                id="scheme-who"
                value={form.whoCanApply}
                onChange={(e) => setForm((f) => ({ ...f, whoCanApply: e.target.value }))}
                placeholder="Farmers, students, EWS households..."
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="scheme-eligibility">Eligibility</Label>
              <Textarea
                id="scheme-eligibility"
                rows={3}
                value={form.eligibility}
                onChange={(e) => setForm((f) => ({ ...f, eligibility: e.target.value }))}
                placeholder="Full eligibility rules shown to citizens..."
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="scheme-docs">Documents required (one per line)</Label>
              <Textarea
                id="scheme-docs"
                rows={4}
                value={documentsText}
                onChange={(e) => setDocumentsText(e.target.value)}
                placeholder={'Aadhaar card\nIncome certificate\nBank passbook'}
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="scheme-url">Official portal URL</Label>
              <Input
                id="scheme-url"
                value={form.officialPortalUrl}
                onChange={(e) => setForm((f) => ({ ...f, officialPortalUrl: e.target.value }))}
                placeholder="https://pmkisan.gov.in/"
              />
            </div>

            <div className="flex items-center justify-between rounded-lg border p-3">
              <Label htmlFor="scheme-active">Visible on web and mobile</Label>
              <Switch
                id="scheme-active"
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
              onClick={() => void handleSubmit()}
              disabled={createMutation.isPending || updateMutation.isPending}
            >
              {editing ? 'Save changes' : 'Add scheme'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
