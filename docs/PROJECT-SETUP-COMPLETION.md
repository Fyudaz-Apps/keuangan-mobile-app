# Keuangan Mobile App - Project Setup (Current State)

**Status**: SET UP — SQLite persistence working, dev build required  
**Date**: 2026-08-05  
**Reference**: `README-SETUP.md` is the source of truth. Older content in this file (Realm, RN 0.86, Expo SDK 57, NativeWind, chart-kit) is obsolete.

---

## Stack (as installed)

| Component | Version |
|-----------|---------|
| Expo | ~54.0.0 |
| React Native | 0.81.5 |
| React | 19.1.0 |
| TypeScript | ~5.9.2 |
| expo-sqlite | ~16.0.0 |
| Zustand | ^5.0.14 |
| React Navigation (bottom-tabs / native-stack) | 7.x |
| react-native-safe-area-context | ~5.6.0 |
| react-hook-form + zod | ^7 / ^4 (forms) |
| ESLint / Prettier | 9.x / 3.x |

NOT installed (older docs mention them — do not assume): Realm, axios, `@google/generative-ai`, nativewind/tailwind, react-native-chart-kit, expo-camera, expo-av, expo-image-picker, async-storage.

---

## Folder structure (actual)

```
app/index.tsx               # entry (expo-router/entry) + app init + providers
src/
  database/models/          # TS interfaces: Transaction, Category, Budget
  services/
    dbService.ts            # SQLite CRUD (expo-sqlite) — ACTIVE
    geminiService.ts        # AI text parsing
    realmService.ts         # DEAD CODE — Realm, not connected
  store/                    # Zustand: transaction, category, budget, app
  navigation/               # types.ts, index.tsx, BottomTabNavigator.tsx
  screens/                  # dashboard, transactions, categories, budgets, Settings
  components/ui/            # Button, Card, Input, Modal
  constants/                # brand colors, etc.
```

## Database

- File: `keuangan.db` (expo-sqlite, `openDatabaseSync`)
- Tables: `"Transaction"` (quoted — reserved keyword), `Category`, `Budget`
- No encryption, no Realm, no migration framework (schema is `CREATE TABLE IF NOT EXISTS`)
- Native module → dev build required (`npm run prebuild`, then `npm run android|ios`); does not run in Expo Go

## NPM scripts

```bash
npm start          # dev server
npm run android    # dev build on Android
npm run ios        # dev build on iOS
npm run web        # web
npm run lint       # eslint
npm run lint:fix
npm run format     # prettier write (src/** only)
npm run format:check
npm run type-check # tsc --noEmit
npm run prebuild   # expo prebuild --clean (destructive)
```

## Verification

```bash
npm run lint
npm run type-check
npm run format:check
```

---

**Last Updated**: 2026-08-05
