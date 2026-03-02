/**
 * Application Configuration Constants
 * Central location for user roles, routes, and other app-wide configurations
 */

export const APP_BRAND = {
  NAME: "Aegis Vision",
  LOGO_ALT: "Aegis Vision",
} as const;

/**
 * User role types used throughout the application
 */
export const USER_ROLES = {
  ADMINISTRATOR: "Administrator",
  MONITOR: "Monitor",
  STAKEHOLDER: "stakeholder",
  EXECUTIVE: "Executive",
  SUPERVISOR: "Supervisor",
} as const;

export type UserRole = typeof USER_ROLES[keyof typeof USER_ROLES];

/**
 * Application routes for different user roles
 */
export const ROUTES = {
  ROOT: "/",
  ADMIN: {
    DASHBOARD: "/admin/dashboard",
    RESET_PASSWORD: "/admin/reset-password",
    SETUP: "/admin/setup",
    INCIDENTS: "/admin/incidents",
    INCIDENTS_CREATE: "/admin/incidents/create",
    USERS: "/admin/users",
    PIPELINES: "/admin/pipelines",
    ALERTS:"/admin/alerts",
    MODELS: "/admin/models",
    MODEL_DETAIL: (id: number | string) => `/admin/models/${id}`,
    MODEL_BUILD: (id: number | string) => `/admin/models/${id}/build`,
    MODEL_BUILD_STEP: (id: number | string, step: string) =>
      `/admin/models/${id}/build/${step}`,
  },
  MONITOR: {
    SUMMARY: "/monitor/summary",
    DASHBOARD: "/monitor/dashboard",
    RESET_PASSWORD: "/monitor/reset-password",
    INCIDENTS_CREATE: "/monitor/incidents/create",
    ALERT:"/monitor/alerts"
  },
  STAKEHOLDER: {
    REPORTS: "/stakeholder/reports",
  },
} as const;

/**
 * User role display names for UI
 */
export const ROLE_DISPLAY_NAMES = {
  [USER_ROLES.ADMINISTRATOR]: "Admin User",
  [USER_ROLES.MONITOR]: "Monitor User",
  [USER_ROLES.STAKEHOLDER]: "Stakeholder",
} as const;

/**
 * Demo/seed data for prototype testing
 */
export const DEMO_DATA = {
  ORGANIZATION: {
    name: "Demo Organization",
    domain: "demo.aegis.com",
    setupCompleted: false,
  },
  MODELS: [
    {
      id: "model_ppe",
      name: "PPE Detection",
      type: "default",
      tech: "YOLO",
      description: "Detects personal protective equipment (helmets, vests, gloves)",
    },
    {
      id: "model_intrusion",
      name: "Intrusion Detection",
      type: "default",
      tech: "YOLO",
      description: "Detects unauthorized personnel in restricted areas",
    },
    {
      id: "model_fire",
      name: "Fire Detection",
      type: "default",
      tech: "TensorFlow",
      description: "Detects fire and smoke in monitored areas",
    },
    {
      id: "model_defect",
      name: "Defect Detection",
      type: "default",
      tech: "PyTorch",
      description: "Identifies product defects in manufacturing lines",
    },
  ],
  NOTIFICATIONS: {
    global: {
      email: { enabled: false, recipients: [] },
      sms: { enabled: false, recipients: [] },
      whatsapp: { enabled: false, recipients: [] },
      webhook: { enabled: false, url: "" },
      plc: { enabled: false, config: {} },
    },
    pipelines: {},
  },
} as const;

/** Application status */
export const STATUS = {
  ONLINE: "Online",
  OFFLINE: "Offline",
  ACTIVE: "Active",
  INACTIVE: "Inactive",
  STOPPED: "Stopped",
  PENDING: "Pending",
} as const;

/** AI model types */
// "YOLO" | "TensorFlow" | "PyTorch" | "ONNX" | "OpenVINO";
export const MODEL_TYPES = {
  PYTORCH: "PyTorch",
  YOLO: "YOLO",
  TENSORFLOW: "TensorFlow",
  ONNX: "ONNX",
  OPENVINO: "OpenVINO",
} as const;

/** severity levels */
export const SEVERITY_LEVELS = {
  LOW: "Low",
  MEDIUM: "Medium",
  HIGH: "High",
  CRITICAL: "Critical",
} as const;

/** Incident status types */
export const INCIDENT_STATUS = {
  NEW: "New",
  IN_PROGRESS: "In Progress",
  RESOLVED: "Resolved",
  FALSE_POSITIVE: "False Positive",
  ACTIVE: "Active",
  INACTIVE: "Inactive",
  REVIEWING: "Reviewing",
} as const;

/** Notification channels */
export const NOTIFICATION_CHANNELS = {
  EMAIL: "Email",
  SMS: "SMS",
  WHATSAPP: "WhatsApp",
  WEBHOOK: "Webhook",
  PLC: "PLC",
} as const;

/** Pipeline statuses */
export const PIPELINE_STATUSES = {
  RUNNING: "Running",
  STOPPED: "Stopped",
  ERROR: "Error",
} as const;

/** Alert statuses */
export const ALERT_STATUSES = {
  NEW: "New",
  UN_ACKNOWLEDGED:"UnAcknowledged",
  ACKNOWLEDGED: "Acknowledged",
  RESOLVED: "Resolved",
} as const;

/** Incident action */
export const INCIDENT_ACTION = {
 CREATE_INCIDENT :"Create Incident",
 ACKNOWLEDGE:"Acknowledge",
 VIEW_FOOTAGE:"View Footage",
 RESOLVED:"Resolved"
}