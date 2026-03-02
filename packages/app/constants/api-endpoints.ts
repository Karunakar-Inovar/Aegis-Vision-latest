/**
 * API Endpoints Constants
 * Central location for all API endpoint strings used across the application
 */

export const API_ENDPOINTS = {
  // Authentication endpoints
  AUTH: {
    LOGIN: "/v1/auth/login",
    LOGOUT: "/v1/auth/logout",
    RESET_PASSWORD: "/v1/auth/resetpassword",
    REMOVE_USER: "/v1/auth/removeuser",
    UPDATE: "/v1/auth/updateuser",
    CREATE: "/v1/auth/createuser",
    TOKEN_REFRESH: "/v1/auth/refreshtoken",
  },

  // Role endpoints
  ROLE: {
    FETCH: "/v1/roles",
  },

  // User management endpoints
  USER: {
    FETCH: "/v1/user/fetch",
    CREATE: "/v1/user/create",
    INVITE: "/v1/user/invite",
    BULK_UPLOAD: "/v1/user/bulk-upload",
    SEARCH: "/v1/user/search",
    STATS: "/v1/user/stats",
    UPDATE: "/v1/user/update",
    DELETE: "/v1/user/delete",
  },

  // Location endpoints
  LOCATION: {
    FETCH: "/v1/location/fetch",
  },

  // Resolution endpoints
  RESOLUTION: {
    FETCH: "/v1/inputsourceresolution/fetch",
  },

  // Use Case endpoints
  USE_CASE: {
    FETCH: "/v1/usecase/fetch",
    DELETE: "/v1/usecase/delete",
    FETCH_ACCURACIES: "/v1/usecase/accuracies",
  },

  // Input Source (Camera) endpoints
  INPUT_SOURCE: {
    FETCH: "/v1/inputsource/fetch",
    FETCH_DETAILS: "/v1/inputsource/fetchinputsourcedetails",
    FETCH_ONLINE: "/v1/inputsource/fetchonlineinputsource",
    CREATE: "/v1/inputsource/create",
    DELETE: "/v1/inputsource/delete",
    UPDATE: "/v1/inputsource/update",
  },

  // Incident endpoints
  INCIDENT: {
    FETCH: "/v1/incident/fetch",
    FETCH_STATUS: "/v1/incidentstatus/fetch",
    FETCH_TYPES: "/v1/incidentTypes/fetch",
    CREATE: "/v1/incident/create",
    UPDATE: "/v1/incident/update",
  },

  // Pipeline endpoints
  PIPELINE: {
    FETCH: "/v1/pipeline/fetch",
    CREATE: "/v1/pipeline/create",
    UPDATE: "/v1/pipeline/update",
    DELETE: "/v1/pipeline/delete",
    START: "/v1/pipeline/startpipeline",
    STOP: "/v1/pipeline/stoppipeline",
    RESTART: "/v1/pipeline/restartpipeline",
    INPUTSOURCESTART: "/v1/pipeline/startinputsource/",
    INPUTSOURCESTOP: "/v1/pipeline/stopinputsource/",
    INPUTSOURCERESTART: "/v1/pipeline/restartinputsource/",
  },

  // Organization endpoints
  ORGANIZATION: {
    FETCH: "/v1/organization/fetch",
    UPSERT: "/v1/organization/upsert",
    FETCH_INDUSTRIES: "/v1/organizationindustry/fetch",
    FETCH_COMPANY_SIZES: "/v1/organizationsize/fetch",
    CREATE: "/v1/organization/create",
  },

  // Notification endpoints
  NOTIFICATION: {
    FETCH: "/v1/notification/fetch",
    CREATE: "/v1/notification/create",
    UPDATE: "/v1/notification/update",
    DELETE: "/v1/notification/delete",
  },

  // Notification Channel endpoints
  NOTIFICATION_CHANNEL: {
    FETCH: "/v1/notificationchannel/fetch",
  },

  // Severity Level endpoints
  SEVERITY_LEVEL: {
    FETCH: "/v1/severityLevels/fetch",
  },

  // Alert endpoints  
  ALERT: {
    FETCH: "/v1/alert/fetch",
    UPDATE: "/v1/alert/update",
  },

  UPDATE_USER: {
    UPDATE: "/v1/auth/updateuser",
  },
} as const;
