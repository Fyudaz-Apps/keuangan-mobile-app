import React from 'react';
import { Modal as RNModal, View, StyleSheet, ViewStyle } from 'react-native';
import { useTheme } from '@/hooks/use-theme';

interface ModalProps {
  visible: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
  contentStyle?: ViewStyle;
}

const Modal: React.FC<ModalProps> = ({ visible, onClose, title, children, contentStyle }) => {
  const colors = useTheme();
  return (
    <RNModal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <View style={styles.overlay}>
        <View style={[styles.container, { backgroundColor: colors.card }, contentStyle]}>
          {children}
        </View>
      </View>
    </RNModal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  container: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 20,
    maxWidth: '90%',
    width: '90%',
    maxHeight: '90%',
  },
});

export default Modal;
