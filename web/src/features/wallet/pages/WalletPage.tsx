import { useMemo, useState } from 'react';
import { Link } from 'react-router';
import { useQuery } from '@tanstack/react-query';
import {
  ChevronDown,
  Headphones,
  Mail,
  Phone,
  Plus,
  Wallet as WalletIcon,
} from 'lucide-react';
import { toast } from 'sonner';
import { Breadcrumbs } from '@/components/layout/Breadcrumbs';
import { Button } from '@/components/ui/button';
import { StatusPill } from '@/components/ui/portal-primitives';
import { LoadingBlock, EmptyState } from '@/components/ui/primitives';
import {
  billPaymentsApi,
  billPaymentsQueryKeys,
  paymentsApi,
  paymentsQueryKeys,
} from '@/services/api';
import { addWalletTopUp, getLastTopUpDate, getWalletBalance } from '@/lib/wallet';
import { formatCurrency, formatDate } from '@/lib/utils';

type TxFilter = 'all' | 'success' | 'pending' | 'failed';

function paymentStatusTone(status: string): 'green' | 'amber' | 'red' | 'slate' {
  const s = status.toLowerCase();
  if (s === 'success' || s === 'captured') return 'green';
  if (s === 'pending' || s === 'processing') return 'amber';
  if (s === 'failed') return 'red';
  return 'slate';
}

