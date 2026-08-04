export interface Transaction {
  id: string;
  amount: number;
  description: string;
  category: string;
  type: 'income' | 'expense';
  date: Date;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}
