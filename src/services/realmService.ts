import Realm from 'realm';
import { Category, Transaction, Budget } from '@/database/models';

let realmInstance: Realm | null = null;

/**
 * Get or create Realm instance
 */
export async function getRealm(): Promise<Realm> {
  if (realmInstance) {
    return realmInstance;
  }

  try {
    realmInstance = await Realm.open({
      schema: [Category.schema, Transaction.schema, Budget.schema],
      schemaVersion: 1,
    });
    return realmInstance;
  } catch (error) {
    console.error('Failed to open Realm:', error);
    throw error;
  }
}

/**
 * Close Realm connection
 */
export async function closeRealm(): Promise<void> {
  if (realmInstance) {
    realmInstance.close();
    realmInstance = null;
  }
}

/**
 * Add a transaction
 */
export async function addTransaction(transaction: Transaction): Promise<void> {
  const realm = await getRealm();
  realm.write(() => {
    realm.create('Transaction', transaction);
  });
}

/**
 * Get all transactions
 */
export async function getAllTransactions(): Promise<Transaction[]> {
  const realm = await getRealm();
  return realm.objects<Transaction>('Transaction') as unknown as Transaction[];
}

/**
 * Delete a transaction
 */
export async function deleteTransaction(id: string): Promise<void> {
  const realm = await getRealm();
  realm.write(() => {
    const transaction = realm.objectForPrimaryKey<Transaction>(
      'Transaction',
      id
    );
    if (transaction) {
      realm.delete(transaction);
    }
  });
}

/**
 * Update a transaction
 */
export async function updateTransaction(
  id: string,
  updates: Partial<Transaction>
): Promise<void> {
  const realm = await getRealm();
  realm.write(() => {
    const transaction = realm.objectForPrimaryKey<Transaction>(
      'Transaction',
      id
    );
    if (transaction) {
      Object.assign(transaction, updates);
    }
  });
}

/**
 * Add a category
 */
export async function addCategory(category: Category): Promise<void> {
  const realm = await getRealm();
  realm.write(() => {
    realm.create('Category', category);
  });
}

/**
 * Get all categories
 */
export async function getAllCategories(): Promise<Category[]> {
  const realm = await getRealm();
  return realm.objects<Category>('Category') as unknown as Category[];
}

/**
 * Delete a category
 */
export async function deleteCategory(id: string): Promise<void> {
  const realm = await getRealm();
  realm.write(() => {
    const category = realm.objectForPrimaryKey<Category>('Category', id);
    if (category) {
      realm.delete(category);
    }
  });
}

/**
 * Update a category
 */
export async function updateCategory(
  id: string,
  updates: Partial<Category>
): Promise<void> {
  const realm = await getRealm();
  realm.write(() => {
    const category = realm.objectForPrimaryKey<Category>('Category', id);
    if (category) {
      Object.assign(category, updates);
    }
  });
}

/**
 * Add a budget
 */
export async function addBudget(budget: Budget): Promise<void> {
  const realm = await getRealm();
  realm.write(() => {
    realm.create('Budget', budget);
  });
}

/**
 * Get all budgets
 */
export async function getAllBudgets(): Promise<Budget[]> {
  const realm = await getRealm();
  return realm.objects<Budget>('Budget') as unknown as Budget[];
}

/**
 * Delete a budget
 */
export async function deleteBudget(id: string): Promise<void> {
  const realm = await getRealm();
  realm.write(() => {
    const budget = realm.objectForPrimaryKey<Budget>('Budget', id);
    if (budget) {
      realm.delete(budget);
    }
  });
}

/**
 * Update a budget
 */
export async function updateBudget(
  id: string,
  updates: Partial<Budget>
): Promise<void> {
  const realm = await getRealm();
  realm.write(() => {
    const budget = realm.objectForPrimaryKey<Budget>('Budget', id);
    if (budget) {
      Object.assign(budget, updates);
    }
  });
}
