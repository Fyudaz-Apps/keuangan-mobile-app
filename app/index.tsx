import React, { useEffect } from 'react';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { StatusBar } from 'expo-status-bar';
import { RootNavigator } from '@/navigation';
import { useAppStore } from '@/store';

export default function App() {
  const { theme } = useAppStore();

  useEffect(() => {
    // Initialize app
  }, []);

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <RootNavigator />
      <StatusBar
        barStyle={theme === 'dark' ? 'light-content' : 'dark-content'}
        backgroundColor="transparent"
      />
    </GestureHandlerRootView>
  );
}
