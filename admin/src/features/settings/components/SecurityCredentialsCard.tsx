import { useState } from 'react';

import { Eye, EyeOff } from 'lucide-react';

import { useMutation } from '@tanstack/react-query';

import { toast } from 'sonner';

import { Button, Card, CardContent, CardHeader, CardTitle, Input, Switch } from '@/components/ui';

import { settingsService } from '../services/settings.service';

import { SettingsField } from './SettingsField';



interface PasswordFormState {

  current: string;

  next: string;

  confirm: string;

}



const EMPTY_PASSWORDS: PasswordFormState = { current: '', next: '', confirm: '' };



export function SecurityCredentialsCard() {

  const [passwords, setPasswords] = useState<PasswordFormState>(EMPTY_PASSWORDS);

  const [visibility, setVisibility] = useState({ current: false, next: false, confirm: false });

  const [twoFactorEnabled, setTwoFactorEnabled] = useState(false);



  const changePasswordMutation = useMutation({

    mutationFn: () =>

      settingsService.changePassword({

        currentPassword: passwords.current,

        newPassword: passwords.next,

      }),

    onSuccess: () => {

      toast.success('Password updated successfully');

      setPasswords(EMPTY_PASSWORDS);

    },

    onError: () => toast.error('Failed to update password. Check your current password.'),

  });



  function handleUpdatePassword() {

    if (!passwords.current || !passwords.next || !passwords.confirm) {

      toast.error('Please fill in all password fields');

      return;

    }

    if (passwords.next !== passwords.confirm) {

      toast.error('New password and confirmation do not match');

      return;

    }

    if (passwords.next.length < 8) {

      toast.error('New password must be at least 8 characters');

      return;

    }

    changePasswordMutation.mutate();

  }



  return (

    <Card>

      <CardHeader>

        <CardTitle>Security Credentials</CardTitle>

      </CardHeader>

      <CardContent className="space-y-5">

        <SettingsField label="Current Password" htmlFor="current-password">

          <PasswordInput

            id="current-password"

            value={passwords.current}

            visible={visibility.current}

            onToggleVisible={() => setVisibility((prev) => ({ ...prev, current: !prev.current }))}

            onChange={(value) => setPasswords((prev) => ({ ...prev, current: value }))}

          />

        </SettingsField>

        <SettingsField label="New Password" htmlFor="new-password">

          <PasswordInput

            id="new-password"

            value={passwords.next}

            visible={visibility.next}

            onToggleVisible={() => setVisibility((prev) => ({ ...prev, next: !prev.next }))}

            onChange={(value) => setPasswords((prev) => ({ ...prev, next: value }))}

          />

        </SettingsField>

        <SettingsField label="Confirm Password" htmlFor="confirm-password">

          <PasswordInput

            id="confirm-password"

            value={passwords.confirm}

            visible={visibility.confirm}

            onToggleVisible={() => setVisibility((prev) => ({ ...prev, confirm: !prev.confirm }))}

            onChange={(value) => setPasswords((prev) => ({ ...prev, confirm: value }))}

          />

        </SettingsField>



        <div className="flex items-center justify-between gap-4 rounded-lg border border-border p-3.5 opacity-60">

          <div className="min-w-0">

            <p className="text-sm leading-5 font-medium text-foreground">Two-Factor Authentication</p>

            <p className="text-xs leading-4 text-muted-foreground">Coming in a future release</p>

          </div>

          <Switch checked={twoFactorEnabled} onCheckedChange={setTwoFactorEnabled} disabled />

        </div>



        <div className="flex justify-end">

          <Button

            size="sm"

            onClick={handleUpdatePassword}

            disabled={changePasswordMutation.isPending}

          >

            Update Password

          </Button>

        </div>

      </CardContent>

    </Card>

  );

}



function PasswordInput({

  id,

  value,

  visible,

  onToggleVisible,

  onChange,

}: {

  id: string;

  value: string;

  visible: boolean;

  onToggleVisible: () => void;

  onChange: (value: string) => void;

}) {

  return (

    <div className="relative">

      <Input

        id={id}

        type={visible ? 'text' : 'password'}

        className="pr-9"

        value={value}

        onChange={(e) => onChange(e.target.value)}

      />

      <button

        type="button"

        className="absolute top-1/2 right-2.5 -translate-y-1/2 text-muted-foreground transition-colors duration-150 hover:text-foreground"

        onClick={onToggleVisible}

        aria-label={visible ? 'Hide password' : 'Show password'}

      >

        {visible ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}

      </button>

    </div>

  );

}

