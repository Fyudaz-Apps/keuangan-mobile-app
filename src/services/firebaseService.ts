import { initializeApp, getApps, FirebaseApp } from 'firebase/app';
import {
  initializeAuth,
  getReactNativePersistence,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut as firebaseSignOut,
  onAuthStateChanged,
  Auth,
  User,
} from '@firebase/auth';
import {
  getFirestore,
  Firestore,
  collection,
  doc,
  getDocs,
  getDoc,
  setDoc,
  writeBatch,
} from 'firebase/firestore';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Transaction, Category, Budget } from '@/database/models';
import { useTransactionStore, useCategoryStore, useBudgetStore } from '@/store';
import {
  CloudData,
  transactionToDoc,
  categoryToDoc,
  budgetToDoc,
  docToTransaction,
  docToCategory,
  docToBudget,
} from '@/utils/firebaseSync';

const FIREBASE_CONFIG = {
  apiKey: process.env.EXPO_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.EXPO_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.EXPO_PUBLIC_FIREBASE_APP_ID,
};

const BATCH_SIZE = 450;

export interface CloudMeta {
  lastBackupAt: string;
  schemaVersion: number;
  counts: { transactions: number; categories: number; budgets: number };
}

export function isFirebaseConfigured(): boolean {
  return Boolean(
    FIREBASE_CONFIG.apiKey &&
    FIREBASE_CONFIG.authDomain &&
    FIREBASE_CONFIG.projectId &&
    FIREBASE_CONFIG.appId
  );
}

function getAppInstance(): FirebaseApp {
  if (getApps().length === 0) {
    if (!isFirebaseConfigured()) {
      throw new Error(
        'Firebase is not configured. Add EXPO_PUBLIC_FIREBASE_* variables to your .env file.'
      );
    }
    return initializeApp(FIREBASE_CONFIG as Record<string, string>);
  }
  return getApps()[0];
}

function getFirestoreInstance(): Firestore {
  return getFirestore(getAppInstance());
}

let authInstance: Auth | null = null;

function getAuthInstance(): Auth {
  if (!authInstance) {
    authInstance = initializeAuth(getAppInstance(), {
      persistence: getReactNativePersistence(AsyncStorage),
    });
  }
  return authInstance;
}

export function getCurrentUser(): User | null {
  const auth = getAuthInstance();
  return auth.currentUser;
}

export function subscribeToAuth(callback: (user: User | null) => void): () => void {
  return onAuthStateChanged(getAuthInstance(), callback);
}

export async function signUp(email: string, password: string): Promise<void> {
  await createUserWithEmailAndPassword(getAuthInstance(), email, password);
}

export async function signIn(email: string, password: string): Promise<void> {
  await signInWithEmailAndPassword(getAuthInstance(), email, password);
}

export async function signOut(): Promise<void> {
  await firebaseSignOut(getAuthInstance());
}

// ---- Firestore operations ----

function usersCollection(db: Firestore, uid: string, name: string) {
  return collection(db, 'users', uid, name);
}

async function writeInChunks(
  db: Firestore,
  uid: string,
  name: string,
  records: Array<{ id: string; data: Record<string, unknown> }>
): Promise<void> {
  for (let i = 0; i < records.length; i += BATCH_SIZE) {
    const chunk = records.slice(i, i + BATCH_SIZE);
    const batch = writeBatch(db);
    for (const record of chunk) {
      batch.set(doc(usersCollection(db, uid, name), record.id), record.data);
    }
    await batch.commit();
  }
}

export async function backupToCloud(uid: string, data: CloudData): Promise<void> {
  const db = getFirestoreInstance();
  const now = new Date().toISOString();

  const meta: CloudMeta = {
    lastBackupAt: now,
    schemaVersion: 1,
    counts: {
      transactions: data.transactions.length,
      categories: data.categories.length,
      budgets: data.budgets.length,
    },
  };

  await setDoc(doc(db, 'users', uid, 'meta', 'backup'), meta);

  await writeInChunks(
    db,
    uid,
    'transactions',
    data.transactions.map((t) => ({ id: t.id, data: transactionToDoc(t) }))
  );
  await writeInChunks(
    db,
    uid,
    'categories',
    data.categories.map((c) => ({ id: c.id, data: categoryToDoc(c) }))
  );
  await writeInChunks(
    db,
    uid,
    'budgets',
    data.budgets.map((b) => ({ id: b.id, data: budgetToDoc(b) }))
  );
}

export async function fetchCloudData(uid: string): Promise<CloudData> {
  const db = getFirestoreInstance();

  const transactionsSnapshot = await getDocs(usersCollection(db, uid, 'transactions'));
  const categoriesSnapshot = await getDocs(usersCollection(db, uid, 'categories'));
  const budgetsSnapshot = await getDocs(usersCollection(db, uid, 'budgets'));

  return {
    transactions: transactionsSnapshot.docs.map((d) => docToTransaction(d.id, d.data())),
    categories: categoriesSnapshot.docs.map((d) => docToCategory(d.id, d.data())),
    budgets: budgetsSnapshot.docs.map((d) => docToBudget(d.id, d.data())),
  };
}

export async function fetchCloudMeta(uid: string): Promise<CloudMeta | null> {
  const db = getFirestoreInstance();
  const metaDoc = await getDoc(doc(db, 'users', uid, 'meta', 'backup'));
  if (!metaDoc.exists()) return null;
  return metaDoc.data() as CloudMeta;
}

// ---- Persist restored data into SQLite stores ----

async function upsertTransactions(records: Transaction[]): Promise<void> {
  const store = useTransactionStore.getState();
  const existingIds = new Set(store.transactions.map((t) => t.id));
  for (const record of records) {
    if (existingIds.has(record.id)) {
      await store.updateTransaction(record.id, record);
    } else {
      await store.addTransaction(record);
    }
  }
}

async function upsertCategories(records: Category[]): Promise<void> {
  const store = useCategoryStore.getState();
  const existingIds = new Set(store.categories.map((c) => c.id));
  for (const record of records) {
    if (existingIds.has(record.id)) {
      await store.updateCategory(record.id, record);
    } else {
      await store.addCategory(record);
    }
  }
}

async function upsertBudgets(records: Budget[]): Promise<void> {
  const store = useBudgetStore.getState();
  const existingIds = new Set(store.budgets.map((b) => b.id));
  for (const record of records) {
    if (existingIds.has(record.id)) {
      await store.updateBudget(record.id, record);
    } else {
      await store.addBudget(record);
    }
  }
}

export async function persistRestoredData(data: CloudData): Promise<void> {
  await Promise.all([
    upsertTransactions(data.transactions),
    upsertCategories(data.categories),
    upsertBudgets(data.budgets),
  ]);
}
