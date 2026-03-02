/**
 * User API utilities
 * Uses the Axios API client from app/axiosbase for consistency with auth patterns
 */
import API from "../axiosbase";
import { handleApiError } from "./helper";
import { API_ENDPOINTS, ERROR_MESSAGES, LOG_PREFIX, HTTP_HEADERS } from "app/constants";

// User type definition
export  type User = {
  userid: number;
  name: string;
  email: string;
  rolename: string;
  status: string;
  lastActiveAt: string;
  createdAt: string;
  avatar: string;
};

export type CreateUserDto = {
  name: string;
  email: string;
  roleId: number;
  password?: string;
};

export type UpdateUserDto = Partial<CreateUserDto> & {
  status?: string;
};

// API Response types
export type ApiResponse<T> = {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
};

/**
 * Fetch all users
 */
export const fetchUsers = async (): Promise<User[]> => {
  try {
    const response = await API.get(API_ENDPOINTS.USER.FETCH);
    return response;
  } catch (error: any) {
    console.error(`${LOG_PREFIX.USER} Error fetching users:`, error);
    const errorMessage = handleApiError(error, ERROR_MESSAGES.USER.FETCH_FAILED);
    throw new Error(errorMessage);
  }
};

/**
 * Fetch a single user by ID
 */
export const fetchUserById = async (userId: number): Promise<User> => {
  try {
    const response = await API.get(`/v1/user/${userId}`);
    return response;
  } catch (error: any) {
    console.error(`${LOG_PREFIX.USER} Error fetching user ${userId}:`, error);
    const errorMessage = handleApiError(error, ERROR_MESSAGES.USER.FETCH_USER_FAILED);
    throw new Error(errorMessage);
  }
};

/**
 * Create a new user
 */
export const createUser = async (userData: CreateUserDto): Promise<User> => {
  try {
    const response = await API.post(API_ENDPOINTS.AUTH.CREATE, userData);
    return response;
  } catch (error: any) {
    console.error(`${LOG_PREFIX.USER} Error creating user:`, error);
    const errorMessage = handleApiError(error, ERROR_MESSAGES.USER.CREATE_FAILED);
    throw new Error(errorMessage);
  }
};

/**
 * Update an existing user
 */
export const updateUser = async (userId: number, userData: UpdateUserDto): Promise<User> => {
  try {
    const response = await API.put(`${API_ENDPOINTS.AUTH.UPDATE}`, {  userId, ...userData });
    return response;
  } catch (error: any) {
    console.error(`${LOG_PREFIX.USER} ${userId}:`, error);
    const errorMessage = handleApiError(error, ERROR_MESSAGES.USER.UPDATE_FAILED);
    throw new Error(errorMessage);
  }
};

/**
 * Delete a user
 */
export const deleteUser = async (userId: number): Promise<void> => {
  try {
    await API.delete(`${API_ENDPOINTS.AUTH.REMOVE_USER}/${userId}`);
  } catch (error: any) {
    console.error(`${LOG_PREFIX.USER} ${userId}:`, error);
    const errorMessage = handleApiError(error, ERROR_MESSAGES.USER.DELETE_FAILED);
    throw new Error(errorMessage);
  }
};

/**
 * Toggle user status (active/inactive)
 */
export const toggleUserStatus = async (userId: number, currentStatus: string): Promise<User> => {
  const newStatus = currentStatus === 'active' ? 'inactive' : 'active';
  return updateUser(userId, { status: newStatus });
};

/**
 * Invite a user (send invitation email)
 */
export const inviteUser = async (email: string, role: string): Promise<void> => {
  try {
    await API.post(API_ENDPOINTS.USER.INVITE, { email, role });
  } catch (error: any) {
    console.error(`${LOG_PREFIX.USER}:`, error);
    const errorMessage = handleApiError(error, ERROR_MESSAGES.USER.INVITE_FAILED);
    throw new Error(errorMessage);
  }
};

/**
 * Bulk upload users from CSV
 */
export const bulkUploadUsers = async (file: File): Promise<{ success: number; failed: number; errors?: string[] }> => {
  try {
    const formData = new FormData();
    formData.append('file', file);

    // For file uploads, we need to use axios directly with custom config
    const response = await API.post(API_ENDPOINTS.USER.BULK_UPLOAD, formData, {
      headers: HTTP_HEADERS.MULTIPART_FORM_DATA,
    });
    return response;
  } catch (error: any) {
    console.error(`${LOG_PREFIX.USER}:`, error);
    const errorMessage = handleApiError(error, ERROR_MESSAGES.USER.BULK_UPLOAD_FAILED);
    throw new Error(errorMessage);
  }
};

/**
 * Search users by query
 */
export const searchUsers = async (query: string): Promise<User[]> => {
  try {
    const response = await API.get(API_ENDPOINTS.USER.SEARCH, {
      params: { q: query },
    });
    return response;
  } catch (error: any) {
    console.error(`${LOG_PREFIX.USER} Error searching users:`, error);
    const errorMessage = handleApiError(error, ERROR_MESSAGES.USER.SEARCH_FAILED);
    throw new Error(errorMessage);
  }
};

/**
 * Get user statistics
 */
export const getUserStats = async (): Promise<{
  total: number;
  active: number;
  inactive: number;
  pending: number;
  admins: number;
  monitors: number;
  viewers: number;
}> => {
  try {
    const response = await API.get(API_ENDPOINTS.USER.STATS);
    return response;
  } catch (error: any) {
    console.error(`${LOG_PREFIX.USER} Error fetching user stats:`, error);
    const errorMessage = handleApiError(error, ERROR_MESSAGES.USER.STATS_FAILED);
    throw new Error(errorMessage);
  }
};
