export const STORAGE_KEYS = {
  profile: 'edupay_profile_v2',
  balance: 'edupay_balance_v2',
  history: 'edupay_history_v2',
  seeded: 'edupay_history_seeded_v2',
};

export const DEFAULT_PROFILE = { name: 'You', upiId: 'you@edu' };
export const DEFAULT_BALANCE = 5000;

export const DEMO_MERCHANTS = [
  ['Google India Private Limited', 'google@citi', 500],
  ['Campus Canteen', 'canteen@edu', 250],
  ['Amazon Pay', 'amazon@pay', 799],
  ['Reliance Jio', 'jio@upi', 299],
  ['College Fees', 'college@edu', 1500],
  ['Electricity Bill', 'electricity@bill', 640],
  ['Swiggy', 'swiggy@upi', 425],
  ['Book Store', 'books@edu', 180],
  ['Travel Desk', 'travel@edu', 350],
  ['Hostel Mess', 'mess@edu', 1200],
  ['PhonePe Wallet', 'wallet@upi', 500],
  ['Movie Tickets', 'movies@upi', 320],
  ['Medical Store', 'medical@upi', 275],
  ['Food Court', 'food@edu', 210],
  ['Recharge', 'recharge@upi', 199],
];

export function readJSON(key, fallback) {
  if (typeof window === 'undefined') return fallback;
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch {
    return fallback;
  }
}

export function getProfile() {
  return { ...DEFAULT_PROFILE, ...readJSON(STORAGE_KEYS.profile, {}) };
}

export function saveProfile(profile) {
  if (typeof window === 'undefined') return;
  localStorage.setItem(STORAGE_KEYS.profile, JSON.stringify(profile));
}

export function getBalance() {
  if (typeof window === 'undefined') return DEFAULT_BALANCE;
  const value = Number(localStorage.getItem(STORAGE_KEYS.balance));
  return Number.isFinite(value) ? value : DEFAULT_BALANCE;
}

export function saveBalance(value) {
  if (typeof window === 'undefined') return;
  localStorage.setItem(STORAGE_KEYS.balance, String(Math.max(0, Number(value) || 0)));
}

export function getHistory() {
  const history = readJSON(STORAGE_KEYS.history, []);
  return Array.isArray(history) ? history : [];
}

export function saveHistory(history) {
  if (typeof window === 'undefined') return;
  localStorage.setItem(STORAGE_KEYS.history, JSON.stringify(history.slice(0, 50)));
}

export function addHistory(entry) {
  saveHistory([entry, ...getHistory()]);
}

export function seedDemoHistory() {
  if (typeof window === 'undefined') return;
  if (getHistory().length || localStorage.getItem(STORAGE_KEYS.seeded) === '1') return;
  const now = Date.now();
  const history = DEMO_MERCHANTS.map(([name, upiId, amount], index) => ({
    type: 'sent',
    name,
    upiId,
    amount,
    time: new Date(now - (index + 1) * 86400000).toISOString(),
    txnId: `DEMOSEED${String(index + 1).padStart(3, '0')}`,
  }));
  saveHistory(history);
  localStorage.setItem(STORAGE_KEYS.seeded, '1');
}

export function formatINR(value) {
  return `₹${Number(value || 0).toLocaleString('en-IN')}`;
}

export function makeTransactionId() {
  return `DEMO${Math.random().toString(36).slice(2, 12).toUpperCase()}`;
}
