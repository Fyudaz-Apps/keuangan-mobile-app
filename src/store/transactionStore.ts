import { create } from 'zustand';
import { Transaction } from '@/database/models';

interface TransactionState {
  transactions: Transaction[];
  addTransaction: (transaction: Transaction) => void;
  removeTransaction: (id: string) => void;
  updateTransaction: (id: string, transaction: Partial<Transaction>) => void;
  getTransactionsByCategory: (categoryId: string) => Transaction[];
  getTransactionsByDateRange: (startDate: Date, endDate: Date) => Transaction[];
  clearTransactions: () => void;
}

export const useTransactionStore = create<TransactionState>((set, get) => ({
  transactions: [],

  addTransaction: (transaction: Transaction) =>
    set((state) => ({
      transactions: [...state.transactions, transaction],
    })),

  removeTransaction: (id: string) =>
    set((state) => ({
      transactions: state.transactions.filter((t) => t.id !== id),
    })),

  updateTransaction: (id: string, updates: Partial<Transaction>) =>
    set((state) => ({
      transactions: state.transactions.map((t) => (t.id === id ? { ...t, ...updates } : t)),
    })),

  getTransactionsByCategory: (categoryId: string) => {
    const state = get();
    return state.transactions.filter((t) => t.category === categoryId);
  },

  getTransactionsByDateRange: (startDate: Date, endDate: Date) => {
    const state = get();
    return state.transactions.filter((t) => t.date >= startDate && t.date <= endDate);
  },

  clearTransactions: () => set({ transactions: [] }),
}));
