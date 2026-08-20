import { Transaction } from '@/database/models';
import { getStartOfPeriod, addPeriod, PeriodKey } from '@/utils';

export interface CategoryTotal {
  name: string;
  value: number;
}

export interface PeriodTotal {
  label: string;
  income: number;
  expense: number;
}

export function expenseByCategory(transactions: Transaction[]): CategoryTotal[] {
  const map = new Map<string, number>();
  for (const t of transactions) {
    if (t.type !== 'expense') continue;
    map.set(t.category, (map.get(t.category) ?? 0) + t.amount);
  }
  return [...map.entries()]
    .map(([name, value]) => ({ name, value }))
    .sort((a, b) => b.value - a.value);
}

function periodLabel(period: PeriodKey, start: Date): string {
  switch (period) {
    case 'year':
      return start.toLocaleDateString('id-ID', { year: 'numeric' });
    case 'month':
      return start.toLocaleDateString('id-ID', { month: 'short' });
    default:
      return start.toLocaleDateString('id-ID', { day: 'numeric', month: 'short' });
  }
}

export function periodTotals(
  transactions: Transaction[],
  period: PeriodKey,
  count: number,
  referenceDate: Date = new Date()
): PeriodTotal[] {
  const current = getStartOfPeriod(period, referenceDate);
  const buckets: (PeriodTotal & { start: number; end: number })[] = [];

  for (let i = count - 1; i >= 0; i--) {
    const start = addPeriod(period, current, -i);
    const end = addPeriod(period, start, 1).getTime();
    buckets.push({
      label: periodLabel(period, start),
      income: 0,
      expense: 0,
      start: start.getTime(),
      end,
    });
  }

  for (const t of transactions) {
    const time = new Date(t.date).getTime();
    const bucket = buckets.find((b) => time >= b.start && time < b.end);
    if (!bucket) continue;
    if (t.type === 'income') bucket.income += t.amount;
    else bucket.expense += t.amount;
  }

  return buckets.map(({ label, income, expense }) => ({ label, income, expense }));
}

export function csvFromTransactions(transactions: Transaction[]): string {
  const header = 'date,type,amount,description,category,notes';
  const escape = (value: string) => `"${value.replace(/"/g, '""')}"`;
  const rows = transactions.map((t) =>
    [
      new Date(t.date).toISOString(),
      t.type,
      t.amount,
      escape(t.description),
      escape(t.category),
      escape(t.notes ?? ''),
    ].join(',')
  );
  return [header, ...rows].join('\n');
}
