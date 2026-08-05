import React, { useState } from 'react';
import { View, Text, StyleSheet, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Card, Input, Button } from '@/components/ui';
import { useTheme, Theme } from '@/hooks/use-theme';
import { useT } from '@/i18n';
import { signIn, signUp } from '@/services/firebaseService';

export default function AuthScreen() {
  const colors = useTheme();
  const t = useT();
  const styles = createStyles(colors);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [busy, setBusy] = useState(false);

  const handleAuth = async (mode: 'login' | 'register') => {
    if (!email.trim() || !password) {
      Alert.alert(t('error'), t('authFailed'));
      return;
    }
    setBusy(true);
    try {
      if (mode === 'login') {
        await signIn(email.trim(), password);
      } else {
        await signUp(email.trim(), password);
      }
    } catch (error) {
      console.error('Auth failed:', error);
      Alert.alert(t('error'), t('authFailed'));
    } finally {
      setBusy(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.center}>
        <Text style={styles.title}>Keuangan</Text>
        <Text style={styles.subtitle}>{t('loginSubtitle')}</Text>

        <Card style={styles.card}>
          <Input
            label={t('emailLabel')}
            value={email}
            onChangeText={setEmail}
            placeholder="email@example.com"
            autoCapitalize="none"
            autoCorrect={false}
            keyboardType="email-address"
          />
          <Input
            label={t('passwordLabel')}
            value={password}
            onChangeText={setPassword}
            secureTextEntry
          />
          <Button
            title={busy ? t('cloudBusy') : t('login')}
            onPress={() => handleAuth('login')}
            disabled={busy}
            style={styles.button}
          />
          <Button
            title={busy ? t('cloudBusy') : t('register')}
            onPress={() => handleAuth('register')}
            disabled={busy}
            variant="secondary"
            style={styles.button}
          />
        </Card>
      </View>
    </SafeAreaView>
  );
}

const createStyles = (colors: Theme) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.screen,
      justifyContent: 'center',
    },
    center: {
      paddingHorizontal: 24,
    },
    title: {
      fontSize: 40,
      fontWeight: 'bold',
      color: colors.text,
      textAlign: 'center',
    },
    subtitle: {
      fontSize: 14,
      color: colors.textMuted,
      textAlign: 'center',
      marginTop: 8,
      marginBottom: 16,
    },
    card: {
      marginTop: 8,
    },
    button: {
      marginTop: 8,
    },
  });
