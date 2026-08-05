import { Transaction, Category, Budget } from '@/database/models';

export interface CloudData {
  transactions: Transaction[];
  categories: Category[];
  budgets: Budget[];
}

function toIso(d: Date): string {
  return d.toISOString();
}

export function transactionToDoc(t: Transaction): Record<string, unknown> {
  return {
    amount: t.amount,
    description: t.description,
    category: t.category,
    type: t.type,
    date: toIso(t.date),
    notes: t.notes ?? null,
    createdAt: toIso(t.createdAt),
    updatedAt: toIso(t.updatedAt),
  };
}

export function docToTransaction(id: string, d: Record<string, any>): Transaction {
  return {
    id,
    amount: d.amount,
    description: d.description,
    category: d.category,
    type: d.type as 'income' | 'expense',
    date: new Date(d.date),
    notes: d.notes ?? undefined,
    createdAt: new Date(d.createdAt),
    updatedAt: new Date(d.updatedAt),
  };
}

export function categoryToDoc(c: Category): Record<string, unknown> {
  return {
    name: c.name,
    color: c.color,
    icon: c.icon,
    type: c.type,
    createdAt: toIso(c.createdAt),
    updatedAt: toIso(c.updatedAt),
  };
}

export function docToCategory(id: string, d: Record<string, any>): Category {
  return {
    id,
    name: d.name,
    color: d.color,
    icon: d.icon,
    type: d.type as 'income' | 'expense',
    createdAt: new Date(d.createdAt),
    updatedAt: new Date(d.updatedAt),
  };
}

export function budgetToDoc(b: Budget): Record<string, unknown> {
  return {
    category: b.category,
    amount: b.amount,
    period: b.period,
    startDate: toIso(b.startDate),
    endDate: b.endDate ? toIso(b.endDate) : null,
    createdAt: toIso(b.createdAt),
    updatedAt: toIso(b.updatedAt),
  };
}

export function docToBudget(id: string, d: Record<string, any>): Budget {
  return {
    id,
    category: d.category,
    amount: d.amount,
    period: d.period as Budget['period'],
    startDate: new Date(d.startDate),
    endDate: d.endDate ? new Date(d.endDate) : undefined,
    createdAt: new Date(d.createdAt),
    updatedAt: new Date(d.updatedAt),
  };
}

// Merge: cloud wins when updatedAt >= local.updatedAt; local-only records are kept.
interface HasId {
  id: string;
  updatedAt: Date;
}

export function mergeByUpdatedAt<T extends HasId>(cloud: T[], local: T[]): T[] {
  const localMap = new Map(local.map((item) => [item.id, item]));
  const merged = new Map<string, T>();

  for (const item of local) merged.set(item.id, item);

  for (const item of cloud) {
    const localItem = localMap.get(item.id);
    if (!localItem || item.updatedAt >= localItem.updatedAt) {
      merged.set(item.id, item);
    }
  }

  return Array.from(merged.values());
}

export function mergeCloudIntoLocal(cloud: CloudData, local: CloudData): CloudData {
  return {
    transactions: mergeByUpdatedAt(cloud.transactions, local.transactions),
    categories: mergeByUpdatedAt(cloud.categories, local.categories),
    budgets: mergeByUpdatedAt(cloud.budgets, local.budgets),
  };
}
