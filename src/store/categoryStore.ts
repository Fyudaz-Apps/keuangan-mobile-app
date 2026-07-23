import { create } from 'zustand';
import { Category } from '@/database/models';

interface CategoryState {
  categories: Category[];
  addCategory: (category: Category) => void;
  removeCategory: (id: string) => void;
  updateCategory: (id: string, category: Partial<Category>) => void;
  getCategoriesByType: (type: 'income' | 'expense') => Category[];
  clearCategories: () => void;
}

export const useCategoryStore = create<CategoryState>((set, get) => ({
  categories: [],

  addCategory: (category: Category) =>
    set((state) => ({
      categories: [...state.categories, category],
    })),

  removeCategory: (id: string) =>
    set((state) => ({
      categories: state.categories.filter((c) => c.id !== id),
    })),

  updateCategory: (id: string, updates: Partial<Category>) =>
    set((state) => ({
      categories: state.categories.map((c) =>
        c.id === id ? { ...c, ...updates } : c
      ),
    })),

  getCategoriesByType: (type: 'income' | 'expense') => {
    const state = get();
    return state.categories.filter((c) => c.type === type);
  },

  clearCategories: () => set({ categories: [] }),
}));
