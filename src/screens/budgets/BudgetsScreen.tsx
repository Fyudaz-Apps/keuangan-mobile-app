import React, { useState } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useBudgetStore, useCategoryStore } from '@/store';
import { Budget } from '@/database/models';
import { useTheme, Theme } from '@/hooks/use-theme';
import { useT } from '@/i18n';
import AddBudgetModal from '@/components/AddBudgetModal';

export default function BudgetsScreen() {
  const { budgets, removeBudget } = useBudgetStore();
  const { categories } = useCategoryStore();
  const colors = useTheme();
  const t = useT();
  const styles = createStyles(colors);
  const [showAddModal, setShowAddModal] = useState(false);
  const [editing, setEditing] = useState<Budget | null>(null);

  const categoryName = (id: string) => categories.find((c) => c.id === id)?.name ?? id;

  const openAdd = () => {
    setEditing(null);
    setShowAddModal(true);
  };

  const openEdit = (budget: Budget) => {
    setEditing(budget);
    setShowAddModal(true);
  };

  const handleDelete = (id: string, name: string) => {
    Alert.alert(t('deleteBudgetTitle'), t('deleteBudgetMsg').replace('{name}', name), [
      { text: t('cancel'), style: 'cancel' },
      {
        text: t('delete'),
        style: 'destructive',
        onPress: () => removeBudget(id),
      },
    ]);
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>{t('budgets')}</Text>
        <TouchableOpacity style={styles.addButton} onPress={openAdd}>
          <Text style={styles.addButtonText}>{t('add')}</Text>
        </TouchableOpacity>
      </View>

      <FlatList
        data={budgets}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        ListEmptyComponent={<Text style={styles.emptyText}>{t('emptyBudgets')}</Text>}
        renderItem={({ item }) => (
          <View style={styles.row}>
            <View style={styles.rowInfo}>
              <Text style={styles.rowName}>{categoryName(item.category)}</Text>
              <Text style={styles.rowSub}>
                Rp {item.amount.toLocaleString()} · {t(item.period)}
              </Text>
            </View>
            <View style={styles.rowActions}>
              <TouchableOpacity onPress={() => openEdit(item)}>
                <Text style={styles.editText}>{t('edit')}</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={() => handleDelete(item.id, categoryName(item.category))}>
                <Text style={styles.deleteText}>{t('delete')}</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}
      />

      <AddBudgetModal
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
    rowInfo: {
      flex: 1,
    },
    rowName: {
      fontSize: 16,
      fontWeight: '600',
      color: colors.text,
    },
    rowSub: {
      fontSize: 13,
      color: colors.textMuted,
      marginTop: 2,
    },
    rowActions: {
      flexDirection: 'row',
      gap: 12,
      marginLeft: 8,
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
