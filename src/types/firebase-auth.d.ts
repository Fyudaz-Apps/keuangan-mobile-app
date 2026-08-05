import type { Persistence, ReactNativeAsyncStorage } from '@firebase/auth';

// `getReactNativePersistence` is exported only from the React Native build of
// `@firebase/auth` (resolved by Metro via the `react-native` condition). The
// package's public `types` condition does not include it, so augment it here.
declare module '@firebase/auth' {
  export function getReactNativePersistence(storage: ReactNativeAsyncStorage): Persistence;
}
