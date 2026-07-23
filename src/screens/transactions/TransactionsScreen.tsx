import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
} from 'react-native';
import { Card, Button } from '@/components/ui';
import AddTransactionModal from '@/components/AddTransactionModal';

export default function TransactionsScreen() {
  const [showAddModal, setShowAddModal] = useState(false);

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Transactions</Text>
      </View>
      <Card style={styles.placeholderCard}>
        <Text style={styles.placeholderText}>
          Transactions screen coming soon...
        </Text>
        <Button
          title="Add Transaction"
          onPress={() => setShowAddModal(true)}
          style={styles.button}
        />
      </Card>

      <AddTransactionModal
        visible={showAddModal}
        onClose={() => setShowAddModal(false)}
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
  placeholderCard: {
    marginTop: 16,
    marginHorizontal: 16,
    alignItems: 'center',
  },
  placeholderText: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginBottom: 16,
  },
  button: {
    width: '100%',
  },
});
