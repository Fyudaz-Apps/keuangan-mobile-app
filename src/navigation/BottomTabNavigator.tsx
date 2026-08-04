import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context'; // 1. Import hook safe area
import { TabParamList } from './types';
import DashboardScreen from '@/screens/dashboard/DashboardScreen';
import TransactionsScreen from '@/screens/transactions/TransactionsScreen';
import CategoriesScreen from '@/screens/categories/CategoriesScreen';
import BudgetsScreen from '@/screens/budgets/BudgetsScreen';
import SettingsScreen from '@/screens/SettingsScreen';

const Tab = createBottomTabNavigator<TabParamList>();

export function BottomTabNavigator() {
  // 2. Ambil nilai inset bawah dari layar HP
  const insets = useSafeAreaInsets();

  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: true,
        tabBarStyle: {
          backgroundColor: '#ffffff',
          borderTopColor: '#e0e0e0',
          borderTopWidth: 1,
          // 3. Tambahkan inset.bottom ke padding agar naik di atas tombol navigasi sistem
          paddingBottom: insets.bottom > 0 ? insets.bottom : 8,
          height: 60 + (insets.bottom > 0 ? insets.bottom : 0),
          paddingTop: 8,
        },
        tabBarActiveTintColor: '#208AEF',
        tabBarInactiveTintColor: '#999999',
        tabBarIcon: ({ focused, color, size }) => {
          let iconName: keyof typeof Ionicons.glyphMap;

          switch (route.name) {
            case 'Dashboard':
              iconName = focused ? 'grid' : 'grid-outline';
              break;
            case 'Transactions':
              iconName = focused ? 'swap-horizontal' : 'swap-horizontal-outline';
              break;
            case 'Categories':
              iconName = focused ? 'list' : 'list-outline';
              break;
            case 'Budgets':
              iconName = focused ? 'wallet' : 'wallet-outline';
              break;
            case 'Settings':
              iconName = focused ? 'settings' : 'settings-outline';
              break;
            default:
              iconName = 'square';
          }

          return <Ionicons name={iconName} size={size} color={color} />;
        },
      })}
    >
      <Tab.Screen
        name="Dashboard"
        component={DashboardScreen}
        options={{
          title: 'Dashboard',
          tabBarLabel: 'Dashboard',
        }}
      />
      <Tab.Screen
        name="Transactions"
        component={TransactionsScreen}
        options={{
          title: 'Transactions',
          tabBarLabel: 'Transactions',
        }}
      />
      <Tab.Screen
        name="Categories"
        component={CategoriesScreen}
        options={{
          title: 'Categories',
          tabBarLabel: 'Categories',
        }}
      />
      <Tab.Screen
        name="Budgets"
        component={BudgetsScreen}
        options={{
          title: 'Budgets',
          tabBarLabel: 'Budgets',
        }}
      />
      <Tab.Screen
        name="Settings"
        component={SettingsScreen}
        options={{
          title: 'Settings',
          tabBarLabel: 'Settings',
        }}
      />
    </Tab.Navigator>
  );
}
