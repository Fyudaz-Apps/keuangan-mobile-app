import React, { useState } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useBudgetStore, useCategoryStore } from '@/store';
import AddBudgetModal from '@/components/AddBudgetModal';

export default function BudgetsScreen() {
  const { budgets, removeBudget } = useBudgetStore();
  const { categories } = useCategoryStore();
  const [showAddModal, setShowAddModal] = useState(false);

  const categoryName = (id: string) => categories.find((c) => c.id === id)?.name ?? id;

  const handleDelete = (id: string, name: string) => {
    Alert.alert('Hapus Budget', `Hapus budget "${name}"?`, [
      { text: 'Batal', style: 'cancel' },
      {
        text: 'Hapus',
        style: 'destructive',
        onPress: () => removeBudget(id),
      },
    ]);
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Budgets</Text>
        <TouchableOpacity style={styles.addButton} onPress={() => setShowAddModal(true)}>
          <Text style={styles.addButtonText}>+ Add</Text>
        </TouchableOpacity>
      </View>

      <FlatList
        data={budgets}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        ListEmptyComponent={<Text style={styles.emptyText}>Belum ada budget.</Text>}
        renderItem={({ item }) => (
          <View style={styles.row}>
            <View style={styles.rowInfo}>
              <Text style={styles.rowName}>{categoryName(item.category)}</Text>
              <Text style={styles.rowSub}>
                Rp {item.amount.toLocaleString()} · {item.period}
              </Text>
            </View>
            <TouchableOpacity onPress={() => handleDelete(item.id, categoryName(item.category))}>
              <Text style={styles.deleteText}>Hapus</Text>
            </TouchableOpacity>
          </View>
        )}
      />

      <AddBudgetModal visible={showAddModal} onClose={() => setShowAddModal(false)} />
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
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#000000',
  },
  addButton: {
    backgroundColor: '#208AEF',
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
    color: '#999',
    marginTop: 32,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
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
    color: '#000',
  },
  rowSub: {
    fontSize: 13,
    color: '#666',
    marginTop: 2,
  },
  deleteText: {
    color: '#ff4444',
    fontSize: 13,
  },
});
