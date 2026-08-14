import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router';
import { UserCheck, X } from 'lucide-react';
import { toast } from 'sonner';
import { Button, Input, Label } from '@/components/ui/button';
import { useAuthStore } from '@/features/auth/store/auth.store';
import { isProfileComplete } from '@/lib/profile';

const DISMISS_KEY = 'cybersave_profile_prompt_dismissed';

export function CompleteProfileModal() {
  const navigate = useNavigate();
  const citizen = useAuthStore(s => s.citizen);
  const updateProfile = useAuthStore(s => s.updateProfile);
  const [open, setOpen] = useState(false);
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!citizen) return;
    if (isProfileComplete(citizen)) {
      setOpen(false);
      return;
    }
    const dismissed = sessionStorage.getItem(DISMISS_KEY) === '1';
    if (!dismissed) setOpen(true);
    setFirstName(citizen.firstName ?? '');
    setLastName(citizen.lastName ?? '');
    setEmail(citizen.email ?? '');
  }, [citizen]);

  if (!open) return null;

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    try {
      await updateProfile({
        firstName: firstName.trim(),
        lastName: lastName.trim() || undefined,
        email: email.trim() || undefined,
      });
      toast.success('Profile updated');
      setOpen(false);
    } catch {
      toast.error('Could not save profile');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="relative w-full max-w-lg rounded-[28px] bg-white px-8 py-10 shadow-2xl">
        <button
          type="button"
          className="absolute top-4 right-4 rounded-full p-2 text-[#6B7280] hover:bg-gray-100"
          onClick={() => setOpen(false)}
        >
          <X className="h-4 w-4" />
        </button>

        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-[#EFF6FF] text-[#2563EB]">
          <UserCheck className="h-8 w-8" />
        </div>
        <h2 className="mt-5 text-center text-2xl font-bold text-[#0A1629]">Complete Your Profile</h2>
        <p className="mt-3 text-center text-sm leading-6 text-[#6B7280]">
          Please fill in your account details to access all government services, track applications,
          and manage documents securely.
        </p>

        <form onSubmit={handleSave} className="mt-6 space-y-4">
          <div>
            <Label htmlFor="firstName">First name</Label>
            <Input id="firstName" value={firstName} onChange={e => setFirstName(e.target.value)} required className="mt-1.5" />
          </div>
          <div>
            <Label htmlFor="lastName">Last name</Label>
            <Input id="lastName" value={lastName} onChange={e => setLastName(e.target.value)} className="mt-1.5" />
          </div>
          <div>
            <Label htmlFor="email">Email (optional)</Label>
            <Input id="email" type="email" value={email} onChange={e => setEmail(e.target.value)} className="mt-1.5" />
          </div>
          <Button type="submit" size="lg" className="w-full" disabled={loading}>
            {loading ? 'Saving…' : 'Fill Account Details'}
          </Button>
          <Button
            type="button"
            variant="ghost"
            className="w-full"
            onClick={() => {
              sessionStorage.setItem(DISMISS_KEY, '1');
              setOpen(false);
            }}
          >
            Remind Me Later
          </Button>
        </form>

        <button type="button" className="sr-only" onClick={() => navigate('/profile')}>
          profile
        </button>
      </div>
    </div>
  );
}
