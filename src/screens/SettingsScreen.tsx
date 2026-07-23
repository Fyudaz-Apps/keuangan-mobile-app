import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
} from 'react-native';
import { Card, Button } from '@/components/ui';

export default function SettingsScreen() {
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Settings</Text>
      </View>
      <Card style={styles.placeholderCard}>
        <Text style={styles.placeholderText}>
          Settings screen coming soon...
        </Text>
        <Button
          title="Configure"
          onPress={() => {}}
          style={styles.button}
        />
      </Card>
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
    alignItems: 'center',
  },
  placeholderText: {
    fontSize: 16,
    color: '#999999',
    marginBottom: 16,
  },
  button: {
    marginTop: 8,
  },
});
