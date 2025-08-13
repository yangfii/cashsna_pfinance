import { useState, useEffect } from 'react';

export function useLocalStorage<T>(key: string, initialValue: T) {
  // Get value from localStorage or use initialValue
  const [storedValue, setStoredValue] = useState<T>(() => {
    try {
      const item = window.localStorage.getItem(key);
      return item ? JSON.parse(item) : initialValue;
    } catch (error) {
      console.error(`Error reading localStorage key "${key}":`, error);
      return initialValue;
    }
  });

  // Return a wrapped version of useState's setter function that persists the new value to localStorage
  const setValue = (value: T | ((val: T) => T)) => {
    try {
      // Allow value to be a function so we have the same API as useState
      const valueToStore = value instanceof Function ? value(storedValue) : value;
      setStoredValue(valueToStore);
      window.localStorage.setItem(key, JSON.stringify(valueToStore));
    } catch (error) {
      console.error(`Error setting localStorage key "${key}":`, error);
    }
  };

  // Remove from localStorage
  const removeValue = () => {
    try {
      window.localStorage.removeItem(key);
      setStoredValue(initialValue);
    } catch (error) {
      console.error(`Error removing localStorage key "${key}":`, error);
    }
  };

  return [storedValue, setValue, removeValue] as const;
}

// Helper functions for data management
export const localStorageManager = {
  // Clear all app data from localStorage
  clearAllData: () => {
    const keys = Object.keys(localStorage);
    keys.forEach(key => {
      if (key.startsWith('cashsnap_')) {
        localStorage.removeItem(key);
      }
    });
  },

  // Get all cached data
  getAllCachedData: () => {
    const data: Record<string, any> = {};
    const keys = Object.keys(localStorage);
    keys.forEach(key => {
      if (key.startsWith('cashsnap_')) {
        try {
          data[key] = JSON.parse(localStorage.getItem(key) || '');
        } catch (error) {
          console.error(`Error parsing localStorage key "${key}":`, error);
        }
      }
    });
    return data;
  },

  // Check if data is cached
  isCached: (key: string) => {
    return localStorage.getItem(`cashsnap_${key}`) !== null;
  },

  // Get cache timestamp
  getCacheTimestamp: (key: string) => {
    const timestamp = localStorage.getItem(`cashsnap_${key}_timestamp`);
    return timestamp ? parseInt(timestamp) : null;
  },

  // Set cache timestamp
  setCacheTimestamp: (key: string) => {
    localStorage.setItem(`cashsnap_${key}_timestamp`, Date.now().toString());
  },

  // Check if cache is expired (default 1 hour)
  isCacheExpired: (key: string, maxAge: number = 60 * 60 * 1000) => {
    const timestamp = localStorageManager.getCacheTimestamp(key);
    if (!timestamp) return true;
    return Date.now() - timestamp > maxAge;
  }
};