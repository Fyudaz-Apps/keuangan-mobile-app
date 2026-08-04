import React, { useEffect, useState } from 'react';
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
import DateTimePicker, { DateTimePickerEvent } from '@react-native-community/datetimepicker';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Modal, Input, Button } from '@/components/ui';
import { useTransactionStore, useCategoryStore } from '@/store';
import {
  parseTransactionWithAI,
  isAiProviderConfigured,
  ParsedTransaction,
} from '@/services/geminiService';
import { generateId, formatDate } from '@/utils';
import { Transaction } from '@/database/models';

const transactionFormSchema = z.object({
  amount: z
    .string()
    .min(1, 'Jumlah wajib diisi')
    .refine((value) => parseAmount(value) > 0, 'Jumlah harus lebih dari 0'),
  description: z.string().trim().min(1, 'Deskripsi wajib diisi'),
  category: z.string().min(1, 'Pilih kategori'),
  type: z.enum(['income', 'expense']),
  date: z.date(),
  notes: z.string().optional(),
});

type TransactionFormValues = z.infer<typeof transactionFormSchema>;

function parseAmount(value: string): number {
  const cleaned = value.replace(/[^\d.,]/g, '');
  const normalized = cleaned.replace(/\./g, '').replace(',', '.');
  const num = Number(normalized);
  return isNaN(num) ? 0 : num;
}

const defaultFormValues: TransactionFormValues = {
  amount: '',
  description: '',
  category: '',
  type: 'expense',
  date: new Date(),
  notes: '',
};

interface AddTransactionModalProps {
  visible: boolean;
  onClose: () => void;
  editingTransaction?: Transaction | null;
}

