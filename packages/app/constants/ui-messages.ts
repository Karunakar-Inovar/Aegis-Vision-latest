/**
 * Centralized UI Messages
 * 
 * This file contains all UI messages used throughout the application.
 * Organizing messages here provides:
 * - Consistency across the application
 * - Easy maintenance and updates
 * - Simple localization support in the future
 * - Single source of truth for all UI messages
 */

export const UI_MESSAGES = {
  // Authentication & User Management
  auth: {
    userNotFound: "User not found. Please log in again.",
    userNotAuthenticated: "User not authenticated. Please log in again.",
    loginFailed: "Failed to login. Please try again.",
    logoutSuccess: "Logged out successfully.",
    logoutFailed: "Failed to logout.",
    logoutAction: "Log out",
    userMenuTitle: "User menu",
    sessionExpired: "Your session has expired. Please log in again.",
    signIn: {
      title: "Welcome back!",
      action: "Sign In",
      actionLoading: "Signing In...",
      forgotPassword: "Forgot password?",
      emailLabel: "Email",
      emailPlaceholder: "email@example.com",
      passwordLabel: "Password",
      passwordPlaceholder: "Enter your password",
      missingCredentials: "Please enter your email and password",
      roles: {
        admin: "Admin",
        monitor: "Monitor",
        stakeholder: "Viewer",
      },
      termsPrefix: "By clicking \"Sign In\" you agree to the",
      termsOfService: "Terms of Service",
      termsConnector: "and acknowledge the",
      privacyNotice: "Privacy Notice",
      brandName: "Aegis Vision",
      taglineTitle: "AI-Powered Video Surveillance",
      taglineBody: "Monitor, detect, and respond to incidents in real-time with intelligent video analytics.",
    },
  },

  // Password Validation
  password: {
    required: "Password is required",
    currentRequired: "Current password is required",
    newRequired: "New password is required",
    minLength: "Password must be at least 8 characters",
    maxLength: "Password is too long",
    mismatch: "Passwords do not match",
    mustInclude: (requirements: string[]) => `Password must include: ${requirements.join(", ")}`,
    updateSuccess: "Password updated successfully",
    updateFailed: "Unable to update password",
    resetSuccess: "Password reset successfully",
    resetFailed: "Failed to reset password. Please try again.",
    weakPassword: "Password is too weak. Please choose a stronger password.",
  },

  // Email Validation
  email: {
    required: "Email is required",
    invalid: "Invalid email address",
    tooLong: "Email is too long",
    maxLength: "Email must not exceed 254 characters",
    alreadyExists: "This email is already registered",
    notFound: "No account found with this email",
  },

  // Profile & Personal Information
  profile: {
    updateSuccess: "Profile updated successfully",
    updateFailed: "Unable to update profile",
    nameRequired: "Name is required",
    nameTooLong: "Name is too long",
    phoneInvalid: "Invalid phone number",
    phoneTooShort: "Phone number is too short",
    phoneTooLong: "Phone number is too long",
  },

  // Organization Management
  organization: {
    nameRequired: "Organization name is required",
    nameTooLong: "Organization name must not exceed 225 characters",
    domainTooLong: "Organization domain must not exceed 225 characters",
    industryRequired: "Please select an industry",
    companySizeRequired: "Please select a company size",
    saveSuccess: "Organization settings saved successfully!",
    saveFailed: "Failed to save organization settings",
    loadFailed: "Failed to load organization data",
    licenseInvalid: "Invalid license key",
    licenseExpired: "License key has expired",
  },

  // User Management
  users: {
    fetchFailed: "Failed to fetch users",
    loadRolesFailed: "Failed to load roles",
    validationErrors: "Please fix validation errors before submitting",
    createSuccess: (name: string) => `User "${name}" invited successfully!`,
    updateSuccess: (name: string) => `User "${name}" updated successfully!`,
    deleteSuccess: (name: string) => `User "${name}" deleted successfully.`,
    createFailed: (action: string) => `Failed to ${action} user`,
    deleteFailed: "Failed to delete user. Please try again.",
    roleRequired: "Please select a role",
    statusRequired: "Please select a status",
    nameRequired: "Name is required",
    nameTooShort: "Name must be at least 2 characters",
    nameTooLong: "Name must not exceed 100 characters",
    emailRequired: "Email is required",
    emailInvalid: "Invalid email format",
    inviteSent: "Invitation sent successfully",
    inviteFailed: "Failed to send invitation. Please try again.",
  },

  // Camera Management
  cameras: {
    addSuccess: (name: string) => `Camera "${name}" added successfully!`,
    updateSuccess: (name: string) => `Camera "${name}" updated successfully!`,
    deleteSuccess: (name: string) => `Camera "${name}" deleted successfully!`,
    addFailed: "Failed to add camera",
    updateFailed: "Failed to update camera",
    deleteFailed: "Failed to delete camera",
    loadFailed: "Failed to load cameras",
    nameRequired: "Camera name is required",
    urlRequired: "Camera URL is required",
    urlInvalid: "Invalid camera URL",
    locationRequired: "Location is required",
    atLeastOneRequired: "Please add at least one camera to continue.",
    connectionFailed: "Failed to connect to camera",
    refreshSuccess: "Camera feeds refreshed successfully.",
    nameTooShort: "Camera name must be at least 3 characters",
    fpsExceedsSource: (value: string, maxFps: number) => `FPS value "${value}" exceeds source FPS of ${maxFps}`,
    toggleSuccess: (name: string, enabled: boolean) => 
      `Camera "${name}" ${enabled ? "activated" : "deactivated"} successfully!`,
   refresh :"Refreshing camera feeds...",
  },

  // Pipeline Management
  pipelines: {
    nameRequired: "Pipeline name is required",
    loadFailed: "Failed to load pipelines",
    loadOptionsFailed: "Failed to load options",
    createSuccess: (name: string) => `Pipeline "${name}" created successfully!`,
    updateSuccess: (name: string) => `Pipeline "${name}" updated successfully!`,
    deleteSuccess: (name: string) => `Pipeline "${name}" deleted successfully!`,
    startSuccess: (name: string) => `Pipeline "${name}" started successfully!`,
    stopSuccess: (name: string) => `Pipeline "${name}" stopped successfully!`,
    restartSuccess: (name: string) => `Pipeline "${name}" restarted successfully!`,
    createFailed: "Failed to create pipeline",
    updateFailed: "Failed to update pipeline",
    deleteFailed: "Failed to delete pipeline",
    stopFailed: "Failed to stop pipeline",
    requiredFields: "Please fill in all required fields",
    startSuccessGeneral: "Pipeline started. Camera feeds are connecting...",
    startFailed: "Failed to start pipeline. Please try again.",
    pipelineStop: "Stopping pipeline...",
    pipelineStarting:"Starting pipeline...",
    pipelineWithCameraStarted :"Pipeline has been stopped. All camera feeds are now offline."
  },

  // AI Model Management
  models: {
    loadFailed: "Failed to load AI models. Please try again.",
    addSuccess: (name: string) => `Model "${name}" added successfully!`,
    savedAsDraft: (name: string) => `Model "${name}" saved as Draft.`,
    updateSuccess: (name: string) => `Model "${name}" updated successfully!`,
    deleteSuccess: (name: string) => `Model "${name}" deleted successfully!`,
    deleteFailed: "Failed to delete model. Please try again.",
    toggleSuccess: (name: string, enabled: boolean) => 
      `Model "${name}" ${enabled ? "enabled" : "disabled"} successfully!`,
    nameRequired: "Model name is required",
    versionRequired: "Model version is required",
    typeRequired: "Model type is required",
    byomSuccess: "Model uploaded and use case created",
  },

  // Incident Management
  incidents: {
    loadFailed: "Failed to load incidents",
    loadDetailsFailed: "Failed to load incident details",
    createSuccess: "Incident created successfully",
    createFailed: "Failed to create incident. Please try again.",
    updateSuccess: "Incident updated successfully",
    updateFailed: "Failed to update incident",
    deleteSuccess: "Incident deleted successfully",
    deleteFailed: "Failed to delete incident",
    titleRequired: "Incident title is required",
    titleTooShort: "Title must be at least 3 characters",
    descriptionRequired: "Description is required",
    descriptionTooShort: "Description must be at least 10 characters",
    typeRequired: "Incident type is required",
    severityRequired: "Severity level is required",
    locationRequired: "Location is required",
    requiredFields: "Please fill in all required fields correctly",
    loadFormOptionsFailed: "Failed to load form options. Please refresh the page.",
    falsePositiveStatusNotFound: "False Positive status not found",
    markedFalsePositive: "Incident marked as false positive",
  },

  // Alert Management
  alerts: {
    loadFailed: "Failed to load alerts",
    acknowledgeSuccess: "Alert acknowledged successfully",
    acknowledgeFailed: "Failed to acknowledge alert",
    resolveSuccess: "Alert marked as resolved",
    resolveFailed: "Failed to mark alert as resolved",
    dismissSuccess: "Alert dismissed successfully",
    dismissFailed: "Failed to dismiss alert",
    noAlerts: "No alerts to display",
    filterApplied: "Alert filter applied",
    filterCleared: "Alert filters cleared",
    acknowledgeError: "Failed to acknowledge alert. Please try again.",
    resolveError: "Failed to mark alert as resolved. Please try again.",
  },

  // Notification Management
  notifications: {
    loadFailed: "Failed to load notifications",
    createSuccess: (name: string) => 
      `Notification "${name}" created successfully!`,
    updateSuccessStatus: (name: string, status: boolean) => 
      `Notification "${name}" ${status ? "activated" : "deactivated"} successfully!`,
    deleteSuccess: (name: string) => 
      `Notification "${name}" deleted successfully!`,
    updateSuccess: (name: string) => 
      `Notification "${name}" updated successfully!`,
    createFailed: "Failed to create notification",
    updateFailed: "Failed to update notification",
    deleteFailed: "Failed to delete notification",
    requiredFields: "Please fill in all required fields",
    recipientError: (error: string) => error,
    cameraRequired: "Please select at least one camera",
    sendSuccess: "Notification sent successfully",
    sendFailed: "Failed to send notification",
  },

  // Monitoring
  monitor: {
    liveDashboardTitle: "Live Monitoring Dashboard",
    liveDashboardSubtitle: "See what's happening, as it happens",
    alertManagementTitle: "Alert Management",
    alertManagementSubtitle: "Monitor, triage, and respond to operational alerts in real time",
  },

  // Form Validation - General
  form: {
    requiredField: "This field is required",
    invalidFormat: "Invalid format",
    selectOption: "Please select an option",
    minLength: (min: number) => `Must be at least ${min} characters`,
    maxLength: (max: number) => `Must not exceed ${max} characters`,
    minValue: (min: number) => `Must be at least ${min}`,
    maxValue: (max: number) => `Must not exceed ${max}`,
    mustMatch: (field: string) => `Must match ${field}`,
    invalidDate: "Invalid date",
    futureDate: "Date cannot be in the future",
    pastDate: "Date cannot be in the past",
  },

  // File Upload
  file: {
    tooLarge: (maxSize: string) => `File size must not exceed ${maxSize}`,
    invalidType: (types: string[]) => `Invalid file type. Allowed types: ${types.join(", ")}`,
    uploadFailed: "Failed to upload file",
    uploadSuccess: "File uploaded successfully",
    deleteSuccess: "File deleted successfully",
    deleteFailed: "Failed to delete file",
  },

  // System & General
  system: {
    genericError: "An error occurred. Please try again.",
    loadFailed: "Failed to load data. Please refresh the page.",
    saveFailed: "Failed to save changes. Please try again.",
    deleteConfirm: "Are you sure you want to delete this item?",
    unsavedChanges: "You have unsaved changes. Are you sure you want to leave?",
    operationSuccess: "Operation completed successfully",
    operationFailed: "Operation failed. Please try again.",
    networkError: "Network error. Please check your connection.",
    serverError: "Server error. Please try again later.",
    permissionDenied: "You don't have permission to perform this action.",
    notFound: "The requested resource was not found.",
    timeout: "Request timed out. Please try again.",
    maintenanceMode: "System is under maintenance. Please try again later.",
  },

  // Setup & Configuration
  setup: {
    launchFailed: "Failed to launch system. Please try again or contact support.",
    configurationIncomplete: "Configuration is incomplete. Please complete all required steps.",
    stepRequired: (step: string) => `Please complete ${step} before proceeding`,
    loadFormOptionsFailed: "Failed to load form options",
  },

  // Home / Entry experiences
  home: {
    loadingTitle: "Loading sign-in experience",
    loadingSubtitle: "This should only take a moment",
    componentErrorTitle: "Error rendering sign-in",
    componentErrorHint: "Check the browser console for more details.",
    componentUnavailable: "Sign-in component not available",
    stackTrace: "Stack trace",
  },

  // Import & Module Loading
  import: {
    timeout: "Import timeout: The component is taking too long to load. This may indicate a circular dependency or module resolution issue.",
    notFound: (component: string) => `${component} not found in module.`,
    failed: (component: string) => `Failed to load ${component} component`,
    moduleNotFound: "Module not found",
  },
} as const;

/**
 * Helper function to get a validation message
 * @param category - The category of the message (e.g., 'auth', 'password')
 * @param key - The specific message key
 * @returns The validation message
 */
export function getValidationMessage(
  category: keyof typeof UI_MESSAGES,
  key: string
): string {
  const messages = UI_MESSAGES[category];
  if (messages && key in messages) {
    const message = messages[key as keyof typeof messages];
    return typeof message === 'function' ? '' : message;
  }
  return UI_MESSAGES.system.genericError;
}

/**
 * Type helper for validation message categories
 */
export type ValidationCategory = keyof typeof UI_MESSAGES;

/**
 * Type helper for getting keys of a specific category
 */
export type ValidationKey<T extends ValidationCategory> = keyof typeof UI_MESSAGES[T];
