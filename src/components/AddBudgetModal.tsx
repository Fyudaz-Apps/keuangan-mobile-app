import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { Modal, Input, Button } from '@/components/ui';
import { useBudgetStore, useCategoryStore } from '@/store';
import { Budget } from '@/database/models';
import { generateId } from '@/utils';

const PERIODS: { key: Budget['period']; label: string }[] = [
  { key: 'daily', label: 'Harian' },
  { key: 'weekly', label: 'Mingguan' },
  { key: 'monthly', label: 'Bulanan' },
  { key: 'yearly', label: 'Tahunan' },
];

interface AddBudgetModalProps {
  visible: boolean;
  onClose: () => void;
}

export default function AddBudgetModal({ visible, onClose }: AddBudgetModalProps) {
  const { addBudget } = useBudgetStore();
  const { categories } = useCategoryStore();
  const [categoryId, setCategoryId] = useState('');
  const [amount, setAmount] = useState('');
  const [period, setPeriod] = useState<Budget['period']>('monthly');

  const resetForm = () => {
    setCategoryId('');
    setAmount('');
    setPeriod('monthly');
  };

  const handleSave = () => {
    const numericAmount = parseFloat(amount);
    if (isNaN(numericAmount) || numericAmount <= 0) {
      Alert.alert('Error', 'Masukkan jumlah yang valid.');
      return;
    }
    if (!categoryId) {
      Alert.alert('Error', 'Pilih kategori.');
      return;
    }

    const now = new Date();
    addBudget({
      id: generateId(),
      category: categoryId,
      amount: numericAmount,
      period,
      startDate: now,
      endDate: undefined,
      createdAt: now,
      updatedAt: now,
    });

    resetForm();
    onClose();
    Alert.alert('Berhasil', 'Budget berhasil ditambahkan!');
  };

  return (
    <Modal visible={visible} onClose={onClose}>
      <ScrollView showsVerticalScrollIndicator={false}>
        <Text style={styles.title}>Tambah Budget</Text>

        <Text style={styles.fieldLabel}>Kategori</Text>
        {categories.length === 0 ? (
          <Text style={styles.emptyHint}>Belum ada kategori. Tambahkan kategori dulu.</Text>
        ) : (
          <View style={styles.chipGrid}>
            {categories.map((cat) => (
              <TouchableOpacity
                key={cat.id}
                style={[styles.chip, categoryId === cat.id && styles.chipActive]}
                onPress={() => setCategoryId(cat.id)}
              >
                <Text style={[styles.chipText, categoryId === cat.id && styles.chipTextActive]}>
                  {cat.name}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        )}

        <Input
          label="Jumlah (Rp)"
          placeholder="Contoh: 1000000"
          value={amount}
          onChangeText={setAmount}
          keyboardType="numeric"
        />

        <Text style={styles.fieldLabel}>Periode</Text>
        <View style={styles.chipGrid}>
          {PERIODS.map((p) => (
            <TouchableOpacity
              key={p.key}
              style={[styles.chip, period === p.key && styles.chipActive]}
              onPress={() => setPeriod(p.key)}
            >
              <Text style={[styles.chipText, period === p.key && styles.chipTextActive]}>
                {p.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        <View style={styles.actions}>
          <Button title="Simpan" onPress={handleSave} style={styles.saveButton} />
          <Button
            title="Batal"
            onPress={() => {
              resetForm();
              onClose();
            }}
            variant="secondary"
            style={styles.cancelButton}
          />
        </View>
      </ScrollView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#000',
    marginBottom: 16,
    textAlign: 'center',
  },
  fieldLabel: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 8,
    marginTop: 8,
    color: '#000',
  },
  emptyHint: {
    fontSize: 13,
    color: '#999',
    marginBottom: 8,
  },
  chipGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 8,
  },
  chip: {
    paddingVertical: 6,
    paddingHorizontal: 14,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#d0d0d0',
    backgroundColor: '#f9f9f9',
  },
  chipActive: {
    backgroundColor: '#208AEF',
    borderColor: '#208AEF',
  },
  chipText: {
    fontSize: 13,
    color: '#555',
  },
  chipTextActive: {
    color: '#fff',
    fontWeight: '600',
  },
  actions: {
    marginTop: 8,
    gap: 8,
  },
  saveButton: {
    marginTop: 4,
  },
  cancelButton: {
    marginTop: 0,
  },
});
