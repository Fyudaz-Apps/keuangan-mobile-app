import { useEffect, useState } from 'react';

/**
 * Custom hook for managing state with local storage
 */
export function useLocalStorage<T>(
  key: string,
  initialValue: T
): [T, (value: T | ((val: T) => T)) => void] {
  const [storedValue, setStoredValue] = useState<T>(initialValue);

  const setValue = (value: T | ((val: T) => T)) => {
    try {
      const valueToStore = value instanceof Function ? value(storedValue) : value;
      setStoredValue(valueToStore);
      // Note: AsyncStorage would be used in a real React Native app
    } catch (error) {
      console.error('Error setting local storage:', error);
    }
  };

  return [storedValue, setValue];
}

/**
 * Custom hook for debounced values
 */
export function useDebouncedValue<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => clearTimeout(handler);
  }, [value, delay]);

  return debouncedValue;
}

/**
 * Custom hook for managing async data
 */
interface UseAsyncState<T> {
  data: T | null;
  loading: boolean;
  error: Error | null;
}

export function useAsync<T>(
  asyncFunction: () => Promise<T>,
  immediate: boolean = true
): UseAsyncState<T> {
  const [state, setState] = useState<UseAsyncState<T>>({
    data: null,
    loading: immediate,
    error: null,
  });

  useEffect(() => {
    if (!immediate) return;

    let mounted = true;

    asyncFunction()
      .then((response) => {
        if (mounted) {
          setState({ data: response, loading: false, error: null });
        }
      })
      .catch((error) => {
        if (mounted) {
          setState({ data: null, loading: false, error });
        }
      });

    return () => {
      mounted = false;
    };
  }, [asyncFunction, immediate]);

  return state;
}
