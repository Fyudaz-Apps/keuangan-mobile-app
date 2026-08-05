import { create } from 'zustand';
import { Transaction } from '@/database/models';
import * as dbService from '@/services/dbService';

interface TransactionState {
  transactions: Transaction[];
  isLoading: boolean;
  loadFromDb: () => Promise<void>;
  addTransaction: (transaction: Transaction) => Promise<void>;
  removeTransaction: (id: string) => Promise<void>;
  removeTransactions: (ids: string[]) => Promise<void>;
  updateTransaction: (id: string, transaction: Partial<Transaction>) => Promise<void>;
  findDuplicate: (transaction: Partial<Transaction>) => Transaction | undefined;
  getTransactionsByCategory: (categoryId: string) => Transaction[];
  getTransactionsByDateRange: (startDate: Date, endDate: Date) => Transaction[];
  clearTransactions: () => Promise<void>;
}

export const useTransactionStore = create<TransactionState>((set, get) => ({
  transactions: [],
  isLoading: false,

  loadFromDb: async () => {
    set({ isLoading: true });
    try {
      const transactions = await dbService.getAllTransactions();
      set({ transactions });
    } finally {
      set({ isLoading: false });
    }
  },

  addTransaction: async (transaction: Transaction) => {
    await dbService.addTransaction(transaction);
    set((state) => ({
      transactions: [...state.transactions, transaction],
    }));
  },

  removeTransaction: async (id: string) => {
    await dbService.deleteTransaction(id);
    set((state) => ({
      transactions: state.transactions.filter((t) => t.id !== id),
    }));
  },

  removeTransactions: async (ids: string[]) => {
    const idSet = new Set(ids);
    await Promise.all(ids.map((id) => dbService.deleteTransaction(id)));
    set((state) => ({
      transactions: state.transactions.filter((t) => !idSet.has(t.id)),
    }));
  },

  updateTransaction: async (id: string, updates: Partial<Transaction>) => {
    await dbService.updateTransaction(id, updates);
    set((state) => ({
      transactions: state.transactions.map((t) => (t.id === id ? { ...t, ...updates } : t)),
    }));
  },

  findDuplicate: (transaction: Partial<Transaction>) => {
    const { amount, description, date, type } = transaction;
    if (amount == null || !description || !date || !type) return undefined;
    const d = new Date(date).toDateString();
    return get().transactions.find(
      (t) =>
        t.amount === amount &&
        t.type === type &&
        t.description.toLowerCase() === description.toLowerCase() &&
        new Date(t.date).toDateString() === d
    );
  },

  getTransactionsByCategory: (categoryId: string) => {
    const state = get();
    return state.transactions.filter((t) => t.category === categoryId);
  },

  getTransactionsByDateRange: (startDate: Date, endDate: Date) => {
    const state = get();
    return state.transactions.filter((t) => t.date >= startDate && t.date <= endDate);
  },

  clearTransactions: async () => {
    const { transactions } = get();
    await Promise.all(transactions.map((t) => dbService.deleteTransaction(t.id)));
    set({ transactions: [] });
  },
}));
