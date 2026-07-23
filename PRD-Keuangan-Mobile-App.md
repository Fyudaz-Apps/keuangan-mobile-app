# Product Requirements Document (PRD)
## Keuangan Mobile App - React Native Consolidation

**Document Version:** 1.0  
**Date Created:** 2026-07-23  
**Status:** Draft  
**Project Name:** Keuangan Mobile App  
**Platform:** iOS & Android (React Native)

---

## Overview

**Keuangan Mobile App** adalah aplikasi finansial **standalone** yang berjalan di iOS dan Android. Aplikasi ini **sepenuhnya mandiri** (offline-first) tanpa memerlukan backend server atau web version apapun.

### Key Points:
- 📱 **Hanya Mobile**: React Native untuk iOS & Android
- 🔒 **Data Lokal**: Semua data tersimpan di Realm (encrypted)
- 🤖 **AI Integration**: Google Gemini API untuk parsing receipt & voice (client-side)
- 🚫 **No Backend**: Tidak ada server API, database server, atau authentication server
- 🌐 **Offline-First**: Aplikasi bekerja sempurna tanpa internet
- 📤 **Manual Export**: User bisa export data ke CSV/PDF

---

## Deployment Target

| Platform | Target | Distribution |
|----------|--------|---------------|
| **iOS** | iPhone 12+ (iOS 14.0+) | Apple App Store |
| **Android** | Android 7.0+ (API 24+) | Google Play Store |
| **Web** | ❌ NOT INCLUDED | - |
| **Backend** | ❌ NOT INCLUDED | - |

---

## 2. Problem Statement & Motivation

### Current State
- Existing **laporan-keuangan-backend**: Multimodal finance bot (Telegram-based)
- Existing **laporan-keuangan-webserver**: React web frontend
- **Goal**: Konversi ke mobile app (iOS/Android) yang **standalone & offline-first**

### Target Solution
Sebuah **React Native mobile app** yang:
- Berjalan 100% offline (tidak perlu backend server)
- Semua data tersimpan secara lokal & terenkripsi di Realm
- AI-powered parsing untuk foto receipt & voice memos (via Gemini API)
- User experience yang smooth & fast
- Tidak bergantung pada server eksternal (selain Gemini API token)

---

## 3. Product Scope & Features

### Phase 1: MVP (Weeks 1-4)
**Core Features**: Foundation for both iOS/Android

#### 3.1.1 User Authentication
- **Email/Password login** with JWT token management
- **Account creation** with email verification
- **Password recovery** workflow
- **Secure token storage** (React Native Keychain)
- **Session management** (auto-logout, token refresh)

#### 3.1.2 Dashboard & Analytics
- **Financial overview card** (total balance, income/expense summary)
- **Monthly spending chart** (Recharts equivalent for RN: react-native-svg, react-native-chart-kit)
- **Category breakdown** (pie/donut chart)
- **Recent transactions** list (last 5-10 items)
- **Quick stats** (avg daily spending, top category)

#### 3.1.3 Transaction Management
- **Add Transaction** manually
  - Manual entry form (amount, category, date, description)
  - Photo-based entry (capture receipt → OCR via backend)
  - Voice memo integration (record → STT via backend)
- **View Transaction List**
  - Date-grouped list view
  - Filter by category, date range, amount range
  - Search transactions by description
- **Edit/Delete Transaction**
  - Inline editing
  - Soft delete with undo option (60 seconds)
- **Transaction Categories** (pre-populated from backend)
  - Default categories: Food, Transport, Entertainment, Utilities, Health, Education, Other
  - Custom category creation

#### 3.1.4 Offline Support
- **Realm local database** for fast, type-safe transaction storage
- **Automatic sync queue** for queued operations while offline
- **Background sync service** runs when connection restored
- **Conflict resolution** (last-write-wins for MVP, with user override option)
- **Data encryption** at rest using Realm encryption

#### 3.1.5 Navigation & UI
- **Bottom Tab Navigation**: Dashboard → Transactions → Tasks → Settings → Profile
- **Dark/Light theme** toggle (persistent)
- **Responsive layout** for various screen sizes (phones)
- **Accessibility**: WCAG 2.1 AA compliance where applicable

