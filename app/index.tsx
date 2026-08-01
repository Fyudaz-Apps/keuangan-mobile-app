import 'react-native-get-random-values';
import React, { useEffect } from 'react';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { StatusBar } from 'expo-status-bar';
import { RootNavigator } from '@/navigation';
import { useAppStore, useTransactionStore, useCategoryStore, useBudgetStore } from '@/store';
import { seedDefaultCategories, getRealm } from '@/services/realmService';

export default function App() {
  const { theme } = useAppStore();

  useEffect(() => {
    const initializeApp = async () => {
      try {
        await getRealm();
        await seedDefaultCategories();
        await Promise.all([
          useTransactionStore.getState().loadFromDb(),
          useCategoryStore.getState().loadFromDb(),
          useBudgetStore.getState().loadFromDb(),
        ]);
      } catch (error) {
        console.error('Failed to initialize database:', error);
      }
    };

    initializeApp();
  }, []);

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <RootNavigator />
      <StatusBar style={theme === 'dark' ? 'light' : 'dark'} backgroundColor="transparent" />
    </GestureHandlerRootView>
  );
}
