/**
 * Authentication utility functions for Aegis Vision
 * Simulates authentication using LocalStorage for prototype
 */

import API from "app/axiosbase";
import { getItem, setItem, removeItem, STORAGE_KEYS } from "./storage";
import { handleApiError } from "./helper";
import { API_ENDPOINTS, ERROR_MESSAGES, SUCCESS_MESSAGES, LOG_PREFIX, USER_ROLES, ROUTES, ROLE_DISPLAY_NAMES, DEMO_DATA, UserRole } from "app/constants";
import socketService from "./socket";
import config from "app/config";


export interface AuthUser {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  isFirstLogin: boolean;
  loginTime: string;
  accountSetupComplete: boolean;
  phoneNumber: string;
}

/**
 * Normalize role values for consistent comparisons
 * Accepts any casing and trims whitespace.
 */
export function normalizeUserRole(role?: string | null): string {
  return typeof role === "string" ? role.trim().toLowerCase() : "";
}

/**
 * Login user with email, password and role
 * Returns user object on success or null on failure
 */
export async function login(
  email: string,
  password: string,
  role: UserRole
): Promise<{ user: AuthUser | null; error?: string }> {
  // Validate input
  if (!email || !password) {
    return { user: null, error: ERROR_MESSAGES.AUTH.INVALID_CREDENTIALS };
  }

  try {
    const response = await API.post(API_ENDPOINTS.AUTH.LOGIN, { email, password, role });

    // Validate response structure
    if (!response?.user || !response?.token) {
      return { user: null, error: ERROR_MESSAGES.AUTH.INVALID_RESPONSE };
    }

    const user: AuthUser = response.user;

    // user.role ="Administrator"

    if (user?.accountSetupComplete) {
      await setItem(STORAGE_KEYS.PASSWORD_RESET, "true");
    }

    // Store token and user data with await
    await setItem(STORAGE_KEYS.TOKEN, response.token);
    await setItem(STORAGE_KEYS.AUTH, user);
    await setItem(STORAGE_KEYS.REFRESH_TOKEN, response.refreshToken);

    try {
      const socketUrl = config.wsUrl;
      socketService.connect(response.token, socketUrl);
      console.log(`${LOG_PREFIX.AUTH} Socket.IO connected for user:`, user.id);
    } catch (socketError) {
      console.error(`${LOG_PREFIX.AUTH} Socket connection failed:`, socketError);
    }

    return { user, error: undefined };
  } catch (error: any) {
    console.error(`${LOG_PREFIX.AUTH} Login error:`, error);

    // Extract error message from different possible error structures    
    const errorMessage = handleApiError(error, ERROR_MESSAGES.AUTH.LOGIN_FAILED);

    return { user: null, error: errorMessage };
  }
}

/**
 * Logout current user
 * Returns success status and optional message
 */
export async function logout(): Promise<{ success: boolean; message?: string }> {
  try {
    const user = getCurrentUser();

    try {
      socketService.disconnect();
      console.log(`${LOG_PREFIX.AUTH} Socket.IO disconnected for user:`, user?.id);
    } catch (socketError) {
      console.error(`${LOG_PREFIX.AUTH} Socket disconnect error:`, socketError);
    }

    // Call logout API
    await API.delete(API_ENDPOINTS.AUTH.LOGOUT, {});

    // Clear local storage regardless of API response
    removeItem(STORAGE_KEYS.AUTH);
    removeItem(STORAGE_KEYS.TOKEN);
    removeItem(STORAGE_KEYS.PASSWORD_RESET);

    // Optionally clear shift data for monitor users
    if (user?.role === USER_ROLES.MONITOR) {
      removeItem(STORAGE_KEYS.SHIFT);
    }
    localStorage.clear();

    return { success: true, message: SUCCESS_MESSAGES.AUTH.LOGOUT };
  } catch (error: any) {
    console.error(`${LOG_PREFIX.AUTH} Logout error:`, error);

    try {
      socketService.disconnect();
    } catch (socketError) {
      console.error(`${LOG_PREFIX.AUTH} Socket disconnect error during cleanup:`, socketError);
    }

    // Clear local storage even if API call fails
    removeItem(STORAGE_KEYS.AUTH);
    removeItem(STORAGE_KEYS.TOKEN);
    removeItem(STORAGE_KEYS.PASSWORD_RESET);

    const user = getCurrentUser();
    if (user?.role === USER_ROLES.MONITOR) {
      removeItem(STORAGE_KEYS.SHIFT);
    }
    return { success: true, message: SUCCESS_MESSAGES.AUTH.LOGOUT };
  }
}

/**
 * Reconnect socket with existing token
 * Useful for app initialization or token refresh
 */
export function reconnectSocket(): void {
  const token = getItem<string>(STORAGE_KEYS.TOKEN);
  const user = getCurrentUser();

  if (token && user && !socketService.isConnected()) {
    try {
      const socketUrl = config.wsUrl;
      socketService.connect(token, socketUrl);
      console.log(`${LOG_PREFIX.AUTH} Socket.IO reconnected for user:`, user.id);
    } catch (error) {
      console.error(`${LOG_PREFIX.AUTH} Socket reconnection failed:`, error);
    }
  }
}

