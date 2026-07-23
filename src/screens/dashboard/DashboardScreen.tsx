import React, { useEffect, useState } from 'react';
import {
  View,
  ScrollView,
  StyleSheet,
  Text,
  SafeAreaView,
} from 'react-native';
import { useTransactionStore, useCategoryStore, useBudgetStore } from '@/store';
import { Card, Button } from '@/components/ui';
import AddTransactionModal from '@/components/AddTransactionModal';

interface Transaction {
  id: string;
  amount: number;
  description: string;
  category: string;
  type: 'income' | 'expense';
  date: Date;
}

interface Summary {
  totalIncome: number;
  totalExpense: number;
  balance: number;
}

export default function DashboardScreen() {
  const { transactions } = useTransactionStore();
  const { categories } = useCategoryStore();
  const { budgets } = useBudgetStore();
  const [summary, setSummary] = useState<Summary>({
    totalIncome: 0,
    totalExpense: 0,
    balance: 0,
  });
  const [recentTransactions, setRecentTransactions] = useState<Transaction[]>([]);
  const [showAddModal, setShowAddModal] = useState(false);

  useEffect(() => {
    // Calculate summary
    const income = transactions
      .filter((t) => t.type === 'income')
      .reduce((sum, t) => sum + t.amount, 0);

    const expense = transactions
      .filter((t) => t.type === 'expense')
      .reduce((sum, t) => sum + t.amount, 0);

    setSummary({
      totalIncome: income,
      totalExpense: expense,
      balance: income - expense,
    });

    // Get recent transactions (last 5)
    const recent = [...transactions]
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
      .slice(0, 5);

    setRecentTransactions(recent as Transaction[]);
  }, [transactions]);

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Dashboard</Text>
        </View>

        {/* Summary Cards */}
        <Card title="Summary" style={styles.summaryCard}>
          <View style={styles.summaryRow}>
            <View style={styles.summaryItem}>
              <Text style={styles.summaryLabel}>Total Income</Text>
              <Text style={styles.summaryValue}>
                Rp {summary.totalIncome.toLocaleString()}
              </Text>
            </View>
            <View style={styles.summaryItem}>
              <Text style={styles.summaryLabel}>Total Expense</Text>
              <Text style={[styles.summaryValue, { color: '#ff6b6b' }]}>
                Rp {summary.totalExpense.toLocaleString()}
              </Text>
            </View>
          </View>
          <View style={styles.balanceContainer}>
            <Text style={styles.balanceLabel}>Balance</Text>
            <Text
              style={[
                styles.balanceValue,
                {
                  color: summary.balance >= 0 ? '#4caf50' : '#ff6b6b',
                },
              ]}
            >
              Rp {summary.balance.toLocaleString()}
            </Text>
          </View>
        </Card>

        {/* Quick Stats */}
        <Card title="Quick Stats" style={styles.statsCard}>
          <View style={styles.statsGrid}>
            <View style={styles.statItem}>
              <Text style={styles.statLabel}>Transactions</Text>
              <Text style={styles.statValue}>{transactions.length}</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statLabel}>Categories</Text>
              <Text style={styles.statValue}>{categories.length}</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statLabel}>Active Budgets</Text>
              <Text style={styles.statValue}>{budgets.length}</Text>
            </View>
          </View>
        </Card>

        {/* Recent Transactions */}
        {recentTransactions.length > 0 && (
          <Card title="Recent Transactions">
            {recentTransactions.map((transaction) => (
              <View key={transaction.id} style={styles.transactionItem}>
                <View style={styles.transactionInfo}>
                  <Text style={styles.transactionDescription}>
                    {transaction.description}
                  </Text>
                  <Text style={styles.transactionDate}>
                    {new Date(transaction.date).toLocaleDateString()}
                  </Text>
                </View>
                <Text
                  style={[
                    styles.transactionAmount,
                    {
                      color:
                        transaction.type === 'income'
                          ? '#4caf50'
                          : '#ff6b6b',
                    },
                  ]}
                >
                  {transaction.type === 'income' ? '+' : '-'} Rp{' '}
                  {transaction.amount.toLocaleString()}
                </Text>
              </View>
            ))}
          </Card>
        )}

        {/* Empty State */}
        {transactions.length === 0 && (
          <Card style={styles.emptyCard}>
            <Text style={styles.emptyText}>
              No transactions yet. Start by adding your first transaction!
            </Text>
            <Button
              title="Add Transaction"
              onPress={() => setShowAddModal(true)}
              style={styles.emptyButton}
            />
          </Card>
        )}
      </ScrollView>

      <AddTransactionModal
        visible={showAddModal}
        onClose={() => setShowAddModal(false)}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    paddingHorizontal: 16,
    paddingVertical: 16,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#000000',
  },
  summaryCard: {
    marginTop: 8,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  summaryItem: {
    flex: 1,
  },
  summaryLabel: {
    fontSize: 12,
    color: '#999999',
    marginBottom: 4,
  },
  summaryValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#000000',
  },
  balanceContainer: {
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
  },
  balanceLabel: {
    fontSize: 12,
    color: '#999999',
    marginBottom: 4,
  },
  balanceValue: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  statsCard: {
    marginTop: 12,
  },
  statsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  statItem: {
    alignItems: 'center',
  },
  statLabel: {
    fontSize: 12,
    color: '#999999',
    marginBottom: 4,
  },
  statValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#208AEF',
  },
  transactionItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  transactionInfo: {
    flex: 1,
  },
  transactionDescription: {
    fontSize: 14,
    fontWeight: '500',
    color: '#000000',
    marginBottom: 4,
  },
  transactionDate: {
    fontSize: 12,
    color: '#999999',
  },
  transactionAmount: {
    fontSize: 14,
    fontWeight: '600',
  },
  emptyCard: {
    marginTop: 32,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 32,
  },
  emptyText: {
    fontSize: 14,
    color: '#999999',
    textAlign: 'center',
    marginBottom: 16,
  },
  emptyButton: {
    marginTop: 8,
  },
});