### Phase 2: Enhanced Features (Weeks 5-8)
**Production-Ready & Feature Parity**

#### 3.2.1 AI-Powered Transaction Input (Direct Gemini Integration)
- **Receipt Photo Recognition**
  - Camera integration (expo-camera)
  - Photo gallery upload
  - Direct Gemini Vision API call (client-side)
  - Auto-populate transaction fields (amount, vendor, category, date)
  - No backend API dependency
- **Voice Memo Transcription**
  - Voice recording (expo-av)
  - Direct Gemini Speech-to-Text API (client-side)
  - Auto-parse natural language to transaction
  - Confirmation dialog before saving

#### 3.2.2 Financial Reports & Budget Management
- **Monthly Report**
  - Spending summary by category (from Realm)
  - Income vs. Expense comparison
  - Trend analysis (month-over-month)
  - PDF export (react-native-pdf)
- **Budget Management**
  - Set budget limits per category
  - Budget vs. actual comparison
  - In-app alerts when budget exceeded

#### 3.2.3 Settings & User Management
- **App Preferences**
  - Currency/locale settings
  - Theme preference (dark/light/system)
  - Default categories configuration
- **Data Management**
  - Export data to CSV
  - Backup/restore local database
  - Privacy settings

### Phase 3: Advanced Features (Weeks 9-12, Post-Launch)
**Premium & Differentiators**

#### 3.3.1 Advanced Analytics
- **Yearly financial report** with forecasting
- **Spending patterns** analysis
- **Savings goal tracking**
- **Net worth calculator**

---

## 4. Technical Architecture

### 4.1 Architecture Overview

**Standalone React Native Application**
```
┌─────────────────────────────────────────────────────────┐
│         React Native Mobile App (iOS/Android)           │
├─────────────────────────────────────────────────────────┤
│  ┌──────────────────┐        ┌────────────────────────┐ │
│  │  UI Components   │        │  Realm Database        │ │
│  │  - Dashboard     │◄──────►│  - Transactions        │ │
│  │  - Transactions  │        │  - Categories          │ │
│  │  - Settings      │        │  - Budget              │ │
│  └──────────────────┘        └────────────────────────┘ │
│           │                                               │
│           │                                               │
│  ┌────────▼──────────────────────────────────────────┐  │
│  │  Services Layer                                   │  │
│  │  - Transaction Service                           │  │
│  │  - Gemini AI Service (OCR, Speech-to-Text)       │  │
│  │  - Report Service                                │  │
│  │  - Camera/Voice Service                          │  │
│  └────────┬──────────────────────────────────────────┘  │
│           │                                               │
└───────────┼───────────────────────────────────────────────┘
            │
            ▼
┌─────────────────────────────────────────────────────────┐
│         Google Generative AI (Gemini API)               │
│  - Vision API (Receipt OCR)                             │
│  - Speech-to-Text (Voice parsing)                       │
│  - Natural Language Processing                          │
└─────────────────────────────────────────────────────────┘

🔒 Offline-First: All data stored in Realm, works without internet
📡 Gemini Integration: Client-side API calls with token
```

### 4.2 Tech Stack

#### **Frontend (React Native - Standalone)**
| Layer | Technology | Rationale |
|-------|-----------|-----------|
| Framework | React Native 0.73+ | Cross-platform (iOS/Android) |
| Navigation | React Navigation 6+ | Production-grade routing |
| State Management | Zustand (with persist middleware) | Lightweight, TypeScript-friendly |
| Local Database | Realm (mongodb/realm-js) | Fast, type-safe offline storage, encryption |
| API Client | Axios | HTTP client for Gemini API calls |
| Forms | React Hook Form + Zod | Validation, type-safe |
| Camera/Media | expo-camera, expo-av | Out-of-box permissions, stable |
| AI Integration | Google Generative AI SDK | Direct Gemini API (Vision, Speech-to-Text) |
| PDF Export | react-native-pdf | Report generation |
| UI Components | NativeWind (Tailwind for RN) | Consistent styling |
| Charts | react-native-chart-kit | Financial data visualization |
| Storage | @react-native-async-storage | Secure preference storage |

