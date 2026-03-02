/**
 * Roles API utilities
 * Fetches and manages user roles from the API
 */
import API from "../axiosbase";
import { handleApiError } from "./helper";
import { API_ENDPOINTS, ERROR_MESSAGES, LOG_PREFIX } from "app/constants";
import { getItem, setItem, STORAGE_KEYS } from "./storage";

// Role type definition
export type Role = {
  id: string;
  name: string;
  value: string;
  displayName?: string;
};

/**
 * Fetch all roles from API
 */
export const fetchRoles = async (): Promise<Role[]> => {
  try {
    const role = getItem<Role[]>(STORAGE_KEYS.ROLES);
    if (role && role.length > 0) {
      return role;
    }
    const response = await API.get(API_ENDPOINTS.ROLE.FETCH);
    
    // Handle response structure - extract roles array from response
    const roles = response.roles || response.role || response;
    
    // Transform API response to match our Role type
    const transformedRoles = roles.map((role: any) => ({
      id: role.RoleId?.toString() || role.id?.toString(),
      name: role.RoleName || role.name,
      value: role.RoleValue || role.value || role.name,
      displayName: role.DisplayName || role.displayName || role.name,
    }));
    
    // Store in local storage
    await setItem(STORAGE_KEYS.ROLES, transformedRoles);
    
    return transformedRoles;
  } catch (error: any) {
    console.error(`${LOG_PREFIX.ROLE} Error fetching roles:`, error);
    const errorMessage = handleApiError(error, ERROR_MESSAGES.ROLE.FETCH_FAILED);
    throw new Error(errorMessage);
  }
};

/**
 * Get roles from local storage
 */
export const getRoles = (): Role[] => {
  const roles = getItem<Role[]>(STORAGE_KEYS.ROLES);
  return roles || [];
};

/**
 * Get role by value
 */
export const getRoleByValue = (value: string): Role | null => {
  const roles = getRoles();
  return roles.find(role => role.value === value) || null;
};

/**
 * Get role by ID
 */
export const getRoleById = (id: string): Role | null => {
  const roles = getRoles();
  return roles.find(role => role.id === id) || null;
};

/**
 * Check if roles are cached in local storage
 */
export const hasRolesCached = (): boolean => {
  const roles = getRoles();
  return roles.length > 0;
};
