import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context'; // 1. Import hook safe area
import { useTheme } from '@/hooks/use-theme';
import { useT } from '@/i18n';
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
  const colors = useTheme();
  const t = useT();

  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarStyle: {
          backgroundColor: colors.card,
          borderTopColor: colors.border,
          borderTopWidth: 1,
          // 3. Tambahkan inset.bottom ke padding agar naik di atas tombol navigasi sistem
          paddingBottom: insets.bottom > 0 ? insets.bottom : 8,
          height: 60 + (insets.bottom > 0 ? insets.bottom : 0),
          paddingTop: 8,
        },
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.textMuted,
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
          title: t('dashboard'),
          tabBarLabel: t('dashboard'),
        }}
      />
      <Tab.Screen
        name="Transactions"
        component={TransactionsScreen}
        options={{
          title: t('transactions'),
          tabBarLabel: t('transactions'),
        }}
      />
      <Tab.Screen
        name="Categories"
        component={CategoriesScreen}
        options={{
          title: t('categories'),
          tabBarLabel: t('categories'),
        }}
      />
      <Tab.Screen
        name="Budgets"
        component={BudgetsScreen}
        options={{
          title: t('budgets'),
          tabBarLabel: t('budgets'),
        }}
      />
      <Tab.Screen
        name="Settings"
        component={SettingsScreen}
        options={{
          title: t('settings'),
          tabBarLabel: t('settings'),
        }}
      />
    </Tab.Navigator>
  );
}