#### **Backend (Not Required)**
- ❌ No backend API dependency
- ✅ Direct Gemini API integration (client-side)
- ✅ All data stored locally in Realm
- ✅ Standalone application

#### **External Services**
| Service | Purpose | Cost |
|---------|---------|------|
| Google Generative AI (Gemini) | Vision API (receipts), Speech-to-Text | Free tier available, pay-per-use |

### 4.2 Project Structure

```
keuangan-mobile-app/
├── .github/
│   └── workflows/
│       ├── build-android.yml
│       ├── build-ios.yml
│       └── deploy-to-stores.yml
├── app/
│   ├── _layout.tsx              # Root navigator
│   ├── (app)/
│   │   ├── _layout.tsx          # Bottom tab navigator
│   │   ├── dashboard/
│   │   │   ├── _layout.tsx
│   │   │   └── index.tsx
│   │   ├── transactions/
│   │   │   ├── _layout.tsx
│   │   │   ├── index.tsx
│   │   │   ├── [id].tsx         # Transaction detail
│   │   │   └── add.tsx          # Add transaction (manual, photo, voice)
│   │   ├── reports/
│   │   │   ├── _layout.tsx
│   │   │   └── index.tsx
│   │   ├── settings/
│   │   │   └── index.tsx
│   │   └── +not-found.tsx
│   ├── _layout.tsx              # Onboarding / First-time setup (if needed)
├── src/
│   ├── api/                     # API client layer
│   │   ├── gemini.ts            # Google Generative AI client
│   │   └── types.ts             # API response types
│   ├── store/                   # Zustand state management
│   │   ├── transaction.store.ts
│   │   ├── app.store.ts         # Theme, settings, currency
│   │   └── ui.store.ts          # Loading, modals
│   ├── database/                # Realm database layer
│   │   ├── realm.ts             # Realm initialization & instance
│   │   ├── models/              # Realm data models
│   │   │   ├── Transaction.ts
│   │   │   ├── Category.ts
│   │   │   └── Budget.ts
│   │   ├── repositories/        # Data access layer
│   │   │   ├── transaction.repo.ts
│   │   │   ├── category.repo.ts
│   │   │   └── budget.repo.ts
│   │   └── migrations/
│   │       └── migrations.ts
│   ├── hooks/
│   │   ├── useTransactions.ts
│   │   ├── useBudget.ts
│   │   ├── useGeminiParsing.ts   # AI parsing hook
│   │   └── useCamera.ts
│   ├── components/
│   │   ├── common/              # Reusable components
│   │   │   ├── Button.tsx
│   │   │   ├── Card.tsx
│   │   │   ├── Input.tsx
│   │   │   ├── Modal.tsx
│   │   │   └── Header.tsx
│   │   ├── transactions/
│   │   │   ├── TransactionList.tsx
│   │   │   ├── TransactionItem.tsx
│   │   │   ├── TransactionForm.tsx
│   │   │   ├── AddTransactionModal.tsx
│   │   │   ├── CameraCapture.tsx
│   │   │   ├── VoiceRecorder.tsx
│   │   │   ├── CategorySelector.tsx
│   │   │   └── FilterPanel.tsx
│   │   ├── dashboard/
│   │   │   ├── BalanceCard.tsx
│   │   │   ├── OverviewChart.tsx
│   │   │   ├── CategoryBreakdown.tsx
│   │   │   └── QuickStats.tsx
│   │   ├── reports/
│   │   │   ├── MonthlyReport.tsx
│   │   │   ├── BudgetSummary.tsx
│   │   │   └── ExportButton.tsx
│   │   └── settings/
│   │       ├── SettingsSection.tsx
│   │       ├── ThemeToggle.tsx
│   │       └── CurrencySelector.tsx
│   ├── services/
│   │   ├── transaction.service.ts (business logic)
│   │   ├── gemini.service.ts    # AI parsing service
│   │   ├── camera.service.ts
│   │   ├── voice.service.ts
│   │   └── report.service.ts
│   ├── utils/
│   │   ├── date.ts
│   │   ├── currency.ts
│   │   ├── validation.ts
│   │   └── error-handler.ts
│   ├── types/
│   │   ├── index.ts             # All TypeScript types
│   │   └── models.ts            # Domain models
│   ├── constants/
│   │   ├── categories.ts
│   │   └── config.ts
│   └── context/
│       └── ThemeContext.tsx      # Theme provider
├── app.json                     # Expo/React Native config
├── package.json
├── tsconfig.json
├── tailwind.config.js           # NativeWind config
├── .env.example
└── README.md
```

