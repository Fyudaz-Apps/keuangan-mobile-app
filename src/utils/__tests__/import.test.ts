import { parseNoteLines, parseDateHeader, parseInlineDate, parseVpsExport } from '@/utils/import';

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

  it('parses multiple lines and uses date headers', () => {
    const items = parseNoteLines('02/08\nmakan bakso 25rb\nbensin 100rb\n03/08/24\ngaji 5jt');
    expect(items).toHaveLength(3);
    expect(items.map((i) => i.amount)).toEqual([25000, 100000, 5000000]);
    expect(items[0].date).toEqual(new Date(2026, 7, 2));
    expect(items[1].date).toEqual(new Date(2026, 7, 2));
    expect(items[2].date).toEqual(new Date(2024, 7, 3));
  });

  it('transactions before any date header have no date', () => {
    const [item] = parseNoteLines('makan 25rb\n12/08\nbensin 100rb');
    expect(item.date).toBeUndefined();
  });

  it('does not treat thousand separators as dates', () => {
    const items = parseNoteLines('25.000\nmakan bakso 25rb');
    expect(items).toHaveLength(2);
    expect(items[0].date).toBeUndefined();
  });

  it('parses inline date prefix on a transaction line', () => {
    const [item] = parseNoteLines('02/08 makan bakso 25rb');
    expect(item.date).toEqual(new Date(2026, 7, 2));
    expect(item.description).toBe('makan bakso');
    expect(item.amount).toBe(25000);
  });

  it('parses inline date with year', () => {
    const items = parseNoteLines('01/08 makan 25rb\n03/08/24 gaji 5jt');
    expect(items[0].date).toEqual(new Date(2026, 7, 1));
    expect(items[1].date).toEqual(new Date(2024, 7, 3));
  });

  it('does not misread amount multipliers as dates', () => {
    const [item] = parseNoteLines('1,5jt beli baju');
    expect(item.date).toBeUndefined();
    expect(item.amount).toBe(1500000);
  });
});

describe('parseInlineDate', () => {
  const now = new Date(2026, 7, 5);

  it('extracts date prefix and keeps the rest', () => {
    expect(parseInlineDate('02/08 makan bakso 25rb', now)).toEqual({
      date: new Date(2026, 7, 2),
      rest: 'makan bakso 25rb',
    });
  });

  it('returns null when no valid date prefix', () => {
    expect(parseInlineDate('makan bakso 25rb', now)).toBeNull();
    expect(parseInlineDate('1,5 jt beli baju', now)).toBeNull();
    expect(parseInlineDate('25.000 makan', now)).toBeNull();
  });
});

describe('parseDateHeader', () => {
  const now = new Date(2026, 7, 5);

  it('parses dd/mm without year using current year', () => {
    expect(parseDateHeader('12/07', now)).toEqual(new Date(2026, 6, 12));
  });

  it('rolls back a year when date is in the future', () => {
    expect(parseDateHeader('12/12', now)).toEqual(new Date(2025, 11, 12));
    expect(parseDateHeader('12/08', now)).toEqual(new Date(2025, 7, 12));
  });

  it('parses dd/mm/yy and dd/mm/yyyy', () => {
    expect(parseDateHeader('13/08/24', now)).toEqual(new Date(2024, 7, 13));
    expect(parseDateHeader('13-08-2024', now)).toEqual(new Date(2024, 7, 13));
  });

  it('rejects invalid months/days', () => {
    expect(parseDateHeader('25.000', now)).toBeNull();
    expect(parseDateHeader('12/13', now)).toBeNull();
    expect(parseDateHeader('31/02', now)).toBeNull();
  });
});

describe('parseVpsExport', () => {
  const sampleTable = `|id|user_id|amount|type|category|description|status_konfirmasi|date|created_at|updated_at|
|---|---|---|---|---|---|---|---|---|---|
|e3faf969-26ae-47cf-b3a3-992f7e3a9b21|ab604039-20a8-4462-bb08-b2b5d0e633de|50,000|expense|Transportasi|Pembelian bensin|1|2026-03-24 22:41:34.983|2026-03-24 22:41:34.983|2026-03-24 15:41:37.056|
|2a2f87ff-4d3f-43cf-940c-b58190ae18e8|ab604039-20a8-4462-bb08-b2b5d0e633de|54,000|expense|Langganan/VPS|Pembelian VPS SumoPod|1|2026-03-11 00:00:00.000|2026-03-25 01:04:00.837|2026-03-25 01:04:00.837|
|cancelled-row|ab604039-20a8-4462-bb08-b2b5d0e633de|10,000|expense|Makanan|Dibatalkan|0|2026-03-12 00:00:00.000|2026-03-25 01:04:00.837|2026-03-25 01:04:00.837|`;

  it('parses confirmed rows only', () => {
    const items = parseVpsExport(sampleTable);
    expect(items).toHaveLength(2);
  });

  it('parses amount with comma thousand separator', () => {
    const items = parseVpsExport(sampleTable);
    expect(items[0].amount).toBe(50000);
    expect(items[1].amount).toBe(54000);
  });

  it('preserves category and description', () => {
    const items = parseVpsExport(sampleTable);
    expect(items[0].category).toBe('Transportasi');
    expect(items[0].description).toBe('Pembelian bensin');
    expect(items[1].category).toBe('Langganan/VPS');
  });

  it('maps type correctly', () => {
    const items = parseVpsExport(sampleTable);
    expect(items[0].type).toBe('expense');
  });

  it('parses date from datetime column', () => {
    const items = parseVpsExport(sampleTable);
    expect(items[0].date).toEqual(new Date(2026, 2, 24));
    expect(items[1].date).toEqual(new Date(2026, 2, 11));
  });

  it('skips rows with status_konfirmasi = 0', () => {
    const items = parseVpsExport(sampleTable);
    expect(items.map((i) => i.description)).not.toContain('Dibatalkan');
  });

  it('returns empty array for empty text', () => {
    expect(parseVpsExport('')).toEqual([]);
  });

  it('skips header and separator rows', () => {
    const items = parseVpsExport(sampleTable);
    expect(items.map((i) => i.description)).not.toContain('id');
  });

  it('handles income type', () => {
    const incomeRow = `|id|user_id|amount|type|category|description|status_konfirmasi|date|created_at|updated_at|
|abc|user|10,276,418|income|Pemasukan|Gaji bulan April|1|2026-03-31 23:07:46.239|...|...|`;
    const items = parseVpsExport(incomeRow);
    expect(items).toHaveLength(1);
    expect(items[0].type).toBe('income');
    expect(items[0].amount).toBe(10276418);
    expect(items[0].category).toBe('Pemasukan');
  });
});