export default function AddTransactionModal({
  visible,
  onClose,
  editingTransaction,
}: AddTransactionModalProps) {
  const { addTransaction, updateTransaction } = useTransactionStore();
  const { categories } = useCategoryStore();

  const {
    handleSubmit,
    watch,
    setValue,
    reset,
    formState: { errors },
  } = useForm<TransactionFormValues>({
    resolver: zodResolver(transactionFormSchema),
    defaultValues: defaultFormValues,
  });

  const [aiInput, setAiInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [showDatePicker, setShowDatePicker] = useState(false);

  const type = watch('type');
  const date = watch('date');
  const amount = watch('amount');
  const description = watch('description');
  const category = watch('category');
  const notes = watch('notes');

  const isEditing = !!editingTransaction;

  const typeCategories = categories.filter((c) => c.type === type);

  useEffect(() => {
    if (visible) {
      if (editingTransaction) {
        reset({
          amount: String(editingTransaction.amount),
          description: editingTransaction.description,
          category: editingTransaction.category,
          type: editingTransaction.type,
          date: new Date(editingTransaction.date),
          notes: editingTransaction.notes ?? '',
        });
      } else {
        reset(defaultFormValues);
      }
      setAiInput('');
    }
  }, [visible, editingTransaction, reset]);

  const handleTypeChange = (nextType: 'income' | 'expense') => {
    setValue('type', nextType, { shouldValidate: true });
    if (category && !categories.find((c) => c.type === nextType && c.id === category)) {
      const firstOfType = categories.find((c) => c.type === nextType);
      setValue('category', firstOfType?.id ?? '', { shouldValidate: true });
    }
  };

  const onDateChange = (event: DateTimePickerEvent, selectedDate?: Date) => {
    if (Platform.OS === 'android') {
      setShowDatePicker(false);
    }
    if (selectedDate) {
      setValue('date', selectedDate, { shouldValidate: true });
    }
  };

  const onSubmit = async (values: TransactionFormValues) => {
    setIsSaving(true);
    try {
      const now = new Date();
      const payload = {
        amount: parseAmount(values.amount),
        description: values.description.trim(),
        category: values.category,
        type: values.type,
        date: values.date,
        notes: values.notes?.trim() || undefined,
      };

      if (editingTransaction) {
        await updateTransaction(editingTransaction.id, {
          ...payload,
          updatedAt: now,
        });
      } else {
        await addTransaction({
          ...payload,
          id: generateId(),
          createdAt: now,
          updatedAt: now,
        });
      }

      reset();
      onClose();
    } catch {
      Alert.alert('Error', 'Gagal menyimpan transaksi. Silakan coba lagi.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleAiParse = async () => {
    if (!aiInput.trim()) {
      Alert.alert('Error', 'Ketik deskripsi transaksi untuk di-parse AI.');
      return;
    }

    if (!isAiProviderConfigured()) {
      Alert.alert(
        'AI Provider Belum Dikonfigurasi',
        'Tambahkan EXPO_PUBLIC_9ROUTER_URL dan EXPO_PUBLIC_9ROUTER_API_KEY ke file .env'
      );
      return;
    }

    setIsLoading(true);
    try {
      const parsed: ParsedTransaction = await parseTransactionWithAI(aiInput.trim());
      setValue('amount', String(parsed.amount));
      setValue('description', parsed.description);
      setValue('type', parsed.type);
      const categoriesOfType = categories.filter((c) => c.type === parsed.type);
      const matched = categoriesOfType.find(
        (c) => c.name.toLowerCase() === parsed.category.toLowerCase()
      );
      setValue('category', matched?.id ?? categoriesOfType[0]?.id ?? '', {
        shouldValidate: true,
      });
    } catch (error: any) {
      Alert.alert('AI Error', error.message || 'Gagal mem-parse transaksi dengan AI.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Modal visible={visible} onClose={onClose}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView showsVerticalScrollIndicator={false}>
          <Text style={styles.title}>{isEditing ? 'Edit Transaksi' : 'Tambah Transaksi'}</Text>

          {/* AI Assist Section (only when adding) */}
          {!isEditing && (
            <View style={styles.aiSection}>
              <Text style={styles.sectionLabel}>✨ AI Assist</Text>
              <Text style={styles.aiHint}>
                {'Ketik deskripsi natural, misalnya: "makan bakso 25rb" atau "gaji bulanan 5jt"'}
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
                <ActivityIndicator size="small" color="#208AEF" style={styles.loader} />
              )}
            </View>
          )}

          {!isEditing && <View style={styles.divider} />}

          {/* Manual Form */}
          <Text style={styles.sectionLabel}>📝 Detail Transaksi</Text>

          {/* Type Toggle */}
          <View style={styles.typeToggle}>
            <TouchableOpacity
              style={[styles.typeButton, type === 'expense' && styles.typeButtonActiveExpense]}
              onPress={() => handleTypeChange('expense')}
            >
              <Text
                style={[styles.typeButtonText, type === 'expense' && styles.typeButtonTextActive]}
              >
                💸 Pengeluaran
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.typeButton, type === 'income' && styles.typeButtonActiveIncome]}
              onPress={() => handleTypeChange('income')}
            >
              <Text
                style={[styles.typeButtonText, type === 'income' && styles.typeButtonTextActive]}
              >
                💰 Pemasukan
              </Text>
            </TouchableOpacity>
          </View>

          <Input
            label="Jumlah (Rp)"
            placeholder="Contoh: 25000"
            value={amount}
            onChangeText={(text) => setValue('amount', text, { shouldValidate: true })}
            keyboardType="numeric"
            error={errors.amount?.message}
          />

          <Input
            label="Deskripsi"
            placeholder="Contoh: Makan siang"
            value={description}
            onChangeText={(text) => setValue('description', text, { shouldValidate: true })}
            error={errors.description?.message}
          />

          {/* Date Picker */}
          <Text style={styles.fieldLabel}>Tanggal</Text>
          <TouchableOpacity style={styles.dateButton} onPress={() => setShowDatePicker(true)}>
            <Text style={styles.dateButtonText}>{date ? formatDate(date) : 'Pilih tanggal'}</Text>
          </TouchableOpacity>
          {showDatePicker && (
            <DateTimePicker
              value={date || new Date()}
              mode="date"
              display={Platform.OS === 'ios' ? 'spinner' : 'default'}
              onChange={onDateChange}
            />
          )}

          {/* Category Picker */}
          <Text style={styles.fieldLabel}>Kategori</Text>
          {typeCategories.length === 0 ? (
            <Text style={styles.emptyCategoryText}>Belum ada kategori untuk tipe ini.</Text>
          ) : (
            <View style={styles.categoryGrid}>
              {typeCategories.map((cat) => (
                <TouchableOpacity
                  key={cat.id}
                  style={[styles.categoryChip, category === cat.id && styles.categoryChipActive]}
                  onPress={() => setValue('category', cat.id, { shouldValidate: true })}
                >
                  <Text
                    style={[
                      styles.categoryChipText,
                      category === cat.id && styles.categoryChipTextActive,
                    ]}
                  >
                    {cat.name}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          )}
          {errors.category && <Text style={styles.errorText}>{errors.category.message}</Text>}

          <Input
            label="Catatan (opsional)"
            placeholder="Catatan tambahan"
            value={notes}
            onChangeText={(text) => setValue('notes', text)}
            multiline
          />

          {/* Action Buttons */}
          <View style={styles.actions}>
            <Button
              title={isSaving ? 'Menyimpan...' : isEditing ? 'Simpan Perubahan' : 'Simpan'}
              onPress={handleSubmit(onSubmit)}
              disabled={isSaving}
              style={styles.saveButton}
            />
            <Button
              title="Batal"
              onPress={() => {
                reset();
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
  dateButton: {
    borderWidth: 1,
    borderColor: '#d0d0d0',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 12,
    marginBottom: 8,
  },
  dateButtonText: {
    fontSize: 14,
    color: '#000',
  },
  categoryGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 8,
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
  emptyCategoryText: {
    fontSize: 13,
    color: '#999',
    marginBottom: 8,
  },
  errorText: {
    color: '#ff4444',
    fontSize: 12,
    marginBottom: 4,
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
