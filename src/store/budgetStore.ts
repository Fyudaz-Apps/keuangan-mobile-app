import { create } from 'zustand';
import { Budget } from '@/database/models';

interface BudgetState {
  budgets: Budget[];
  addBudget: (budget: Budget) => void;
  removeBudget: (id: string) => void;
  updateBudget: (id: string, budget: Partial<Budget>) => void;
  getBudgetsByCategory: (categoryId: string) => Budget[];
  clearBudgets: () => void;
}

export const useBudgetStore = create<BudgetState>((set, get) => ({
  budgets: [],

  addBudget: (budget: Budget) =>
    set((state) => ({
      budgets: [...state.budgets, budget],
    })),

  removeBudget: (id: string) =>
    set((state) => ({
      budgets: state.budgets.filter((b) => b.id !== id),
    })),

  updateBudget: (id: string, updates: Partial<Budget>) =>
    set((state) => ({
      budgets: state.budgets.map((b) => (b.id === id ? { ...b, ...updates } : b)),
    })),

  getBudgetsByCategory: (categoryId: string) => {
    const state = get();
    return state.budgets.filter((b) => b.category === categoryId);
  },

  clearBudgets: () => set({ budgets: [] }),
}));
