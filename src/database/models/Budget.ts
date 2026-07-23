import Realm from 'realm';

export class Budget {
  id!: string;
  category!: string;
  amount!: number;
  period!: 'daily' | 'weekly' | 'monthly' | 'yearly';
  startDate!: Date;
  endDate?: Date;
  createdAt!: Date;
  updatedAt!: Date;

  static schema: Realm.ObjectSchema = {
    name: 'Budget',
    primaryKey: 'id',
    properties: {
      id: 'string',
      category: 'string',
      amount: 'double',
      period: 'string',
      startDate: 'date',
      endDate: 'date?',
      createdAt: 'date',
      updatedAt: 'date',
    },
  };
}
