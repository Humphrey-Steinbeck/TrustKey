// TrustKey Storage Utilities

import { STORAGE_KEYS } from './constants';

/**
 * Storage interface for different storage types
 */
interface StorageInterface {
  getItem(key: string): string | null;
  setItem(key: string, value: string): void;
  removeItem(key: string): void;
  clear(): void;
}

/**
 * Local storage implementation
 */
class LocalStorage implements StorageInterface {
  getItem(key: string): string | null {
    try {
      return localStorage.getItem(key);
    } catch (error) {
      console.error('Error getting item from localStorage:', error);
      return null;
    }
  }

  setItem(key: string, value: string): void {
    try {
      localStorage.setItem(key, value);
    } catch (error) {
      console.error('Error setting item in localStorage:', error);
    }
  }

  removeItem(key: string): void {
    try {
      localStorage.removeItem(key);
    } catch (error) {
      console.error('Error removing item from localStorage:', error);
    }
  }

  clear(): void {
    try {
      localStorage.clear();
    } catch (error) {
      console.error('Error clearing localStorage:', error);
    }
  }
}

/**
 * Session storage implementation
 */
class SessionStorage implements StorageInterface {
  getItem(key: string): string | null {
    try {
      return sessionStorage.getItem(key);
    } catch (error) {
      console.error('Error getting item from sessionStorage:', error);
      return null;
    }
  }

  setItem(key: string, value: string): void {
    try {
      sessionStorage.setItem(key, value);
    } catch (error) {
      console.error('Error setting item in sessionStorage:', error);
    }
  }

  removeItem(key: string): void {
    try {
      sessionStorage.removeItem(key);
    } catch (error) {
      console.error('Error removing item from sessionStorage:', error);
    }
  }

  clear(): void {
    try {
      sessionStorage.clear();
    } catch (error) {
      console.error('Error clearing sessionStorage:', error);
    }
  }
}

/**
 * Memory storage implementation (fallback)
 */
class MemoryStorage implements StorageInterface {
  private storage: Map<string, string> = new Map();

  getItem(key: string): string | null {
    return this.storage.get(key) || null;
  }

  setItem(key: string, value: string): void {
    this.storage.set(key, value);
  }

  removeItem(key: string): void {
    this.storage.delete(key);
  }

  clear(): void {
    this.storage.clear();
  }
}

/**
 * Storage manager class
 */
export class StorageManager {
  private storage: StorageInterface;

  constructor(storageType: 'local' | 'session' | 'memory' = 'local') {
    switch (storageType) {
      case 'local':
        this.storage = new LocalStorage();
        break;
      case 'session':
        this.storage = new SessionStorage();
        break;
      case 'memory':
        this.storage = new MemoryStorage();
        break;
      default:
        this.storage = new LocalStorage();
    }
  }

  /**
   * Get item from storage
   */
  getItem<T = any>(key: string): T | null {
    try {
      const item = this.storage.getItem(key);
      if (item === null) return null;
      return JSON.parse(item);
    } catch (error) {
      console.error('Error parsing stored item:', error);
      return null;
    }
  }

  /**
   * Set item in storage
   */
  setItem<T = any>(key: string, value: T): void {
    try {
      const serialized = JSON.stringify(value);
      this.storage.setItem(key, serialized);
    } catch (error) {
      console.error('Error serializing item for storage:', error);
    }
  }

  /**
   * Remove item from storage
   */
  removeItem(key: string): void {
    this.storage.removeItem(key);
  }

  /**
   * Clear all items from storage
   */
  clear(): void {
    this.storage.clear();
  }

  /**
   * Check if item exists in storage
   */
  hasItem(key: string): boolean {
    return this.getItem(key) !== null;
  }

  /**
   * Get all keys from storage
   */
  getAllKeys(): string[] {
    // This is a simplified implementation
    // In a real application, you might need to track keys separately
    return Object.keys(STORAGE_KEYS);
  }

  /**
   * Get storage size (approximate)
   */
  getSize(): number {
    let size = 0;
    try {
      for (const key in STORAGE_KEYS) {
        const item = this.storage.getItem(STORAGE_KEYS[key as keyof typeof STORAGE_KEYS]);
        if (item) {
          size += item.length;
        }
      }
    } catch (error) {
      console.error('Error calculating storage size:', error);
    }
    return size;
  }
}

/**
 * Default storage manager instance
 */
export const storage = new StorageManager('local');

/**
 * Session storage manager instance
 */
export const sessionStorage = new StorageManager('session');

/**
 * Memory storage manager instance
 */
export const memoryStorage = new StorageManager('memory');

/**
 * Token management utilities
 */
export class TokenManager {
  private storage: StorageManager;

  constructor(storage: StorageManager = storage) {
    this.storage = storage;
  }

  /**
   * Set access token
   */
  setAccessToken(token: string): void {
    this.storage.setItem(STORAGE_KEYS.ACCESS_TOKEN, token);
  }

