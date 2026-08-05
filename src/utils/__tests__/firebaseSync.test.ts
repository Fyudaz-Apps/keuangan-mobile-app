import {
  transactionToDoc,
  docToTransaction,
  categoryToDoc,
  docToCategory,
  budgetToDoc,
  docToBudget,
  mergeByUpdatedAt,
  mergeCloudIntoLocal,
} from '@/utils/firebaseSync';
import { Transaction, Category, Budget } from '@/database/models';

const iso = (offset: number) => new Date(Date.UTC(2026, 0, offset)).toISOString();

describe('firebaseSync serialization', () => {
  it('round-trips a Transaction', () => {
    const tx: Transaction = {
      id: 'tx1',
      amount: 25000,
      description: 'Nasi goreng',
      category: 'cat_food',
      type: 'expense',
      date: new Date('2026-08-01T10:00:00.000Z'),
      notes: 'lunch',
      createdAt: new Date('2026-08-01T09:00:00.000Z'),
      updatedAt: new Date('2026-08-01T09:00:00.000Z'),
    };
    const restored = docToTransaction(tx.id, transactionToDoc(tx));
    expect(restored).toEqual(tx);
  });

  it('round-trips a Transaction without notes', () => {
    const tx: Transaction = {
      id: 'tx2',
      amount: 5000000,
      description: 'Gaji',
      category: 'cat_salary',
      type: 'income',
      date: new Date('2026-08-01T10:00:00.000Z'),
      createdAt: new Date('2026-08-01T09:00:00.000Z'),
      updatedAt: new Date('2026-08-01T09:00:00.000Z'),
    };
    const restored = docToTransaction(tx.id, transactionToDoc(tx));
    expect(restored).toEqual(tx);
  });

  it('round-trips a Category', () => {
    const category: Category = {
      id: 'cat_food',
      name: 'Makanan',
      color: '#ff6b6b',
      icon: 'restaurant',
      type: 'expense',
      createdAt: new Date('2026-08-01T09:00:00.000Z'),
      updatedAt: new Date('2026-08-01T09:00:00.000Z'),
    };
    const restored = docToCategory(category.id, categoryToDoc(category));
    expect(restored).toEqual(category);
  });

  it('round-trips a Budget with and without endDate', () => {
    const withEnd: Budget = {
      id: 'b1',
      category: 'cat_food',
      amount: 1000000,
      period: 'monthly',
      startDate: new Date('2026-08-01T00:00:00.000Z'),
      endDate: new Date('2026-08-31T23:59:59.999Z'),
      createdAt: new Date('2026-08-01T09:00:00.000Z'),
      updatedAt: new Date('2026-08-01T09:00:00.000Z'),
    };
    expect(docToBudget(withEnd.id, budgetToDoc(withEnd))).toEqual(withEnd);

    const withoutEnd: Budget = { ...withEnd, id: 'b2', endDate: undefined };
    expect(docToBudget(withoutEnd.id, budgetToDoc(withoutEnd))).toEqual(withoutEnd);
  });
});

describe('firebaseSync merge', () => {
  interface Item {
    id: string;
    updatedAt: Date;
  }
  const item = (id: string, offset: number): Item => ({ id, updatedAt: new Date(iso(offset)) });

  it('keeps local-only records', () => {
    const local = [item('a', 1)];
    const cloud: Item[] = [];
    expect(mergeByUpdatedAt(cloud, local)).toEqual(local);
  });

  it('adds cloud-only records', () => {
    const local: Item[] = [];
    const cloud = [item('b', 1)];
    expect(mergeByUpdatedAt(cloud, local)).toEqual(cloud);
  });

  it('cloud wins when updatedAt is equal or newer', () => {
    const newer = item('a', 2);
    const result = mergeByUpdatedAt([newer], [item('a', 1)]);
    expect(result).toEqual([newer]);
  });

  it('local wins when local updatedAt is newer', () => {
    const local = item('a', 2);
    const result = mergeByUpdatedAt([item('a', 1)], [local]);
    expect(result).toEqual([local]);
  });

  it('merges all three collections via mergeCloudIntoLocal', () => {
    const localTx = (id: string, offset: number): Transaction => ({
      id,
      amount: 100,
      description: 'd',
      category: 'c',
      type: 'expense',
      date: new Date(iso(1)),
      createdAt: new Date(iso(1)),
      updatedAt: new Date(iso(offset)),
    });
    const cloudTx = localTx('tx', 3);
    const result = mergeCloudIntoLocal(
      {
        transactions: [cloudTx],
        categories: [],
        budgets: [],
      },
      {
        transactions: [localTx('tx', 2), localTx('local-only', 2)],
        categories: [],
        budgets: [],
      }
    );
    expect(result.transactions).toHaveLength(2);
    expect(result.transactions.map((t) => t.id)).toEqual(
      expect.arrayContaining(['tx', 'local-only'])
    );
    expect(result.transactions.find((t) => t.id === 'tx')?.updatedAt).toEqual(cloudTx.updatedAt);
  });
});
