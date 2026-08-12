import { useState } from 'react';
import { toast } from 'sonner';
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
  Badge,
  Button,
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  Switch,
} from '@/components/ui';
import type { Operator, PermissionCategory } from '../types';
import { POLICY_CHANGES } from '../constants/mock-data';

export function OperatorPermissionsTab({
  operator,
  initialCategories,
}: {
  operator: Operator;
  initialCategories: PermissionCategory[];
}) {
  const [categories, setCategories] = useState(initialCategories);

  function toggleCategory(id: string, enabled: boolean) {
    setCategories((prev) =>
      prev.map((c) =>
        c.id === id
          ? {
              ...c,
              enabled,
              permissions: c.permissions.map((p) => ({ ...p, enabled: enabled ? p.enabled : false })),
            }
          : c,
      ),
    );
  }

  function togglePermission(categoryId: string, permissionId: string, enabled: boolean) {
    setCategories((prev) =>
      prev.map((c) =>
        c.id === categoryId
          ? {
              ...c,
              permissions: c.permissions.map((p) => (p.id === permissionId ? { ...p, enabled } : p)),
            }
          : c,
      ),
    );
  }

  const allowed = categories.flatMap((c) => c.permissions).filter((p) => p.enabled).length;
  const total = categories.flatMap((c) => c.permissions).length;

  return (
    <div className="space-y-6 pb-24">
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="space-y-4 lg:col-span-2">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Permissions & Security Level</CardTitle>
              <Badge variant="info">Internal Tier-2</Badge>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                <div>
                  <p className="text-xs text-muted-foreground">Current Security Role</p>
                  <p className="mt-1 text-sm font-semibold text-primary">{operator.role}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Permissions Review Status</p>
                  <p className="mt-1 text-sm font-semibold text-success-text">Verified & Audited</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Last Reviewed</p>
                  <p className="mt-1 text-sm font-semibold text-foreground">Jan 24, 2026</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {categories.map((category) => (
            <Card key={category.id} className={!category.enabled ? 'opacity-60' : undefined}>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle>{category.title}</CardTitle>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-muted-foreground">
                    Category {category.enabled ? 'Enabled' : 'Disabled'}
                  </span>
                  <Switch
                    checked={category.enabled}
                    onCheckedChange={(v) => toggleCategory(category.id, v)}
                  />
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                {category.permissions.map((p) => (
                  <div
                    key={p.id}
                    className="flex items-center justify-between gap-4 rounded-lg border border-border px-4 py-3"
                  >
                    <div className="min-w-0">
                      <p className="text-sm leading-5 font-medium text-foreground">{p.title}</p>
                      <p className="text-xs leading-4 text-muted-foreground">{p.description}</p>
                    </div>
                    <Switch
                      checked={p.enabled}
                      disabled={!category.enabled}
                      onCheckedChange={(v) => togglePermission(category.id, p.id, v)}
                    />
                  </div>
                ))}
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Security Scorecard</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Score label="Active Grants" value={`${allowed}/${total} Allowed`} badge="Secure Base" variant="completed" />
              <Score label="Access Level" value="Standard Ops" badge="Tier-2 Auth" variant="info" />
              <Score label="Elevated Bypass Flags" value="0 Active" badge="No Overrides" variant="rejected" />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Recent Policy Changes</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {POLICY_CHANGES.map((item) => (
                <div key={item.id} className="border-l-2 border-primary/30 pl-3">
                  <p className="text-sm font-medium text-foreground">{item.title}</p>
                  <p className="text-xs text-muted-foreground">
                    {item.by} • {item.date}
                  </p>
                </div>
              ))}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Authorization Chain</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-3">
                <Avatar className="size-10">
                  <AvatarImage src={operator.avatarUrl} />
                  <AvatarFallback>RK</AvatarFallback>
                </Avatar>
                <div>
                  <p className="text-sm font-semibold">{operator.supervisorName}</p>
                  <p className="text-xs text-muted-foreground">Permission level: Tier-2 Approval Authority</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      <div className="fixed right-0 bottom-0 left-0 z-20 border-t border-border bg-card/95 backdrop-blur sm:left-[260px]">
        <div className="mx-auto flex max-w-[1600px] flex-col gap-3 px-4 py-3 sm:flex-row sm:items-center sm:justify-between sm:px-6 lg:px-8">
          <p className="rounded-md bg-warning-bg px-3 py-2 text-sm leading-5 text-warning-text">
            Changes will require approval from {operator.supervisorName}&apos;s supervisor.
          </p>
          <div className="flex items-center gap-2">
            <Button variant="outline" onClick={() => toast.message('Changes discarded')}>
              Discard
            </Button>
            <Button onClick={() => toast.success('Permission changes saved')}>Save Changes</Button>
          </div>
        </div>
      </div>
    </div>
  );
}

function Score({
  label,
  value,
  badge,
  variant,
}: {
  label: string;
  value: string;
  badge: string;
  variant: 'completed' | 'info' | 'rejected';
}) {
  return (
    <div className="flex items-center justify-between gap-3 rounded-lg border border-border px-3 py-2.5">
      <div>
        <p className="text-xs text-muted-foreground">{label}</p>
        <p className="text-sm font-semibold text-foreground">{value}</p>
      </div>
      <Badge variant={variant}>{badge}</Badge>
    </div>
  );
}
