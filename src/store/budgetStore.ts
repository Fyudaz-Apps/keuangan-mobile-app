import { create } from 'zustand';
import { Budget } from '@/database/models';
import * as realmService from '@/services/realmService';

interface BudgetState {
  budgets: Budget[];
  isLoading: boolean;
  loadFromDb: () => Promise<void>;
  addBudget: (budget: Budget) => Promise<void>;
  removeBudget: (id: string) => Promise<void>;
  updateBudget: (id: string, budget: Partial<Budget>) => Promise<void>;
  getBudgetsByCategory: (categoryId: string) => Budget[];
  clearBudgets: () => Promise<void>;
}

export const useBudgetStore = create<BudgetState>((set, get) => ({
  budgets: [],
  isLoading: false,

  loadFromDb: async () => {
    set({ isLoading: true });
    try {
      const budgets = await realmService.getAllBudgets();
      set({ budgets });
    } finally {
      set({ isLoading: false });
    }
  },

  addBudget: async (budget: Budget) => {
    await realmService.addBudget(budget);
    set((state) => ({
      budgets: [...state.budgets, budget],
    }));
  },

  removeBudget: async (id: string) => {
    await realmService.deleteBudget(id);
    set((state) => ({
      budgets: state.budgets.filter((b) => b.id !== id),
    }));
  },

  updateBudget: async (id: string, updates: Partial<Budget>) => {
    await realmService.updateBudget(id, updates);
    set((state) => ({
      budgets: state.budgets.map((b) => (b.id === id ? { ...b, ...updates } : b)),
    }));
  },

  getBudgetsByCategory: (categoryId: string) => {
    const state = get();
    return state.budgets.filter((b) => b.category === categoryId);
  },

  clearBudgets: async () => {
    const { budgets } = get();
    await Promise.all(budgets.map((b) => realmService.deleteBudget(b.id)));
    set({ budgets: [] });
  },
}));
