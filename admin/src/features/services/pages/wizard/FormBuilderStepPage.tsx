import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router';
import {
  Calendar,
  CheckSquare,
  CircleDot,
  GripVertical,
  Hash,
  ListFilter,
  Mail,
  Pencil,
  Phone,
  Plus,
  TextCursorInput,
  Trash2,
  Upload,
} from 'lucide-react';
import { toast } from 'sonner';
import {
  Button,
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  Checkbox,
  Input,
  Label,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  Skeleton,
} from '@/components/ui';
import { ServiceWizardShell } from '../../wizard/ServiceWizardShell';
import {
  apiFieldTypeToUi,
  uiFieldTypeToApi,
  useSaveForm,
  useServiceVersionBundle,
} from '../../wizard/useServiceVersion';

const AVAILABLE = [
  { id: 'text', label: 'Text Input', icon: TextCursorInput },
  { id: 'number', label: 'Number Input', icon: Hash },
  { id: 'email', label: 'Email Address', icon: Mail },
  { id: 'phone', label: 'Phone Field', icon: Phone },
  { id: 'date', label: 'Date Picker', icon: Calendar },
  { id: 'select', label: 'Dropdown Select', icon: ListFilter },
  { id: 'file', label: 'File Upload', icon: Upload },
  { id: 'checkbox', label: 'Checkbox Option', icon: CheckSquare },
  { id: 'radio', label: 'Radio Control', icon: CircleDot },
];

const OPTION_FIELD_TYPES = new Set(['DROPDOWN', 'RADIO', 'CHECKBOX', 'MULTI_SELECT']);

type FieldOption = { id: string; label: string; value: string };
type Field = {
  id: string;
  label: string;
  type: string;
  required: boolean;
  placeholder: string;
  options: FieldOption[];
};

function slugValue(label: string, index: number): string {
  const base = label
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '_')
    .replace(/^_|_$/g, '');
  return base || `option_${index + 1}`;
}

function supportsOptions(uiType: string): boolean {
  return OPTION_FIELD_TYPES.has(uiFieldTypeToApi(uiType));
}

