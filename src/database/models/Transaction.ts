import Realm from 'realm';

export class Transaction {
  id!: string;
  amount!: number;
  description!: string;
  category!: string;
  type!: 'income' | 'expense';
  date!: Date;
  notes?: string;
  createdAt!: Date;
  updatedAt!: Date;

  static schema: Realm.ObjectSchema = {
    name: 'Transaction',
    primaryKey: 'id',
    properties: {
      id: 'string',
      amount: 'double',
      description: 'string',
      category: 'string',
      type: 'string',
      date: 'date',
      notes: 'string?',
      createdAt: 'date',
      updatedAt: 'date',
    },
  };
}
