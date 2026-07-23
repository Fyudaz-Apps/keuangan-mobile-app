import Realm from 'realm';

export class Category {
  id!: string;
  name!: string;
  color!: string;
  icon!: string;
  type!: 'income' | 'expense';
  createdAt!: Date;
  updatedAt!: Date;

  static schema: Realm.ObjectSchema = {
    name: 'Category',
    primaryKey: 'id',
    properties: {
      id: 'string',
      name: 'string',
      color: 'string',
      icon: 'string',
      type: 'string',
      createdAt: 'date',
      updatedAt: 'date',
    },
  };
}