/**
 * Check socket connection status
 */
export function isSocketConnected(): boolean {
  return socketService.isConnected();
}

/**
 * Get currently logged in user
 */
export function getCurrentUser(): AuthUser | null {
  return getItem<AuthUser>(STORAGE_KEYS.AUTH);
}

/**
 * Get user role
 */
export function getRole(): UserRole | null {
  const user = getCurrentUser();
  return user?.role || null;
}

/**
 * Check if user is authenticated
 */
export function isAuthenticated(): boolean {
  return getCurrentUser() !== null;
}

/**
 * Check if this is first time setup (for admin users)
 */
export function isFirstTimeSetup(): boolean {
  const user = getCurrentUser();
  if (user?.role !== USER_ROLES.ADMINISTRATOR) return false;

  const org = getItem(STORAGE_KEYS.ORGANIZATION) as { setupCompleted?: boolean } | null;
  return !org || !org.setupCompleted;
}

/**
 * Mark setup as completed
 */
export function completeSetup(): void {
  const org = getItem(STORAGE_KEYS.ORGANIZATION) || {};
  setItem(STORAGE_KEYS.ORGANIZATION, {
    ...org,
    setupCompleted: true,
  });

  // Update user's first login flag
  const user = getCurrentUser();
  if (user) {
    setItem(STORAGE_KEYS.AUTH, {
      ...user,
      isFirstLogin: false,
    });
  }
}

/**
 * Reset password for user
 * Returns success status and optional error message
 */
export async function resetPassword(
  userId: string,
  password: string
): Promise<{ success: boolean; message?: string }> {
  try {
    const response = await API.put(API_ENDPOINTS.AUTH.RESET_PASSWORD, {
      userId,
      password
    });

    // Check if response indicates success
    if (response?.success) {
      // Mark password reset as completed
      await setItem(STORAGE_KEYS.PASSWORD_RESET, "true");
          // Store token and user data with await
      await setItem(STORAGE_KEYS.TOKEN, response.data.token);
      await setItem(STORAGE_KEYS.AUTH, response.data.user);
      await setItem(STORAGE_KEYS.REFRESH_TOKEN, response.data.refreshToken);

      return { success: true };
    } else {
      return {
        success: false,
        message: response?.message || ERROR_MESSAGES.AUTH.RESET_PASSWORD_FAILED
      };
    }
  } catch (error: any) {
    // Extract error message from different possible error structures    
    const errorMessage = handleApiError(error, ERROR_MESSAGES.AUTH.RESET_PASSWORD_ERROR);
    return { success: false, message: errorMessage };
  }
}

/**
 * Check if user needs to reset password
 */
export function needsPasswordReset(): boolean {
  const passwordReset = getItem<string>("passwordReset");
  return passwordReset !== "true";
}

/**
 * Get redirect path based on role
 */
export function getRedirectPath(user: AuthUser): string {
  const role = normalizeUserRole(user?.role);
  const adminRole = normalizeUserRole(USER_ROLES.ADMINISTRATOR);
  const monitorRole = normalizeUserRole(USER_ROLES.MONITOR);
  const stakeholderRole = normalizeUserRole(USER_ROLES.STAKEHOLDER);

  switch (role) {
    case adminRole:
      if (user.accountSetupComplete === false) {
        return ROUTES.ADMIN.RESET_PASSWORD;
      }
      return ROUTES.ADMIN.DASHBOARD;
    case monitorRole:
      if (user.accountSetupComplete === false) {
        return ROUTES.MONITOR.RESET_PASSWORD;
      }
      return ROUTES.MONITOR.DASHBOARD; // Shift handover page
    case stakeholderRole:
      return ROUTES.STAKEHOLDER.REPORTS;
    default:
      return ROUTES.ROOT;
  }
}

/**
 * Helper: Check if setup has been completed
 */
function hasCompletedSetup(): boolean {
  const org = getItem(STORAGE_KEYS.ORGANIZATION) as { setupCompleted?: boolean } | null;
  return org?.setupCompleted === true;
}

/**
 * Helper: Generate a simple user ID
 */
function generateUserId(): string {
  return `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

/**
 * Helper: Get display name for role
 */
function getRoleDisplayName(role: UserRole): string {
  return ROLE_DISPLAY_NAMES[role] || "User";
}

/**
 * Initialize demo data (for prototype testing)
 */
export function initializeDemoData(): void {
  // Only initialize if no data exists
  if (getItem(STORAGE_KEYS.ORGANIZATION)) return;

  // Set up basic organization
  setItem(STORAGE_KEYS.ORGANIZATION, DEMO_DATA.ORGANIZATION);

  // Initialize empty arrays
  setItem(STORAGE_KEYS.CAMERAS, []);
  setItem(STORAGE_KEYS.PIPELINES, []);
  setItem(STORAGE_KEYS.MODELS, DEMO_DATA.MODELS);
  setItem(STORAGE_KEYS.INCIDENTS, []);
  setItem(STORAGE_KEYS.USERS, []);
  setItem(STORAGE_KEYS.NOTIFICATIONS, DEMO_DATA.NOTIFICATIONS);
}

