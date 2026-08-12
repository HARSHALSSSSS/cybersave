import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui';
import { DEFAULT_NOTIFICATION_PREFERENCES } from '../constants/mock-data';
import { ToggleRow } from './ToggleRow';

export function NotificationPreferencesCard() {
  const [prefs, setPrefs] = useState(DEFAULT_NOTIFICATION_PREFERENCES);

  function toggle(key: keyof typeof prefs) {
    setPrefs((prev) => ({ ...prev, [key]: !prev[key] }));
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Notification Preferences</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <ToggleRow
          label="Email Notifications"
          description="Receive updates and alerts via email"
          checked={prefs.email}
          onCheckedChange={() => toggle('email')}
        />
        <ToggleRow
          label="Push Notifications"
          description="Receive real-time alerts on this device"
          checked={prefs.push}
          onCheckedChange={() => toggle('push')}
        />
        <ToggleRow
          label="Document Upload Alerts"
          description="Notify when citizens upload new documents"
          checked={prefs.documentUploadAlerts}
          onCheckedChange={() => toggle('documentUploadAlerts')}
        />
        <ToggleRow
          label="Expiry Reminders"
          description="Notify before documents or licences expire"
          checked={prefs.expiryReminders}
          onCheckedChange={() => toggle('expiryReminders')}
        />
        <ToggleRow
          label="System Updates"
          description="Notify about maintenance and platform changes"
          checked={prefs.systemUpdates}
          onCheckedChange={() => toggle('systemUpdates')}
        />
      </CardContent>
    </Card>
  );
}
