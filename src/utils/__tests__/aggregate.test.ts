import { expenseByCategory, csvFromTransactions, periodTotals } from '@/utils/aggregate';
import { Transaction } from '@/database/models';

function tx(partial: Partial<Transaction>): Transaction {
  return {
    id: partial.id ?? '1',
    amount: partial.amount ?? 0,
    description: partial.description ?? 'x',
    category: partial.category ?? 'Makanan',
    type: partial.type ?? 'expense',
    date: partial.date ?? new Date('2026-01-01'),
    notes: partial.notes,
    createdAt: new Date(),
    updatedAt: new Date(),
  };
}

describe('expenseByCategory', () => {
  it('groups and sorts expense totals descending', () => {
    const list = [
      tx({ category: 'Makanan', amount: 10000 }),
      tx({ category: 'Transportasi', amount: 5000 }),
      tx({ category: 'Makanan', amount: 20000 }),
      tx({ category: 'Gaji', amount: 1000000, type: 'income' }),
    ];
    expect(expenseByCategory(list)).toEqual([
      { name: 'Makanan', value: 30000 },
      { name: 'Transportasi', value: 5000 },
    ]);
  });

  it('returns empty array when no expenses', () => {
    expect(expenseByCategory([tx({ type: 'income', amount: 100 })])).toEqual([]);
  });
});

describe('csvFromTransactions', () => {
  it('writes header and escapes quotes', () => {
    const csv = csvFromTransactions([tx({ description: 'Makan "bakso"' })]);
    expect(csv).toContain('date,type,amount,description,category,notes');
    expect(csv).toContain('"Makan ""bakso"""');
  });
});

describe('periodTotals', () => {
  it('buckets income and expense into the current month bucket', () => {
    const now = new Date();
    const totals = periodTotals(
      [
        tx({ date: now, type: 'income', amount: 5000 }),
        tx({ date: now, type: 'expense', amount: 2000 }),
        tx({ date: new Date(now.getFullYear() - 2, 0, 15), type: 'expense', amount: 999999 }),
      ],
      'month',
      1
    );
    expect(totals).toHaveLength(1);
    expect(totals[0].income).toBe(5000);
    expect(totals[0].expense).toBe(2000);
  });

  it('creates the requested number of buckets', () => {
    const totals = periodTotals([], 'day', 7);
    expect(totals).toHaveLength(7);
  });
});
