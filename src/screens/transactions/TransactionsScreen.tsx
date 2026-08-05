import React, { useState, useMemo } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Alert, Modal } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTransactionStore, useCategoryStore } from '@/store';
import { Transaction } from '@/database/models';
import { useTheme, Theme } from '@/hooks/use-theme';
import { useT } from '@/i18n';
import AddTransactionModal from '@/components/AddTransactionModal';

const MONTH_NAMES = [
  'Januari',
  'Februari',
  'Maret',
  'April',
  'Mei',
  'Juni',
  'Juli',
  'Agustus',
  'September',
  'Oktober',
  'November',
  'Desember',
];

export default function TransactionsScreen() {
  const { transactions, removeTransaction, removeTransactions } = useTransactionStore();
  const { categories } = useCategoryStore();
  const colors = useTheme();
  const t = useT();
  const styles = createStyles(colors);
  const [showAddModal, setShowAddModal] = useState(false);
  const [editing, setEditing] = useState<Transaction | null>(null);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [selectMode, setSelectMode] = useState(false);
  const [filterMonth, setFilterMonth] = useState<number | null>(null);
  const [filterYear, setFilterYear] = useState<number | null>(null);
  const [showFilterModal, setShowFilterModal] = useState(false);

  const categoryName = (name: string) => categories.find((c) => c.name === name)?.name ?? name;

  const years = useMemo(() => {
    const set = new Set<number>();
    for (const tx of transactions) {
      set.add(new Date(tx.date).getFullYear());
    }
    return [...set].sort((a, b) => b - a);
  }, [transactions]);

  const filtered = useMemo(() => {
    const sorted = [...transactions].sort(
      (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
    );
    if (filterMonth === null || filterYear === null) return sorted;
    return sorted.filter((tx) => {
      const d = new Date(tx.date);
      return d.getFullYear() === filterYear && d.getMonth() === filterMonth;
    });
  }, [transactions, filterMonth, filterYear]);

  const totals = useMemo(() => {
    let income = 0;
    let expense = 0;
    for (const tx of filtered) {
      if (tx.type === 'income') income += tx.amount;
      else expense += tx.amount;
    }
    return { income, expense };
  }, [filtered]);

  const openAdd = () => {
    setEditing(null);
    setShowAddModal(true);
  };

  const openEdit = (tx: Transaction) => {
    setEditing(tx);
    setShowAddModal(true);
  };

  const toggleSelect = (id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  const toggleSelectAll = () => {
    if (selectedIds.size === filtered.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(filtered.map((tx) => tx.id)));
    }
  };

  const exitSelectMode = () => {
    setSelectMode(false);
    setSelectedIds(new Set());
  };

  const handleDelete = (tx: Transaction) => {
    Alert.alert(
      t('deleteTransactionTitle'),
      t('deleteTransactionMsg').replace('{name}', tx.description),
      [
        { text: t('cancel'), style: 'cancel' },
        {
          text: t('delete'),
          style: 'destructive',
          onPress: () => removeTransaction(tx.id),
        },
      ]
    );
  };

  const handleDeleteSelected = () => {
    const count = selectedIds.size;
    Alert.alert(
      t('deleteSelectedTitle').replace('{count}', count.toString()),
      t('deleteSelectedMsg').replace('{count}', count.toString()),
      [
        { text: t('cancel'), style: 'cancel' },
        {
          text: t('deleteSelected'),
          style: 'destructive',
          onPress: () => {
            removeTransactions([...selectedIds]);
            exitSelectMode();
          },
        },
      ]
    );
  };

  const selectedCount = selectedIds.size;

  const applyFilter = (month: number | null, year: number | null) => {
    setFilterMonth(month);
    setFilterYear(year);
    setShowFilterModal(false);
  };

  const clearFilter = () => {
    setFilterMonth(null);
    setFilterYear(null);
    setShowFilterModal(false);
  };

  const filterLabel = () => {
    if (filterMonth === null || filterYear === null) return t('allTransactions');
    return `${MONTH_NAMES[filterMonth]} ${filterYear}`;
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>{t('transactions')}</Text>
        <View style={styles.headerRight}>
          {selectMode ? (
            <TouchableOpacity onPress={exitSelectMode}>
              <Text style={styles.cancelText}>{t('cancel')}</Text>
            </TouchableOpacity>
          ) : (
            <TouchableOpacity onPress={() => setSelectMode(true)}>
              <Text style={styles.selectText}>{t('selectMode')}</Text>
            </TouchableOpacity>
          )}
          <TouchableOpacity style={styles.addButton} onPress={openAdd}>
            <Text style={styles.addButtonText}>{t('add')}</Text>
          </TouchableOpacity>
        </View>
      </View>

      <TouchableOpacity style={styles.filterBar} onPress={() => setShowFilterModal(true)}>
        <Text style={styles.filterLabel}>{filterLabel()}</Text>
        <Text style={styles.filterChevron}>▼</Text>
      </TouchableOpacity>

      <View style={styles.totalBar}>
        <View style={styles.totalItem}>
          <Text style={[styles.totalLabel, { color: colors.success }]}>{t('income')}</Text>
          <Text style={[styles.totalValue, { color: colors.success }]}>
            + Rp {totals.income.toLocaleString('id-ID')}
          </Text>
        </View>
        <View style={styles.totalItem}>
          <Text style={[styles.totalLabel, { color: colors.danger }]}>{t('expense')}</Text>
          <Text style={[styles.totalValue, { color: colors.danger }]}>
            - Rp {totals.expense.toLocaleString('id-ID')}
          </Text>
        </View>
      </View>

      {selectMode && filtered.length > 0 && (
        <View style={styles.selectBar}>
          <TouchableOpacity onPress={toggleSelectAll}>
            <Text style={styles.selectAllText}>
              {selectedCount === filtered.length ? t('deselectAll') : t('selectAll')}
            </Text>
          </TouchableOpacity>
          {selectedCount > 0 && (
            <TouchableOpacity onPress={handleDeleteSelected}>
              <Text style={styles.deleteSelectedText}>
                {t('deleteSelected')} ({selectedCount})
              </Text>
            </TouchableOpacity>
          )}
        </View>
      )}

      <FlatList
        data={filtered}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        ListEmptyComponent={<Text style={styles.emptyText}>{t('emptyTransactions')}</Text>}
        renderItem={({ item }) => (
          <View style={styles.row}>
            {selectMode && (
              <TouchableOpacity onPress={() => toggleSelect(item.id)} style={styles.checkbox}>
                <View
                  style={[styles.checkboxBox, selectedIds.has(item.id) && styles.checkboxChecked]}
                >
                  {selectedIds.has(item.id) && <Text style={styles.checkmark}>✓</Text>}
                </View>
              </TouchableOpacity>
            )}
            <View style={styles.rowInfo}>
              <Text style={styles.rowName}>{item.description}</Text>
              <Text style={styles.rowSub}>
                {categoryName(item.category)} · {new Date(item.date).toLocaleDateString('id-ID')}
              </Text>
            </View>
            <Text
              style={[
                styles.rowAmount,
                { color: item.type === 'income' ? colors.success : colors.danger },
              ]}
            >
              {item.type === 'income' ? '+' : '-'} Rp {item.amount.toLocaleString()}
            </Text>
            {!selectMode && (
              <View style={styles.rowActions}>
                <TouchableOpacity onPress={() => openEdit(item)}>
                  <Text style={styles.editText}>{t('edit')}</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={() => handleDelete(item)}>
                  <Text style={styles.deleteText}>{t('delete')}</Text>
                </TouchableOpacity>
              </View>
            )}
          </View>
        )}
      />

      <AddTransactionModal
        visible={showAddModal}
        onClose={() => setShowAddModal(false)}
        editing={editing}
      />

      <Modal visible={showFilterModal} transparent animationType="fade">
        <TouchableOpacity style={styles.modalOverlay} onPress={() => setShowFilterModal(false)}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>{t('filterByMonthYear')}</Text>
            <FlatList
              data={[...years].sort((a, b) => a - b)}
              keyExtractor={(item) => String(item)}
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.yearList}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={[styles.yearItem, filterYear === item && styles.yearItemActive]}
                  onPress={() => applyFilter(filterMonth, item)}
                >
                  <Text style={[styles.yearText, filterYear === item && styles.yearTextActive]}>
                    {item}
                  </Text>
                </TouchableOpacity>
              )}
            />
            <FlatList
              data={MONTH_NAMES.map((name, idx) => ({ name, idx }))}
              keyExtractor={(item) => String(item.idx)}
              showsVerticalScrollIndicator={false}
              contentContainerStyle={styles.monthList}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={[styles.monthItem, filterMonth === item.idx && styles.monthItemActive]}
                  onPress={() => applyFilter(item.idx, filterYear ?? new Date().getFullYear())}
                >
                  <Text
                    style={[styles.monthText, filterMonth === item.idx && styles.monthTextActive]}
                  >
                    {item.name}
                  </Text>
                </TouchableOpacity>
              )}
            />
            <View style={styles.modalActions}>
              <TouchableOpacity onPress={clearFilter} style={styles.modalClearButton}>
                <Text style={styles.modalClearText}>{t('clearFilter')}</Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => setShowFilterModal(false)}
                style={styles.modalCloseButton}
              >
                <Text style={styles.modalCloseText}>{t('close')}</Text>
              </TouchableOpacity>
            </View>
          </View>
        </TouchableOpacity>
      </Modal>
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
      paddingHorizontal: 20,
      paddingVertical: 16,
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
    },
    headerRight: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 12,
    },
    headerTitle: {
      fontSize: 26,
      fontWeight: '700',
      color: colors.text,
    },
    addButton: {
      backgroundColor: colors.primary,
      paddingHorizontal: 14,
      paddingVertical: 8,
      borderRadius: 8,
    },
    addButtonText: {
      color: '#fff',
      fontSize: 14,
      fontWeight: '600',
    },
    selectText: {
      color: colors.primary,
      fontSize: 14,
      fontWeight: '600',
    },
    cancelText: {
      color: colors.textMuted,
      fontSize: 14,
      fontWeight: '600',
    },
    filterBar: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingHorizontal: 20,
      paddingVertical: 10,
      backgroundColor: colors.backgroundElement,
      borderBottomWidth: 1,
      borderBottomColor: colors.border,
    },
    filterLabel: {
      fontSize: 14,
      fontWeight: '600',
      color: colors.text,
    },
    filterChevron: {
      fontSize: 12,
      color: colors.textMuted,
    },
    totalBar: {
      flexDirection: 'row',
      paddingHorizontal: 20,
      paddingVertical: 12,
      gap: 16,
    },
    totalItem: {
      flex: 1,
    },
    totalLabel: {
      fontSize: 12,
      fontWeight: '600',
      marginBottom: 2,
    },
    totalValue: {
      fontSize: 16,
      fontWeight: '700',
    },
    selectBar: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingHorizontal: 20,
      paddingVertical: 8,
      backgroundColor: colors.backgroundElement,
    },
    selectAllText: {
      fontSize: 13,
      color: colors.primary,
      fontWeight: '600',
    },
    deleteSelectedText: {
      fontSize: 13,
      color: colors.danger,
      fontWeight: '600',
    },
    listContent: {
      paddingHorizontal: 16,
      paddingBottom: 24,
    },
    emptyText: {
      textAlign: 'center',
      color: colors.textMuted,
      marginTop: 32,
    },
    row: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: colors.card,
      borderRadius: 8,
      padding: 12,
      marginBottom: 8,
    },
    checkbox: {
      marginRight: 10,
    },
    checkboxBox: {
      width: 22,
      height: 22,
      borderRadius: 6,
      borderWidth: 2,
      borderColor: colors.border,
      justifyContent: 'center',
      alignItems: 'center',
    },
    checkboxChecked: {
      backgroundColor: colors.primary,
      borderColor: colors.primary,
    },
    checkmark: {
      color: '#fff',
      fontSize: 13,
      fontWeight: 'bold',
    },
    rowInfo: {
      flex: 1,
      marginRight: 8,
    },
    rowName: {
      fontSize: 15,
      fontWeight: '600',
      color: colors.text,
    },
    rowSub: {
      fontSize: 12,
      color: colors.textMuted,
      marginTop: 2,
    },
    rowAmount: {
      fontSize: 13,
      fontWeight: '600',
    },
    rowActions: {
      marginLeft: 12,
      flexDirection: 'row',
      gap: 12,
    },
    editText: {
      color: colors.primary,
      fontSize: 13,
    },
    deleteText: {
      color: colors.danger,
      fontSize: 13,
    },
    modalOverlay: {
      flex: 1,
      backgroundColor: 'rgba(0,0,0,0.5)',
      justifyContent: 'center',
      alignItems: 'center',
      padding: 20,
    },
    modalContent: {
      backgroundColor: colors.card,
      borderRadius: 16,
      padding: 20,
      width: '100%',
      maxHeight: '80%',
    },
    modalTitle: {
      fontSize: 18,
      fontWeight: '700',
      color: colors.text,
      marginBottom: 16,
      textAlign: 'center',
    },
    yearList: {
      paddingBottom: 12,
    },
    yearItem: {
      paddingHorizontal: 16,
      paddingVertical: 10,
      borderRadius: 20,
      borderWidth: 1,
      borderColor: colors.border,
      backgroundColor: colors.backgroundElement,
      marginRight: 8,
    },
    yearItemActive: {
      backgroundColor: colors.primary,
      borderColor: colors.primary,
    },
    yearText: {
      fontSize: 14,
      fontWeight: '600',
      color: colors.text,
    },
    yearTextActive: {
      color: '#fff',
    },
    monthList: {
      paddingVertical: 8,
    },
    monthItem: {
      paddingVertical: 14,
      borderBottomWidth: 1,
      borderBottomColor: colors.border,
    },
    monthItemActive: {
      backgroundColor: colors.backgroundElement,
    },
    monthText: {
      fontSize: 15,
      color: colors.text,
    },
    monthTextActive: {
      color: colors.primary,
      fontWeight: '700',
    },
    modalActions: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      marginTop: 16,
      gap: 12,
    },
    modalClearButton: {
      flex: 1,
      paddingVertical: 12,
      borderRadius: 8,
      borderWidth: 1,
      borderColor: colors.border,
      alignItems: 'center',
    },
    modalClearText: {
      color: colors.text,
      fontWeight: '600',
    },
    modalCloseButton: {
      flex: 1,
      paddingVertical: 12,
      borderRadius: 8,
      backgroundColor: colors.primary,
      alignItems: 'center',
    },
    modalCloseText: {
      color: '#fff',
      fontWeight: '600',
    },
  });
