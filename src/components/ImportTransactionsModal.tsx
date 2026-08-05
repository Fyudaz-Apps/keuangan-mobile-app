import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  Platform,
} from 'react-native';
import * as DocumentPicker from 'expo-document-picker';
import { File } from 'expo-file-system';
import { Modal, Input, Button } from '@/components/ui';
import { useTransactionStore } from '@/store';
import { useTheme, Theme } from '@/hooks/use-theme';
import { useT } from '@/i18n';
import { parseNoteLines, parseVpsExport, ImportedTransaction } from '@/utils/import';
import { extractSdocxText } from '@/utils/sdocx';
import { generateId } from '@/utils';

interface ImportTransactionsModalProps {
  visible: boolean;
  onClose: () => void;
}

export default function ImportTransactionsModal({
  visible,
  onClose,
}: ImportTransactionsModalProps) {
  const { addTransaction } = useTransactionStore();
  const colors = useTheme();
  const t = useT();
  const styles = createStyles(colors);
  const [text, setText] = useState('');
  const [dateText, setDateText] = useState(() => new Date().toISOString().slice(0, 10));
  const [parsed, setParsed] = useState<ImportedTransaction[]>([]);
  const [importing, setImporting] = useState(false);

  const reset = () => {
    setText('');
    setDateText(new Date().toISOString().slice(0, 10));
    setParsed([]);
    setImporting(false);
  };

  const parseImportText = (input: string): ImportedTransaction[] => {
    if (
      input.includes('|id|') ||
      input.includes('| id|') ||
      /^\s*\|[^|]+\|[^|]+\|/.test(input.trim().split('\n')[0] ?? '')
    ) {
      return parseVpsExport(input);
    }
    return parseNoteLines(input);
  };

  const handleParse = () => {
    setParsed(parseImportText(text));
  };

  const handlePickFiles = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: ['text/plain', 'text/markdown', 'text/csv', 'application/octet-stream'],
        multiple: true,
        copyToCacheDirectory: true,
      });
      if (result.canceled) return;

      const parts: string[] = [];
      for (const asset of result.assets) {
        try {
          const file = new File(asset.uri);
          const isSdocx =
            asset.name.toLowerCase().endsWith('.sdocx') || (asset.mimeType ?? '').includes('sdocx');
          const content = isSdocx ? extractSdocxText(await file.bytes()) : await file.text();
          if (content.trim()) parts.push(content);
        } catch {
          // skip unreadable file
        }
      }

      if (parts.length === 0) {
        Alert.alert(t('error'), t('importFilesEmpty'));
        return;
      }

      const merged = text.trim() ? `${text.trim()}\n${parts.join('\n')}` : parts.join('\n');
      setText(merged);
      setParsed(parseImportText(merged));
    } catch (error) {
      console.error('File pick failed:', error);
      Alert.alert(t('error'), t('importFilesError'));
    }
  };

  const handleImport = async () => {
    const fallbackDate = new Date(dateText);
    if (isNaN(fallbackDate.getTime())) {
      Alert.alert(t('error'), t('importDateInvalid'));
      return;
    }
    if (parsed.length === 0) {
      Alert.alert(t('error'), t('importEmpty'));
      return;
    }

    setImporting(true);
    try {
      const now = new Date();
      for (const item of parsed) {
        addTransaction({
          id: generateId(),
          amount: item.amount,
          description: item.description,
          category: item.category,
          type: item.type,
          date: item.date ?? fallbackDate,
          notes: item.raw,
          createdAt: now,
          updatedAt: now,
        });
      }
      Alert.alert(t('success'), t('importSuccess').replace('{count}', parsed.length.toString()));
      reset();
      onClose();
    } finally {
      setImporting(false);
    }
  };

  const formatDate = (date?: Date) => (date ? date.toLocaleDateString('id-ID') : dateText);

  return (
    <Modal visible={visible} onClose={onClose}>
      <ScrollView showsVerticalScrollIndicator={false}>
        <Text style={styles.title}>{t('importFromNotes')}</Text>
        <Text style={styles.hint}>{t('importHint')}</Text>

        <Input
          label={t('importTextLabel')}
          placeholder={t('importTextPlaceholder')}
          value={text}
          onChangeText={setText}
          multiline
          style={styles.textArea}
        />

        <Input
          label={t('importDateLabel')}
          value={dateText}
          onChangeText={setDateText}
          placeholder="YYYY-MM-DD"
        />

        <Button title={t('parse')} onPress={handleParse} style={styles.button} />

        {Platform.OS !== 'web' && (
          <Button
            title={t('importFiles')}
            onPress={handlePickFiles}
            variant="secondary"
            style={styles.button}
          />
        )}

        {parsed.length > 0 && (
          <>
            <Text style={styles.parsedCount}>
              {t('parsedCount').replace('{count}', parsed.length.toString())}
            </Text>
            {parsed.map((item, index) => (
              <View key={index} style={styles.row}>
                <View style={styles.rowInfo}>
                  <Text style={styles.rowName}>
                    {item.description} · {item.category}
                  </Text>
                  <Text style={styles.rowSub}>
                    {item.type === 'income' ? t('income') : t('expense')} · {formatDate(item.date)}
                  </Text>
                </View>
                <Text
                  style={[
                    styles.rowAmount,
                    { color: item.type === 'income' ? colors.success : colors.danger },
                  ]}
                >
                  Rp {item.amount.toLocaleString()}
                </Text>
              </View>
            ))}
            <Button
              title={importing ? t('importing') : t('import')}
              onPress={handleImport}
              disabled={importing}
              style={styles.button}
            />
          </>
        )}

        {parsed.length === 0 && text.trim() && (
          <Text style={styles.emptyText}>{t('importEmpty')}</Text>
        )}

        <TouchableOpacity
          onPress={() => {
            reset();
            onClose();
          }}
        >
          <Text style={styles.cancelText}>{t('cancel')}</Text>
        </TouchableOpacity>
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
    hint: {
      fontSize: 13,
      color: colors.textSecondary,
      marginBottom: 8,
    },
    textArea: {
      minHeight: 120,
      textAlignVertical: 'top',
    },
    button: {
      marginTop: 8,
    },
    parsedCount: {
      fontSize: 14,
      fontWeight: '600',
      color: colors.text,
      marginTop: 16,
      marginBottom: 8,
    },
    row: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: colors.backgroundElement,
      borderRadius: 8,
      padding: 10,
      marginBottom: 6,
    },
    rowInfo: {
      flex: 1,
      marginRight: 8,
    },
    rowName: {
      fontSize: 13,
      fontWeight: '600',
      color: colors.text,
    },
    rowSub: {
      fontSize: 11,
      color: colors.textMuted,
      marginTop: 2,
    },
    rowAmount: {
      fontSize: 13,
      fontWeight: '600',
    },
    emptyText: {
      fontSize: 13,
      color: colors.textMuted,
      marginTop: 12,
    },
    cancelText: {
      fontSize: 14,
      color: colors.textMuted,
      textAlign: 'center',
      marginTop: 16,
    },
  });
