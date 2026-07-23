import 'react-native-get-random-values'
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
        style={theme === 'dark' ? 'light' : 'dark'}
        backgroundColor="transparent"
      />
    </GestureHandlerRootView>
  );
}
