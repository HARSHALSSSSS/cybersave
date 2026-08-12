import { useEffect, useState } from 'react';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { toast } from 'sonner';

import {

  Avatar,

  AvatarFallback,

  Button,

  Card,

  CardContent,

  CardHeader,

  CardTitle,

  Input,

} from '@/components/ui';

import { getMe } from '@/features/authentication/services/auth.service';

import { fullName, initials } from '@/services/api/adapters';

import { settingsService } from '../services/settings.service';

import { SettingsField } from './SettingsField';



export function ProfileSettingsCard() {

  const queryClient = useQueryClient();

  const { data: profile, isLoading } = useQuery({

    queryKey: ['admin', 'me'],

    queryFn: getMe,

  });



  const [fullNameValue, setFullNameValue] = useState('');



  useEffect(() => {

    if (profile) {

      setFullNameValue(fullName(profile.firstName, profile.lastName, profile.email));

    }

  }, [profile]);



  const saveMutation = useMutation({

    mutationFn: () => {

      const parts = fullNameValue.trim().split(/\s+/);

      const firstName = parts[0] ?? '';

      const lastName = parts.slice(1).join(' ') || undefined;

      return settingsService.updateProfile({ firstName, lastName });

    },

    onSuccess: () => {

      queryClient.invalidateQueries({ queryKey: ['admin', 'me'] });

      toast.success('Profile changes saved');

    },

    onError: () => toast.error('Failed to save profile'),

  });



  if (isLoading || !profile) {

    return (

      <Card>

        <CardHeader>

          <CardTitle>Profile Settings</CardTitle>

        </CardHeader>

        <CardContent>Loading profile…</CardContent>

      </Card>

    );

  }



  const displayInitials =
    initials(profile.firstName, profile.lastName) !== '??'
      ? initials(profile.firstName, profile.lastName)
      : profile.email.slice(0, 2).toUpperCase();

  const roleLabel = profile.roles?.[0]?.name ?? 'Administrator';



  return (

    <Card>

      <CardHeader>

        <CardTitle>Profile Settings</CardTitle>

      </CardHeader>

      <CardContent className="space-y-5">

        <div className="flex flex-wrap items-center gap-4">

          <Avatar className="h-16 w-16">

            <AvatarFallback className="text-lg font-semibold">{displayInitials}</AvatarFallback>

          </Avatar>

        </div>



        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">

          <SettingsField label="Full Name" htmlFor="profile-full-name">

            <Input

              id="profile-full-name"

              value={fullNameValue}

              onChange={(e) => setFullNameValue(e.target.value)}

            />

          </SettingsField>

          <SettingsField label="Email" htmlFor="profile-email">

            <Input id="profile-email" type="email" value={profile.email} readOnly disabled />

          </SettingsField>

          <SettingsField label="Role" htmlFor="profile-role">

            <Input id="profile-role" value={roleLabel} readOnly disabled />

          </SettingsField>

        </div>



        <div className="flex justify-end">

          <Button size="sm" onClick={() => saveMutation.mutate()} disabled={saveMutation.isPending}>

            Save Profile Changes

          </Button>

        </div>

      </CardContent>

    </Card>

  );

}

