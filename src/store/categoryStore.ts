import { create } from 'zustand';
import { Category } from '@/database/models';
import * as dbService from '@/services/dbService';

interface CategoryState {
  categories: Category[];
  isLoading: boolean;
  loadFromDb: () => Promise<void>;
  addCategory: (category: Category) => Promise<void>;
  removeCategory: (id: string) => Promise<void>;
  updateCategory: (id: string, category: Partial<Category>) => Promise<void>;
  getCategoriesByType: (type: 'income' | 'expense') => Category[];
  clearCategories: () => Promise<void>;
}

export const useCategoryStore = create<CategoryState>((set, get) => ({
  categories: [],
  isLoading: false,

  loadFromDb: async () => {
    set({ isLoading: true });
    try {
      const categories = await dbService.getAllCategories();
      set({ categories });
    } finally {
      set({ isLoading: false });
    }
  },

  addCategory: async (category: Category) => {
    await dbService.addCategory(category);
    set((state) => ({
      categories: [...state.categories, category],
    }));
  },

  removeCategory: async (id: string) => {
    await dbService.deleteCategory(id);
    set((state) => ({
      categories: state.categories.filter((c) => c.id !== id),
    }));
  },

  updateCategory: async (id: string, updates: Partial<Category>) => {
    await dbService.updateCategory(id, updates);
    set((state) => ({
      categories: state.categories.map((c) => (c.id === id ? { ...c, ...updates } : c)),
    }));
  },

  getCategoriesByType: (type: 'income' | 'expense') => {
    const state = get();
    return state.categories.filter((c) => c.type === type);
  },

  clearCategories: async () => {
    const { categories } = get();
    await Promise.all(categories.map((c) => dbService.deleteCategory(c.id)));
    set({ categories: [] });
  },
}));
