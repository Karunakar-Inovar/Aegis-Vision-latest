/**
 * Notification API utilities
 * Uses the Axios API client from app/axiosbase for consistency with auth patterns
 */
import API from "../axiosbase";
import { handleApiError } from "./helper";
import { API_ENDPOINTS, ERROR_MESSAGES, LOG_PREFIX } from "app/constants";

// Notification Detail type definition (matches API response)
export type NotificationDetail = {
  NotificationId: number;
  NotificationName: string;
  NotificationChannelId: number;
  NotificationChannelName: string;
  AlertSeverityId: number;
  SeverityLevelName: string;
  IsActive: boolean;
  IsGlobal: boolean;
  CreatedOn: string;
  Recipients: RecipientDetail[];
  InputSources: InputSourceDetail[];
};

export type RecipientDetail = {
  NotificationRecipientId?: number;
  NotificationChannelId?: number;
  NotificationChannelName?: string;
  Address?: string;
  Template?: string;
  address?: string;  // Support both cases
  template?: string;
  notificationChannelId?: number;
};

export type InputSourceDetail = {
  InputSourceId?: number;
  InputSourceName?: string;
  [key: string]: any;
};

export type MetaData = {
  total_count: number;
  returned_count: number;
  limit: number;
  has_more: boolean;
  next_cursor?: any;
};

export type NotificationResponse = {
  data: NotificationDetail[];
  metadata?: MetaData;
};

export type FetchNotificationFilters = {
  notificationId?: number;
  notificationName?: string;
  notificationChannelId?: number;
  inputSourceId?: number;
  alertSeverityId?: number;
  isActive?: boolean;
  isGlobal?: boolean;
  cursorDatetime?: string;
  cursorNotificationId?: number;
  limit?: number;
};

export type FetchNotificationRequest = {
  filters?: FetchNotificationFilters;
  sort?: {
    column?: string;
    order?: "ASC" | "DESC";
  };
};

/**
 * Fetch all notifications
 */
export const fetchNotifications = async (
  data: FetchNotificationRequest = {},
): Promise<NotificationResponse> => {
  try {
    const response = await API.post(API_ENDPOINTS.NOTIFICATION.FETCH, {
      filters: {
        limit: 100,
        ...data.filters,
      },
      sort: {
        column: "CreatedDateTime",
        order: "DESC",
        ...data.sort,
      },
    });
    return response.get_notifications || response;
  } catch (error: any) {
    console.error(
      `${LOG_PREFIX.NOTIFICATION} Error fetching notifications:`,
      error,
    );
    const errorMessage = handleApiError(
      error,
      ERROR_MESSAGES.NOTIFICATION.FETCH_FAILED,
    );
    throw new Error(errorMessage);
  }
};

/**
 * Create a new notification
 */
export interface CreateNotificationRequest {
  notificationName?: string;
  notificationChannelId?: number;
  alertSeverityId?: number;
  isActive?: boolean;
  isGlobal?: boolean;
  recipients?: RecipientDetail[];
  inputSources?: number[];
}

export const createNotification = async (
  data: CreateNotificationRequest,
): Promise<NotificationDetail> => {
  try {
    const response = await API.post(API_ENDPOINTS.NOTIFICATION.CREATE, data);
    return response.notification || response;
  } catch (error: any) {
    console.error(
      `${LOG_PREFIX.NOTIFICATION} Error creating notification:`,
      error,
    );
    const errorMessage = handleApiError(
      error,
      ERROR_MESSAGES.NOTIFICATION.CREATE_FAILED,
    );
    throw new Error(errorMessage);
  }
};

/**
 * Update an existing notification
 */
export interface UpdateNotificationRequest extends CreateNotificationRequest {
  notificationId: number;
}

export const updateNotification = async (
  data: UpdateNotificationRequest,
): Promise<void> => {
  try {
    await API.put(API_ENDPOINTS.NOTIFICATION.UPDATE, data);
  } catch (error: any) {
    console.error(
      `${LOG_PREFIX.NOTIFICATION} Error updating notification:`,
      error,
    );
    const errorMessage = handleApiError(
      error,
      ERROR_MESSAGES.NOTIFICATION.UPDATE_FAILED,
    );
    throw new Error(errorMessage);
  }
};

/**
 * Delete a notification
 */
export const deleteNotification = async (
  notificationId: number,
): Promise<void> => {
  try {
    await API.delete(
      `${API_ENDPOINTS.NOTIFICATION.DELETE}?notificationId=${notificationId}`,
    );
  } catch (error: any) {
    console.error(
      `${LOG_PREFIX.NOTIFICATION} Error deleting notification:`,
      error,
    );
    const errorMessage = handleApiError(
      error,
      ERROR_MESSAGES.NOTIFICATION.DELETE_FAILED,
    );
    throw new Error(errorMessage);
  }
};

// Notification Channel types
export type NotificationChannel = {
  NotificationChannelId: number;
  NotificationChannelName: string;
};

export type NotificationChannelResponse = {
  data: NotificationChannel[];
};

export type SeverityLevel = {
  SeverityLevelId: number;
  SeverityLevelName: string;
};

export type SeverityLevelResponse = {
  data: SeverityLevel[];
};

/**
 * Fetch notification channels
 */
export const fetchNotificationChannels = async (): Promise<NotificationChannelResponse> => {
  try {
    const response = await API.post(API_ENDPOINTS.NOTIFICATION_CHANNEL.FETCH, {});
    return response;
  } catch (error: any) {
    console.error(
      `${LOG_PREFIX.NOTIFICATION} Error fetching notification channels:`,
      error,
    );
    const errorMessage = handleApiError(
      error,
      ERROR_MESSAGES.NOTIFICATION.FETCH_CHANNELS_FAILED,
    );
    throw new Error(errorMessage);
  }
};

/**
 * Fetch severity levels
 */
export const fetchSeverityLevels = async (): Promise<SeverityLevelResponse> => {
  try {
    const response = await API.post(API_ENDPOINTS.SEVERITY_LEVEL.FETCH, {});
    return response;
  } catch (error: any) {
    console.error(
      `${LOG_PREFIX.NOTIFICATION} Error fetching severity levels:`,
      error,
    );
    const errorMessage = handleApiError(
      error,
      ERROR_MESSAGES.NOTIFICATION.FETCH_SEVERITY_LEVELS_FAILED,
    );
    throw new Error(errorMessage);
  }
};
