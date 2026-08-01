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
 * Convert Realm results into plain serializable objects.
 * Realm objects are live proxies; spreading them into Zustand state
 * can break JSON serialization and state diffing.
 */
function serializeTransactions(results: Realm.Results<Transaction>): Transaction[] {
  return Array.from(results).map((t) => ({
    id: t.id,
    amount: t.amount,
    description: t.description,
    category: t.category,
    type: t.type,
    date: new Date(t.date),
    notes: t.notes,
    createdAt: new Date(t.createdAt),
    updatedAt: new Date(t.updatedAt),
  }));
}

function serializeCategories(results: Realm.Results<Category>): Category[] {
  return Array.from(results).map((c) => ({
    id: c.id,
    name: c.name,
    color: c.color,
    icon: c.icon,
    type: c.type,
    createdAt: new Date(c.createdAt),
    updatedAt: new Date(c.updatedAt),
  }));
}

function serializeBudgets(results: Realm.Results<Budget>): Budget[] {
  return Array.from(results).map((b) => ({
    id: b.id,
    category: b.category,
    amount: b.amount,
    period: b.period,
    startDate: new Date(b.startDate),
    endDate: b.endDate ? new Date(b.endDate) : undefined,
    createdAt: new Date(b.createdAt),
    updatedAt: new Date(b.updatedAt),
  }));
}

/**
 * Seed default categories if none exist
 */
export async function seedDefaultCategories(): Promise<void> {
  const realm = await getRealm();
  const count = realm.objects('Category').length;

  if (count > 0) return;

  const now = new Date();
  const defaultCategories: Category[] = [
    // Income categories
    {
      id: 'cat_salary',
      name: 'Gaji',
      color: '#4caf50',
      icon: 'cash',
      type: 'income',
      createdAt: now,
      updatedAt: now,
    },
    {
      id: 'cat_bonus',
      name: 'Bonus',
      color: '#4caf50',
      icon: 'gift',
      type: 'income',
      createdAt: now,
      updatedAt: now,
    },
    {
      id: 'cat_investment',
      name: 'Investasi',
      color: '#4caf50',
      icon: 'trending-up',
      type: 'income',
      createdAt: now,
      updatedAt: now,
    },
    {
      id: 'cat_other_income',
      name: 'Lainnya',
      color: '#4caf50',
      icon: 'ellipsis-horizontal',
      type: 'income',
      createdAt: now,
      updatedAt: now,
    },

    // Expense categories
    {
      id: 'cat_food',
      name: 'Makanan',
      color: '#ff6b6b',
      icon: 'restaurant',
      type: 'expense',
      createdAt: now,
      updatedAt: now,
    },
    {
      id: 'cat_transport',
      name: 'Transportasi',
      color: '#ff6b6b',
      icon: 'car',
      type: 'expense',
      createdAt: now,
      updatedAt: now,
    },
    {
      id: 'cat_entertainment',
      name: 'Hiburan',
      color: '#ff6b6b',
      icon: 'game-controller',
      type: 'expense',
      createdAt: now,
      updatedAt: now,
    },
    {
      id: 'cat_utilities',
      name: 'Utilitas',
      color: '#ff6b6b',
      icon: 'flash',
      type: 'expense',
      createdAt: now,
      updatedAt: now,
    },
    {
      id: 'cat_health',
      name: 'Kesehatan',
      color: '#ff6b6b',
      icon: 'medical',
      type: 'expense',
      createdAt: now,
      updatedAt: now,
    },
    {
      id: 'cat_education',
      name: 'Pendidikan',
      color: '#ff6b6b',
      icon: 'school',
      type: 'expense',
      createdAt: now,
      updatedAt: now,
    },
    {
      id: 'cat_shopping',
      name: 'Belanja',
      color: '#ff6b6b',
      icon: 'cart',
      type: 'expense',
      createdAt: now,
      updatedAt: now,
    },
    {
      id: 'cat_other_expense',
      name: 'Lainnya',
      color: '#ff6b6b',
      icon: 'ellipsis-horizontal',
      type: 'expense',
      createdAt: now,
      updatedAt: now,
    },
  ];

  realm.write(() => {
    defaultCategories.forEach((category) => {
      realm.create('Category', category);
    });
  });
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
  return serializeTransactions(
    realm.objects<Transaction>('Transaction') as unknown as Realm.Results<Transaction>
  );
}

/**
 * Delete a transaction
 */
export async function deleteTransaction(id: string): Promise<void> {
  const realm = await getRealm();
  realm.write(() => {
    const transaction = realm.objectForPrimaryKey<Transaction>('Transaction', id);
    if (transaction) {
      realm.delete(transaction);
    }
  });
}

/**
 * Update a transaction
 */
export async function updateTransaction(id: string, updates: Partial<Transaction>): Promise<void> {
  const realm = await getRealm();
  realm.write(() => {
    const transaction = realm.objectForPrimaryKey<Transaction>('Transaction', id);
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
  return serializeCategories(
    realm.objects<Category>('Category') as unknown as Realm.Results<Category>
  );
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
export async function updateCategory(id: string, updates: Partial<Category>): Promise<void> {
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
  return serializeBudgets(realm.objects<Budget>('Budget') as unknown as Realm.Results<Budget>);
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
export async function updateBudget(id: string, updates: Partial<Budget>): Promise<void> {
  const realm = await getRealm();
  realm.write(() => {
    const budget = realm.objectForPrimaryKey<Budget>('Budget', id);
    if (budget) {
      Object.assign(budget, updates);
    }
  });
}
