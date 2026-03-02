/**
 * AI Model Data Model — strongly typed enums, interfaces, and utility types.
 *
 * Follows the repo convention of `as const` objects + derived union types.
 */

// ─── Enums (const objects) ──────────────────────────────────────────────────

/** How the model was integrated into the platform. */
export const IntegrationType = {
  BUILT: "BUILT",
  BYOM_UPLOAD: "BYOM_UPLOAD",
  BYOM_REST: "BYOM_REST",
} as const;
export type IntegrationType = (typeof IntegrationType)[keyof typeof IntegrationType];

/** Lifecycle status of a model. */
export const ModelStatus = {
  DRAFT: "DRAFT",
  VALIDATED: "VALIDATED",
  PUBLISHED: "PUBLISHED",
  DEPLOYED: "DEPLOYED",
} as const;
export type ModelStatus = (typeof ModelStatus)[keyof typeof ModelStatus];

/** Region-of-Interest configuration state for a station/camera assignment. */
export const ROIStatus = {
  CONFIGURED: "CONFIGURED",
  PENDING: "PENDING",
  NOT_SET: "NOT_SET",
} as const;
export type ROIStatus = (typeof ROIStatus)[keyof typeof ROIStatus];

/** Model framework / runtime. */
export const ModelFramework = {
  YOLO: "YOLO",
  TENSORFLOW: "TensorFlow",
  PYTORCH: "PyTorch",
  ONNX: "ONNX",
  OPENVINO: "OpenVINO",
  CUSTOM: "Custom",
} as const;
export type ModelFramework = (typeof ModelFramework)[keyof typeof ModelFramework];

/** Model category. */
export const ModelCategory = {
  QUALITY_CONTROL: "quality-control",
  SAFETY_MONITORING: "safety-monitoring",
  SECURITY: "security",
  ANALYTICS: "analytics",
  CUSTOM: "custom",
} as const;
export type ModelCategory = (typeof ModelCategory)[keyof typeof ModelCategory];

/** Output type produced by the model. */
export const OutputType = {
  BOUNDING_BOX: "bounding-box",
  CLASSIFICATION: "classification",
  SEGMENTATION: "segmentation",
  KEYPOINT: "keypoint",
  ANOMALY_SCORE: "anomaly-score",
} as const;
export type OutputType = (typeof OutputType)[keyof typeof OutputType];

/** High-level origin of the model. */
export const ModelSourceType = {
  PRE_DEFINED: "PRE_DEFINED",
  BYOM: "BYOM",
  BUILD_YOUR_MODEL: "BUILD_YOUR_MODEL",
} as const;
export type ModelSourceType = (typeof ModelSourceType)[keyof typeof ModelSourceType];

/** Build-flow step identifiers (11 steps). */
export const BuildStep = {
  DATASET_COLLECTION: "DATASET_COLLECTION",
  DATA_LABELING: "DATA_LABELING",
  DATA_AUGMENTATION: "DATA_AUGMENTATION",
  ARCHITECTURE_SELECTION: "ARCHITECTURE_SELECTION",
  TRAINING_CONFIG: "TRAINING_CONFIG",
  MODEL_TRAINING: "MODEL_TRAINING",
  EVALUATION: "EVALUATION",
  OPTIMIZATION: "OPTIMIZATION",
  EXPORT_PACKAGING: "EXPORT_PACKAGING",
  VALIDATION: "VALIDATION",
  DEPLOYMENT_READY: "DEPLOYMENT_READY",
} as const;
export type BuildStep = (typeof BuildStep)[keyof typeof BuildStep];

export const BuildStepStatus = {
  NOT_STARTED: "NOT_STARTED",
  IN_PROGRESS: "IN_PROGRESS",
  COMPLETED: "COMPLETED",
  FAILED: "FAILED",
  SKIPPED: "SKIPPED",
} as const;
export type BuildStepStatus = (typeof BuildStepStatus)[keyof typeof BuildStepStatus];

// ─── Infrastructure types ───────────────────────────────────────────────────

export interface Station {
  id: string;
  name: string;
  location: string;
  cameras: Camera[];
}

export interface Camera {
  id: string;
  name: string;
  stationId: string;
  streamUrl: string;
  status: "online" | "offline";
}

// ─── Model sub-types ────────────────────────────────────────────────────────

export interface ModelVersion {
  id: string;
  version: string;
  createdAt: string;
  status: "current" | "previous" | "archived";
  notes: string;
}

export interface StationAssignment {
  id: string;
  stationId: string;
  stationName: string;
  cameraId: string;
  cameraName: string;
  roiStatus: ROIStatus;
  detectionFrequency: string;
  thresholdProfile: string;
  assignedAt: string;
}

