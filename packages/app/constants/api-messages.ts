/**
 * Error Messages Constants
 * Central location for all error and log messages used across the application
 */

export const ERROR_MESSAGES = {
  // Authentication errors
  AUTH: {
    INVALID_CREDENTIALS: "Email and password are required",
    INVALID_RESPONSE: "Invalid response from server",
    LOGIN_FAILED: "Login failed. Please try again.",
    LOGOUT_FAILED: "Failed to logout. Please try again.",
    RESET_PASSWORD_FAILED: "Failed to reset password",
    RESET_PASSWORD_ERROR: "Reset password failed. Please try again.",
  },

  // User management errors
  USER: {
    FETCH_FAILED: "Failed to fetch users",
    FETCH_USER_FAILED: "Failed to fetch user",
    CREATE_FAILED: "Failed to create user",
    UPDATE_FAILED: "Failed to update user",
    DELETE_FAILED: "Failed to delete user",
    INVITE_FAILED: "Failed to invite user",
    BULK_UPLOAD_FAILED: "Failed to upload users",
    STATS_FAILED: "Failed to fetch user stats",
    SEARCH_FAILED: "Failed to search users",
  },

  // Location errors
  LOCATION: {
    FETCH_FAILED: "Failed to fetch locations",
  },

  // Resolution errors
  RESOLUTION: {
    FETCH_FAILED: "Failed to fetch resolutions",
  },

  // Use Case errors
  USE_CASE: {
    FETCH_FAILED: "Failed to fetch use cases",
    DELETE_FAILED: "Failed to delete use case",
    FETCH_ACCURACIES_FAILED: "Failed to fetch use case accuracies",
  },

  // Input Source (Camera) errors
  INPUT_SOURCE: {
    FETCH_FAILED: "Failed to fetch input sources",
    FETCH_DETAILS_FAILED: "Failed to fetch input source details",
    CREATE_FAILED: "Failed to create input source",
    DELETE_FAILED: "Failed to delete input source",
    UPDATE_FAILED: "Failed to update input source",
    FETCH_ONLINE_FAILED: "Failed to fetch online input sources",
  },

  // Incident errors
  INCIDENT: {
    FETCH_FAILED: "Failed to fetch incidents",
    FETCH_STATUS_FAILED: "Failed to fetch incident statuses",
    UPDATE_FAILED: "Failed to update incident",
    CREATE_FAILED: "Failed to create incident",
    FETCH_TYPES_FAILED: "Failed to fetch incident types",
    FETCH_SEVERITY_LEVELS_FAILED: "Failed to fetch severity levels",
  },

  // Role errors
  ROLE: {
    FETCH_FAILED: "Failed to fetch roles",
  },

  // Pipeline errors
  PIPELINE: {
    FETCH_FAILED: "Failed to fetch pipelines",
    CREATE_FAILED: "Failed to create pipeline",
    UPDATE_FAILED: "Failed to update pipeline",
    DELETE_FAILED: "Failed to delete pipeline",
    START_FAILED: "Failed to start pipeline",
    STOP_FAILED: "Failed to stop pipeline",
    RESTART_FAILED: "Failed to restart pipeline",
  },

  // Organization errors
  ORGANIZATION: {
    FETCH_FAILED: "Failed to fetch organization",
    UPDATE_FAILED: "Failed to update organization",
    FETCH_INDUSTRIES_FAILED: "Failed to fetch industries",
    FETCH_COMPANY_SIZES_FAILED: "Failed to fetch company sizes",
  },
  // Notification errors
  NOTIFICATION: {
    FETCH_FAILED: "Failed to fetch notifications",
    CREATE_FAILED: "Failed to create notification",
    UPDATE_FAILED: "Failed to update notification",
    DELETE_FAILED: "Failed to delete notification",
    FETCH_CHANNELS_FAILED: "Failed to fetch notification channels",
    FETCH_SEVERITY_LEVELS_FAILED: "Failed to fetch severity levels",
  },

  //Alert errors
  ALERT: {
    FETCH_FAILED: "Failed to fetch alerts",
    UPDATE_FAILED: "Failed to update alert",
    FETCH_SEVERITY_LEVELS_FAILED: "Failed to fetch severity levels",
  },
} as const;

/**
 * Success Messages for UI feedback
 */
export const SUCCESS_MESSAGES = {
  AUTH: {
    LOGOUT: "Logged out successfully.",
  },
  USER: {
    DELETED: "User deleted successfully.",
  },
  USE_CASE: {
    ENABLED: "enabled successfully!",
    DISABLED: "disabled successfully!",
    ADDED: "added successfully!",
    UPDATED: "updated successfully!",
    DELETED: "deleted successfully!",
  },
  INPUT_SOURCE: {
    ADDED: "added successfully!",
    UPDATED: "updated successfully!",
    DELETED: "deleted successfully!",
  },
  PIPELINE: {
    ADDED: "added successfully!",
    UPDATED: "updated successfully!",
    DELETED: "deleted successfully!",
    STARTED: "Pipeline started successfully",
  },
} as const;

/**
 * Loading Messages for UI feedback
 */
export const LOADING_MESSAGES = {
  CAMERAS: "Loading cameras...",
  LOCATIONS: "Loading locations...",
  RESOLUTIONS: "Loading resolutions...",
  USE_CASES: "Loading use cases...",
  AI_MODELS: "Loading AI models...",
  INCIDENTS: "Loading incidents...",
  USERS: "Loading users...",
  FPS: "Fetching FPS...",
} as const;

/**
 * Empty State Messages
 */
export const EMPTY_STATE_MESSAGES = {
  NO_CAMERAS: "No cameras available",
  NO_CAMERAS_SEARCH: "No cameras found matching your search",
  NO_MODELS: "No AI models found.",
  NO_MODELS_SEARCH: "No models match your search.",
  NO_INCIDENTS: "No incidents available",
  NO_INCIDENTS_SEARCH: "No incidents found matching your search",
} as const;

/**
 * Log Prefixes for console logging
 */
export const LOG_PREFIX = {
  AUTH: "[Auth]",
  USER: "[User]",
  LOCATION: "[Location]",
  RESOLUTION: "[Resolution]",
  USE_CASE: "[UseCase]",
  INPUT_SOURCE: "[InputSource]",
  INCIDENT: "[Incident]",
  ROLE: "[Role]",
  PIPELINE: "[Pipeline]",
  ORGANIZATION: "[Organization]",
  NOTIFICATION: "[Notification]",
  ALERT: "[Alert]",
} as const;

/**
 * HTTP Headers for API requests
 */
export const HTTP_HEADERS = {
  MULTIPART_FORM_DATA: {
    'Content-Type': 'multipart/form-data',
  },
} as const;
