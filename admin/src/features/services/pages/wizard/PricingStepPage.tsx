import { useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router';
import { Pencil, Plus, Trash2 } from 'lucide-react';
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
  Switch,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui';
import { ServiceWizardShell } from '../../wizard/ServiceWizardShell';
import { decimalToNumber, useSavePricing, useServiceVersionBundle } from '../../wizard/useServiceVersion';

type Charge = { id: string; name: string; amount: number; condition: string };

export function PricingStepPage() {
  const { mainServiceId = '', subServiceId = '' } = useParams();
  const navigate = useNavigate();
  const base = `/services/new/${mainServiceId}/sub/${subServiceId}`;

  const { data: bundle, isLoading, isError } = useServiceVersionBundle(mainServiceId, subServiceId);
  const { mutateAsync: savePricing, isPending } = useSavePricing(mainServiceId, subServiceId);

  const [fee, setFee] = useState(0);
  const [taxOn, setTaxOn] = useState(false);
  const [taxRate, setTaxRate] = useState(18);
  const [charges, setCharges] = useState<Charge[]>([]);
  const [methods, setMethods] = useState({ online: true, upi: true, dd: false, cash: false });
  const [refund, setRefund] = useState('non-refundable');

  useEffect(() => {
    const pricing = bundle?.pricingConfig;
    if (!pricing) return;
    setFee(decimalToNumber(pricing.baseFee));
    setTaxOn(Boolean(pricing.taxEnabled));
    setTaxRate(decimalToNumber(pricing.taxRate) || 18);
    setCharges(
      (pricing.additionalCharges ?? []).map((c) => ({
        id: c.id,
        name: c.name,
        amount: decimalToNumber(c.amount),
        condition: c.condition ?? '',
      })),
    );
  }, [bundle]);

  const total = useMemo(() => {
    const taxAmount = taxOn ? (fee * taxRate) / 100 : 0;
    const additional = charges.reduce((sum, c) => sum + c.amount, 0);
    return Math.round(fee + taxAmount + additional);
  }, [fee, taxOn, taxRate, charges]);

  const mainServiceName = bundle?.subService?.mainService?.name ?? 'Main Service';

  const persist = async () => {
    await savePricing({
      baseFee: fee,
      taxEnabled: taxOn,
      taxRate: taxOn ? taxRate : 0,
      currency: 'INR',
      additionalCharges: charges.map((c) => ({
        name: c.name,
        amount: c.amount,
        condition: c.condition || undefined,
      })),
    });
  };

  const handleSave = async (next?: string) => {
    try {
      await persist();
      toast.success('Pricing saved');
      if (next) navigate(next);
    } catch {
      toast.error('Failed to save pricing');
    }
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
    return <p className="text-sm text-danger">Failed to load pricing configuration.</p>;
  }

  return (
    <ServiceWizardShell
      step="pricing"
      crumbs={[
        { label: 'Dashboard', to: '/dashboard' },
        { label: 'Services', to: '/services' },
        { label: mainServiceName, to: `/services/new/${mainServiceId}/sub-services` },
        { label: 'Pricing' },
      ]}
      showBack
      onBack={() => navigate(`${base}/documents`)}
      onDraft={() => handleSave()}
      onContinue={() => handleSave(`${base}/fulfillment`)}
      continueLabel={isPending ? 'Saving…' : 'Save & Continue'}
    >
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Base Pricing</CardTitle>
          </CardHeader>
          <CardContent className="space-y-5">
            <div className="space-y-1.5">
              <Label>Service Fee (₹)</Label>
              <Input type="number" value={fee} onChange={(e) => setFee(Number(e.target.value) || 0)} />
            </div>
            <div className="flex items-center justify-between gap-3 rounded-lg border border-border px-4 py-3">
              <div>
                <p className="text-sm font-medium">Apply Taxes (GST {taxRate}%)</p>
                <p className="text-xs text-muted-foreground">Standard tax charge computed dynamically.</p>
              </div>
              <Switch checked={taxOn} onCheckedChange={setTaxOn} />
            </div>
            <div className="flex items-center justify-between rounded-lg bg-accent px-4 py-3">
              <span className="text-sm font-medium text-foreground">Total Citizen Price</span>
              <span className="text-lg font-semibold text-primary">₹{total}</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Additional Charges Table</CardTitle>
            <Button
              variant="ghost"
              size="sm"
              className="gap-1 text-primary"
              onClick={() => {
                setCharges((prev) => [
                  ...prev,
                  { id: `c-${Date.now()}`, name: 'New Charge', amount: 0, condition: 'Optional' },
                ]);
              }}
            >
              <Plus className="size-4" />
              Add Charge
            </Button>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Condition</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {charges.map((c) => (
                  <TableRow key={c.id}>
                    <TableCell className="font-medium">{c.name}</TableCell>
                    <TableCell>₹{c.amount}</TableCell>
                    <TableCell className="text-muted-foreground">{c.condition}</TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-1">
                        <Button variant="ghost" size="icon" className="size-8 text-primary">
                          <Pencil className="size-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="size-8 text-danger"
                          onClick={() => setCharges((prev) => prev.filter((x) => x.id !== c.id))}
                        >
                          <Trash2 className="size-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Payment Settings</CardTitle>
          </CardHeader>
          <CardContent className="space-y-5">
            <div className="space-y-3">
              <Label>Accepted Payment Methods</Label>
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
                {(
                  [
                    ['online', 'Online Payment'],
                    ['upi', 'UPI'],
                    ['dd', 'Demand Draft'],
                    ['cash', 'Cash at Counter'],
                  ] as const
                ).map(([key, label]) => (
                  <label key={key} className="flex items-center gap-2 rounded-lg border border-border px-3 py-2.5 text-sm">
                    <Checkbox
                      checked={methods[key]}
                      onCheckedChange={(v) => setMethods((prev) => ({ ...prev, [key]: Boolean(v) }))}
                    />
                    {label}
                  </label>
                ))}
              </div>
            </div>
            <div className="space-y-1.5 max-w-xl">
              <Label>Refund & Cancellation Policy</Label>
              <Select value={refund} onValueChange={setRefund}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="non-refundable">Non-refundable after processing starts</SelectItem>
                  <SelectItem value="full">Full refund within 24h</SelectItem>
                  <SelectItem value="partial">Partial refund before approval</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>
      </div>
    </ServiceWizardShell>
  );
}
