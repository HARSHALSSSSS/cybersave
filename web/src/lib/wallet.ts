const BALANCE_KEY = 'cybersave_wallet_balance';
const TOPUPS_KEY = 'cybersave_wallet_topups';

export interface WalletTopUp {
  id: string;
  amount: number;
  createdAt: string;
}

export function getWalletBalance(): number {
  const raw = localStorage.getItem(BALANCE_KEY);
  const n = raw ? Number(raw) : 0;
  return Number.isFinite(n) ? n : 0;
}

export function getWalletTopUps(): WalletTopUp[] {
  try {
    const raw = localStorage.getItem(TOPUPS_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as WalletTopUp[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function getLastTopUpDate(): string | null {
  const topups = getWalletTopUps();
  return topups[0]?.createdAt ?? null;
}

export function addWalletTopUp(amount: number): number {
  const next = getWalletBalance() + amount;
  localStorage.setItem(BALANCE_KEY, String(next));
  const topups = getWalletTopUps();
  topups.unshift({
    id: `topup-${Date.now()}`,
    amount,
    createdAt: new Date().toISOString(),
  });
  localStorage.setItem(TOPUPS_KEY, JSON.stringify(topups.slice(0, 20)));
  return next;
}

/** @deprecated use addWalletTopUp */
export function addWalletBalance(amount: number): number {
  return addWalletTopUp(amount);
}
