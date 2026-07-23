import { create } from 'zustand';

interface AppState {
  theme: 'light' | 'dark';
  currency: string;
  language: string;
  setTheme: (theme: 'light' | 'dark') => void;
  setCurrency: (currency: string) => void;
  setLanguage: (language: string) => void;
}

export const useAppStore = create<AppState>((set) => ({
  theme: 'light',
  currency: 'IDR',
  language: 'id',

  setTheme: (theme: 'light' | 'dark') => set({ theme }),
  setCurrency: (currency: string) => set({ currency }),
  setLanguage: (language: string) => set({ language }),
}));
