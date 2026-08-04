# Keuangan Mobile App - Setup Summary

**Status**: SET UP — MVP working with local SQLite
**Date**: 2026-08-05
**Reference**: `README-SETUP.md` is the source of truth. Older revisions of this doc (Realm-based) are obsolete.

---

## What is implemented

### 1. Project
- Expo SDK 54 (RN 0.81, React 19.1), TypeScript strict
- Entry: `app/index.tsx` via `expo-router/entry` (expo-router is only the entry; routing is manual React Navigation)

### 2. Database (SQLite, not Realm)
- `src/services/dbService.ts` — expo-sqlite, DB file `keuangan.db`
- Tables: `"Transaction"` (quoted — reserved keyword), `Category`, `Budget`
- Default categories auto-seeded on first launch
- Zustand stores hydrate from / write through to SQLite
- `src/services/realmService.ts` — dead code, not wired to anything

### 3. State (Zustand)
- `transactionStore`, `categoryStore`, `budgetStore`, `appStore` (theme)
- In-memory state; persistence = SQLite via `dbService`

### 4. Navigation
- React Navigation: root native stack → bottom tabs (Dashboard, Transactions, Categories, Budgets, Settings)
- Typed param lists in `src/navigation/types.ts`

### 5. Screens
- Dashboard, Transactions, Categories, Budgets, Settings (in `src/screens/`)
- Settings includes Gemini API key management (save/clear)

### 6. Services
- `dbService.ts` — SQLite CRUD (active)
- `geminiService.ts` — AI text parsing (Gemini)
- `keyService.ts` — Gemini key lookup (SecureStore → `.env` fallback)
- `realmService.ts` — dead code, not connected

### 7. Code quality
- ESLint flat config + Prettier + `npm run type-check`
- Verify before finishing: `lint` → `type-check` → `format:check`

---

## Getting started

```bash
npm install
cp .env.example .env        # optional; add EXPO_PUBLIC_GEMINI_API_KEY as fallback
npm run prebuild            # native modules need a dev build
npm run android             # or: npm run ios / npm start
```

## Gemini API key

Two sources, checked in this order at call time:

1. **Settings screen** (expo-secure-store, per device)
2. **`.env`** — `EXPO_PUBLIC_GEMINI_API_KEY` (fallback)

## Not implemented yet

Category/Budget CRUD UI completion, charts, sync/import-export, i18n, dark mode, OCR/voice, tests, DB migrations.

---

**Last Updated**: 2026-08-05
