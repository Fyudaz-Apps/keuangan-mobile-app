import React, { useState } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useCategoryStore } from '@/store';
import { Category } from '@/database/models';
import { useTheme, Theme } from '@/hooks/use-theme';
import { useT } from '@/i18n';
import AddCategoryModal from '@/components/AddCategoryModal';

export default function CategoriesScreen() {
  const { categories, removeCategory } = useCategoryStore();
  const colors = useTheme();
  const t = useT();
  const styles = createStyles(colors);
  const [showAddModal, setShowAddModal] = useState(false);
  const [editing, setEditing] = useState<Category | null>(null);

  const openAdd = () => {
    setEditing(null);
    setShowAddModal(true);
  };

  const openEdit = (category: Category) => {
    setEditing(category);
    setShowAddModal(true);
  };

  const handleDelete = (id: string, name: string) => {
    Alert.alert(t('deleteCategoryTitle'), t('deleteCategoryMsg').replace('{name}', name), [
      { text: t('cancel'), style: 'cancel' },
      {
        text: t('delete'),
        style: 'destructive',
        onPress: () => removeCategory(id),
      },
    ]);
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>{t('categories')}</Text>
        <TouchableOpacity style={styles.addButton} onPress={openAdd}>
          <Text style={styles.addButtonText}>{t('add')}</Text>
        </TouchableOpacity>
      </View>

      <FlatList
        data={categories}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        ListEmptyComponent={<Text style={styles.emptyText}>{t('emptyCategories')}</Text>}
        renderItem={({ item }) => (
          <View style={styles.row}>
            <View style={[styles.colorDot, { backgroundColor: item.color }]} />
            <View style={styles.rowInfo}>
              <Text style={styles.rowName}>{item.name}</Text>
              <Text style={styles.rowType}>
                {item.type === 'income' ? t('income') : t('expense')}
              </Text>
            </View>
            <View style={styles.rowActions}>
              <TouchableOpacity onPress={() => openEdit(item)}>
                <Text style={styles.editText}>{t('edit')}</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={() => handleDelete(item.id, item.name)}>
                <Text style={styles.deleteText}>{t('delete')}</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}
      />

      <AddCategoryModal
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
      paddingHorizontal: 16,
      paddingVertical: 16,
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
    },
    headerTitle: {
      fontSize: 28,
      fontWeight: 'bold',
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
    colorDot: {
      width: 14,
      height: 14,
      borderRadius: 7,
      marginRight: 12,
    },
    rowInfo: {
      flex: 1,
    },
    rowName: {
      fontSize: 16,
      fontWeight: '600',
      color: colors.text,
    },
    rowType: {
      fontSize: 12,
      color: colors.textMuted,
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
