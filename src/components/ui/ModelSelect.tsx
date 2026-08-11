import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Modal as RNModal,
} from 'react-native';
import { useTheme, Theme } from '@/hooks/use-theme';
import { GEMINI_MODEL_OPTIONS } from '@/services/keyService';

interface ModelSelectProps {
  label?: string;
  value: string;
  onChange: (model: string) => void;
}

const ModelSelect: React.FC<ModelSelectProps> = ({ label, value, onChange }) => {
  const colors = useTheme();
  const styles = createStyles(colors);
  const [open, setOpen] = useState(false);

  const selected = GEMINI_MODEL_OPTIONS.find((m) => m.id === value);

  return (
    <View style={styles.container}>
      {label && <Text style={[styles.label, { color: colors.text }]}>{label}</Text>}
      <TouchableOpacity
        style={[styles.select, { borderColor: colors.border, backgroundColor: colors.card }]}
        onPress={() => setOpen(true)}
      >
        <View style={styles.selectTextWrap}>
          <Text style={[styles.selectText, { color: colors.text }]}>
            {selected?.label ?? value}
          </Text>
          <Text style={[styles.selectSub, { color: colors.textMuted }]}>
            {selected?.description ?? ''}
          </Text>
        </View>
        <Text style={[styles.chevron, { color: colors.textMuted }]}>▾</Text>
      </TouchableOpacity>

      <RNModal visible={open} transparent animationType="fade" onRequestClose={() => setOpen(false)}>
        <View style={styles.overlay}>
          <View style={[styles.modal, { backgroundColor: colors.card }]}>
            <Text style={[styles.modalTitle, { color: colors.text }]}>{label}</Text>
            <ScrollView showsVerticalScrollIndicator={false}>
              {GEMINI_MODEL_OPTIONS.map((model) => {
                const isSelected = model.id === value;
                return (
                  <TouchableOpacity
                    key={model.id}
                    style={[
                      styles.option,
                      { backgroundColor: isSelected ? colors.backgroundSelected : colors.card },
                    ]}
                    onPress={() => {
                      onChange(model.id);
                      setOpen(false);
                    }}
                  >
                    <View style={styles.optionTextWrap}>
                      <Text style={[styles.optionLabel, { color: colors.text }]}>
                        {model.label}
                      </Text>
                      <Text style={[styles.optionDesc, { color: colors.textMuted }]}>
                        {model.description}
                      </Text>
                    </View>
                    {isSelected && (
                      <Text style={[styles.check, { color: colors.primary }]}>✓</Text>
                    )}
                  </TouchableOpacity>
                );
              })}
            </ScrollView>
            <TouchableOpacity onPress={() => setOpen(false)}>
              <Text style={[styles.cancel, { color: colors.textMuted }]}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </RNModal>
    </View>
  );
};

const createStyles = (colors: Theme) =>
  StyleSheet.create({
    container: {
      marginVertical: 8,
    },
    label: {
      fontSize: 14,
      fontWeight: '600',
      marginBottom: 8,
    },
    select: {
      borderWidth: 1,
      borderRadius: 8,
      paddingHorizontal: 12,
      paddingVertical: 12,
      flexDirection: 'row',
      alignItems: 'center',
    },
    selectTextWrap: {
      flex: 1,
    },
    selectText: {
      fontSize: 14,
      fontWeight: '600',
    },
    selectSub: {
      fontSize: 12,
      marginTop: 2,
    },
    chevron: {
      fontSize: 18,
      marginLeft: 8,
    },
    overlay: {
      flex: 1,
      backgroundColor: 'rgba(0, 0, 0, 0.5)',
      justifyContent: 'center',
      alignItems: 'center',
    },
    modal: {
      borderRadius: 12,
      padding: 20,
      maxWidth: '90%',
      width: '90%',
      maxHeight: '80%',
    },
    modalTitle: {
      fontSize: 18,
      fontWeight: '700',
      marginBottom: 16,
    },
    option: {
      flexDirection: 'row',
      alignItems: 'center',
      borderRadius: 8,
      padding: 12,
      marginBottom: 6,
    },
    optionTextWrap: {
      flex: 1,
    },
    optionLabel: {
      fontSize: 14,
      fontWeight: '600',
    },
    optionDesc: {
      fontSize: 12,
      marginTop: 2,
    },
    check: {
      fontSize: 18,
      fontWeight: '700',
      marginLeft: 8,
    },
    cancel: {
      fontSize: 14,
      textAlign: 'center',
      marginTop: 16,
    },
  });

export default ModelSelect;