### 4.3 Gemini API Integration (Client-Side)

**Direct Integration**: No backend required

**Required API**: Google Generative AI (Gemini)

#### Supported Features

**1. Vision API (Receipt OCR)**
```typescript
// Input: Receipt image (base64 or file)
// Output: Parsed transaction data
{
  amount: 150000,
  vendor: "Indomaret",
  category: "Shopping",
  date: "2026-07-23",
  items: ["Snacks", "Drinks"],
  confidence: 0.95
}
```

**2. Speech-to-Text API**
```typescript
// Input: Audio file (M4A, WAV, or similar)
// Output: Parsed transaction from natural language
{
  description: "Buy groceries at Carrefour",
  amount: 250000,
  category: "Groceries",
  confidence: 0.88
}
```

**3. Natural Language Processing**
- Parse user descriptions for category inference
- Extract amounts, dates, vendors from text
- Handle multiple languages

#### Setup
```typescript
// API Configuration
import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.EXPO_PUBLIC_GEMINI_API_KEY);

// Vision Model
const visionModel = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

// Text Model
const textModel = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
```

#### Cost Optimization
- Free tier: 1,500 API calls/day (Gemini 1.5 Flash)
- Estimated usage:
  - 50 users × 5 receipts/day = 250 calls/day ✅ Within free tier
  - Paid tier: $0.00625/1K input tokens (Vision)
- Caching: Cache receipt formats locally to reduce redundant API calls

---

## 5. User Flows & Wireframes

### 5.1 App Navigation Flow
```
Splash Screen
    ↓
First-Time Setup? 
    ├─ YES → Onboarding (set currency, categories)
    └─ NO → Dashboard
            ↓
    Bottom Tab Navigation:
    ├─ 📊 Dashboard (Overview, recent transactions)
    ├─ 💳 Transactions (List, filters, add)
    ├─ 📈 Reports (Monthly summary, budget)
    └─ ⚙️ Settings (Theme, currency, categories)
```

### 5.2 Add Transaction Flow
```
Transactions Tab → [+ Add Button]
    ↓
Choose Entry Method:
    ├─ 📝 Manual Entry
    │   └─ Form (amount, category, date, description) → Save to Realm
    │
    ├─ 📸 Photo Receipt (using Gemini Vision)
    │   └─ Camera/Gallery → Send to Gemini API → 
    │       Auto-populate fields → Confirm → Save to Realm
    │
    └─ 🎙️ Voice Memo (using Gemini Speech-to-Text)
        └─ Record Audio → Send to Gemini API → 
            Parse to transaction → Confirm → Save to Realm
```

### 5.3 Dashboard Flow
```
Dashboard Screen:
├─ Balance Card (Total, Income, Expense)
├─ Monthly Spending Chart
├─ Category Breakdown (Pie)
├─ Recent Transactions (5-10 items)
└─ View All → Transactions List
```

### 5.4 Settings Flow
```
Settings Tab
    ↓
├─ Account Settings
│   ├─ Email
│   ├─ Password
│   └─ Delete Account
├─ App Preferences
│   ├─ Theme (Light/Dark/System)
│   ├─ Currency
│   ├─ Notifications (Enable/Disable)
│   └─ Biometric Login
├─ About
│   ├─ Version
│   └─ Privacy/Terms
└─ Logout
```

---

## 6. Data Models & Database Schema

### 6.1 Core Entities

