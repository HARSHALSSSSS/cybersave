import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import {
  ArrowDownLeft,
  ArrowUpRight,
  FileText,
  Lock,
  Plus,
  RefreshCw,
  Wallet as WalletIcon,
} from 'lucide-react';
import { toast } from 'sonner';
import { Breadcrumbs } from '@/components/layout/Breadcrumbs';
import { Button } from '@/components/ui/button';
import { LoadingBlock, EmptyState } from '@/components/ui/primitives';
import { SecurityNoticeFull } from '@/features/apply/components/SecurityNotice';
import {
  billPaymentsApi,
  billPaymentsQueryKeys,
  paymentsApi,
  paymentsQueryKeys,
} from '@/services/api';
import { addWalletBalance, getWalletBalance } from '@/lib/wallet';
import { formatCurrency, formatDate } from '@/lib/utils';

export function WalletPage() {
  const [balance, setBalance] = useState(getWalletBalance());
  const [showAdd, setShowAdd] = useState(false);
  const [addAmount, setAddAmount] = useState('500');

  const { data: billHistory, isLoading: billsLoading } = useQuery({
    queryKey: billPaymentsQueryKeys.history('all', 1),
    queryFn: () => billPaymentsApi.getBillPaymentHistory({ page: 1, limit: 10 }),
    staleTime: 0,
  });

  const { data: servicePayments = [], isLoading: paymentsLoading } = useQuery({
    queryKey: paymentsQueryKeys.list(),
    queryFn: () => paymentsApi.listCitizenPayments(),
    staleTime: 0,
  });

  const billTx = billHistory?.data ?? [];
  const isLoadingTx = billsLoading || paymentsLoading;
  const walletTransactions = [
    ...billTx.map(tx => ({
      id: `bill-${tx.id}`,
      title: `${tx.biller.name} Bill Payment`,
      date: tx.paidAt ?? tx.createdAt,
      amount: tx.totalAmount,
      kind: 'bill' as const,
    })),
    ...servicePayments.map(tx => ({
      id: `svc-${tx.id}`,
      title: tx.serviceName,
      date: tx.createdAt,
      amount: tx.amount,
      kind: 'service' as const,
      publicRef: tx.publicRef,
    })),
  ].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  function handleAddMoney() {
    const amount = Number(addAmount);
    if (!Number.isFinite(amount) || amount <= 0) {
      toast.error('Enter a valid amount');
      return;
    }
    setBalance(addWalletBalance(amount));
    setShowAdd(false);
    toast.success(`₹${amount} added to wallet`);
  }

  return (
    <div className="space-y-6">
      <Breadcrumbs items={[{ label: 'Portal', to: '/' }, { label: 'Cybersave Digital Wallet' }]} />

      <div>
        <h1 className="font-display text-3xl font-bold text-[#0A1629]">Cybersave Digital Wallet</h1>
        <p className="mt-2 text-sm text-[#6B7280]">
          Securely fund, manage, and trace all government service fees and transaction clearances.
        </p>
      </div>

      <div
        className="relative overflow-hidden rounded-2xl p-6 text-white sm:p-8"
        style={{ background: 'linear-gradient(135deg, #1A3B8B 0%, #2563EB 55%, #3B82F6 100%)' }}
      >
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-widest text-white/75">
              Available Digital Balance
            </p>
            <p className="mt-2 font-display text-4xl font-bold">{formatCurrency(balance)}</p>
            <p className="mt-4 flex items-center gap-2 text-xs text-white/80">
              <Lock className="h-3.5 w-3.5" />
              Secured by Cybersave Digital Trust · 256-bit encryption
            </p>
          </div>
          <button
            type="button"
            onClick={() => setShowAdd(true)}
            className="flex h-12 w-12 items-center justify-center rounded-full bg-white text-[#2563EB] shadow-lg"
            aria-label="Add money"
          >
            <Plus className="h-6 w-6" />
          </button>
        </div>
      </div>

      {showAdd ? (
        <div className="rounded-2xl border border-[#E5E7EB] bg-white p-5 shadow-sm">
          <h2 className="font-semibold text-[#0A1629]">Add Money to Wallet</h2>
          <p className="mt-1 text-sm text-[#6B7280]">
            Demo top-up stored locally until wallet APIs are available on the backend.
          </p>
          <div className="mt-4 flex flex-wrap gap-3">
            <input
              type="number"
              value={addAmount}
              onChange={e => setAddAmount(e.target.value)}
              className="h-11 w-40 rounded-xl border border-[#E5E7EB] px-3 text-sm"
            />
            <Button type="button" onClick={handleAddMoney}>
              Confirm Add
            </Button>
            <Button type="button" variant="ghost" onClick={() => setShowAdd(false)}>
              Cancel
            </Button>
          </div>
        </div>
      ) : null}

      <div className="grid gap-4 sm:grid-cols-3">
        {[
          { label: 'Add Money', icon: Plus, action: () => setShowAdd(true) },
          { label: 'Transactions', icon: RefreshCw, action: () => undefined },
          { label: 'Refund Details', icon: ArrowDownLeft, action: () => toast.info('Refund tracking coming soon') },
        ].map(item => {
          const Icon = item.icon;
          return (
            <button
              key={item.label}
              type="button"
              onClick={item.action}
              className="flex flex-col items-center gap-3 rounded-2xl border border-[#E5E7EB] bg-white p-6 shadow-sm transition hover:border-[#2563EB]/30"
            >
              <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#EFF6FF] text-[#2563EB]">
                <Icon className="h-5 w-5" />
              </span>
              <span className="text-sm font-semibold text-[#0A1629]">{item.label}</span>
            </button>
          );
        })}
      </div>

      <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
        <section className="rounded-2xl border border-[#E5E7EB] bg-white p-5 shadow-sm">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="font-semibold text-[#0A1629]">Recent Transactions</h2>
            <span className="text-sm font-medium text-[#2563EB]">View All History</span>
          </div>

          {isLoadingTx ? (
            <LoadingBlock className="h-32" />
          ) : walletTransactions.length === 0 ? (
            <EmptyState
              title="No transactions yet"
              description="Bill payments and service fees will appear here."
              className="py-8"
            />
          ) : (
            <ul className="divide-y divide-[#F3F4F6]">
              {walletTransactions.map(tx => (
                <li key={tx.id} className="flex items-center justify-between gap-4 py-4">
                  <div className="flex items-center gap-3">
                    <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-red-50 text-red-600">
                      {tx.kind === 'service' ? (
                        <FileText className="h-4 w-4" />
                      ) : (
                        <ArrowUpRight className="h-4 w-4" />
                      )}
                    </span>
                    <div>
                      <p className="text-sm font-semibold text-[#0A1629]">{tx.title}</p>
                      <p className="text-xs text-[#9CA3AF]">
                        {tx.kind === 'service'
                          ? `Application fee${tx.publicRef ? ` · ${tx.publicRef}` : ''} · ${formatDate(tx.date)}`
                          : formatDate(tx.date)}
                      </p>
                    </div>
                  </div>
                  <p className="text-sm font-semibold text-[#0A1629]">
                    − {formatCurrency(tx.amount)}
                  </p>
                </li>
              ))}
            </ul>
          )}
        </section>

        <section className="rounded-2xl border border-[#E5E7EB] bg-white p-5 shadow-sm">
          <h2 className="font-semibold text-[#0A1629]">Linked Payment Methods</h2>
          <div className="mt-6 flex flex-col items-center py-8 text-center">
            <WalletIcon className="h-10 w-10 text-[#CBD5E1]" />
            <p className="mt-3 text-sm font-medium text-[#0A1629]">No linked accounts</p>
            <p className="mt-1 text-xs text-[#9CA3AF]">
              Link a bank account when payment methods API is enabled.
            </p>
            <Button type="button" variant="outline" className="mt-4 border-[#2563EB] text-[#2563EB]" disabled>
              Link Another Bank Account
            </Button>
          </div>
        </section>
      </div>

      <SecurityNoticeFull />
    </div>
  );
}
