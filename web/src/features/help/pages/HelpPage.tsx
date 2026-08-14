import { useState } from 'react';
import { Link, useNavigate } from 'react-router';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  Grid3X3,
  Headphones,
  Mail,
  MapPin,
  MessageCircle,
  Minus,
  Phone,
  Plus,
  Rocket,
  Search,
  Shield,
  User,
  Wallet,
  Wrench,
} from 'lucide-react';
import { toast } from 'sonner';
import { Breadcrumbs } from '@/components/layout/Breadcrumbs';
import { Button, Input, Label } from '@/components/ui/button';
import { SecurityNoticeFull } from '@/features/apply/components/SecurityNotice';
import { FAQ_ITEMS, HELP_TOPICS } from '@/lib/help-content';
import { supportApi, supportQueryKeys } from '@/services/api';

const TOPIC_ICONS = {
  rocket: Rocket,
  user: User,
  grid: Grid3X3,
  wallet: Wallet,
  shield: Shield,
  wrench: Wrench,
} as const;

export function HelpPage() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [search, setSearch] = useState('');
  const [openFaq, setOpenFaq] = useState<string | null>(FAQ_ITEMS[0]?.id ?? null);
  const [showTicket, setShowTicket] = useState(false);
  const [subject, setSubject] = useState('');
  const [content, setContent] = useState('');

  const { data: ticketsData } = useQuery({
    queryKey: supportQueryKeys.tickets(1),
    queryFn: () => supportApi.listTickets(1, 5),
  });

  const createTicket = useMutation({
    mutationFn: () => supportApi.createTicket(subject.trim(), content.trim()),
    onSuccess: (ticket) => {
      toast.success('Support ticket created');
      setShowTicket(false);
      setSubject('');
      setContent('');
      void queryClient.invalidateQueries({ queryKey: supportQueryKeys.all });
      navigate(`/help/tickets/${ticket.id}`);
    },
    onError: () => toast.error('Could not create ticket'),
  });

  const faqFiltered = FAQ_ITEMS.filter(
    item =>
      !search.trim() ||
      item.question.toLowerCase().includes(search.toLowerCase()) ||
      item.answer.toLowerCase().includes(search.toLowerCase()),
  );

  return (
    <div className="space-y-6">
      <Breadcrumbs items={[{ label: 'Portal Home', to: '/' }, { label: 'Help & Support' }]} />

      <div
        className="relative overflow-hidden rounded-2xl px-6 py-10 text-white sm:px-10"
        style={{ background: 'linear-gradient(135deg, #1A3B8B 0%, #2563EB 100%)' }}
      >
        <div className="relative z-10 max-w-xl">
          <h1 className="font-display text-3xl font-bold tracking-tight">Help & Support Centre</h1>
          <p className="mt-3 text-sm leading-6 text-blue-100">
            Get step-by-step assistance, search common user questions, or coordinate direct support
            with our dedicated helpdesk teams.
          </p>
        </div>
        <Headphones className="absolute top-6 right-6 h-24 w-24 text-white/15" />
      </div>

      <div className="rounded-2xl border border-[#E5E7EB] bg-white p-6 shadow-sm">
        <h2 className="font-semibold text-[#0A1629]">How can we assist you today?</h2>
        <div className="relative mt-4">
          <Search className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-[#9CA3AF]" />
          <Input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search FAQs, services, payments, documents…"
            className="pl-10"
          />
        </div>
      </div>

      <section>
        <h2 className="mb-4 text-lg font-semibold text-[#0A1629]">Browse Support by Topic</h2>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {HELP_TOPICS.map(topic => {
            const Icon = TOPIC_ICONS[topic.icon as keyof typeof TOPIC_ICONS] ?? Grid3X3;
            return (
              <button
                key={topic.id}
                type="button"
                onClick={() => setSearch(topic.title)}
                className="rounded-2xl border border-[#E5E7EB] bg-white p-5 text-left shadow-sm transition hover:border-[#2563EB]/30"
              >
                <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#EFF6FF] text-[#2563EB]">
                  <Icon className="h-5 w-5" />
                </span>
                <p className="mt-3 font-semibold text-[#0A1629]">{topic.title}</p>
                <p className="mt-1 text-xs leading-5 text-[#6B7280]">{topic.description}</p>
              </button>
            );
          })}
        </div>
      </section>

      <section className="rounded-2xl border border-[#E5E7EB] bg-white p-6 shadow-sm">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-[#0A1629]">Frequently Asked Questions</h2>
          <Button type="button" variant="outline" size="sm" onClick={() => setShowTicket(true)}>
            Raise a Ticket
          </Button>
        </div>
        <div className="divide-y divide-[#F3F4F6]">
          {faqFiltered.map(item => {
            const open = openFaq === item.id;
            return (
              <div key={item.id} className="py-4">
                <button
                  type="button"
                  className="flex w-full items-start justify-between gap-4 text-left"
                  onClick={() => setOpenFaq(open ? null : item.id)}
                >
                  <span className="font-medium text-[#0A1629]">{item.question}</span>
                  {open ? (
                    <Minus className="h-4 w-4 shrink-0 text-[#9CA3AF]" />
                  ) : (
                    <Plus className="h-4 w-4 shrink-0 text-[#9CA3AF]" />
                  )}
                </button>
                {open ? (
                  <p className="mt-3 text-sm leading-6 text-[#6B7280]">{item.answer}</p>
                ) : null}
              </div>
            );
          })}
        </div>
      </section>

      <section className="rounded-2xl border border-[#E5E7EB] bg-white p-6 shadow-sm">
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
          <h2 className="text-lg font-semibold text-[#0A1629]">Your Support Tickets</h2>
          <div className="flex gap-2">
            <Link to="/help/tickets">
              <Button type="button" variant="outline" size="sm">
                View All
              </Button>
            </Link>
            <Button type="button" variant="outline" size="sm" onClick={() => setShowTicket(true)}>
              Raise a Ticket
            </Button>
          </div>
        </div>
        {(ticketsData?.data.length ?? 0) === 0 ? (
          <p className="text-sm text-[#6B7280]">
            No tickets yet. Raise one if you need help with an application, payment, or document.
          </p>
        ) : (
          <ul className="space-y-3">
            {ticketsData!.data.map(ticket => (
              <li key={ticket.id}>
                <Link
                  to={`/help/tickets/${ticket.id}`}
                  className="flex items-center justify-between rounded-xl border border-[#F3F4F6] px-4 py-3 transition hover:border-[#2563EB]/30"
                >
                  <div>
                    <p className="text-sm font-medium text-[#0A1629]">{ticket.subject}</p>
                    <p className="text-xs text-[#9CA3AF]">{ticket.status.replace(/_/g, ' ')}</p>
                  </div>
                  <span className="text-xs font-semibold text-[#2563EB]">Open</span>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section>
        <h2 className="mb-4 text-lg font-semibold text-[#0A1629]">Still Need Help? Contact Us</h2>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {[
            { icon: Phone, label: 'Helpdesk Phone', value: '1800-111-255' },
            { icon: Mail, label: 'Email Support', value: 'support@cybersave.gov.in' },
            { icon: MessageCircle, label: 'Live Web Chat', value: 'Chat Now', action: () => toast.info('Live chat coming soon') },
            { icon: MapPin, label: 'Find Nearest Center', value: 'Locate Center', action: () => toast.info('Center locator coming soon') },
          ].map(item => {
            const Icon = item.icon;
            return (
              <button
                key={item.label}
                type="button"
                onClick={item.action}
                className="rounded-2xl border border-[#E5E7EB] bg-white p-5 text-left shadow-sm transition hover:border-[#2563EB]/30"
              >
                <Icon className="h-5 w-5 text-[#2563EB]" />
                <p className="mt-3 text-xs text-[#9CA3AF]">{item.label}</p>
                <p className="mt-1 text-sm font-bold text-[#2563EB]">{item.value}</p>
              </button>
            );
          })}
        </div>
      </section>

      <SecurityNoticeFull />

      {showTicket ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-xl">
            <h3 className="text-lg font-semibold text-[#0A1629]">Raise Support Ticket</h3>
            <div className="mt-4 space-y-4">
              <div>
                <Label htmlFor="subject">Subject</Label>
                <Input id="subject" value={subject} onChange={e => setSubject(e.target.value)} className="mt-1.5" />
              </div>
              <div>
                <Label htmlFor="content">Describe your issue</Label>
                <textarea
                  id="content"
                  rows={4}
                  value={content}
                  onChange={e => setContent(e.target.value)}
                  className="mt-1.5 w-full rounded-xl border border-[#E5E7EB] px-3 py-2 text-sm"
                />
              </div>
              <div className="flex justify-end gap-2">
                <Button type="button" variant="ghost" onClick={() => setShowTicket(false)}>
                  Cancel
                </Button>
                <Button
                  type="button"
                  disabled={!subject.trim() || !content.trim() || createTicket.isPending}
                  onClick={() => createTicket.mutate()}
                >
                  Submit Ticket
                </Button>
              </div>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
