import * as SecureStore from 'expo-secure-store';
import { getGeminiApiKey } from './envService';

const GEMINI_KEY_STORE = 'gemini_api_key';
const GEMINI_MODEL_STORE = 'gemini_model';

export const DEFAULT_GEMINI_MODEL = 'gemini-3.1-flash-lite';

export const GEMINI_MODEL_OPTIONS = [
  {
    id: 'gemini-3.1-flash-lite',
    label: 'Gemini 3.1 Flash Lite',
    description: 'Cepat & hemat, cukup untuk parsing transaksi',
  },
  {
    id: 'gemini-3.5-flash-lite',
    label: 'Gemini 3.5 Flash Lite',
    description: 'Terbaru, cepat & hemat',
  },
  {
    id: 'gemini-3.5-flash',
    label: 'Gemini 3.5 Flash',
    description: 'Akurasi lebih baik, sedikit lebih lambat',
  },
  {
    id: 'gemini-flash-latest',
    label: 'Gemini Flash (latest)',
    description: 'Alias model Flash terbaru',
  },
  {
    id: 'gemini-3.1-pro-preview',
    label: 'Gemini 3.1 Pro (preview)',
    description: 'Paling akurat, lebih lambat (kuota terbatas)',
  },
  { id: 'gemini-2.5-pro', label: 'Gemini 2.5 Pro', description: 'Akurasi tinggi, lebih lambat' },
] as const;

export type GeminiModelId = (typeof GEMINI_MODEL_OPTIONS)[number]['id'];

export async function getGeminiKey(): Promise<string | null> {
  try {
    const stored = await SecureStore.getItemAsync(GEMINI_KEY_STORE);
    if (stored) return stored;
  } catch {
    // SecureStore can fail on web; fall through to env.
  }
  return getGeminiApiKey() || null;
}

export async function setGeminiKey(key: string): Promise<void> {
  await SecureStore.setItemAsync(GEMINI_KEY_STORE, key);
}

export async function clearGeminiKey(): Promise<void> {
  await SecureStore.deleteItemAsync(GEMINI_KEY_STORE);
}

export async function getGeminiModel(): Promise<string> {
  try {
    const stored = await SecureStore.getItemAsync(GEMINI_MODEL_STORE);
    if (stored) return stored;
  } catch {
    // SecureStore can fail on web; fall through to default.
  }
  return DEFAULT_GEMINI_MODEL;
}

export async function setGeminiModel(model: string): Promise<void> {
  await SecureStore.setItemAsync(GEMINI_MODEL_STORE, model);
}
