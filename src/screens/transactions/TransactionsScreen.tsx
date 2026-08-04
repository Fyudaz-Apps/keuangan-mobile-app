import React, { useMemo, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import DateTimePicker, { DateTimePickerEvent } from '@react-native-community/datetimepicker';
import { Ionicons } from '@expo/vector-icons';
import { Card, Button, Input } from '@/components/ui';
import AddTransactionModal from '@/components/AddTransactionModal';
import { useTransactionStore, useCategoryStore } from '@/store';
import { formatCurrency, formatDate } from '@/utils';
import { Transaction } from '@/database/models';

type TypeFilter = 'all' | 'income' | 'expense';

const TYPE_FILTERS: { value: TypeFilter; label: string }[] = [
  { value: 'all', label: 'Semua' },
  { value: 'income', label: '💰 Pemasukan' },
  { value: 'expense', label: '💸 Pengeluaran' },
];

export default function TransactionsScreen() {
  const { transactions, removeTransaction } = useTransactionStore();
  const { categories } = useCategoryStore();

  const [showAddModal, setShowAddModal] = useState(false);
  const [editingTransaction, setEditingTransaction] = useState<Transaction | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState<TypeFilter>('all');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [startDate, setStartDate] = useState<Date | null>(null);
  const [endDate, setEndDate] = useState<Date | null>(null);
  const [showStartPicker, setShowStartPicker] = useState(false);
  const [showEndPicker, setShowEndPicker] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const categoryMap = useMemo(() => {
    const map: Record<string, string> = {};
    categories.forEach((c) => {
      map[c.id] = c.name;
    });
    return map;
  }, [categories]);

  const filteredTransactions = useMemo(() => {
    return transactions
      .filter((t) => typeFilter === 'all' || t.type === typeFilter)
      .filter((t) => categoryFilter === 'all' || t.category === categoryFilter)
      .filter((t) => {
        const query = searchQuery.trim().toLowerCase();
        if (!query) return true;
        return t.description.toLowerCase().includes(query);
      })
      .filter((t) => {
        const d = new Date(t.date);
        const day = new Date(d.getFullYear(), d.getMonth(), d.getDate());
        if (
          startDate &&
          day < new Date(startDate.getFullYear(), startDate.getMonth(), startDate.getDate())
        ) {
          return false;
        }
        if (
          endDate &&
          day > new Date(endDate.getFullYear(), endDate.getMonth(), endDate.getDate())
        ) {
          return false;
        }
        return true;
      })
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }, [transactions, searchQuery, typeFilter, categoryFilter, startDate, endDate]);

  const hasActiveFilters =
    searchQuery.trim() !== '' ||
    typeFilter !== 'all' ||
    categoryFilter !== 'all' ||
    startDate !== null ||
    endDate !== null;

  const openAddModal = () => {
    setEditingTransaction(null);
    setShowAddModal(true);
  };

  const openEditModal = (transaction: Transaction) => {
    setEditingTransaction(transaction);
    setShowAddModal(true);
  };

  const handleDelete = (id: string) => {
    Alert.alert('Hapus Transaksi', 'Yakin ingin menghapus transaksi ini?', [
      { text: 'Batal', style: 'cancel' },
      {
        text: 'Hapus',
        style: 'destructive',
        onPress: async () => {
          setDeletingId(id);
          try {
            await removeTransaction(id);
          } catch {
            Alert.alert('Error', 'Gagal menghapus transaksi.');
          } finally {
            setDeletingId(null);
          }
        },
      },
    ]);
  };

  const onStartDateChange = (event: DateTimePickerEvent, selectedDate?: Date) => {
    if (Platform.OS === 'android') setShowStartPicker(false);
    if (selectedDate) setStartDate(selectedDate);
  };

  const onEndDateChange = (event: DateTimePickerEvent, selectedDate?: Date) => {
    if (Platform.OS === 'android') setShowEndPicker(false);
    if (selectedDate) setEndDate(selectedDate);
  };

  const clearFilters = () => {
    setSearchQuery('');
    setTypeFilter('all');
    setCategoryFilter('all');
    setStartDate(null);
    setEndDate(null);
  };

  const renderItem = ({ item }: { item: Transaction }) => {
    const isIncome = item.type === 'income';
    return (
      <Card style={styles.transactionCard}>
        <View style={styles.transactionRow}>
          <View style={styles.transactionInfo}>
            <Text style={styles.transactionDescription} numberOfLines={1}>
              {item.description}
            </Text>
            <Text style={styles.transactionMeta}>
              {categoryMap[item.category] || 'Tanpa kategori'} • {formatDate(item.date)}
            </Text>
            {item.notes ? (
              <Text style={styles.transactionNotes} numberOfLines={1}>
                {item.notes}
              </Text>
            ) : null}
          </View>
          <View style={styles.transactionRight}>
            <Text style={[styles.transactionAmount, { color: isIncome ? '#4caf50' : '#ff6b6b' }]}>
              {isIncome ? '+' : '-'} {formatCurrency(item.amount)}
            </Text>
            <View style={styles.transactionActions}>
              <TouchableOpacity
                style={styles.iconButton}
                onPress={() => openEditModal(item)}
                hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
              >
                <Ionicons name="create-outline" size={18} color="#208AEF" />
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.iconButton}
                onPress={() => handleDelete(item.id)}
                disabled={deletingId === item.id}
                hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
              >
                {deletingId === item.id ? (
                  <ActivityIndicator size="small" color="#ff4444" />
                ) : (
                  <Ionicons name="trash-outline" size={18} color="#ff4444" />
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Card>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Transactions</Text>
      </View>

      <View style={styles.filtersContainer}>
        <Input
          placeholder="Cari deskripsi..."
          value={searchQuery}
          onChangeText={setSearchQuery}
          containerStyle={styles.searchInput}
        />

        {/* Type filter */}
        <View style={styles.typeFilterRow}>
          {TYPE_FILTERS.map((filter) => (
            <TouchableOpacity
              key={filter.value}
              style={[styles.filterChip, typeFilter === filter.value && styles.filterChipActive]}
              onPress={() => setTypeFilter(filter.value)}
            >
              <Text
                style={[
                  styles.filterChipText,
                  typeFilter === filter.value && styles.filterChipTextActive,
                ]}
              >
                {filter.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Category filter */}
        <FlatList
          horizontal
          showsHorizontalScrollIndicator={false}
          data={[{ id: 'all', name: 'Semua Kategori' }, ...categories]}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.categoryFilterList}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={[styles.filterChip, categoryFilter === item.id && styles.filterChipActive]}
              onPress={() => setCategoryFilter(item.id)}
            >
              <Text
                style={[
                  styles.filterChipText,
                  categoryFilter === item.id && styles.filterChipTextActive,
                ]}
              >
                {item.name}
              </Text>
            </TouchableOpacity>
          )}
        />

        {/* Date range */}
        <View style={styles.dateFilterRow}>
          <TouchableOpacity
            style={styles.dateFilterButton}
            onPress={() => setShowStartPicker(true)}
          >
            <Ionicons name="calendar-outline" size={16} color="#208AEF" />
            <Text style={styles.dateFilterText}>
              {startDate ? formatDate(startDate) : 'Dari tanggal'}
            </Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.dateFilterButton} onPress={() => setShowEndPicker(true)}>
            <Ionicons name="calendar-outline" size={16} color="#208AEF" />
            <Text style={styles.dateFilterText}>
              {endDate ? formatDate(endDate) : 'Sampai tanggal'}
            </Text>
          </TouchableOpacity>
        </View>

        {showStartPicker && (
          <DateTimePicker
            value={startDate || new Date()}
            mode="date"
            display={Platform.OS === 'ios' ? 'spinner' : 'default'}
            onChange={onStartDateChange}
          />
        )}
        {showEndPicker && (
          <DateTimePicker
            value={endDate || new Date()}
            mode="date"
            display={Platform.OS === 'ios' ? 'spinner' : 'default'}
            onChange={onEndDateChange}
          />
        )}

        {hasActiveFilters && (
          <TouchableOpacity style={styles.clearFilterButton} onPress={clearFilters}>
            <Text style={styles.clearFilterText}>Reset Filter</Text>
          </TouchableOpacity>
        )}
      </View>

      <View style={styles.listHeader}>
        <Text style={styles.listHeaderText}>{filteredTransactions.length} transaksi</Text>
        <Button title="+ Tambah" onPress={openAddModal} size="small" />
      </View>

      <FlatList
        data={filteredTransactions}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        contentContainerStyle={styles.listContent}
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <Ionicons name="file-tray-outline" size={48} color="#cccccc" />
            <Text style={styles.emptyText}>
              {transactions.length === 0
                ? 'Belum ada transaksi. Tambahkan transaksi pertamamu!'
                : 'Tidak ada transaksi yang cocok dengan filter.'}
            </Text>
            {transactions.length === 0 && <Button title="Add Transaction" onPress={openAddModal} />}
          </View>
        }
      />

      <AddTransactionModal
        visible={showAddModal}
        onClose={() => setShowAddModal(false)}
        editingTransaction={editingTransaction}
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
  filtersContainer: {
    paddingHorizontal: 16,
    paddingBottom: 8,
  },
  searchInput: {
    marginVertical: 4,
  },
  typeFilterRow: {
    flexDirection: 'row',
    gap: 8,
    marginVertical: 8,
  },
  filterChip: {
    paddingVertical: 6,
    paddingHorizontal: 14,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#d0d0d0',
    backgroundColor: '#ffffff',
  },
  filterChipActive: {
    backgroundColor: '#208AEF',
    borderColor: '#208AEF',
  },
  filterChipText: {
    fontSize: 13,
    color: '#555',
  },
  filterChipTextActive: {
    color: '#ffffff',
    fontWeight: '600',
  },
  categoryFilterList: {
    gap: 8,
    marginBottom: 8,
  },
  dateFilterRow: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 4,
  },
  dateFilterButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    borderWidth: 1,
    borderColor: '#d0d0d0',
    borderRadius: 8,
    backgroundColor: '#ffffff',
    paddingHorizontal: 10,
    paddingVertical: 10,
  },
  dateFilterText: {
    fontSize: 13,
    color: '#333',
  },
  clearFilterButton: {
    marginTop: 8,
    alignSelf: 'flex-end',
  },
  clearFilterText: {
    fontSize: 13,
    color: '#208AEF',
    fontWeight: '600',
  },
  listHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  listHeaderText: {
    fontSize: 14,
    color: '#999999',
    fontWeight: '600',
  },
  listContent: {
    paddingHorizontal: 16,
    paddingBottom: 24,
    gap: 8,
  },
  transactionCard: {
    marginHorizontal: 0,
  },
  transactionRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  transactionInfo: {
    flex: 1,
    marginRight: 12,
  },
  transactionDescription: {
    fontSize: 15,
    fontWeight: '600',
    color: '#000000',
    marginBottom: 4,
  },
  transactionMeta: {
    fontSize: 12,
    color: '#999999',
    marginBottom: 2,
  },
  transactionNotes: {
    fontSize: 12,
    color: '#bbbbbb',
  },
  transactionRight: {
    alignItems: 'flex-end',
  },
  transactionAmount: {
    fontSize: 14,
    fontWeight: '700',
    marginBottom: 6,
  },
  transactionActions: {
    flexDirection: 'row',
    gap: 16,
  },
  iconButton: {
    padding: 2,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 48,
    gap: 12,
  },
  emptyText: {
    fontSize: 14,
    color: '#999999',
    textAlign: 'center',
    marginBottom: 8,
  },
});
