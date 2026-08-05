import React, { useState } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTransactionStore, useCategoryStore } from '@/store';
import { Transaction } from '@/database/models';
import { useTheme, Theme } from '@/hooks/use-theme';
import { useT } from '@/i18n';
import AddTransactionModal from '@/components/AddTransactionModal';

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

  const categoryName = (name: string) => categories.find((c) => c.name === name)?.name ?? name;

  const sorted = [...transactions].sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
  );

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
    if (selectedIds.size === sorted.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(sorted.map((tx) => tx.id)));
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

      {selectMode && sorted.length > 0 && (
        <View style={styles.selectBar}>
          <TouchableOpacity onPress={toggleSelectAll}>
            <Text style={styles.selectAllText}>
              {selectedCount === sorted.length ? t('deselectAll') : t('selectAll')}
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
        data={sorted}
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
  });