#### User
```typescript
interface User {
  id: string (UUID)
  email: string
  password_hash: string
  name: string
  currency: string (default: "IDR")
  theme: "light" | "dark" | "system"
  biometric_enabled: boolean
  created_at: timestamp
  updated_at: timestamp
}
```

#### Transaction
```typescript
interface Transaction {
  id: string (UUID)
  user_id: string (FK → User)
  amount: number (in smallest unit, e.g., cents)
  category: string (FK → Category)
  description: string
  date: timestamp
  method: "manual" | "photo" | "voice" | "bot"
  receipt_url?: string (S3/CloudStorage)
  voice_memo_url?: string
  metadata: {
    vendor?: string
    tags?: string[]
    recurring?: boolean
  }
  sync_status: "pending" | "synced" | "conflict" (offline support)
  created_at: timestamp
  updated_at: timestamp
  deleted_at?: timestamp (soft delete)
}
```

#### Category
```typescript
interface Category {
  id: string (UUID)
  user_id: string (FK → User, NULL for system categories)
  name: string
  icon: string (emoji or SVG name)
  color: string (hex)
  is_custom: boolean
  sort_order: integer
  created_at: timestamp
}
```

#### Task
```typescript
interface Task {
  id: string (UUID)
  user_id: string (FK → User)
  title: string
  description?: string
  status: "todo" | "in_progress" | "done"
  category?: string
  due_date?: timestamp
  priority: "low" | "medium" | "high"
  created_at: timestamp
  updated_at: timestamp
}
```

#### SyncQueue (Offline Support)
```typescript
interface SyncQueue {
  id: string
  user_id: string (FK → User)
  entity_type: "transaction" | "task" | "category"
  entity_id: string
  operation: "create" | "update" | "delete"
  payload: JSON
  retry_count: integer
  last_retry: timestamp
  created_at: timestamp
}
```

### 6.2 Realm Database Schema (React Native - Standalone)

#### Transaction Model
```typescript
class Transaction extends Realm.Object {
  _id: ObjectId;
  amount: number; // In smallest unit (cents/rupiah)
  category: string; // Category name or ID
  description: string;
  date: Date;
  method: 'manual' | 'photo' | 'voice';
  receipt_image_path?: string; // Local file path
  vendor?: string;
  tags?: string[];
  is_deleted: boolean; // Soft delete
  created_at: Date;
  updated_at: Date;
  
  static schema = {
    name: 'Transaction',
    primaryKey: '_id',
    properties: {
      _id: 'objectId',
      amount: 'double',
      category: 'string',
      description: 'string',
      date: 'date',
      method: 'string',
      receipt_image_path: 'string?',
      vendor: 'string?',
      tags: 'string[]',
      is_deleted: { type: 'bool', default: false },
      created_at: 'date',
      updated_at: 'date',
    },
    indexes: ['date', 'category'],
  };
}
```

#### Category Model
```typescript
class Category extends Realm.Object {
  _id: ObjectId;
  name: string;
  icon: string; // Emoji
  color: string; // Hex color
  is_custom: boolean;
  sort_order: number;
  created_at: Date;
  
  static schema = {
    name: 'Category',
    primaryKey: '_id',
    properties: {
      _id: 'objectId',
      name: 'string',
      icon: 'string',
      color: 'string',
      is_custom: 'bool',
      sort_order: 'int',
      created_at: 'date',
    },
  };
}
```

#### Budget Model
```typescript
class Budget extends Realm.Object {
  _id: ObjectId;
  category: string; // FK to Category
  limit_amount: number;
  period: 'monthly' | 'yearly'; // Recurrence period
  created_at: Date;
  updated_at: Date;
  
  static schema = {
    name: 'Budget',
    primaryKey: '_id',
    properties: {
      _id: 'objectId',
      category: 'string',
      limit_amount: 'double',
      period: { type: 'string', default: 'monthly' },
      created_at: 'date',
      updated_at: 'date',
    },
    indexes: ['category'],
  };
}
```

