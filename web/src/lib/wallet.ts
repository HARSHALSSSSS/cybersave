const BALANCE_KEY = 'cybersave_wallet_balance';

export function getWalletBalance(): number {
  const raw = localStorage.getItem(BALANCE_KEY);
  const n = raw ? Number(raw) : 0;
  return Number.isFinite(n) ? n : 0;
}

export function addWalletBalance(amount: number): number {
  const next = getWalletBalance() + amount;
  localStorage.setItem(BALANCE_KEY, String(next));
  return next;
}
