/**
 * Setup Wizard Progress Tracking
 * 
 * Manages the admin first-time setup wizard state and progress.
 */

import { UserRole } from "app/constants";

export interface OrganizationDetails {
  name: string;
  domain?: string;
  industry: string;
  companySize: string;
  logo?: string;
}

export interface Camera {
  id: string;
  name: string;
  rtspUrl: string;
  fps?: string;
  resolution?: string;
  location?: string;
  useCase?: string;
  description?: string;
  status: "online" | "offline" | "validating";
  originalFps?: number;
  gstreamerUrl?: string;
  webrtcUrl?: string;
}

export interface Pipeline {
  id: string;
  name: string;
  cameraIds: string[];
  modelId: string;
  alertRules: {
    confidenceThreshold: number;
    alertTypes: string[];
  };
  status: "active" | "inactive";
}

export interface NotificationChannel {
  id?: string;
  type: "email" | "webhook" | "sms";
  config?: Record<string, any>;
  enabled?: boolean;
}

export interface UserInvite {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  status: "pending" | "accepted";
}


// Channel configuration types
interface EmailConfig {
  smtpServer: string;
  fromEmail: string;
  toEmails: string;
}

interface SmsConfig {
  provider: string;
  apiKey: string;
  phoneNumbers: string;
}

interface WhatsAppConfig {
  apiKey: string;
  phoneNumbers: string;
}

interface WebhookConfig {
  url: string;
  authToken: string;
}

interface PlcConfig {
  ipAddress: string;
  port: string;
  commandSequence: string;
}


interface ChannelState {
  email: { enabled: boolean; config: EmailConfig };
  sms: { enabled: boolean; config: SmsConfig };
  whatsapp: { enabled: boolean; config: WhatsAppConfig };
  webhook: { enabled: boolean; config: WebhookConfig };
  plc: { enabled: boolean; config: PlcConfig };
}

export interface SetupProgress {
  currentStep: number;
  completedSteps: number[];
  organization?: OrganizationDetails;
  cameras: Camera[];
  pipelines: Pipeline[];
  notifications: ChannelState;
  invites: UserInvite[];
  setupCompleted: boolean;
  lastSavedAt?: string;
}

const SETUP_STORAGE_KEY = "aegis-setup-progress";

/**
 * Get current setup progress from localStorage
 */
export function getSetupProgress(): SetupProgress {
  if (typeof window === "undefined") {
    return getDefaultSetupProgress();
  }

  const stored = localStorage.getItem(SETUP_STORAGE_KEY);
  if (!stored) {
    return getDefaultSetupProgress();
  }

  try {
    return JSON.parse(stored);
  } catch {
    return getDefaultSetupProgress();
  }
}

/**
 * Save setup progress to localStorage
 */
export function saveSetupProgress(progress: SetupProgress): void {
  if (typeof window === "undefined") return;

  progress.lastSavedAt = new Date().toISOString();
  localStorage.setItem(SETUP_STORAGE_KEY, JSON.stringify(progress));
}

/**
 * Get default/initial setup progress
 */
function getDefaultSetupProgress(): SetupProgress {
  return {
    currentStep: 1,
    completedSteps: [],
    cameras: [],
    pipelines: [],
    notifications: {} as ChannelState,
    invites: [],
    setupCompleted: false,
  };
}

/**
 * Mark a step as completed
 */
export function completeStep(stepNumber: number): void {
  const progress = getSetupProgress();
  if (!progress.completedSteps.includes(stepNumber)) {
    progress.completedSteps.push(stepNumber);
  }
  saveSetupProgress(progress);
}

/**
 * Check if a step is completed
 */
export function isStepCompleted(stepNumber: number): boolean {
  const progress = getSetupProgress();
  return progress.completedSteps.includes(stepNumber);
}

/**
 * Check if setup is complete (all required steps done)
 */