/** Parsed manifest.json extracted from a BYOM upload package. */
export interface PackageManifest {
  modelName: string;
  framework: string;
  outputType: string;
  labels: string[];
  inputFormat: {
    width: number;
    height: number;
    channels: number;
    encoding: string;
  };
  weightsFile: string;
}

/** A single external → internal label mapping row. */
export interface LabelMapping {
  externalLabel: string;
  internalLabel: string;
}

/** Model contract — defines the expected I/O schema and label mapping. */
export interface ByomContract {
  inputType: string;
  outputType: string;
  labelMappings: LabelMapping[];
}

/** BYOM — uploaded model package configuration. */
export interface ByomUploadConfig {
  type: "upload";
  fileName: string;
  fileSize: number;
  uploadedAt: string;
  packageValidated: boolean;
  manifest?: PackageManifest;
  contract?: ByomContract;
}

/** BYOM — REST endpoint configuration. */
export interface ByomRestConfig {
  type: "rest";
  endpointUrl: string;
  authType: "none" | "api-key" | "bearer";
  apiKey?: string;
  bearerToken?: string;
  /** Request timeout in milliseconds (default 30 000). */
  timeoutMs?: number;
  connectionTested: boolean;
  lastTestedAt: string | null;
  latencyMs: number | null;
  contract?: ByomContract;
}

export type ByomConfig = ByomUploadConfig | ByomRestConfig;

/** Individual build step progress entry. */
export interface BuildStepProgress {
  step: BuildStep;
  label: string;
  status: BuildStepStatus;
  startedAt: string | null;
  completedAt: string | null;
}

/** Full build-flow state (11 steps). */
export interface BuildFlowProgress {
  currentStep: number;
  steps: BuildStepProgress[];
}

/** Validation check result. */
export interface ValidationCheck {
  key: string;
  label: string;
  description: string;
  passed: boolean;
  /** Actionable fix message shown when the check fails. */
  fixMessage?: string | null;
  checkedAt: string | null;
}

export interface ValidationReport {
  runAt: string;
  allPassed: boolean;
  checks: ValidationCheck[];
}

// ─── Primary model type ─────────────────────────────────────────────────────

export interface AIModel {
  id: string;
  name: string;
  framework: ModelFramework | null;
  category: ModelCategory;
  outputType: OutputType;
  labels: string[];
  integrationType: IntegrationType;
  sourceType: ModelSourceType;
  status: ModelStatus;
  createdAt: string;
  updatedAt: string;
  currentVersionId: string | null;
  versions: ModelVersion[];
  assignments: StationAssignment[];
  byomConfig: ByomConfig | null;
  buildFlow: BuildFlowProgress;
  validationReport: ValidationReport | null;
}

// ─── Display helpers ────────────────────────────────────────────────────────

export const SOURCE_TYPE_LABELS: Record<ModelSourceType, string> = {
  [ModelSourceType.PRE_DEFINED]: "Pre-defined",
  [ModelSourceType.BYOM]: "Bring your own",
  [ModelSourceType.BUILD_YOUR_MODEL]: "Build your model",
};

export const INTEGRATION_TYPE_LABELS: Record<IntegrationType, string> = {
  [IntegrationType.BUILT]: "Built",
  [IntegrationType.BYOM_UPLOAD]: "Bring Upload",
  [IntegrationType.BYOM_REST]: "Bring REST",
};

export const MODEL_STATUS_LABELS: Record<ModelStatus, string> = {
  [ModelStatus.DRAFT]: "Draft",
  [ModelStatus.VALIDATED]: "Validated",
  [ModelStatus.PUBLISHED]: "Published",
  [ModelStatus.DEPLOYED]: "Deployed",
};

export const ROI_STATUS_LABELS: Record<ROIStatus, string> = {
  [ROIStatus.CONFIGURED]: "Configured",
  [ROIStatus.PENDING]: "Pending",
  [ROIStatus.NOT_SET]: "Not Set",
};

export const BUILD_STEP_LABELS: Record<BuildStep, string> = {
  [BuildStep.DATASET_COLLECTION]: "Dataset Collection",
  [BuildStep.DATA_LABELING]: "Data Labeling",
  [BuildStep.DATA_AUGMENTATION]: "Data Augmentation",
  [BuildStep.ARCHITECTURE_SELECTION]: "Architecture Selection",
  [BuildStep.TRAINING_CONFIG]: "Training Configuration",
  [BuildStep.MODEL_TRAINING]: "Model Training",
  [BuildStep.EVALUATION]: "Evaluation",
  [BuildStep.OPTIMIZATION]: "Optimization",
  [BuildStep.EXPORT_PACKAGING]: "Export & Packaging",
  [BuildStep.VALIDATION]: "Validation",
  [BuildStep.DEPLOYMENT_READY]: "Deployment Ready",
};