export function WalletPage() {
  const [balance, setBalance] = useState(getWalletBalance());
  const [showAdd, setShowAdd] = useState(false);
  const [addAmount, setAddAmount] = useState('5000');
  const [filter, setFilter] = useState<TxFilter>('all');

  const { data: billHistory, isLoading: billsLoading } = useQuery({
    queryKey: billPaymentsQueryKeys.history('all', 1),
    queryFn: () => billPaymentsApi.getBillPaymentHistory({ page: 1, limit: 50 }),
    staleTime: 0,
  });

  const { data: servicePayments = [], isLoading: paymentsLoading } = useQuery({
    queryKey: paymentsQueryKeys.list(),
    queryFn: () => paymentsApi.listCitizenPayments(),
    staleTime: 0,
  });

  const walletTransactions = useMemo(() => {
    const billTx = billHistory?.data ?? [];
    return [
      ...billTx.map(tx => ({
        id: `bill-${tx.id}`,
        title: `${tx.biller.name} Bill Payment`,
        subtitle: tx.orderId ?? tx.id,
        date: tx.paidAt ?? tx.createdAt,
        amount: tx.totalAmount,
        kind: 'bill' as const,
        status: tx.status,
      })),
      ...servicePayments.map(tx => ({
        id: `svc-${tx.id}`,
        title: tx.serviceName,
        subtitle: tx.publicRef ?? tx.applicationId,
        date: tx.createdAt,
        amount: tx.amount,
        kind: 'service' as const,
        status: tx.status.toLowerCase(),
      })),
    ].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }, [billHistory?.data, servicePayments]);

  const filteredTx = walletTransactions.filter(tx => {
    if (filter === 'all') return true;
    const s = tx.status.toLowerCase();
    if (filter === 'success') return s === 'success' || s === 'captured';
    if (filter === 'pending') return s === 'pending' || s === 'processing';
    if (filter === 'failed') return s === 'failed';
    return true;
  });

  const now = new Date();
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
  const totalSpentMonth = walletTransactions
    .filter(tx => new Date(tx.date) >= monthStart)
    .reduce((sum, tx) => sum + Number(tx.amount), 0);
  const pendingSettlements = walletTransactions
    .filter(tx => ['pending', 'processing'].includes(tx.status.toLowerCase()))
    .reduce((sum, tx) => sum + Number(tx.amount), 0);
  const lastTxDate = walletTransactions[0]?.date;

  const isLoadingTx = billsLoading || paymentsLoading;
  const lastTopUp = getLastTopUpDate();

  function handleAddMoney() {
    const amount = Number(addAmount);
    if (!Number.isFinite(amount) || amount <= 0) {
      toast.error('Enter a valid amount');
      return;
    }
    setBalance(addWalletTopUp(amount));
    setShowAdd(false);
    toast.success(`${formatCurrency(amount)} added to wallet`);
  }

  return (
    <div className="space-y-6 pb-8">
      <Breadcrumbs items={[{ label: 'Home', to: '/' }, { label: 'My Wallet' }]} />

      <div>
        <span className="inline-flex rounded-full bg-[#EFF6FF] px-3 py-1 text-[11px] font-bold tracking-wide text-[#2563EB] uppercase">
          Fintech Services
        </span>
        <h1 className="mt-3 font-display text-3xl font-bold tracking-tight text-[#0A1629]">
          My Wallet
        </h1>
        <p className="mt-2 max-w-2xl text-sm leading-6 text-[#64748B]">
          Manage your balance, view transaction history, and recharge for government service and
          CSC-assisted payments.
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
        <div className="space-y-6">
          <div
            className="relative overflow-hidden rounded-2xl p-6 text-white sm:p-8"
            style={{ background: 'linear-gradient(135deg, #1A3B8B 0%, #2563EB 55%, #3B82F6 100%)' }}
          >
            <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
              <div>
                <p className="text-xs font-semibold tracking-widest text-white/75 uppercase">
                  Available Balance
                </p>
                <p className="mt-2 font-display text-4xl font-bold sm:text-5xl">
                  {formatCurrency(balance)}
                </p>
                <div className="mt-4 flex flex-wrap gap-x-6 gap-y-1 text-xs text-white/80">
                  {lastTopUp ? (
                    <span>Last Recharge: {formatDate(lastTopUp, 'long')}</span>
                  ) : null}
                  <span>Linked Account: Demo wallet (local)</span>
                </div>
              </div>
              <Button
                type="button"
                className="h-11 shrink-0 bg-white text-[#2563EB] hover:bg-white/95"
                onClick={() => setShowAdd(true)}
              >
                Recharge Wallet
              </Button>
            </div>
          </div>

          {showAdd ? (
            <div className="rounded-2xl border border-[#E8EDF5] bg-white p-5 shadow-sm">
              <h2 className="font-semibold text-[#0A1629]">Recharge Wallet</h2>
              <p className="mt-1 text-sm text-[#64748B]">
                Top-up is stored locally until wallet APIs are connected on the backend.
              </p>
              <div className="mt-4 flex flex-wrap gap-3">
                <input
                  type="number"
                  value={addAmount}
                  onChange={e => setAddAmount(e.target.value)}
                  className="h-11 w-40 rounded-xl border border-[#E8EDF5] px-3 text-sm outline-none focus:border-[#2563EB]"
                />
                <Button type="button" onClick={handleAddMoney}>
                  Confirm Recharge
                </Button>
                <Button type="button" variant="ghost" onClick={() => setShowAdd(false)}>
                  Cancel
                </Button>
              </div>
            </div>
          ) : null}

          <section className="rounded-2xl border border-[#E8EDF5] bg-white p-5 shadow-sm">
            <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
              <h2 className="font-semibold text-[#0A1629]">Recent Transactions</h2>
              <div className="relative">
                <select
                  value={filter}
                  onChange={e => setFilter(e.target.value as TxFilter)}
                  className="appearance-none rounded-lg border border-[#E8EDF5] bg-white py-2 pr-8 pl-3 text-sm font-medium text-[#2563EB] outline-none"
                >
                  <option value="all">All transactions</option>
                  <option value="success">Successful</option>
                  <option value="pending">Pending</option>
                  <option value="failed">Failed</option>
                </select>
                <ChevronDown className="pointer-events-none absolute top-1/2 right-2 h-4 w-4 -translate-y-1/2 text-[#2563EB]" />
              </div>
            </div>

            {isLoadingTx ? (
              <LoadingBlock className="h-32" />
            ) : filteredTx.length === 0 ? (
              <EmptyState
                title="No transactions yet"
                description="Bill payments and service fees will appear here."
                className="py-8"
              />
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full min-w-[520px] text-left text-sm">
                  <thead>
                    <tr className="border-b border-[#F1F5F9] text-xs font-semibold text-[#94A3B8] uppercase">
                      <th className="pb-3 pr-4">Date</th>
                      <th className="pb-3 pr-4">Description / TX ID</th>
                      <th className="pb-3 pr-4">Amount</th>
                      <th className="pb-3">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#F1F5F9]">
                    {filteredTx.map(tx => (
                      <tr key={tx.id}>
                        <td className="py-4 pr-4 whitespace-nowrap text-[#64748B]">
                          {formatDate(tx.date)}
                        </td>
                        <td className="py-4 pr-4">
                          <p className="font-semibold text-[#0A1629]">{tx.title}</p>
                          <p className="text-xs text-[#94A3B8]">{tx.subtitle}</p>
                        </td>
                        <td className="py-4 pr-4 font-semibold text-[#0A1629]">
                          − {formatCurrency(tx.amount)}
                        </td>
                        <td className="py-4">
                          <StatusPill tone={paymentStatusTone(tx.status)}>
                            {tx.status.replace(/_/g, ' ')}
                          </StatusPill>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </section>
        </div>

        <aside className="space-y-5">
          <div className="rounded-2xl bg-[#0A1629] p-5 text-white shadow-lg">
            <h3 className="font-display text-lg font-bold">Wallet Summary</h3>
            <ul className="mt-5 space-y-4">
              {[
                { label: 'Total Spent (This Month)', value: formatCurrency(totalSpentMonth) },
                { label: 'Pending Settlements', value: formatCurrency(pendingSettlements) },
                {
                  label: 'Last Transaction',
                  value: lastTxDate ? formatDate(lastTxDate, 'long') : '—',
                },
              ].map(row => (
                <li key={row.label} className="flex items-center justify-between gap-3 text-sm">
                  <span className="text-[#94A3B8]">{row.label}</span>
                  <span className="font-semibold">{row.value}</span>
                </li>
              ))}
            </ul>
            <p className="mt-5 text-[10px] leading-5 text-[#64748B]">
              Transaction ledger includes BBPS bill payments and application service fees from your
              Cybersave account.
            </p>
          </div>

          <div className="rounded-2xl border border-[#BFDBFE] bg-[#F8FAFC] p-5">
            <span className="inline-flex rounded-full bg-[#EFF6FF] px-2.5 py-0.5 text-[10px] font-bold text-[#2563EB] uppercase">
              CSC Assistance
            </span>
            <h3 className="mt-3 font-semibold text-[#0A1629]">Need Help?</h3>
            <ul className="mt-4 space-y-3 text-sm">
              <li className="flex items-center gap-2 text-[#64748B]">
                <Phone className="h-4 w-4 text-[#2563EB]" />
                1800-CSC-HELP
              </li>
              <li className="flex items-center gap-2 text-[#64748B]">
                <Mail className="h-4 w-4 text-[#2563EB]" />
                wallet-support@cybersave.gov.in
              </li>
            </ul>
            <Link
              to="/help"
              className="mt-4 inline-flex items-center gap-1 text-sm font-semibold text-[#2563EB] hover:underline"
            >
              <Headphones className="h-4 w-4" />
              View Wallet FAQs
            </Link>
          </div>

          <div className="rounded-2xl border border-[#E8EDF5] bg-white p-5 shadow-sm">
            <div className="flex flex-col items-center py-4 text-center">
              <WalletIcon className="h-10 w-10 text-[#CBD5E1]" />
              <p className="mt-3 text-sm font-medium text-[#0A1629]">Quick recharge</p>
              <button
                type="button"
                onClick={() => setShowAdd(true)}
                className="mt-3 flex h-11 w-11 items-center justify-center rounded-full bg-[#EFF6FF] text-[#2563EB]"
                aria-label="Add money"
              >
                <Plus className="h-5 w-5" />
              </button>
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}
