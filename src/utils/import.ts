export interface ImportedTransaction {
  amount: number;
  description: string;
  category: string;
  type: 'income' | 'expense';
  raw: string;
  date?: Date;
}

const MULTIPLIER_RE = /(\d+(?:[.,]\d+)?)\s*(rb|ribu|jt|juta)\b/i;
const NUMBER_RE = /(\d{1,3}(?:[.,]\d{3})+|\d+)/;
const CURRENCY_RE = /\b(?:rp|rp\.|idr)\b/i;
const INCOME_RE = /(gaji|bonus|honor|terima|dapat|masuk|kirim|pemasukan|\+)/i;
const DATE_ONLY_RE = /^\s*\d{1,2}[\/\-.]\d{1,2}([\/\-.]\d{2,4})?\s*$/;
const DATE_HEADER_RE = /^\s*(\d{1,2})[/\-.](\d{1,2})(?:[/\-.](\d{2,4}))?\s*$/;
const INLINE_DATE_RE =
  /^\s*(\d{1,2})[/\-.](\d{1,2})(?:[/\-.](\d{2,4}))?(?!\s*(?:rb|ribu|jt|juta)\b)\s+/;

const CATEGORY_KEYWORDS: [string, RegExp][] = [
  [
    'Makanan',
    /makan|kopi|nasi|bakso|mie|goreng|jajan|roti|ayam|soto|sate|warung|kantin|snack|minum|jus/i,
  ],
  [
    'Transportasi',
    /bensin|bbm|transpor|ojek|grab|gojek|taxi|angkot|parkir|tol|bahan\s*bakar|pertalite|pertamax|solar|isi\s*bensin/i,
  ],
  ['Utilitas', /listrik|pulsa|internet|wifi|air|tagihan|pln|pdam|token/i],
  ['Kesehatan', /obat|klinik|dokter|apotik|rumah\s*sakit|vitamin|berobat/i],
  ['Pendidikan', /sekolah|kuliah|buku|kursus|les|bimbel|seragam|spp/i],
  ['Belanja', /belanja|baju|sepatu|pakaian|toko|mall|sarung|celana/i],
  ['Hiburan', /hiburan|film|game|nonton|liburan|konser|streaming|netflix|spotify|youtube/i],
];

function pickCategory(line: string, type: 'income' | 'expense'): string {
  if (type === 'income') {
    if (/bonus/i.test(line)) return 'Bonus';
    if (/gaji/i.test(line)) return 'Gaji';
    return 'Lainnya';
  }
  for (const [name, re] of CATEGORY_KEYWORDS) {
    if (name && re.test(line)) return name;
  }
  return 'Lainnya';
}

function parseLine(rawLine: string): ImportedTransaction | null {
  let line = rawLine.replace(/^[\s\-•*·✓]+/, '').trim();
  if (!line || DATE_ONLY_RE.test(line)) return null;

  const multMatch = line.match(MULTIPLIER_RE);
  let amountStr = '';
  let amount = 0;

  if (multMatch) {
    const num = parseFloat(multMatch[1].replace(',', '.'));
    const multiplier = /jt|juta/i.test(multMatch[2]) ? 1_000_000 : 1_000;
    amount = Math.round(num * multiplier);
    amountStr = multMatch[0];
  } else {
    const numMatch = line.match(NUMBER_RE);
    if (!numMatch) return null;
    amountStr = numMatch[0];
    const cleaned = /^\d{1,3}(?:[.,]\d{3})+$/.test(amountStr)
      ? amountStr.replace(/[.,]/g, '')
      : amountStr.replace(/,/g, '.');
    amount = Math.round(parseFloat(cleaned));
  }

  if (!amount || amount <= 0) return null;

  const type = INCOME_RE.test(line) ? 'income' : 'expense';

  let description = line
    .replace(CURRENCY_RE, ' ')
    .replace(amountStr, ' ')
    .replace(MULTIPLIER_RE, ' ')
    .replace(/\b\d{1,3}(?:[.,]\d{3})+\b/g, ' ')
    .replace(/[\s\-,;:()]+/g, ' ')
    .trim();

  if (!description) description = 'Transaksi';

  return {
    amount,
    description,
    category: pickCategory(description || line, type),
    type,
    raw: rawLine.trim(),
  };
}

