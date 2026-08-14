import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { X } from 'lucide-react';
import { toast } from 'sonner';
import { Button, Input, Label } from '@/components/ui/button';
import { useAuthStore } from '@/features/auth/store/auth.store';
import { useAuthModalStore } from '@/features/auth/store/auth-modal.store';
import { supportApi, supportQueryKeys } from '@/services/api';

type RaiseTicketModalProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  defaultSubject?: string;
  defaultContent?: string;
};

export function RaiseTicketModal({
  open,
  onOpenChange,
  defaultSubject = '',
  defaultContent = '',
}: RaiseTicketModalProps) {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const isAuthenticated = useAuthStore(s => s.isAuthenticated);
  const openLogin = useAuthModalStore(s => s.openLogin);
  const [subject, setSubject] = useState(defaultSubject);
  const [content, setContent] = useState(defaultContent);

  useEffect(() => {
    if (open) {
      setSubject(defaultSubject);
      setContent(defaultContent);
    }
  }, [open, defaultSubject, defaultContent]);

  const createTicket = useMutation({
    mutationFn: () => supportApi.createTicket(subject.trim(), content.trim()),
    onSuccess: ticket => {
      toast.success('Support ticket created');
      onOpenChange(false);
      setSubject('');
      setContent('');
      void queryClient.invalidateQueries({ queryKey: supportQueryKeys.all });
      navigate(`/help/tickets/${ticket.id}`);
    },
    onError: () => toast.error('Could not create ticket. Please sign in and try again.'),
  });

  function handleSubmit() {
    if (!isAuthenticated) {
      openLogin({ requireProfile: true });
      return;
    }
    if (!subject.trim() || !content.trim()) return;
    createTicket.mutate();
  }

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/45 p-4 backdrop-blur-[2px]">
      <div
        className="relative w-full max-w-lg rounded-2xl bg-white p-6 shadow-2xl"
        role="dialog"
        aria-labelledby="raise-ticket-title"
      >
        <button
          type="button"
          className="absolute top-4 right-4 rounded-lg p-1 text-[#94A3B8] hover:bg-[#F1F5F9]"
          onClick={() => onOpenChange(false)}
          aria-label="Close"
        >
          <X className="h-5 w-5" />
        </button>

        <h3 id="raise-ticket-title" className="font-display text-xl font-bold text-[#0A1629]">
          Raise Support Ticket
        </h3>
        <p className="mt-1 text-sm text-[#64748B]">
          Describe your issue and our team will respond in this thread.
        </p>

        <div className="mt-5 space-y-4">
          <div>
            <Label htmlFor="ticket-subject">Subject</Label>
            <Input
              id="ticket-subject"
              value={subject}
              onChange={e => setSubject(e.target.value)}
              placeholder="e.g. Application status inquiry"
              className="mt-1.5"
            />
          </div>
          <div>
            <Label htmlFor="ticket-content">Describe your issue</Label>
            <textarea
              id="ticket-content"
              rows={5}
              value={content}
              onChange={e => setContent(e.target.value)}
              placeholder="Include your application ID, service name, and what you need help with."
              className="mt-1.5 w-full rounded-xl border border-[#E8EDF5] px-3 py-2.5 text-sm outline-none focus:border-[#2563EB] focus:ring-2 focus:ring-[#2563EB]/20"
            />
          </div>
        </div>

        <div className="mt-6 flex justify-end gap-2">
          <Button type="button" variant="ghost" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button
            type="button"
            disabled={!subject.trim() || !content.trim() || createTicket.isPending}
            onClick={handleSubmit}
          >
            {createTicket.isPending ? 'Submitting…' : 'Submit Ticket'}
          </Button>
        </div>
      </div>
    </div>
  );
}