#### Realm Initialization
```typescript
// realm.ts
import Realm from 'realm';
import { Transaction, Category, Budget } from './models';

let realm: Realm | null = null;

export async function initializeRealm(): Promise<Realm> {
  if (realm) {
    return realm;
  }

  try {
    realm = await Realm.open({
      schema: [Transaction, Category, Budget],
      schemaVersion: 1,
      deleteRealmIfMigrationNeeded: false,
      encryptionKey: generateEncryptionKey(), // Encrypt at rest
    });
    
    console.log('✅ Realm initialized (encrypted):', realm.path);
    return realm;
  } catch (error) {
    console.error('❌ Failed to initialize Realm:', error);
    throw error;
  }
}

export function getRealm(): Realm {
  if (!realm) {
    throw new Error('Realm not initialized. Call initializeRealm() first.');
  }
  return realm;
}

export async function closeRealm(): Promise<void> {
  if (realm) {
    realm.close();
    realm = null;
  }
}

// Generate or retrieve encryption key
function generateEncryptionKey(): Uint8Array {
  // In production: retrieve from Keychain/Keystore
  // For demo: generate fixed key (NOT recommended)
  return new Uint8Array(64); // 64-byte key
}
```

### 6.3 Realm Advantages over SQLite

| Feature | SQLite | Realm |
|---------|--------|-------|
| **Performance** | Good | Excellent (memory-mapped) |
| **Type Safety** | Limited (raw SQL) | Full TypeScript support |
| **Query Language** | SQL | Native JS/TS objects |
| **Relationships** | Foreign keys (complex) | Native object references |
| **Migrations** | Manual SQL scripts | Auto-handled with schemaVersion |
| **Encryption** | Plugin required | Built-in support |
| **Learning Curve** | SQL knowledge needed | Familiar to JS developers |
| **Offline Sync** | Manual tracking | Built-in transaction support |
| **Watch Queries** | Polling required | Real-time listeners |

---

## 7. Non-Functional Requirements

### 7.1 Performance
- **App startup time**: < 3 seconds
- **Transaction list load**: < 1 second (first 20 items)
- **API response time**: < 2 seconds
- **Offline sync**: Background task, non-blocking

### 7.2 Security
- **JWT tokens** stored in secure Keychain/Keystore
- **HTTPS only** for all API calls
- **SQLite encryption** at rest (optional Phase 2)
- **Biometric authentication** (Phase 2)
- **No sensitive data** in app logs
- **Regular security audits** (quarterly)

### 7.3 Scalability
- **Support 100K+ transactions** per user
- **Efficient pagination** (lazy loading)
- **Optimized database queries** (indexing)
- **CDN for media** (receipts, voice memos)

### 7.4 Reliability
- **99.5% uptime** for backend
- **Graceful error handling** for failed requests
- **Automatic retry** with exponential backoff
- **User-facing error messages** (clear, actionable)

### 7.5 Accessibility
- **WCAG 2.1 AA** compliance (where applicable to mobile)
- **Color contrast** ratios > 4.5:1
- **Readable font sizes** (minimum 16sp)
- **Touch targets** > 48x48dp
- **VoiceOver/TalkBack** support

### 7.6 Compatibility
- **iOS**: 14.0+
- **Android**: API 24+ (Android 7.0+)
- **Devices**: Phones (4.5" - 6.7"), basic tablet support

---

## 8. Development Roadmap

### **Phase 1: MVP (Weeks 1-4)**
**Goal**: Functional mobile app with core features

| Week | Deliverable | Status |
|------|-------------|--------|
| 1 | Project setup, navigation, auth UI | To Do |
| 2 | API integration, dashboard, basic transactions | To Do |
| 3 | Offline sync, forms, validation | To Do |
| 4 | Testing, bug fixes, beta release | To Do |

**Deliverables**:
- iOS Testflight & Android Internal Testing builds
- Feature parity with web login, dashboard, transaction list/add
- Offline transaction queueing
- Basic error handling

### **Phase 2: Production Ready (Weeks 5-8)**
**Goal**: App Store & Google Play Store release

| Week | Deliverable | Status |
|------|-------------|--------|
| 5 | AI receipt/voice parsing UI | To Do |
| 6 | Push notifications, real-time sync | To Do |
| 7 | Budget management, reports export | To Do |
| 8 | App Store optimization, release prep | To Do |

