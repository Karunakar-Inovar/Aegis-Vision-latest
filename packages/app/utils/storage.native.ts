/**
 * AsyncStorage utility functions for React Native
 * Provides type-safe storage operations with error handling
 */

import AsyncStorage from "@react-native-async-storage/async-storage";

export const STORAGE_KEYS = {
  AUTH: "aegis_auth",
  ORGANIZATION: "aegis_organization",
  CAMERAS: "aegis_cameras",
  PIPELINES: "aegis_pipelines",
  MODELS: "aegis_models",
  INCIDENTS: "aegis_incidents",
  USERS: "aegis_users",
  SHIFT: "aegis_shift",
  NOTIFICATIONS: "aegis_notifications",
  SETUP_PROGRESS: "aegis_setup_progress",
} as const;

/**
 * Get item from AsyncStorage with type safety
 * Note: This is async on native
 */
export function getItem<T>(key: string): T | null {
  // Return null synchronously - use getItemAsync for async operations
  // This maintains compatibility with web version signature
  return null;
}

/**
 * Get item from AsyncStorage asynchronously
 */
export async function getItemAsync<T>(key: string): Promise<T | null> {
  try {
    const item = await AsyncStorage.getItem(key);
    return item ? JSON.parse(item) : null;
  } catch (error) {
    console.error(`Error reading from AsyncStorage key "${key}":`, error);
    return null;
  }
}

/**
 * Set item in AsyncStorage
 * Note: This is async on native
 */
export function setItem<T>(key: string, value: T): boolean {
  // Fire and forget for sync compatibility
  setItemAsync(key, value).catch(console.error);
  return true;
}

/**
 * Set item in AsyncStorage asynchronously
 */
export async function setItemAsync<T>(key: string, value: T): Promise<boolean> {
  try {
    await AsyncStorage.setItem(key, JSON.stringify(value));
    return true;
  } catch (error) {
    console.error(`Error writing to AsyncStorage key "${key}":`, error);
    return false;
  }
}

/**
 * Remove item from AsyncStorage
 */
export function removeItem(key: string): boolean {
  // Fire and forget for sync compatibility
  removeItemAsync(key).catch(console.error);
  return true;
}

/**
 * Remove item from AsyncStorage asynchronously
 */
export async function removeItemAsync(key: string): Promise<boolean> {
  try {
    await AsyncStorage.removeItem(key);
    return true;
  } catch (error) {
    console.error(`Error removing AsyncStorage key "${key}":`, error);
    return false;
  }
}

/**
 * Clear all AsyncStorage (use with caution)
 */
export function clearAll(): boolean {
  clearAllAsync().catch(console.error);
  return true;
}

/**
 * Clear all AsyncStorage asynchronously
 */
export async function clearAllAsync(): Promise<boolean> {
  try {
    await AsyncStorage.clear();
    return true;
  } catch (error) {
    console.error("Error clearing AsyncStorage:", error);
    return false;
  }
}

/**
 * Check if a key exists in AsyncStorage
 */
export function hasItem(key: string): boolean {
  // This is async on native, return false for sync compatibility
  return false;
}

/**
 * Check if a key exists in AsyncStorage asynchronously
 */
export async function hasItemAsync(key: string): Promise<boolean> {
  try {
    const item = await AsyncStorage.getItem(key);
    return item !== null;
  } catch (error) {
    return false;
  }
}







