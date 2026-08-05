import { parseNoteLines } from '@/utils/import';

describe('parseNoteLines', () => {
  it('parses "makan bakso 25rb" as expense Makanan', () => {
    const [item] = parseNoteLines('makan bakso 25rb');
    expect(item).toMatchObject({
      amount: 25000,
      description: 'makan bakso',
      category: 'Makanan',
      type: 'expense',
    });
  });

  it('parses "bensin 100rb" as Transportasi', () => {
    const [item] = parseNoteLines('bensin 100rb');
    expect(item).toMatchObject({ amount: 100000, category: 'Transportasi', type: 'expense' });
  });

  it('parses "gaji bulanan 5jt" as income Gaji', () => {
    const [item] = parseNoteLines('gaji bulanan 5jt');
    expect(item).toMatchObject({ amount: 5000000, category: 'Gaji', type: 'income' });
  });

  it('parses "1,5jt beli baju" with decimal multiplier', () => {
    const [item] = parseNoteLines('1,5jt beli baju');
    expect(item).toMatchObject({ amount: 1500000, category: 'Belanja' });
  });

  it('parses "Rp 25.000, makan siang" with thousands separator', () => {
    const [item] = parseNoteLines('Rp 25.000, makan siang');
    expect(item).toMatchObject({ amount: 25000, description: 'makan siang' });
  });

  it('skips lines without an amount', () => {
    expect(parseNoteLines('listrik saja')).toEqual([]);
  });

  it('parses multiple lines and skips date-only lines', () => {
    const items = parseNoteLines('12/08\nmakan bakso 25rb\nbensin 100rb');
    expect(items).toHaveLength(2);
    expect(items.map((i) => i.amount)).toEqual([25000, 100000]);
  });
});
