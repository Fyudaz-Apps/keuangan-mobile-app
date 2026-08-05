import { File, Paths } from 'expo-file-system';
import * as Sharing from 'expo-sharing';
import * as Print from 'expo-print';
import { Transaction } from '@/database/models';
import { csvFromTransactions } from '@/utils/aggregate';

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
