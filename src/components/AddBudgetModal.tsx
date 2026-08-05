import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { Modal, Input, Button } from '@/components/ui';
import { useBudgetStore, useCategoryStore } from '@/store';
import { Budget } from '@/database/models';
import { useTheme, Theme } from '@/hooks/use-theme';
import { useT } from '@/i18n';
import { generateId } from '@/utils';

const PERIODS: { key: Budget['period']; label: string }[] = [
  { key: 'daily', label: 'daily' },
  { key: 'weekly', label: 'weekly' },
  { key: 'monthly', label: 'monthly' },
  { key: 'yearly', label: 'yearly' },
];

interface AddBudgetModalProps {
  visible: boolean;
  onClose: () => void;
  editing?: Budget | null;
}

export default function AddBudgetModal({ visible, onClose, editing = null }: AddBudgetModalProps) {
  const { addBudget, updateBudget } = useBudgetStore();
  const { categories } = useCategoryStore();
  const colors = useTheme();
  const t = useT();
  const styles = createStyles(colors);
  const [categoryId, setCategoryId] = useState('');
  const [amount, setAmount] = useState('');
  const [period, setPeriod] = useState<Budget['period']>('monthly');

  const resetForm = () => {
    setCategoryId('');
    setAmount('');
    setPeriod('monthly');
  };

  useEffect(() => {
    if (!visible) return;
    if (editing) {
      setCategoryId(editing.category);
      setAmount(editing.amount.toString());
      setPeriod(editing.period);
    } else {
      resetForm();
    }
  }, [visible, editing]);

  const handleSave = () => {
    const numericAmount = parseFloat(amount);
    if (isNaN(numericAmount) || numericAmount <= 0) {
      Alert.alert(t('error'), t('validAmount'));
      return;
    }
    if (!categoryId) {
      Alert.alert(t('error'), t('validCategory'));
      return;
    }

    const now = new Date();
    if (editing) {
      updateBudget(editing.id, {
        category: categoryId,
        amount: numericAmount,
        period,
        updatedAt: now,
      });
    } else {
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
    }

    resetForm();
    onClose();
    Alert.alert(t('success'), t('budgetSaved'));
  };

  return (
    <Modal visible={visible} onClose={onClose}>
      <ScrollView showsVerticalScrollIndicator={false}>
        <Text style={styles.title}>{editing ? t('budgetEditTitle') : t('budgetAddTitle')}</Text>

        <Text style={styles.fieldLabel}>{t('categoryLabel')}</Text>
        {categories.length === 0 ? (
          <Text style={styles.emptyHint}>{t('budgetEmptyCategoryHint')}</Text>
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
          label={t('amountLabel')}
          placeholder="Contoh: 1000000"
          value={amount}
          onChangeText={setAmount}
          keyboardType="numeric"
        />

        <Text style={styles.fieldLabel}>{t('periodLabel')}</Text>
        <View style={styles.chipGrid}>
          {PERIODS.map((p) => (
            <TouchableOpacity
              key={p.key}
              style={[styles.chip, period === p.key && styles.chipActive]}
              onPress={() => setPeriod(p.key)}
            >
              <Text style={[styles.chipText, period === p.key && styles.chipTextActive]}>
                {t(p.label)}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        <View style={styles.actions}>
          <Button title={t('save')} onPress={handleSave} style={styles.saveButton} />
          <Button
            title={t('cancel')}
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

const createStyles = (colors: Theme) =>
  StyleSheet.create({
    title: {
      fontSize: 22,
      fontWeight: 'bold',
      color: colors.text,
      marginBottom: 16,
      textAlign: 'center',
    },
    fieldLabel: {
      fontSize: 14,
      fontWeight: '600',
      marginBottom: 8,
      marginTop: 8,
      color: colors.text,
    },
    emptyHint: {
      fontSize: 13,
      color: colors.textMuted,
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
      borderColor: colors.border,
      backgroundColor: colors.chipBg,
    },
    chipActive: {
      backgroundColor: colors.primary,
      borderColor: colors.primary,
    },
    chipText: {
      fontSize: 13,
      color: colors.text,
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