  /**
   * Get access token
   */
  getAccessToken(): string | null {
    return this.storage.getItem<string>(STORAGE_KEYS.ACCESS_TOKEN);
  }

  /**
   * Remove access token
   */
  removeAccessToken(): void {
    this.storage.removeItem(STORAGE_KEYS.ACCESS_TOKEN);
  }

  /**
   * Set refresh token
   */
  setRefreshToken(token: string): void {
    this.storage.setItem(STORAGE_KEYS.REFRESH_TOKEN, token);
  }

  /**
   * Get refresh token
   */
  getRefreshToken(): string | null {
    return this.storage.getItem<string>(STORAGE_KEYS.REFRESH_TOKEN);
  }

  /**
   * Remove refresh token
   */
  removeRefreshToken(): void {
    this.storage.removeItem(STORAGE_KEYS.REFRESH_TOKEN);
  }

  /**
   * Clear all tokens
   */
  clearTokens(): void {
    this.removeAccessToken();
    this.removeRefreshToken();
  }

  /**
   * Check if user is authenticated
   */
  isAuthenticated(): boolean {
    return this.getAccessToken() !== null;
  }
}

/**
 * User preferences management
 */
export class UserPreferencesManager {
  private storage: StorageManager;

  constructor(storage: StorageManager = storage) {
    this.storage = storage;
  }

  /**
   * Set user preference
   */
  setPreference<T = any>(key: string, value: T): void {
    const preferences = this.getPreferences();
    preferences[key] = value;
    this.storage.setItem(STORAGE_KEYS.USER_PREFERENCES, preferences);
  }

  /**
   * Get user preference
   */
  getPreference<T = any>(key: string, defaultValue?: T): T | null {
    const preferences = this.getPreferences();
    return preferences[key] !== undefined ? preferences[key] : defaultValue || null;
  }

  /**
   * Get all user preferences
   */
  getPreferences(): Record<string, any> {
    return this.storage.getItem<Record<string, any>>(STORAGE_KEYS.USER_PREFERENCES) || {};
  }

  /**
   * Remove user preference
   */
  removePreference(key: string): void {
    const preferences = this.getPreferences();
    delete preferences[key];
    this.storage.setItem(STORAGE_KEYS.USER_PREFERENCES, preferences);
  }

  /**
   * Clear all user preferences
   */
  clearPreferences(): void {
    this.storage.removeItem(STORAGE_KEYS.USER_PREFERENCES);
  }

  /**
   * Set theme preference
   */
  setTheme(theme: 'light' | 'dark' | 'auto'): void {
    this.setPreference(STORAGE_KEYS.THEME, theme);
  }

  /**
   * Get theme preference
   */
  getTheme(): 'light' | 'dark' | 'auto' {
    return this.getPreference(STORAGE_KEYS.THEME, 'auto');
  }

  /**
   * Set language preference
   */
  setLanguage(language: string): void {
    this.setPreference(STORAGE_KEYS.LANGUAGE, language);
  }

  /**
   * Get language preference
   */
  getLanguage(): string {
    return this.getPreference(STORAGE_KEYS.LANGUAGE, 'en');
  }
}

/**
 * Wallet connection management
 */
export class WalletConnectionManager {
  private storage: StorageManager;

  constructor(storage: StorageManager = storage) {
    this.storage = storage;
  }

  /**
   * Save wallet connection
   */
  saveConnection(connection: {
    address: string;
    chainId: number;
    provider: string;
    timestamp: number;
  }): void {
    this.storage.setItem(STORAGE_KEYS.WALLET_CONNECTION, connection);
  }

  /**
   * Get wallet connection
   */
  getConnection(): {
    address: string;
    chainId: number;
    provider: string;
    timestamp: number;
  } | null {
    return this.storage.getItem(STORAGE_KEYS.WALLET_CONNECTION);
  }

  /**
   * Remove wallet connection
   */
  removeConnection(): void {
    this.storage.removeItem(STORAGE_KEYS.WALLET_CONNECTION);
  }

  /**
   * Check if wallet is connected
   */
  isConnected(): boolean {
    const connection = this.getConnection();
    return connection !== null && connection.address !== '';
  }

  /**
   * Get connected address
   */
  getConnectedAddress(): string | null {
    const connection = this.getConnection();
    return connection?.address || null;
  }

  /**
   * Get connected chain ID
   */
  getConnectedChainId(): number | null {
    const connection = this.getConnection();
    return connection?.chainId || null;
  }
}

/**
 * Default instances
 */
export const tokenManager = new TokenManager();
export const userPreferencesManager = new UserPreferencesManager();
export const walletConnectionManager = new WalletConnectionManager();

/**
 * Clear all application data
 */
export const clearAllData = (): void => {
  storage.clear();
  sessionStorage.clear();
  memoryStorage.clear();
};

/**
 * Export all storage keys for external use
 */
export { STORAGE_KEYS };
