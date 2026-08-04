import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, SafeAreaView } from 'react-native';
import { Card, Button, Input } from '@/components/ui';
import { getGeminiKey, setGeminiKey, clearGeminiKey } from '@/services/keyService';

export default function SettingsScreen() {
  const [apiKey, setApiKey] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    getGeminiKey().then((key) => setApiKey(key || ''));
  }, []);

  const handleSave = async () => {
    setSaving(true);
    try {
      const trimmed = apiKey.trim();
      if (trimmed) {
        await setGeminiKey(trimmed);
      } else {
        await clearGeminiKey();
      }
      setApiKey(trimmed);
    } finally {
      setSaving(false);
    }
  };

  const handleClear = async () => {
    await clearGeminiKey();
    setApiKey('');
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Settings</Text>
      </View>
      <Card style={styles.card}>
        <Text style={styles.sectionTitle}>AI / Gemini API Key</Text>
        <Text style={styles.sectionHint}>
          Dipakai untuk parsing transaksi via AI. Jika kosong, fallback ke
          EXPO_PUBLIC_GEMINI_API_KEY di file .env.
        </Text>
        <Input
          label="Gemini API Key"
          value={apiKey}
          onChangeText={setApiKey}
          placeholder="AIza..."
          autoCapitalize="none"
          autoCorrect={false}
          secureTextEntry
        />
        <Button
          title={saving ? 'Saving...' : 'Save'}
          onPress={handleSave}
          disabled={saving}
          style={styles.button}
        />
        <Button
          title="Clear (use .env)"
          onPress={handleClear}
          disabled={saving}
          variant="secondary"
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
  card: {
    marginTop: 16,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000000',
    marginBottom: 4,
  },
  sectionHint: {
    fontSize: 13,
    color: '#666666',
    marginBottom: 8,
  },
  button: {
    marginTop: 8,
  },
});
