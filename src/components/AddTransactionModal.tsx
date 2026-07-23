import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { Modal, Input, Button } from '@/components/ui';
import { useTransactionStore } from '@/store';
import {
  parseTransactionWithAI,
  isGeminiConfigured,
  ParsedTransaction,
} from '@/services/geminiService';
import { generateId } from '@/utils';

const CATEGORIES = [
  'Food',
  'Transport',
  'Entertainment',
  'Utilities',
  'Health',
  'Education',
  'Shopping',
  'Salary',
  'Other',
];

interface AddTransactionModalProps {
  visible: boolean;
  onClose: () => void;
}

export default function AddTransactionModal({
  visible,
  onClose,
}: AddTransactionModalProps) {
  const { addTransaction } = useTransactionStore();

  // Form state
  const [amount, setAmount] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('Other');
  const [type, setType] = useState<'income' | 'expense'>('expense');

  // AI assist state
  const [aiInput, setAiInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const resetForm = () => {
    setAmount('');
    setDescription('');
    setCategory('Other');
    setType('expense');
    setAiInput('');
  };

  const handleSave = () => {
    const numericAmount = parseFloat(amount);
    if (isNaN(numericAmount) || numericAmount <= 0) {
      Alert.alert('Error', 'Masukkan jumlah yang valid.');
      return;
    }
    if (!description.trim()) {
      Alert.alert('Error', 'Masukkan deskripsi transaksi.');
      return;
    }

    const now = new Date();
    addTransaction({
      id: generateId(),
      amount: numericAmount,
      description: description.trim(),
      category,
      type,
      date: now,
      createdAt: now,
      updatedAt: now,
    });

    resetForm();
    onClose();
    Alert.alert('Berhasil', 'Transaksi berhasil ditambahkan!');
  };

  const handleAiParse = async () => {
    if (!aiInput.trim()) {
      Alert.alert('Error', 'Ketik deskripsi transaksi untuk di-parse AI.');
      return;
    }

    if (!isGeminiConfigured()) {
      Alert.alert(
        'Gemini Belum Dikonfigurasi',
        'Tambahkan EXPO_PUBLIC_GEMINI_API_KEY di file .env',
      );
      return;
    }

    setIsLoading(true);
    try {
      const parsed: ParsedTransaction = await parseTransactionWithAI(
        aiInput.trim(),
      );
      setAmount(parsed.amount.toString());
      setDescription(parsed.description);
      setCategory(parsed.category);
      setType(parsed.type);
    } catch (error: any) {
      Alert.alert(
        'AI Error',
        error.message || 'Gagal mem-parse transaksi dengan AI.',
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Modal visible={visible} onClose={onClose}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView showsVerticalScrollIndicator={false}>
          <Text style={styles.title}>Tambah Transaksi</Text>

          {/* AI Assist Section */}
          <View style={styles.aiSection}>
            <Text style={styles.sectionLabel}>✨ AI Assist</Text>
            <Text style={styles.aiHint}>
              Ketik deskripsi natural, misalnya: "makan bakso 25rb" atau "gaji
              bulanan 5jt"
            </Text>
            <Input
              placeholder='Contoh: "beli kopi 18rb"'
              value={aiInput}
              onChangeText={setAiInput}
              editable={!isLoading}
            />
            <Button
              title={isLoading ? 'Memproses...' : '🤖 Parse dengan AI'}
              onPress={handleAiParse}
              disabled={isLoading}
              variant="secondary"
              size="small"
              style={styles.aiButton}
            />
            {isLoading && (
              <ActivityIndicator
                size="small"
                color="#208AEF"
                style={styles.loader}
              />
            )}
          </View>

          <View style={styles.divider} />

          {/* Manual Form */}
          <Text style={styles.sectionLabel}>📝 Detail Transaksi</Text>

          {/* Type Toggle */}
          <View style={styles.typeToggle}>
            <TouchableOpacity
              style={[
                styles.typeButton,
                type === 'expense' && styles.typeButtonActiveExpense,
              ]}
              onPress={() => setType('expense')}
            >
              <Text
                style={[
                  styles.typeButtonText,
                  type === 'expense' && styles.typeButtonTextActive,
                ]}
              >
                💸 Pengeluaran
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                styles.typeButton,
                type === 'income' && styles.typeButtonActiveIncome,
              ]}
              onPress={() => setType('income')}
            >
              <Text
                style={[
                  styles.typeButtonText,
                  type === 'income' && styles.typeButtonTextActive,
                ]}
              >
                💰 Pemasukan
              </Text>
            </TouchableOpacity>
          </View>

          <Input
            label="Jumlah (Rp)"
            placeholder="Contoh: 25000"
            value={amount}
            onChangeText={setAmount}
            keyboardType="numeric"
          />

          <Input
            label="Deskripsi"
            placeholder="Contoh: Makan siang"
            value={description}
            onChangeText={setDescription}
          />

          {/* Category Picker */}
          <Text style={styles.fieldLabel}>Kategori</Text>
          <View style={styles.categoryGrid}>
            {CATEGORIES.map((cat) => (
              <TouchableOpacity
                key={cat}
                style={[
                  styles.categoryChip,
                  category === cat && styles.categoryChipActive,
                ]}
                onPress={() => setCategory(cat)}
              >
                <Text
                  style={[
                    styles.categoryChipText,
                    category === cat && styles.categoryChipTextActive,
                  ]}
                >
                  {cat}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* Action Buttons */}
          <View style={styles.actions}>
            <Button
              title="Simpan"
              onPress={handleSave}
              style={styles.saveButton}
            />
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
      </KeyboardAvoidingView>
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
  aiSection: {
    backgroundColor: '#f0f7ff',
    borderRadius: 12,
    padding: 12,
    marginBottom: 8,
  },
  aiHint: {
    fontSize: 12,
    color: '#666',
    marginBottom: 8,
  },
  aiButton: {
    marginTop: 4,
  },
  loader: {
    marginTop: 8,
  },
  divider: {
    height: 1,
    backgroundColor: '#e0e0e0',
    marginVertical: 16,
  },
  sectionLabel: {
    fontSize: 16,
    fontWeight: '700',
    color: '#333',
    marginBottom: 8,
  },
  typeToggle: {
    flexDirection: 'row',
    marginBottom: 12,
    gap: 8,
  },
  typeButton: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#d0d0d0',
    alignItems: 'center',
  },
  typeButtonActiveExpense: {
    backgroundColor: '#ffe0e0',
    borderColor: '#ff4444',
  },
  typeButtonActiveIncome: {
    backgroundColor: '#e0ffe0',
    borderColor: '#44bb44',
  },
  typeButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#666',
  },
  typeButtonTextActive: {
    color: '#000',
  },
  fieldLabel: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 8,
    marginTop: 8,
    color: '#000',
  },
  categoryGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 16,
  },
  categoryChip: {
    paddingVertical: 6,
    paddingHorizontal: 14,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#d0d0d0',
    backgroundColor: '#f9f9f9',
  },
  categoryChipActive: {
    backgroundColor: '#208AEF',
    borderColor: '#208AEF',
  },
  categoryChipText: {
    fontSize: 13,
    color: '#555',
  },
  categoryChipTextActive: {
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
