import { useState } from 'react';
import { toast } from 'sonner';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui';
import { COLOR_THEME_OPTIONS, DEFAULT_LOCALIZATION, LANGUAGE_OPTIONS, TIMEZONE_OPTIONS } from '../constants/mock-data';
import { SettingsField } from './SettingsField';

export function LocalizationThemeCard() {
  const [localization, setLocalization] = useState(DEFAULT_LOCALIZATION);

  function updateField(field: keyof typeof localization, value: string, label: string) {
    setLocalization((prev) => ({ ...prev, [field]: value }));
    toast.success(`${label} updated`);
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Localization &amp; Theme</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <SettingsField label="Language" htmlFor="localization-language">
          <Select
            value={localization.language}
            onValueChange={(value) => updateField('language', value, 'Language')}
          >
            <SelectTrigger id="localization-language" className="w-full">
              <SelectValue placeholder="Select language" />
            </SelectTrigger>
            <SelectContent>
              {LANGUAGE_OPTIONS.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </SettingsField>

        <SettingsField label="Timezone" htmlFor="localization-timezone">
          <Select
            value={localization.timezone}
            onValueChange={(value) => updateField('timezone', value, 'Timezone')}
          >
            <SelectTrigger id="localization-timezone" className="w-full">
              <SelectValue placeholder="Select timezone" />
            </SelectTrigger>
            <SelectContent>
              {TIMEZONE_OPTIONS.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </SettingsField>

        <SettingsField label="Color Theme" htmlFor="localization-theme">
          <Select
            value={localization.colorTheme}
            onValueChange={(value) => updateField('colorTheme', value, 'Color theme')}
          >
            <SelectTrigger id="localization-theme" className="w-full">
              <SelectValue placeholder="Select theme" />
            </SelectTrigger>
            <SelectContent>
              {COLOR_THEME_OPTIONS.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </SettingsField>
      </CardContent>
    </Card>
  );
}
