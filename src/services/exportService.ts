import { File, Paths } from 'expo-file-system';
import * as Sharing from 'expo-sharing';
import * as Print from 'expo-print';
import { Transaction, Category, Budget } from '@/database/models';
import { csvFromTransactions } from '@/utils/aggregate';

export interface LocalBackup {
  version: number;
  exportedAt: string;
  transactions: Transaction[];
  categories: Category[];
  budgets: Budget[];
}

function htmlFromTransactions(transactions: Transaction[]): string {
  const rows = transactions
    .map(
      (t) =>
        `<tr><td>${new Date(t.date).toLocaleDateString('id-ID')}</td><td>${t.type}</td><td>Rp ${t.amount.toLocaleString('id-ID')}</td><td>${t.description}</td><td>${t.category}</td><td>${t.notes ?? ''}</td></tr>`
    )
    .join('');
  return `<html><body><h1>Transactions</h1><table border="1" cellpadding="6"><thead><tr><th>Date</th><th>Type</th><th>Amount</th><th>Description</th><th>Category</th><th>Notes</th></tr></thead><tbody>${rows}</tbody></table></body></html>`;
}

export async function exportTransactionsCsv(transactions: Transaction[]): Promise<void> {
  const csv = csvFromTransactions(transactions);
  const file = new File(Paths.cache, 'transactions.csv');
  file.write(csv);
  await Sharing.shareAsync(file.uri, { mimeType: 'text/csv', dialogTitle: 'Export CSV' });
}

export async function exportTransactionsPdf(transactions: Transaction[]): Promise<void> {
  const { uri } = await Print.printToFileAsync({ html: htmlFromTransactions(transactions) });
  await Sharing.shareAsync(uri, { mimeType: 'application/pdf', dialogTitle: 'Export PDF' });
}

export async function exportLocalBackup(data: LocalBackup): Promise<void> {
  const json = JSON.stringify(data, null, 2);
  const file = new File(
    Paths.cache,
    `keuangan-backup-${new Date().toISOString().slice(0, 10)}.json`
  );
  file.write(json);
  await Sharing.shareAsync(file.uri, { mimeType: 'application/json', dialogTitle: 'Backup Lokal' });
}

export async function importLocalBackup(uri: string): Promise<LocalBackup> {
  const file = new File(uri);
  const text = await file.text();
  const data = JSON.parse(text) as LocalBackup;
  if (
    !data ||
    !Array.isArray(data.transactions) ||
    !Array.isArray(data.categories) ||
    !Array.isArray(data.budgets)
  ) {
    throw new Error('Format backup tidak valid.');
  }
  return data;
}