**Deliverables**:
- Production iOS & Android apps released to stores
- Feature parity with web app (Phase 2)
- Push notifications working
- Performance optimizations

### **Phase 3: Post-Launch (Weeks 9-12+)**
**Goal**: Advanced features & user growth

| Milestone | Feature | Estimated Effort |
|-----------|---------|------------------|
| Week 9-10 | Advanced analytics, savings goals | 2 weeks |
| Week 11-12 | Biometric auth, bank linking | 2 weeks |
| Week 12+ | Family sharing, recurring expenses | 2+ weeks |

---

## 9. Success Criteria & KPIs

### Functional Success
- [ ] All MVP features implemented & tested
- [ ] No critical bugs at release
- [ ] 95%+ API endpoint coverage
- [ ] Offline sync working correctly
- [ ] Cross-platform (iOS/Android) parity

### Business Metrics
- [ ] 1,000+ downloads in first month
- [ ] 4.0+ average rating on both stores
- [ ] 70%+ 30-day retention rate
- [ ] < 1% crash rate (Firebase Crashlytics)
- [ ] < 500ms average API response time

### User Satisfaction
- [ ] Net Promoter Score (NPS) > 40
- [ ] User survey: "Easy to add transactions" > 80% agree
- [ ] Support tickets < 10 per week (post-launch)

---

## 10. Risks & Mitigation

| Risk | Impact | Probability | Mitigation |
|------|--------|-------------|-----------|
| **Backend API instability** | App crashes, data loss | Medium | Implement offline fallbacks, robust error handling, rate limiting |
| **iOS review delays** | Launch delay | Medium | Start App Store submission early, follow guidelines strictly |
| **Performance on old devices** | Poor user experience | Medium | Optimize bundles, lazy-load, test on low-end hardware |
| **User data privacy concerns** | Negative reviews, churn | Low | Clear privacy policy, encryption, GDPR compliance |
| **Feature scope creep** | Timeline delays | High | Strict prioritization, Phase-based releases |

---

## 11. Post-Launch Support & Maintenance

### Sprint Schedule
- **Week 1 post-launch**: Daily monitoring, hotfix deployment
- **Week 2-4**: Weekly updates, minor feature additions
- **Month 2+**: Bi-weekly updates, new features

### Monitoring & Analytics
- **Firebase Crashlytics**: Real-time crash reporting
- **Firebase Analytics**: User behavior, funnel analysis
- **App Store Connect**: Crash rates, performance metrics
- **Backend logs**: API error rates, response times

### Support Channels
- **In-app FAQ** (help center)
- **Email support**: support@keuangan.app
- **GitHub Issues**: Bug reporting (public)

---

## 12. Appendix

### A. Technology Comparison: React Native vs. Alternatives

| Framework | Pros | Cons | Choice |
|-----------|------|------|--------|
| **React Native** | Code reuse (web), large community, TypeScript | Performance limitations on complex animations | ✅ Selected |
| **Flutter** | Better performance, beautiful UI | No code sharing with web/backend |  |
| **Native (Swift/Kotlin)** | Best performance, platform features | 2x development cost, separate codebases |  |
| **Capacitor/Ionic** | Web-based, easy migration | Performance issues, poor native feel |  |

### B. Dependency Checklist

**Critical Dependencies**:
- ✅ React Native 0.73+
- ✅ React Navigation 6+
- ✅ Zustand 4+
- ✅ Axios 1.4+
- ✅ Realm (mongodb/realm-js) - Local encrypted database
- ✅ @google/generative-ai - Gemini API client
- ✅ expo-camera, expo-av - Media capture
- ✅ react-native-pdf - Report export

### C. Repository Setup

**New Repository**: `Fyudaz-Apps/keuangan-mobile-app`

