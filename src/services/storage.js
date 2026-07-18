import AsyncStorage from '@react-native-async-storage/async-storage';
import { format } from 'date-fns';

const KEYS = {
  EXPENSES:  'expenses_v1',
  BUDGETS:   'budgets_v1',
  SETTINGS:  'settings_v1',
  STREAK:    'streak_v1',
};

// ── Expenses ──────────────────────────────────────────────────────────────────
export async function saveExpense(expense) {
  const all = await getAllExpenses();
  const entry = {
    id:        Date.now().toString(),
    timestamp: new Date().toISOString(),
    date:      format(new Date(), 'dd-MMM-yyyy'),
    dayKey:    format(new Date(), 'yyyy-MM-dd'),
    month:     format(new Date(), 'MMM-yyyy'),
    ...expense,
  };
  all.unshift(entry);
  await AsyncStorage.setItem(KEYS.EXPENSES, JSON.stringify(all));
  await updateStreak();
  return entry;
}

export async function getAllExpenses() {
  const raw = await AsyncStorage.getItem(KEYS.EXPENSES);
  return raw ? JSON.parse(raw) : [];
}

export async function getExpensesByMonth(monthKey) {
  const all = await getAllExpenses();
  return all.filter(e => e.month === monthKey);
}

export async function getExpensesByDay(dayKey) {
  const all = await getAllExpenses();
  return all.filter(e => e.dayKey === dayKey);
}

export async function getTodayExpenses() {
  const today = format(new Date(), 'yyyy-MM-dd');
  return getExpensesByDay(today);
}

export async function deleteExpense(id) {
  const all = await getAllExpenses();
  const filtered = all.filter(e => e.id !== id);
  await AsyncStorage.setItem(KEYS.EXPENSES, JSON.stringify(filtered));
}

export async function getLastExpense() {
  const all = await getAllExpenses();
  return all[0] || null;
}

// ── Summary helpers ───────────────────────────────────────────────────────────
export async function getTodaySummary() {
  const expenses = await getTodayExpenses();
  return buildSummary(expenses);
}

export async function getMonthSummary(monthKey) {
  const expenses = await getExpensesByMonth(monthKey);
  return buildSummary(expenses);
}

function buildSummary(expenses) {
  const summary = {
    transport: 0, food: 0, home: 0,
    rent: 0, personal: 0, others: 0, total: 0,
  };
  expenses.forEach(e => {
    const cat = e.category || 'others';
    summary[cat] = (summary[cat] || 0) + Number(e.amount);
    summary.total += Number(e.amount);
  });
  return summary;
}

// ── Budgets ───────────────────────────────────────────────────────────────────
const DEFAULT_BUDGETS = {
  transport: 300,
  food:      400,
  home:      500,
  rent:      0,
  personal:  300,
  others:    600,
  monthly:   2500,
};

export async function getBudgets() {
  const raw = await AsyncStorage.getItem(KEYS.BUDGETS);
  return raw ? { ...DEFAULT_BUDGETS, ...JSON.parse(raw) } : DEFAULT_BUDGETS;
}

export async function saveBudgets(budgets) {
  await AsyncStorage.setItem(KEYS.BUDGETS, JSON.stringify(budgets));
}

// ── Settings ──────────────────────────────────────────────────────────────────
const DEFAULT_SETTINGS = {
  name:              'Avudaiappan',
  currency:          '₹',
  language:          'en',
  voiceConfirm:      true,
  dailyReminder:     true,
  reminderTime:      '21:00',
  sheetsSync:        false,
  sheetsId:          '',
  haptics:           true,
  quickSave:         false,
};

export async function getSettings() {
  const raw = await AsyncStorage.getItem(KEYS.SETTINGS);
  return raw ? { ...DEFAULT_SETTINGS, ...JSON.parse(raw) } : DEFAULT_SETTINGS;
}

export async function saveSettings(settings) {
  await AsyncStorage.setItem(KEYS.SETTINGS, JSON.stringify(settings));
}

// ── Streak ────────────────────────────────────────────────────────────────────
export async function updateStreak() {
  const raw = await AsyncStorage.getItem(KEYS.STREAK);
  const streak = raw ? JSON.parse(raw) : { count: 0, lastDate: null };
  const today = format(new Date(), 'yyyy-MM-dd');
  if (streak.lastDate !== today) {
    streak.count = streak.lastDate === format(
      new Date(Date.now() - 86400000), 'yyyy-MM-dd'
    ) ? streak.count + 1 : 1;
    streak.lastDate = today;
    await AsyncStorage.setItem(KEYS.STREAK, JSON.stringify(streak));
  }
  return streak;
}

export async function getStreak() {
  const raw = await AsyncStorage.getItem(KEYS.STREAK);
  return raw ? JSON.parse(raw) : { count: 0, lastDate: null };
}

export async function clearAll() {
  await AsyncStorage.multiRemove(Object.values(KEYS));
}
