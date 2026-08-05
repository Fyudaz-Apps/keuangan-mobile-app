export interface ImportedTransaction {
  amount: number;
  description: string;
  category: string;
  type: 'income' | 'expense';
  raw: string;
}

const MULTIPLIER_RE = /(\d+(?:[.,]\d+)?)\s*(rb|ribu|jt|juta)\b/i;
const NUMBER_RE = /(\d{1,3}(?:[.,]\d{3})+|\d+)/;
const CURRENCY_RE = /\b(?:rp|rp\.|idr)\b/i;
const INCOME_RE = /(gaji|bonus|honor|terima|dapat|masuk|kirim|pemasukan|\+)/i;
const DATE_ONLY_RE = /^\s*\d{1,2}[\/\-.]\d{1,2}([\/\-.]\d{2,4})?\s*$/;

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
  for (const line of text.split(/\r?\n/)) {
    const parsed = parseLine(line);
    if (parsed) results.push(parsed);
  }
  return results;
}
