import { create } from 'zustand';

export type ThemePreference = 'light' | 'dark' | 'system';

interface AppState {
  theme: ThemePreference;
  currency: string;
  language: string;
  setTheme: (theme: ThemePreference) => void;
  setCurrency: (currency: string) => void;
  setLanguage: (language: string) => void;
}

export const useAppStore = create<AppState>((set) => ({
  theme: 'system',
  currency: 'IDR',
  language: 'id',

  setTheme: (theme: ThemePreference) => set({ theme }),
  setCurrency: (currency: string) => set({ currency }),
  setLanguage: (language: string) => set({ language }),
}));
