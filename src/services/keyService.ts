import * as SecureStore from 'expo-secure-store';

const GEMINI_KEY_STORE = 'gemini_api_key';

export async function getGeminiKey(): Promise<string | null> {
  try {
    const stored = await SecureStore.getItemAsync(GEMINI_KEY_STORE);
    if (stored) return stored;
  } catch {
    // SecureStore can fail on web; fall through to env.
  }
  return process.env.EXPO_PUBLIC_GEMINI_API_KEY || null;
}

export async function setGeminiKey(key: string): Promise<void> {
  await SecureStore.setItemAsync(GEMINI_KEY_STORE, key);
}

export async function clearGeminiKey(): Promise<void> {
  await SecureStore.deleteItemAsync(GEMINI_KEY_STORE);
}
