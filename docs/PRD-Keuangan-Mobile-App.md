# Product Requirements Document (PRD)
## Keuangan Mobile App

**Document Version:** 2.0
**Date Updated:** 2026-08-05
**Status:** Active — reflects current implementation
**Platform:** iOS & Android (Expo SDK 54, React Native)
**Reference:** `README-SETUP.md` for architecture; `IMPLEMENTATION-CHECKLIST.md` for status.

---

## Overview

Aplikasi finansial **standalone, offline-first** di iOS dan Android. Semua data tersimpan lokal. Tanpa backend server, tanpa authentication.

### Key Points
- **Mobile only**: iOS & Android
- **Data lokal**: SQLite (`expo-sqlite`), file `keuangan.db` — bukan Realm, tanpa encryption
- **AI input**: Gemini API untuk parsing teks transaksi (client-side `fetch`) — OCR foto & voice TIDAK diimplementasikan
- **Key management**: API key bisa diisi via Settings (expo-secure-store) dengan fallback `.env`
- **No backend**: tanpa server API / auth server
- **Offline-first**: bekerja tanpa internet
- **Export CSV/PDF**: belum diimplementasikan

---

## Product Scope & Features

### Implemented (MVP)

#### Dashboard
- Ringkasan saldo, income, expense
- Transaksi terbaru

#### Transaction Management
- Tambah transaksi manual (form: amount, category, type, date, description, notes)
- Tambah via AI text parsing (`parseTransactionWithAI`)
- List transaksi (urut by date desc)
- Edit / delete
- Filter helper di store: by category, by date range

#### Categories
- Default categories di-seed otomatis saat first launch (income: Gaji, Bonus, Investasi, Lainnya; expense: Makanan, Transportasi, Hiburan, Utilitas, Kesehatan, Pendidikan, Belanja, Lainnya)
- CRUD dasar

#### Budgets
- Set budget per kategori (period: daily/weekly/monthly/yearly)
- CRUD dasar

#### Settings
- Preferensi aplikasi
- **Gemini API Key** (save / clear, disimpan di expo-secure-store)

#### Navigation & UI
- Bottom tab: Dashboard → Transactions → Categories → Budgets → Settings
- `StyleSheet` (tanpa NativeWind), brand color primary `#208AEF`
- `SafeAreaView` dari `react-native-safe-area-context`

---

## Not Implemented (out of current scope)

- Authentication / JWT / akun
- Backend sync / conflict resolution / background sync
- Receipt OCR (expo-camera) & voice memo (expo-av)
- Chart / analytics (react-native-chart-kit)
- Export CSV/PDF
- i18n
- Database encryption & migrasi (schema `CREATE TABLE IF NOT EXISTS` saja)
- Tests

---

## Data Model (SQLite)

### "Transaction" (quoted — reserved keyword)
`id` TEXT PK, `amount` REAL, `description` TEXT, `category` TEXT, `type` TEXT ('income'|'expense'), `date` TEXT, `notes` TEXT NULL, `createdAt` TEXT, `updatedAt` TEXT

### Category
`id` TEXT PK, `name` TEXT, `color` TEXT, `icon` TEXT, `type` TEXT, `createdAt` TEXT, `updatedAt` TEXT

### Budget
`id` TEXT PK, `category` TEXT, `amount` REAL, `period` TEXT, `startDate` TEXT, `endDate` TEXT NULL, `createdAt` TEXT, `updatedAt` TEXT

---

## AI Integration

- Satu fungsi: `parseTransactionWithAI(input)` di `src/services/geminiService.ts`
- Key di-resolve saat panggil via `src/services/keyService.ts`: SecureStore (Settings) → `EXPO_PUBLIC_GEMINI_API_KEY` (`.env`)
- Gemini REST via `fetch`, tanpa SDK
- Key Gemini valid mulai `AIza`

Lihat `GEMINI-INTEGRATION-GUIDE.md` untuk detail.

---

## Non-Functional Requirements

- **Dev build wajib**: expo-sqlite & expo-secure-store native module → Expo Go tidak jalan
- **Startup**: init DB + seed categories + load stores di `app/index.tsx` `useEffect`
- **Code quality**: `npm run lint`, `npm run type-check`, `npm run format:check` sebelum selesai

---

**Last Updated**: 2026-08-05
