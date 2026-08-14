import { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router';
import { useQuery } from '@tanstack/react-query';
import {
  Grid3X3,
  Headphones,
  Mail,
  MapPin,
  MessageCircle,
  MessageSquarePlus,
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
import { Button, Input } from '@/components/ui/button';
import { SecurityNoticeFull } from '@/features/apply/components/SecurityNotice';
import { RaiseTicketModal } from '@/features/help/components/RaiseTicketModal';
import { useAuthStore } from '@/features/auth/store/auth.store';
import { useAuthModalStore } from '@/features/auth/store/auth-modal.store';
import { FAQ_ITEMS, HELP_TOPICS } from '@/lib/help-content';
import { supportApi, supportQueryKeys } from '@/services/api';
import { formatDate } from '@/lib/utils';

const TOPIC_ICONS = {
  rocket: Rocket,
  user: User,
  grid: Grid3X3,
  wallet: Wallet,
  shield: Shield,
  wrench: Wrench,
} as const;

function ticketStatusLabel(status: string) {
  return status.replace(/_/g, ' ').toLowerCase().replace(/^\w/, c => c.toUpperCase());
}

export function HelpPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const isAuthenticated = useAuthStore(s => s.isAuthenticated);
  const openLogin = useAuthModalStore(s => s.openLogin);
  const [search, setSearch] = useState('');
  const [openFaq, setOpenFaq] = useState<string | null>(FAQ_ITEMS[0]?.id ?? null);
  const [showTicket, setShowTicket] = useState(false);
  const [ticketSubject, setTicketSubject] = useState('');
  const [ticketContent, setTicketContent] = useState('');

  const { data: ticketsData } = useQuery({
    queryKey: supportQueryKeys.tickets(1),
    queryFn: () => supportApi.listTickets(1, 5),
    enabled: isAuthenticated,
  });

  useEffect(() => {
    if (searchParams.get('raise') === '1') {
      setTicketSubject(searchParams.get('subject') ?? '');
      setTicketContent(searchParams.get('body') ?? '');
      setShowTicket(true);
      searchParams.delete('raise');
      searchParams.delete('subject');
      searchParams.delete('body');
      setSearchParams(searchParams, { replace: true });
    }
  }, [searchParams, setSearchParams]);

  function openRaiseTicket(prefill?: { subject?: string; content?: string }) {
    if (!isAuthenticated) {
      openLogin({ requireProfile: true });
      return;
    }
    setTicketSubject(prefill?.subject ?? '');
    setTicketContent(prefill?.content ?? '');
    setShowTicket(true);
  }

  const faqFiltered = FAQ_ITEMS.filter(
    item =>
      !search.trim() ||
      item.question.toLowerCase().includes(search.toLowerCase()) ||
      item.answer.toLowerCase().includes(search.toLowerCase()),
  );

  return (
    <div className="space-y-6 pb-8">
      <Breadcrumbs items={[{ label: 'Portal Home', to: '/' }, { label: 'Help & Support' }]} />

      <div
        className="relative overflow-hidden rounded-2xl px-6 py-10 text-white sm:px-10"
        style={{ background: 'linear-gradient(135deg, #1A3B8B 0%, #2563EB 100%)' }}
      >
        <div className="relative z-10 max-w-2xl">
          <p className="text-xs font-semibold tracking-widest text-blue-200 uppercase">
            Support Portal
          </p>
          <h1 className="mt-2 font-display text-3xl font-bold tracking-tight sm:text-4xl">
            How can we help you today?
          </h1>
          <p className="mt-3 text-sm leading-6 text-blue-100">
            Search help articles, browse topics, or raise a ticket for application, payment, and
            document support.
          </p>
          <div className="mt-6 flex flex-wrap gap-3">
            <Button
              type="button"
              className="bg-white text-[#2563EB] hover:bg-white/95"
              onClick={() => openRaiseTicket()}
            >
              <MessageSquarePlus className="mr-2 h-4 w-4" />
              Raise a Ticket
            </Button>
            {isAuthenticated ? (
              <Link to="/help/tickets">
                <Button type="button" variant="outline" className="border-white/40 text-white hover:bg-white/10">
                  My Tickets
                </Button>
              </Link>
            ) : null}
          </div>
        </div>
        <Headphones className="absolute top-6 right-6 hidden h-24 w-24 text-white/15 sm:block" />
      </div>

      <div className="rounded-2xl border border-[#E8EDF5] bg-white p-6 shadow-sm">
        <div className="relative">
          <Search className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-[#94A3B8]" />
          <Input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search help articles, common queries, and procedures…"
            className="pl-10"
          />
        </div>
      </div>

      <section>
        <h2 className="mb-4 text-lg font-semibold text-[#0A1629]">Popular Help Topics</h2>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {HELP_TOPICS.map(topic => {
            const Icon = TOPIC_ICONS[topic.icon as keyof typeof TOPIC_ICONS] ?? Grid3X3;
            return (
              <button
                key={topic.id}
                type="button"
                onClick={() => setSearch(topic.title)}
                className="rounded-2xl border border-[#E8EDF5] bg-white p-5 text-left shadow-sm transition hover:border-[#2563EB]/30"
              >
                <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#EFF6FF] text-[#2563EB]">
                  <Icon className="h-5 w-5" />
                </span>
                <p className="mt-3 font-semibold text-[#0A1629]">{topic.title}</p>
                <p className="mt-1 text-xs leading-5 text-[#64748B]">{topic.description}</p>
                <span className="mt-3 inline-block text-xs font-semibold text-[#2563EB]">
                  Browse Articles →
                </span>
              </button>
            );
          })}
        </div>
      </section>

      <section className="rounded-2xl border border-[#E8EDF5] bg-white p-6 shadow-sm">
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
          <h2 className="text-lg font-semibold text-[#0A1629]">Frequently Asked Questions</h2>
          <Button type="button" variant="outline" size="sm" onClick={() => openRaiseTicket()}>
            Raise a Ticket
          </Button>
        </div>
        <div className="divide-y divide-[#F1F5F9]">
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
                    <Minus className="h-4 w-4 shrink-0 text-[#94A3B8]" />
                  ) : (
                    <Plus className="h-4 w-4 shrink-0 text-[#94A3B8]" />
                  )}
                </button>
                {open ? (
                  <p className="mt-3 text-sm leading-6 text-[#64748B]">{item.answer}</p>
                ) : null}
              </div>
            );
          })}
        </div>
      </section>

      {isAuthenticated ? (
        <section className="rounded-2xl border border-[#E8EDF5] bg-white p-6 shadow-sm">
          <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
            <h2 className="text-lg font-semibold text-[#0A1629]">Your Support Tickets</h2>
            <div className="flex gap-2">
              <Link to="/help/tickets">
                <Button type="button" variant="outline" size="sm">
                  View All
                </Button>
              </Link>
              <Button type="button" size="sm" onClick={() => openRaiseTicket()}>
                Raise a Ticket
              </Button>
            </div>
          </div>
          {(ticketsData?.data.length ?? 0) === 0 ? (
            <p className="text-sm text-[#64748B]">
              No tickets yet. Raise one if you need help with an application, payment, or document.
            </p>
          ) : (
            <ul className="space-y-3">
              {ticketsData!.data.map(ticket => (
                <li key={ticket.id}>
                  <Link
                    to={`/help/tickets/${ticket.id}`}
                    className="flex items-center justify-between gap-4 rounded-xl border border-[#F1F5F9] px-4 py-3 transition hover:border-[#2563EB]/30"
                  >
                    <div className="min-w-0">
                      <p className="truncate text-sm font-medium text-[#0A1629]">{ticket.subject}</p>
                      <p className="text-xs text-[#94A3B8]">
                        Updated {formatDate(ticket.updatedAt)}
                      </p>
                    </div>
                    <span className="shrink-0 text-xs font-semibold capitalize text-[#2563EB]">
                      {ticketStatusLabel(ticket.status)}
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </section>
      ) : null}

      <section>
        <h2 className="mb-4 text-lg font-semibold text-[#0A1629]">Still Need Help?</h2>
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="rounded-2xl border border-[#BFDBFE] bg-[#F8FAFC] p-6">
            <MessageCircle className="h-8 w-8 text-[#2563EB]" />
            <h3 className="mt-3 font-semibold text-[#0A1629]">Live Chat Support</h3>
            <p className="mt-2 text-sm text-[#64748B]">
              Connect with a support agent for real-time help with applications and payments.
            </p>
            <Button type="button" className="mt-4" onClick={() => openRaiseTicket()}>
              Raise a Ticket
            </Button>
          </div>
          <div className="rounded-2xl border border-emerald-200 bg-emerald-50/50 p-6">
            <Phone className="h-8 w-8 text-emerald-600" />
            <h3 className="mt-3 font-semibold text-[#0A1629]">Call 1800-CSC-HELP</h3>
            <p className="mt-2 text-sm text-[#64748B]">Mon–Sat, 8 AM – 8 PM IST · Toll-free</p>
            <Button
              type="button"
              variant="outline"
              className="mt-4 border-emerald-300 text-emerald-700"
              onClick={() => toast.info('Dial 1800-CSC-HELP from your phone')}
            >
              Call Toll-Free
            </Button>
          </div>
        </div>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          {[
            { icon: Mail, label: 'Email Support', value: 'support@cybersave.gov.in' },
            { icon: MapPin, label: 'Find Nearest Center', value: 'Locate CSC', action: () => toast.info('Center locator coming soon') },
          ].map(item => {
            const Icon = item.icon;
            return (
              <button
                key={item.label}
                type="button"
                onClick={item.action}
                className="rounded-2xl border border-[#E8EDF5] bg-white p-5 text-left shadow-sm transition hover:border-[#2563EB]/30"
              >
                <Icon className="h-5 w-5 text-[#2563EB]" />
                <p className="mt-3 text-xs text-[#94A3B8]">{item.label}</p>
                <p className="mt-1 text-sm font-bold text-[#2563EB]">{item.value}</p>
              </button>
            );
          })}
        </div>
      </section>

      <SecurityNoticeFull />

      <RaiseTicketModal
        open={showTicket}
        onOpenChange={setShowTicket}
        defaultSubject={ticketSubject}
        defaultContent={ticketContent}
      />
    </div>
  );
}