export function parseNoteLines(text: string): ImportedTransaction[] {
  const results: ImportedTransaction[] = [];
  let currentDate: Date | null = null;
  for (const line of text.split(/\r?\n/)) {
    const header = parseDateHeader(line);
    if (header) {
      currentDate = header;
      continue;
    }
    const inline = parseInlineDate(line);
    const parsed = parseLine(inline ? inline.rest : line);
    if (parsed) {
      results.push({
        ...parsed,
        raw: line.trim(),
        date: (inline?.date ?? currentDate) || undefined,
      });
    }
  }
  return results;
}

/**
 * Extracts a date prefix from a transaction line (e.g. "02/08 makan 25rb")
 * so the transaction keeps the date written in the note.
 */
export function parseInlineDate(
  line: string,
  now: Date = new Date()
): {
  date: Date;
  rest: string;
} | null {
  const match = line.match(INLINE_DATE_RE);
  if (!match) return null;
  const date = parseDateHeader(match[0].trim(), now);
  if (!date) return null;
  return { date, rest: line.slice(match[0].length) };
}

/**
 * Parses a date header line (e.g. "12/08", "12/08/24", "2024-08-12") into a Date.
 * dd/mm ordering (Indonesian convention). Without a year, uses the current year,
 * rolling back one year if the resulting date is still in the future.
 */
export function parseDateHeader(line: string, now: Date = new Date()): Date | null {
  const match = line.match(DATE_HEADER_RE);
  if (!match) return null;

  const day = parseInt(match[1], 10);
  const month = parseInt(match[2], 10);
  if (month < 1 || month > 12 || day < 1 || day > 31) return null;

  let year: number;
  if (match[3]) {
    year = parseInt(match[3], 10);
    if (year < 100) year += 2000;
  } else {
    year = now.getFullYear();
  }

  const date = new Date(year, month - 1, day);
  if (date.getMonth() !== month - 1) return null;

  if (!match[3] && date.getTime() > now.getTime()) {
    date.setFullYear(year - 1);
  }
  return date;
}

const VPS_HEADER_RE = /^\s*\|?\s*id\s*\|/i;
const VPS_SEP_RE = /^\s*\|?\s*[-:]+[-| :]*\s*$/;
const VPS_ROW_RE = /^\s*\|/;

/**
 * Parses a VPS database export (pipe-delimited markdown table) into
 * ImportedTransaction objects. Only rows with status_konfirmasi = 1
 * are included. Expected columns: id, user_id, amount, type, category,
 * description, status_konfirmasi, date, created_at, updated_at.
 */
export function parseVpsExport(text: string): ImportedTransaction[] {
  const results: ImportedTransaction[] = [];
  for (const rawLine of text.split(/\r?\n/)) {
    const line = rawLine.trim();
    if (!line) continue;
    if (VPS_HEADER_RE.test(line)) continue;
    if (VPS_SEP_RE.test(line)) continue;
    if (!VPS_ROW_RE.test(line)) continue;

    const cols = line
      .split('|')
      .map((c) => c.trim())
      .filter((c) => c !== '');
    // cols: [id, user_id, amount, type, category, description, status_konfirmasi, date, created_at, updated_at]
    if (cols.length < 10) continue;

    const status = cols[6];
    if (status !== '1') continue;

    const amountStr = cols[2].replace(/,/g, '');
    const amount = Math.round(parseFloat(amountStr));
    if (!amount || amount <= 0) continue;

    const type = cols[3] === 'income' ? 'income' : 'expense';
    const category = cols[4] || 'Lainnya';
    const description = cols[5] || 'Transaksi';

    const dateStr = cols[7];
    let date: Date | undefined;
    if (dateStr) {
      const datePart = dateStr.split(' ')[0];
      const [y, m, d] = datePart.split('-').map(Number);
      if (!isNaN(y) && !isNaN(m) && !isNaN(d) && m >= 1 && m <= 12 && d >= 1 && d <= 31) {
        date = new Date(y, m - 1, d);
      }
    }

    results.push({
      amount,
      description,
      category,
      type,
      raw: rawLine.trim(),
      date,
    });
  }
  return results;
}
