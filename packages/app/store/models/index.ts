/**
 * AI Model Store — public API.
 *
 * Re-exports everything consumers need: types, enums, store hook, and mock data.
 */

// Types & enums
export {
  // Enum objects + union types
  IntegrationType,
  ModelSourceType,
  ModelStatus,
  ROIStatus,
  ModelFramework,
  ModelCategory,
  OutputType,
  BuildStep,
  BuildStepStatus,
  // Label maps
  SOURCE_TYPE_LABELS,
  INTEGRATION_TYPE_LABELS,
  MODEL_STATUS_LABELS,
  ROI_STATUS_LABELS,
  BUILD_STEP_LABELS,
} from "./types";

export type {
  Station,
  Camera,
  AIModel,
  ModelVersion,
  StationAssignment,
  PackageManifest,
  LabelMapping,
  ByomContract,
  ByomUploadConfig,
  ByomRestConfig,
  ByomConfig,
  BuildStepProgress,
  BuildFlowProgress,
  ValidationCheck,
  ValidationReport,
} from "./types";

// Store
export { useModelStore, useHasHydrated } from "./store";
export type { ModelStore, ModelStoreState, ModelStoreActions } from "./store";

// Mock / seed data
export { SEED_MODELS, MOCK_STATIONS, MOCK_CAMERAS } from "./mock-data";
