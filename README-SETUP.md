# Keuangan Mobile App

A comprehensive mobile financial management application built with React Native and Expo. Track expenses, manage categories, set budgets, and maintain control over your personal finances with ease.

## 🚀 Features (MVP Phase 1)

- **Dashboard**: Quick overview of income, expenses, and balance
- **Transactions**: View, add, and manage financial transactions
- **Categories**: Organize transactions with customizable categories
- **Budgets**: Set and track budgets for different spending categories
- **Settings**: Configure app preferences and settings
- **Offline Support**: Full offline capability with local Realm database

## 📋 Project Structure

```
keuangan-mobile-app/
├── app/                          # Expo Router app directory
├── src/
│   ├── components/
│   │   ├── ui/                   # Reusable UI components
│   │   │   ├── Button.tsx
│   │   │   ├── Card.tsx
│   │   │   ├── Input.tsx
│   │   │   └── Modal.tsx
│   │   └── common/               # Common components
│   ├── database/
│   │   └── models/               # Realm models
│   │       ├── Transaction.ts
│   │       ├── Category.ts
│   │       └── Budget.ts
│   ├── navigation/               # Navigation configuration
│   │   ├── types.ts              # Navigation type definitions
│   │   ├── BottomTabNavigator.tsx
│   │   └── index.ts
│   ├── screens/
│   │   ├── dashboard/            # Dashboard screen
│   │   ├── transactions/         # Transactions screen
│   │   ├── categories/           # Categories screen
│   │   ├── budgets/              # Budgets screen
│   │   └── SettingsScreen.tsx    # Settings screen
│   ├── services/                 # Business logic services
│   ├── store/                    # Zustand stores (state management)
│   ├── types/                    # TypeScript type definitions
│   ├── utils/                    # Utility functions
│   ├── hooks/                    # Custom React hooks
│   └── constants/                # App constants
├── assets/                       # Images, fonts, and other assets
├── .env.example                  # Environment variables template
├── .eslintrc.json                # ESLint configuration
├── .prettierrc.json              # Prettier configuration
├── app.json                      # Expo app configuration
├── tsconfig.json                 # TypeScript configuration
├── package.json                  # Dependencies and scripts
└── README.md                     # This file
```

## 🛠️ Tech Stack

- **Framework**: React Native + Expo
- **Language**: TypeScript
- **State Management**: Zustand
- **Database**: Realm (local storage with offline support)
- **Navigation**: React Navigation
- **Code Quality**: ESLint + Prettier
- **Build Tool**: Expo CLI

## 📦 Installation

### Prerequisites

- Node.js 18+ and npm/yarn
- Expo CLI: `npm install -g expo-cli`
- iOS: Xcode and CocoaPods (for iOS development)
- Android: Android Studio and Android SDK (for Android development)

### Setup Steps

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd keuangan-mobile-app
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Setup environment variables**
   ```bash
   cp .env.example .env
   # Edit .env with your configuration
   ```

4. **Start the development server**
   ```bash
   npm start
   ```

5. **Run on your device**
   - **Android**: Press `a` in the terminal or run `npm run android`
   - **iOS**: Press `i` in the terminal or run `npm run ios`
   - **Web**: Press `w` in the terminal or run `npm run web`

## 📱 Development Commands

```bash
# Start development server
npm start

# Run on Android
npm run android

# Run on iOS
npm run ios

# Run on Web
npm run web

# Lint code
npm run lint

# Fix linting issues
npm run lint:fix

# Format code
npm run format

# Check code formatting
npm run format:check

# Type check TypeScript
npm run type-check

# Reset project
npm run reset-project

# Prebuild native files (required for native modules)
npm run prebuild

# Build for production (Android)
npm run build:android

# Build for production (iOS)
npm run build:ios

# Submit to app stores
npm run submit:android
npm run submit:ios
```

## 🏗️ Architecture

### State Management (Zustand)

The app uses Zustand stores for centralized state management:

