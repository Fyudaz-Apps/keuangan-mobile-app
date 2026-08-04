# Keuangan Mobile App - Setup Summary

**Status**: SET UP — MVP working with local SQLite  
**Date**: 2026-08-05  
**Reference**: `README-SETUP.md` is the source of truth. `docs/` older revisions (Realm-based) are obsolete.

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

### 3. State (Zustand)
- `transactionStore`, `categoryStore`, `budgetStore`, `appStore` (theme)
- In-memory state; persistence = SQLite via `dbService`

### 4. Navigation
- React Navigation: root native stack → bottom tabs (Dashboard, Transactions, Categories, Budgets, Settings)
- Typed param lists in `src/navigation/types.ts`

### 5. Screens
- Dashboard, Transactions, Categories, Budgets, Settings (in `src/screens/`)

### 6. Services
- `dbService.ts` — SQLite CRUD (active)
- `geminiService.ts` — AI text parsing (9router → Gemini fallback)
- `realmService.ts` — dead code, not wired to anything

### 7. Code quality
- ESLint + Prettier + `npm run type-check`
- Verify before finishing: `lint` → `type-check` → `format:check`

---

## Getting started

```bash
npm install
cp .env.example .env        # add EXPO_PUBLIC_GEMINI_API_KEY (AIza...)
npm run prebuild            # native modules need a dev build
npm run android             # or: npm run ios / npm start
```

## Environment (`.env`)

Only `EXPO_PUBLIC_`-prefixed vars reach the app:
- `EXPO_PUBLIC_GEMINI_API_KEY` — Gemini key (`AIza...`)
- `EXPO_PUBLIC_9ROUTER_URL` / `EXPO_PUBLIC_9ROUTER_API_KEY` / `EXPO_PUBLIC_9ROUTER_MODEL` — optional local AI proxy; used instead of Gemini when both URL and key are set

## Not implemented yet

Category/Budget CRUD UI completion, charts, sync/import-export, i18n, dark mode, OCR/voice, tests, DB migrations.

---

**Last Updated**: 2026-08-05
