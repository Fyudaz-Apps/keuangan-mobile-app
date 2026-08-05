import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  Platform,
  ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Card, Button, Input } from '@/components/ui';
import { useAppStore, useTransactionStore } from '@/store';
import { useTheme, Theme } from '@/hooks/use-theme';
import { useT } from '@/i18n';
import { getGeminiKey, setGeminiKey, clearGeminiKey } from '@/services/keyService';
import { exportTransactionsCsv, exportTransactionsPdf } from '@/services/exportService';
import {
  getCurrentUser,
  subscribeToAuth,
  signOut,
  backupToCloud,
  fetchCloudData,
  persistRestoredData,
  isFirebaseConfigured,
} from '@/services/firebaseService';
import { mergeCloudIntoLocal } from '@/utils/firebaseSync';
import { useCategoryStore, useBudgetStore } from '@/store';
import ImportTransactionsModal from '@/components/ImportTransactionsModal';

const THEME_OPTIONS = ['light', 'dark', 'system'] as const;

export default function SettingsScreen() {
  const { theme, setTheme, language, setLanguage } = useAppStore();
  const { transactions } = useTransactionStore();
  const { categories } = useCategoryStore();
  const { budgets } = useBudgetStore();
  const colors = useTheme();
  const t = useT();
  const styles = createStyles(colors);
  const [apiKey, setApiKey] = useState('');
  const [saving, setSaving] = useState(false);
  const [showImportModal, setShowImportModal] = useState(false);
  const [cloudBusy, setCloudBusy] = useState(false);
  const [currentUser, setCurrentUser] = useState<{ uid: string; email: string | null } | null>(
    null
  );

  useEffect(() => {
    getGeminiKey().then((key) => setApiKey(key || ''));
    if (Platform.OS === 'web' || !isFirebaseConfigured()) return;
    setCurrentUser(getCurrentUser());
    const unsubscribe = subscribeToAuth((user) => {
      setCurrentUser(user ? { uid: user.uid, email: user.email } : null);
    });
    return unsubscribe;
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

  const handleExport = async (format: 'csv' | 'pdf') => {
    if (transactions.length === 0) {
      Alert.alert(t('error'), t('noDataToExport'));
      return;
    }
    try {
      if (format === 'csv') {
        await exportTransactionsCsv(transactions);
      } else {
        await exportTransactionsPdf(transactions);
      }
      Alert.alert(t('success'), t('exportSuccess'));
    } catch (error) {
      console.error('Export failed:', error);
      Alert.alert(t('error'), t('exportFailed'));
    }
  };

  const handleLogout = async () => {
    try {
      await signOut();
    } catch (error) {
      console.error('Logout failed:', error);
      Alert.alert(t('error'), t('authFailed'));
    }
  };

  const handleBackup = async () => {
    const user = currentUser;
    if (!user) {
      Alert.alert(t('error'), t('authRequired'));
      return;
    }
    setCloudBusy(true);
    try {
      await backupToCloud(user.uid, { transactions, categories, budgets });
      Alert.alert(
        t('success'),
        t('backupSuccess')
          .replace('{count}', transactions.length.toString())
          .replace('{categories}', categories.length.toString())
          .replace('{budgets}', budgets.length.toString())
      );
    } catch (error) {
      console.error('Backup failed:', error);
      Alert.alert(t('error'), t('backupFailed'));
    } finally {
      setCloudBusy(false);
    }
  };

  const handleRestore = async () => {
    const user = currentUser;
    if (!user) {
      Alert.alert(t('error'), t('authRequired'));
      return;
    }
    setCloudBusy(true);
    try {
      const cloud = await fetchCloudData(user.uid);
      if (
        cloud.transactions.length === 0 &&
        cloud.categories.length === 0 &&
        cloud.budgets.length === 0
      ) {
        Alert.alert(t('error'), t('noCloudData'));
        return;
      }
      const merged = mergeCloudIntoLocal(cloud, { transactions, categories, budgets });
      await persistRestoredData(merged);
      Alert.alert(t('success'), t('restoreSuccess'));
    } catch (error) {
      console.error('Restore failed:', error);
      Alert.alert(t('error'), t('restoreFailed'));
    } finally {
      setCloudBusy(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>{t('settings')}</Text>
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        <Card style={styles.card}>
          <Text style={styles.sectionTitle}>{t('appearance')}</Text>
          <Text style={styles.sectionHint}>{t('themeMode')}</Text>
          <View style={styles.optionRow}>
            {THEME_OPTIONS.map((option) => (
              <TouchableOpacity
                key={option}
                style={[styles.optionChip, theme === option && styles.optionChipActive]}
                onPress={() => setTheme(option)}
              >
                <Text
                  style={[styles.optionChipText, theme === option && styles.optionChipTextActive]}
                >
                  {t(option)}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          <Text style={styles.sectionTitle}>{t('language')}</Text>
          <View style={styles.optionRow}>
            {(['id', 'en'] as const).map((lang) => (
              <TouchableOpacity
                key={lang}
                style={[styles.optionChip, language === lang && styles.optionChipActive]}
                onPress={() => setLanguage(lang)}
              >
                <Text
                  style={[styles.optionChipText, language === lang && styles.optionChipTextActive]}
                >
                  {lang === 'id' ? 'Bahasa Indonesia' : 'English'}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </Card>

        <Card style={styles.card}>
          <Text style={styles.sectionTitle}>{t('aiGeminiSection')}</Text>
          <Text style={styles.sectionHint}>{t('aiGeminiHint')}</Text>
          <Input
            label={t('geminiApiKey')}
            value={apiKey}
            onChangeText={setApiKey}
            placeholder="AIza..."
            autoCapitalize="none"
            autoCorrect={false}
            secureTextEntry
          />
          <Button
            title={saving ? t('saving') : t('save')}
            onPress={handleSave}
            disabled={saving}
            style={styles.button}
          />
          <Button
            title={t('clearUseEnv')}
            onPress={handleClear}
            disabled={saving}
            variant="secondary"
            style={styles.button}
          />
        </Card>

        {Platform.OS !== 'web' && (
          <Card style={styles.card}>
            <Text style={styles.sectionTitle}>{t('cloudBackup')}</Text>
            <Text style={styles.sectionHint}>{t('cloudBackupHint')}</Text>

            {!isFirebaseConfigured() && (
              <Text style={styles.sectionHint}>{t('firebaseNotConfigured')}</Text>
            )}

            {currentUser ? (
              <>
                <Text style={styles.sectionHint}>
                  {t('loggedInAs').replace('{email}', currentUser.email ?? '')}
                </Text>
                <Button
                  title={cloudBusy ? t('cloudBusy') : t('backupToCloud')}
                  onPress={handleBackup}
                  disabled={cloudBusy}
                  style={styles.button}
                />
                <Button
                  title={cloudBusy ? t('cloudBusy') : t('restoreFromCloud')}
                  onPress={handleRestore}
                  disabled={cloudBusy}
                  variant="secondary"
                  style={styles.button}
                />
                <Button
                  title={t('logout')}
                  onPress={handleLogout}
                  disabled={cloudBusy}
                  variant="danger"
                  style={styles.button}
                />
              </>
            ) : (
              <Text style={styles.sectionHint}>{t('loginSubtitle')}</Text>
            )}
          </Card>
        )}

        {Platform.OS !== 'web' && (
          <Card style={styles.card}>
            <Text style={styles.sectionTitle}>{t('exportData')}</Text>
            <Button
              title={t('exportCsv')}
              onPress={() => handleExport('csv')}
              style={styles.button}
            />
            <Button
              title={t('exportPdf')}
              onPress={() => handleExport('pdf')}
              variant="secondary"
              style={styles.button}
            />
          </Card>
        )}

        <Card style={styles.card}>
          <Text style={styles.sectionTitle}>{t('importData')}</Text>
          <Button
            title={t('importFromNotes')}
            onPress={() => setShowImportModal(true)}
            variant="secondary"
            style={styles.button}
          />
        </Card>

        <ImportTransactionsModal
          visible={showImportModal}
          onClose={() => setShowImportModal(false)}
        />
      </ScrollView>
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
    },
    headerTitle: {
      fontSize: 28,
      fontWeight: 'bold',
      color: colors.text,
    },
    card: {
      marginTop: 16,
    },
    sectionTitle: {
      fontSize: 16,
      fontWeight: '600',
      color: colors.text,
      marginBottom: 4,
      marginTop: 8,
    },
    sectionHint: {
      fontSize: 13,
      color: colors.textMuted,
      marginBottom: 8,
    },
    optionRow: {
      flexDirection: 'row',
      gap: 8,
      marginBottom: 8,
    },
    optionChip: {
      paddingVertical: 8,
      paddingHorizontal: 14,
      borderRadius: 20,
      borderWidth: 1,
      borderColor: colors.border,
      backgroundColor: colors.chipBg,
    },
    optionChipActive: {
      backgroundColor: colors.primary,
      borderColor: colors.primary,
    },
    optionChipText: {
      fontSize: 13,
      color: colors.text,
    },
    optionChipTextActive: {
      color: '#fff',
      fontWeight: '600',
    },
    button: {
      marginTop: 8,
    },
  });
