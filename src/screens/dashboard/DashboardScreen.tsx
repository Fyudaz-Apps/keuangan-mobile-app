import React, { useEffect, useMemo, useState } from 'react';
import { View, ScrollView, StyleSheet, Text, Dimensions, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { PieChart, BarChart } from 'react-native-chart-kit';
import { useTransactionStore, useCategoryStore, useBudgetStore } from '@/store';
import { Card, Button } from '@/components/ui';
import { useTheme, Theme } from '@/hooks/use-theme';
import { useT } from '@/i18n';
import { expenseByCategory, periodTotals } from '@/utils/aggregate';
import { getPeriodRange, PeriodKey } from '@/utils';
import AddTransactionModal from '@/components/AddTransactionModal';

const PERIOD_OPTIONS: { key: PeriodKey; label: string; buckets: number }[] = [
  { key: 'day', label: 'daily', buckets: 7 },
  { key: 'week', label: 'weekly', buckets: 8 },
  { key: 'month', label: 'monthly', buckets: 6 },
  { key: 'year', label: 'yearly', buckets: 5 },
];

export default function DashboardScreen() {
  const { transactions } = useTransactionStore();
  const { categories } = useCategoryStore();
  const { budgets } = useBudgetStore();
  const colors = useTheme();
  const t = useT();
  const styles = createStyles(colors);
  const [period, setPeriod] = useState<PeriodKey>('month');
  const [showAddModal, setShowAddModal] = useState(false);

  const rangeTransactions = useMemo(() => {
    const { start, end } = getPeriodRange(period);
    const startTime = start.getTime();
    const endTime = end.getTime();
    return transactions.filter((tx) => {
      const time = new Date(tx.date).getTime();
      return time >= startTime && time <= endTime;
    });
  }, [transactions, period]);

  const summary = useMemo(() => {
    const income = rangeTransactions
      .filter((t) => t.type === 'income')
      .reduce((sum, t) => sum + t.amount, 0);
    const expense = rangeTransactions
      .filter((t) => t.type === 'expense')
      .reduce((sum, t) => sum + t.amount, 0);
    return { totalIncome: income, totalExpense: expense, balance: income - expense };
  }, [rangeTransactions]);

  const recentTransactions = useMemo(
    () =>
      [...transactions]
        .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
        .slice(0, 5),
    [transactions]
  );

  const chartColors = ['#208AEF', '#ff6b6b', '#ffa502', '#4caf50', '#a55eea', '#17C0EB'];
  const chartData = expenseByCategory(rangeTransactions)
    .slice(0, 6)
    .map((item, index) => ({
      name: item.name,
      population: item.value,
      color: chartColors[index % chartColors.length],
      legendFontColor: colors.textSecondary,
      legendFontSize: 12,
    }));

  const activePeriod = PERIOD_OPTIONS.find((p) => p.key === period) ?? PERIOD_OPTIONS[2];
  const trendData = useMemo(
    () => periodTotals(transactions, period, activePeriod.buckets),
    [transactions, period, activePeriod.buckets]
  );

  const barLabels = trendData.map((b) => b.label);
  const barDataset = {
    labels: barLabels,
    datasets: [
      { data: trendData.map((b) => b.income), color: () => colors.success },
      { data: trendData.map((b) => b.expense), color: () => colors.danger },
    ],
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>{t('dashboard')}</Text>
        </View>

        <View style={styles.periodRow}>
          {PERIOD_OPTIONS.map((option) => (
            <TouchableOpacity
              key={option.key}
              style={[styles.periodChip, period === option.key && styles.periodChipActive]}
              onPress={() => setPeriod(option.key)}
            >
              <Text
                style={[
                  styles.periodChipText,
                  period === option.key && styles.periodChipTextActive,
                ]}
              >
                {t(option.label)}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        <Card title={`${t('summary')} — ${t(activePeriod.label)}`} style={styles.summaryCard}>
          <View style={styles.summaryRow}>
            <View style={styles.summaryItem}>
              <Text style={styles.summaryLabel}>{t('totalIncome')}</Text>
              <Text style={[styles.summaryValue, { color: colors.success }]}>
                Rp {summary.totalIncome.toLocaleString()}
              </Text>
            </View>
            <View style={styles.summaryItem}>
              <Text style={styles.summaryLabel}>{t('totalExpense')}</Text>
              <Text style={[styles.summaryValue, { color: colors.danger }]}>
                Rp {summary.totalExpense.toLocaleString()}
              </Text>
            </View>
          </View>
          <View style={styles.balanceContainer}>
            <Text style={styles.balanceLabel}>{t('balance')}</Text>
            <Text
              style={[
                styles.balanceValue,
                {
                  color: summary.balance >= 0 ? colors.success : colors.danger,
                },
              ]}
            >
              Rp {summary.balance.toLocaleString()}
            </Text>
          </View>
        </Card>

        <Card title={t('quickStats')} style={styles.statsCard}>
          <View style={styles.statsGrid}>
            <View style={styles.statItem}>
              <Text style={styles.statLabel}>{t('transactions')}</Text>
              <Text style={styles.statValue}>{rangeTransactions.length}</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statLabel}>{t('categories')}</Text>
              <Text style={styles.statValue}>{categories.length}</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statLabel}>{t('activeBudgets')}</Text>
              <Text style={styles.statValue}>{budgets.length}</Text>
            </View>
          </View>
        </Card>

        {chartData.length > 0 && (
          <Card title={`${t('totalExpense')} — ${t(activePeriod.label)}`} style={styles.statsCard}>
            <PieChart
              data={chartData}
              width={Dimensions.get('window').width - 32}
              height={200}
              accessor="population"
              backgroundColor="transparent"
              paddingLeft="0"
              chartConfig={{
                color: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
                labelColor: () => colors.text,
              }}
            />
          </Card>
        )}

        {trendData.length > 0 && (
          <Card title={t('trend')} style={styles.statsCard}>
            <BarChart
              data={barDataset}
              width={Dimensions.get('window').width - 32}
              height={220}
              fromZero
              yAxisLabel="Rp "
              yAxisSuffix="k"
              chartConfig={{
                backgroundGradientFrom: colors.card,
                backgroundGradientTo: colors.card,
                decimalPlaces: 0,
                color: () => colors.primary,
                labelColor: () => colors.textSecondary,
                propsForLabels: { fontSize: 10 },
              }}
            />
          </Card>
        )}

        {recentTransactions.length > 0 && (
          <Card title={t('recentTransactions')}>
            {recentTransactions.map((transaction) => (
              <View key={transaction.id} style={styles.transactionItem}>
                <View style={styles.transactionInfo}>
                  <Text style={styles.transactionDescription}>{transaction.description}</Text>
                  <Text style={styles.transactionDate}>
                    {new Date(transaction.date).toLocaleDateString()}
                  </Text>
                </View>
                <Text
                  style={[
                    styles.transactionAmount,
                    {
                      color: transaction.type === 'income' ? colors.success : colors.danger,
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

        {transactions.length === 0 && (
          <Card style={styles.emptyCard}>
            <Text style={styles.emptyText}>{t('noTransactions')}</Text>
            <Button
              title={t('addTransaction')}
              onPress={() => setShowAddModal(true)}
              style={styles.emptyButton}
            />
          </Card>
        )}
      </ScrollView>

      <AddTransactionModal visible={showAddModal} onClose={() => setShowAddModal(false)} />
    </SafeAreaView>
  );
}

const createStyles = (colors: Theme) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.screen,
    },
    header: {
      paddingHorizontal: 16,
      paddingVertical: 16,
    },
    headerTitle: {
      fontSize: 28,
      fontWeight: 'bold',
      color: colors.text,
    },
    periodRow: {
      flexDirection: 'row',
      gap: 8,
      marginHorizontal: 16,
      marginBottom: 8,
    },
    periodChip: {
      paddingVertical: 8,
      paddingHorizontal: 14,
      borderRadius: 20,
      borderWidth: 1,
      borderColor: colors.border,
      backgroundColor: colors.chipBg,
    },
    periodChipActive: {
      backgroundColor: colors.primary,
      borderColor: colors.primary,
    },
    periodChipText: {
      fontSize: 13,
      color: colors.text,
    },
    periodChipTextActive: {
      color: '#fff',
      fontWeight: '600',
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
      color: colors.textMuted,
      marginBottom: 4,
    },
    summaryValue: {
      fontSize: 18,
      fontWeight: 'bold',
      color: colors.text,
    },
    balanceContainer: {
      paddingTop: 12,
      borderTopWidth: 1,
      borderTopColor: colors.border,
    },
    balanceLabel: {
      fontSize: 12,
      color: colors.textMuted,
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
      color: colors.textMuted,
      marginBottom: 4,
    },
    statValue: {
      fontSize: 24,
      fontWeight: 'bold',
      color: colors.primary,
    },
    transactionItem: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      paddingVertical: 12,
      borderBottomWidth: 1,
      borderBottomColor: colors.border,
    },
    transactionInfo: {
      flex: 1,
    },
    transactionDescription: {
      fontSize: 14,
      fontWeight: '500',
      color: colors.text,
      marginBottom: 4,
    },
    transactionDate: {
      fontSize: 12,
      color: colors.textMuted,
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
      color: colors.textMuted,
      textAlign: 'center',
      marginBottom: 16,
    },
    emptyButton: {
      marginTop: 8,
    },
  });
