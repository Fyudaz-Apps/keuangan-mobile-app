import Constants from 'expo-constants';

function getExtra(key: string): string | undefined {
  const extra = Constants.expoConfig?.extra as Record<string, string> | undefined;
  return extra?.[key];
}

export function getEnv(key: string): string | undefined {
  if (typeof process !== 'undefined' && process.env?.[key]) {
    return process.env[key];
  }
  return getExtra(key);
}

export function getFirebaseConfig() {
  return {
    apiKey: getEnv('EXPO_PUBLIC_FIREBASE_API_KEY'),
    authDomain: getEnv('EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN'),
    projectId: getEnv('EXPO_PUBLIC_FIREBASE_PROJECT_ID'),
    storageBucket: getEnv('EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET'),
    messagingSenderId: getEnv('EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID'),
    appId: getEnv('EXPO_PUBLIC_FIREBASE_APP_ID'),
  };
}

export function getGeminiApiKey(): string | undefined {
  return getEnv('EXPO_PUBLIC_GEMINI_API_KEY');
}