export function FormBuilderStepPage() {
  const { mainServiceId = '', subServiceId = '' } = useParams();
  const navigate = useNavigate();
  const base = `/services/new/${mainServiceId}/sub/${subServiceId}`;

  const { data: bundle, isLoading, isError } = useServiceVersionBundle(mainServiceId, subServiceId);
  const { mutateAsync: saveForm, isPending } = useSaveForm(mainServiceId, subServiceId);

  const [fields, setFields] = useState<Field[]>([]);
  const [selectedId, setSelectedId] = useState<string>('');

  useEffect(() => {
    const apiFields = bundle?.formVersion?.fields ?? [];
    if (apiFields.length === 0) return;
    const mapped = apiFields.map((f) => ({
      id: f.id,
      label: f.label,
      type: apiFieldTypeToUi(f.type),
      required: Boolean(f.required),
      placeholder: f.placeholder ?? '',
      options: (f.options ?? []).map((o, index) => ({
        id: o.id ?? `opt-${f.id}-${index}`,
        label: o.label,
        value: o.value,
      })),
    }));
    setFields(mapped);
    setSelectedId(mapped[0]?.id ?? '');
  }, [bundle]);

  const selected = fields.find((f) => f.id === selectedId) ?? fields[0];
  const mainServiceName = bundle?.subService?.mainService?.name ?? 'Main Service';
  const selectedSupportsOptions = selected ? supportsOptions(selected.type) : false;

  const persist = async () => {
    await saveForm({
      fields: fields.map((f, index) => {
        const apiType = uiFieldTypeToApi(f.type);
        const withOptions = OPTION_FIELD_TYPES.has(apiType);
        return {
          label: f.label,
          type: apiType,
          required: f.required,
          placeholder: f.placeholder || undefined,
          sortOrder: index,
          options: withOptions
            ? f.options.map((o, optIndex) => ({
                label: o.label,
                value: o.value || slugValue(o.label, optIndex),
                sortOrder: optIndex,
              }))
            : undefined,
        };
      }),
    });
  };

  const handleSave = async (next?: string) => {
    try {
      await persist();
      toast.success('Form saved');
      if (next) navigate(next);
    } catch {
      toast.error('Failed to save form');
    }
  };

  const updateSelected = (patch: Partial<Field>) => {
    if (!selected) return;
    setFields((prev) => prev.map((f) => (f.id === selected.id ? { ...f, ...patch } : f)));
  };

  const updateOption = (optionId: string, patch: Partial<FieldOption>) => {
    if (!selected) return;
    setFields((prev) =>
      prev.map((f) =>
        f.id === selected.id
          ? {
              ...f,
              options: f.options.map((o) => (o.id === optionId ? { ...o, ...patch } : o)),
            }
          : f,
      ),
    );
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-8 w-64" />
        <Skeleton className="h-96 w-full rounded-xl" />
      </div>
    );
  }

  if (isError) {
    return <p className="text-sm text-danger">Failed to load form configuration.</p>;
  }

  return (
    <ServiceWizardShell
      step="form-builder"
      crumbs={[
        { label: 'Dashboard', to: '/dashboard' },
        { label: 'Services', to: '/services' },
        { label: mainServiceName, to: `/services/new/${mainServiceId}/sub-services` },
        { label: 'Form Builder' },
      ]}
      onDraft={() => handleSave()}
      onContinue={() => handleSave(`${base}/documents`)}
      continueLabel={isPending ? 'Saving…' : 'Save & Continue'}
    >
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-12">
        <Card className="lg:col-span-3">
          <CardHeader>
            <CardTitle>Available Elements</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {AVAILABLE.map((el) => (
              <button
                key={el.id}
                type="button"
                onClick={() => {
                  const id = `f-${Date.now()}`;
                  const defaultOptions = supportsOptions(el.label)
                    ? [
                        { id: `${id}-o1`, label: 'Option 1', value: 'option_1' },
                        { id: `${id}-o2`, label: 'Option 2', value: 'option_2' },
                      ]
                    : [];
                  setFields((prev) => [
                    ...prev,
                    {
                      id,
                      label: el.label,
                      type: el.label,
                      required: false,
                      placeholder: '',
                      options: defaultOptions,
                    },
                  ]);
                  setSelectedId(id);
                  toast.success(`${el.label} added`);
                }}
                className="flex w-full items-center gap-2 rounded-lg border border-border px-3 py-2.5 text-left text-sm hover:bg-muted/50"
              >
                <GripVertical className="size-4 text-muted-foreground" />
                <el.icon className="size-4 text-primary" />
                <span className="font-medium">{el.label}</span>
              </button>
            ))}
          </CardContent>
        </Card>

        <Card className="lg:col-span-5">
          <CardHeader>
            <CardTitle>Form Workspace Sandbox</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {fields.length === 0 ? (
              <p className="text-sm text-muted-foreground">Add fields from the palette.</p>
            ) : (
              fields.map((field) => (
                <div
                  key={field.id}
                  role="button"
                  tabIndex={0}
                  onClick={() => setSelectedId(field.id)}
                  onKeyDown={(e) => e.key === 'Enter' && setSelectedId(field.id)}
                  className={`flex items-center gap-3 rounded-lg border px-3 py-3 ${
                    selectedId === field.id ? 'border-primary bg-accent/40' : 'border-border'
                  }`}
                >
                  <GripVertical className="size-4 text-muted-foreground" />
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium text-foreground">
                      {field.label}
                      {field.required ? <span className="text-danger"> *</span> : null}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {field.type}
                      {supportsOptions(field.type) && field.options.length > 0
                        ? ` · ${field.options.length} options`
                        : ''}
                    </p>
                  </div>
                  <button type="button" className="text-primary" onClick={() => setSelectedId(field.id)}>
                    <Pencil className="size-4" />
                  </button>
                  <button
                    type="button"
                    className="text-danger"
                    onClick={(e) => {
                      e.stopPropagation();
                      setFields((prev) => prev.filter((f) => f.id !== field.id));
                    }}
                  >
                    <Trash2 className="size-4" />
                  </button>
                </div>
              ))
            )}
          </CardContent>
        </Card>

        <Card className="lg:col-span-4">
          <CardHeader>
            <CardTitle>Properties Panel</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {selected ? (
              <>
                <div className="space-y-1.5">
                  <Label>Field Display Label</Label>
                  <Input
                    value={selected.label}
                    onChange={(e) => updateSelected({ label: e.target.value })}
                  />
                </div>
                <div className="space-y-1.5">
                  <Label>Helper / Placeholder</Label>
                  <Input
                    value={selected.placeholder}
                    onChange={(e) => updateSelected({ placeholder: e.target.value })}
                  />
                </div>
                <label className="flex items-center gap-2 text-sm">
                  <Checkbox
                    checked={selected.required}
                    onCheckedChange={(v) => updateSelected({ required: Boolean(v) })}
                  />
                  Mandatory Required Field
                </label>
                <div className="space-y-1.5">
                  <Label>Validation</Label>
                  <Select defaultValue="any">
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="any">Any text</SelectItem>
                      <SelectItem value="exact6">Exact 6 Digit Number</SelectItem>
                      <SelectItem value="email">Valid email</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {selectedSupportsOptions ? (
                  <div className="space-y-3 border-t border-border pt-4">
                    <div className="flex items-center justify-between gap-2">
                      <Label>Field Options</Label>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="gap-1 text-primary"
                        onClick={() => {
                          const index = selected.options.length;
                          updateSelected({
                            options: [
                              ...selected.options,
                              {
                                id: `opt-${Date.now()}`,
                                label: `Option ${index + 1}`,
                                value: `option_${index + 1}`,
                              },
                            ],
                          });
                        }}
                      >
                        <Plus className="size-4" />
                        Add option
                      </Button>
                    </div>
                    {selected.options.length === 0 ? (
                      <p className="text-xs text-muted-foreground">
                        Add at least one option for citizens to choose from.
                      </p>
                    ) : (
                      <div className="space-y-2">
                        {selected.options.map((option) => (
                          <div key={option.id} className="grid grid-cols-[1fr_1fr_auto] gap-2">
                            <Input
                              placeholder="Label"
                              value={option.label}
                              onChange={(e) => {
                                const label = e.target.value;
                                updateOption(option.id, {
                                  label,
                                  value: option.value || slugValue(label, 0),
                                });
                              }}
                            />
                            <Input
                              placeholder="Value"
                              value={option.value}
                              onChange={(e) => updateOption(option.id, { value: e.target.value })}
                            />
                            <Button
                              type="button"
                              variant="ghost"
                              size="icon"
                              className="size-9 text-danger"
                              onClick={() =>
                                updateSelected({
                                  options: selected.options.filter((o) => o.id !== option.id),
                                })
                              }
                            >
                              <Trash2 className="size-4" />
                            </Button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                ) : null}
              </>
            ) : (
              <p className="text-sm text-muted-foreground">Select a field to edit properties.</p>
            )}
          </CardContent>
        </Card>
      </div>
    </ServiceWizardShell>
  );
}
