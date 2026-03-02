/**
 * LocalStorage utility functions for Aegis Vision (Web)
 * Provides type-safe storage operations with error handling
 *
 * Note: Native uses storage.native.ts with AsyncStorage
 */

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
  TOKEN: "aegis_token",
  PASSWORD_RESET: "aegis_password_reset",
  // CURRENT_USER: "aegis_current_user",
  ROLES: "aegis_roles",
  REFRESH_TOKEN: "aegis_refresh_token",
  USER: "aegis_user",
  INCIDENT:"aegis_incident",
  ALERT: "aegis_alert",
} as const;

/**
 * Get item from localStorage with type safety
 */
export function getItem<T>(key: string): T | null {
  if (typeof window === "undefined") return null;

  try {
    const item = window.localStorage.getItem(key);
    return item ? JSON.parse(item) : null;
  } catch (error) {
    console.error(`Error reading from localStorage key "${key}":`, error);
    return null;
  }
}

/**
 * Get item asynchronously (for API compatibility with native)
 */
export async function getItemAsync<T>(key: string): Promise<T | null> {
  return getItem<T>(key);
}

/**
 * Set item in localStorage
 */
export function setItem<T>(key: string, value: T): boolean {
  if (typeof window === "undefined") return false;

  try {
    window.localStorage.setItem(key, JSON.stringify(value));
    return true;
  } catch (error) {
    console.error(`Error writing to localStorage key "${key}":`, error);
    return false;
  }
}

/**
 * Set item asynchronously (for API compatibility with native)
 */
export async function setItemAsync<T>(key: string, value: T): Promise<boolean> {
  return setItem<T>(key, value);
}

/**
 * Remove item from localStorage
 */
export function removeItem(key: string): boolean {
  if (typeof window === "undefined") return false;

  try {
    window.localStorage.removeItem(key);
    return true;
  } catch (error) {
    console.error(`Error removing localStorage key "${key}":`, error);
    return false;
  }
}

/**
 * Remove item asynchronously (for API compatibility with native)
 */
export async function removeItemAsync(key: string): Promise<boolean> {
  return removeItem(key);
}

/**
 * Clear all localStorage (use with caution)
 */
export function clearAll(): boolean {
  if (typeof window === "undefined") return false;

  try {
    window.localStorage.clear();
    return true;
  } catch (error) {
    console.error("Error clearing localStorage:", error);
    return false;
  }
}

/**
 * Clear all asynchronously (for API compatibility with native)
 */
export async function clearAllAsync(): Promise<boolean> {
  return clearAll();
}

/**
 * Check if a key exists in localStorage
 */
export function hasItem(key: string): boolean {
  if (typeof window === "undefined") return false;
  return window.localStorage.getItem(key) !== null;
}

/**
 * Check if a key exists asynchronously (for API compatibility with native)
 */
export async function hasItemAsync(key: string): Promise<boolean> {
  return hasItem(key);
}






