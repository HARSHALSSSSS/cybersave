import { Link } from 'react-router';
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
  PageHeader,
} from '@/components/ui';
import { ProfileSettingsCard } from '../components/ProfileSettingsCard';
import { SecurityCredentialsCard } from '../components/SecurityCredentialsCard';
import { NotificationPreferencesCard } from '../components/NotificationPreferencesCard';
import { LocalizationThemeCard } from '../components/LocalizationThemeCard';

export function SettingsPage() {
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
            <BreadcrumbPage>Settings</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

      <PageHeader
        title="Portal Settings"
        description="Manage your profile, security credentials, notification preferences, and appearance."
      />

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          <ProfileSettingsCard />
          <SecurityCredentialsCard />
        </div>

        <div className="space-y-6">
          <NotificationPreferencesCard />
          <LocalizationThemeCard />
        </div>
      </div>
    </div>
  );
}