```bash
# Project initialization
npx create-expo-app keuangan-mobile-app
cd keuangan-mobile-app
npm install

# Essential setup
npm install zustand axios zod react-hook-form
npm install realm  # Realm for encrypted local database
npm install @google/generative-ai  # Gemini AI integration
npm install @react-native-async-storage/async-storage
npm install react-native-chart-kit  # Financial charts
npm install nativewind tailwindcss  # Styling
npm install expo-camera expo-av  # Camera and audio

# Dev dependencies
npm install --save-dev @types/react @types/react-native typescript
npm install --save-dev eslint prettier @typescript-eslint/eslint-plugin
```

### D. Environment Configuration

**.env.example**:
```
# Gemini AI Configuration
EXPO_PUBLIC_GEMINI_API_KEY=your_gemini_api_key_here

# App Configuration
EXPO_PUBLIC_ENVIRONMENT=development
EXPO_PUBLIC_CURRENCY=IDR
EXPO_PUBLIC_LOG_LEVEL=debug

# App Name & Display
EXPO_PUBLIC_APP_NAME=Keuangan Mobile
```

**Obtaining Gemini API Key**:
1. Visit: https://ai.google.dev
2. Create free account (Google account required)
3. Generate API key
4. No billing required for free tier (1,500 requests/day)

### E. Design System Token

**Colors** (NativeWind / Tailwind):
```typescript
const colors = {
  primary: {
    50: '#f5f7fa',
    500: '#2563eb', // Blue
    900: '#1e3a8a',
  },
  success: '#10b981',   // Green
  danger: '#ef4444',    // Red
  warning: '#f59e0b',   // Amber
  gray: {
    50: '#f9fafb',
    900: '#111827',
  },
}

const spacing = {
  xs: 4,   // 4px
  sm: 8,   // 8px
  md: 16,  // 16px
  lg: 24,  // 24px
  xl: 32,  // 32px
}
```

### F. Deployment Checklist

**Pre-Launch**:
- [ ] Code review completed (all Phase 1 & 2 PRs)
- [ ] Unit tests > 80% coverage
- [ ] E2E tests for critical flows
- [ ] Performance profiling (Bundle size < 50MB, startup < 3s)
- [ ] Security audit (no hardcoded secrets, HTTPS only)
- [ ] Privacy policy published
- [ ] Terms of service finalized
- [ ] App Store & Google Play accounts set up
- [ ] Certificates & signing keys configured

**Launch Day**:
- [ ] iOS app submitted to App Review
- [ ] Android app published to Google Play (internal testing first)
- [ ] Marketing announcement scheduled
- [ ] Support team trained
- [ ] Monitoring dashboards active

---

## 13. Key Implementation Considerations

1. **Gemini API Key Management**
   - Store securely in environment (not in code)
   - Consider user API key vs. shared app key
   - Monitor API usage to avoid hitting free tier limits

2. **Receipt Image Quality**
   - Compress large images before sending to Gemini
   - Cache formatted receipts to reduce API calls
   - Provide user feedback during parsing

3. **Voice Recording Quality**
   - Recommend quiet environment for best transcription
   - Handle different audio formats (M4A, WAV, etc.)
   - Timeout if recording takes too long

4. **Data Persistence**
   - Realm encryption enabled by default
   - Regular backups via export feature
   - Handle corrupted database gracefully

5. **Offline-First Architecture**
   - No sync required (no backend)
   - All operations immediate in Realm
   - No conflict resolution needed

---

## 14. Questions for Stakeholders

1. **Gemini API Cost**: Should users provide their own API key, or use a shared app key? (Cost implications)
2. **Data Export**: Need feature to export all transactions to CSV/PDF for tax purposes?
3. **Multi-Device Sync**: Should app support syncing between user's devices (requires backend)?
4. **Receipt Storage**: Where to store receipt images? (Device only vs. Cloud?)
5. **Categories**: Should users be able to fully customize categories, or use predefined set?
6. **Release Timeline**: Target launch date for iOS/Android app stores?
7. **Team Size**: How many React Native developers available for development?

---

## Document Control

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.0 | 2026-07-23 | Copilot | Initial PRD draft |
| | | | |

**Next Review Date**: 2026-07-30 (Post-stakeholder review)  
**Last Updated**: 2026-07-23  

---

**End of Document**