export function isSetupComplete(): boolean {
  const progress = getSetupProgress();
  
  // Required steps: 1 (org), 2 (cameras), 3 (pipelines)
  const requiredSteps = [1, 2, 3];
  const allRequiredCompleted = requiredSteps.every(step => 
    progress.completedSteps.includes(step)
  );

  return allRequiredCompleted && progress.setupCompleted;
}

/**
 * Get incomplete required steps
 */
export function getIncompleteSteps(): Array<{ step: number; title: string; description: string }> {
  const progress = getSetupProgress();
  const incomplete: Array<{ step: number; title: string; description: string }> = [];

  const steps = [
    { step: 1, title: "Organization Details", description: "Complete your organization profile", required: true },
    { step: 2, title: "Add Cameras", description: "Connect at least one IP camera", required: true },
    { step: 3, title: "Create Pipelines", description: "Set up at least one monitoring pipeline", required: true },
    { step: 4, title: "Notification Channels", description: "Configure alert notifications", required: false },
    { step: 5, title: "Invite Users", description: "Add team members to your workspace", required: false },
  ];

  return steps
    .filter(s => s.required && !progress.completedSteps.includes(s.step))
    .map(s => ({ step: s.step, title: s.title, description: s.description }));
}

/**
 * Mark setup as fully completed
 */
export function markSetupComplete(): void {
  const progress = getSetupProgress();
  progress.setupCompleted = true;
  progress.currentStep = 6; // Final step
  saveSetupProgress(progress);
}

/**
 * Reset setup progress (for testing)
 */
export function resetSetupProgress(): void {
  if (typeof window === "undefined") return;
  localStorage.removeItem(SETUP_STORAGE_KEY);
}

/**
 * Update organization details
 */
export function updateOrganization(org: OrganizationDetails): void {
  const progress = getSetupProgress();
  progress.organization = org;
  saveSetupProgress(progress);
}

/**
 * Add or update camera
 */
export function saveCamera(camera: Camera): void {
  const progress = getSetupProgress();
  const index = progress.cameras.findIndex(c => c.id === camera.id);
  
  if (index >= 0) {
    progress.cameras[index] = camera;
  } else {
    progress.cameras.push(camera);
  }
  
  saveSetupProgress(progress);
}

/**
 * Remove camera
 */
export function removeCamera(cameraId: string): void {
  const progress = getSetupProgress();
  progress.cameras = progress.cameras.filter(c => c.id !== cameraId);
  // Also remove camera from any pipelines
  progress.pipelines = progress.pipelines.map(p => ({
    ...p,
    cameraIds: p.cameraIds.filter(id => id !== cameraId)
  }));
  saveSetupProgress(progress);
}

/**
 * Add or update pipeline
 */
export function savePipeline(pipeline: Pipeline): void {
  const progress = getSetupProgress();
  const index = progress.pipelines.findIndex(p => p.id === pipeline.id);
  
  if (index >= 0) {
    progress.pipelines[index] = pipeline;
  } else {
    progress.pipelines.push(pipeline);
  }
  
  saveSetupProgress(progress);
}

/**
 * Remove pipeline
 */
export function removePipeline(pipelineId: string): void {
  const progress = getSetupProgress();
  progress.pipelines = progress.pipelines.filter(p => p.id !== pipelineId);
  saveSetupProgress(progress);
}

/**
 * Add or update notification channel
 */
export function saveNotificationChannel(channels: ChannelState): void {
  const progress = getSetupProgress();
  progress.notifications = channels;
  saveSetupProgress(progress);
}

/**
 * Add user invite
 */
export function addUserInvite(invite: UserInvite): void {
  const progress = getSetupProgress();
  progress.invites.push(invite);
  saveSetupProgress(progress);
}

/**
 * Remove user invite
 */
export function removeUserInvite(inviteId: string): void {
  const progress = getSetupProgress();
  progress.invites = progress.invites.filter(i => i.id !== inviteId);
  saveSetupProgress(progress);
}

/**
 * Update current step
 */
export function setCurrentStep(step: number): void {
  const progress = getSetupProgress();
  progress.currentStep = step;
  saveSetupProgress(progress);
}