- **`transactionStore`**: Manages transaction data and operations
- **`categoryStore`**: Manages category data
- **`budgetStore`**: Manages budget data
- **`appStore`**: Manages global app state (theme, language, currency)

### Database (Realm)

Local data persistence using Realm with the following models:

- **`Transaction`**: Stores financial transactions
- **`Category`**: Stores transaction categories
- **`Budget`**: Stores budget definitions

### Navigation

The app uses React Navigation with:
- Bottom Tab Navigator for main navigation
- Native Stack Navigator for screen stacks
- Proper TypeScript typing for navigation params

### Component Structure

Components are organized by type:
- **UI Components** (`src/components/ui/`): Reusable, low-level components
- **Common Components** (`src/components/common/`): Composite, feature-specific components

## 🎨 Styling

The app uses React Native's built-in `StyleSheet` API with a consistent design system:

- **Primary Color**: `#208AEF` (Blue)
- **Success Color**: `#4caf50` (Green)
- **Error Color**: `#ff6b6b` (Red)
- **Background**: `#f5f5f5` (Light Gray)

## 🔒 Environment Variables

Copy `.env.example` to `.env` and configure:

```env
# Application Settings
APP_NAME=keuangan-mobile-app
ENVIRONMENT=development

# API Configuration
API_BASE_URL=http://localhost:3000
API_TIMEOUT=30000

# Database
REALM_SCHEMA_VERSION=1
DATABASE_NAME=keuangan.realm

# User Preferences
DEFAULT_CURRENCY=IDR
DEFAULT_LANGUAGE=id
DEFAULT_THEME=light

# Features
ENABLE_ANALYTICS=false
ENABLE_NOTIFICATIONS=true
ENABLE_OFFLINE_MODE=true

# Logging
LOG_LEVEL=debug
ENABLE_LOGS=true
```

## 🧪 Testing

Testing setup coming in Phase 2. Recommended tools:
- **Unit Tests**: Jest + React Native Testing Library
- **E2E Tests**: Detox or Maestro
- **Type Safety**: TypeScript strict mode

## 📝 Code Style

The project uses:
- **ESLint**: Code quality and consistency
- **Prettier**: Code formatting
- **TypeScript**: Type safety

Run these commands before committing:

```bash
npm run lint:fix
npm run format
npm run type-check
```

## 🚀 Deployment

### Build for Production

```bash
# Build for Android
npm run build:android

# Build for iOS
npm run build:ios
```

### Submit to App Stores

```bash
# Submit to Google Play
npm run submit:android

# Submit to Apple App Store
npm run submit:ios
```

## 📚 Documentation

- [React Native Documentation](https://reactnative.dev/)
- [Expo Documentation](https://docs.expo.dev/)
- [React Navigation Documentation](https://reactnavigation.org/)
- [Realm Documentation](https://www.mongodb.com/docs/realm/sdk/react-native/)
- [Zustand Documentation](https://github.com/pmndrs/zustand)

## 🤝 Contributing

1. Create a feature branch: `git checkout -b feature/your-feature`
2. Make your changes
3. Run linting and formatting: `npm run lint:fix && npm run format`
4. Commit your changes: `git commit -am 'Add new feature'`
5. Push to the branch: `git push origin feature/your-feature`
6. Create a Pull Request

## 📋 Phase 1 MVP Roadmap

- [x] Project initialization and setup
- [x] Folder structure and configuration
- [x] Core UI components
- [x] Navigation structure
- [x] Realm models
- [x] State management (Zustand)
- [x] Dashboard screen skeleton
- [ ] Complete Transaction management (CRUD)
- [ ] Complete Category management (CRUD)
- [ ] Complete Budget management
- [ ] Data sync and import/export
- [ ] Analytics and reporting
- [ ] Internationalization (i18n)
- [ ] Dark mode support

## 🐛 Known Issues

None at this time. Please report issues on the GitHub Issues page.

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 👤 Author

**Fyudaz Apps**

## 🙏 Acknowledgments

- React Native and Expo communities
- Contributors and maintainers of dependencies

---

**Version**: 1.0.0  
**Last Updated**: 2026-07-23
