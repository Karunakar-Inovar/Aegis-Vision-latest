/**
 * Mock data — stations, cameras, and seed AI models.
 *
 * Used for Vercel preview / offline development without a backend.
 */

import {
  IntegrationType,
  ModelSourceType,
  ModelStatus,
  ROIStatus,
  ModelFramework,
  ModelCategory,
  OutputType,
  BuildStep,
  BuildStepStatus,
  BUILD_STEP_LABELS,
  type Station,
  type Camera,
  type AIModel,
  type BuildFlowProgress,
  type BuildStepProgress,
  type ValidationReport,
  type StationAssignment,
  type ModelVersion,
  type ByomUploadConfig,
  type ByomRestConfig,
} from "./types";

// ─── Helpers ────────────────────────────────────────────────────────────────

function iso(daysAgo: number): string {
  const d = new Date();
  d.setDate(d.getDate() - daysAgo);
  return d.toISOString();
}

function uid(): string {
  return Math.random().toString(36).slice(2, 10);
}

/** Build-flow with all 11 steps in NOT_STARTED state. */
function emptyBuildFlow(): BuildFlowProgress {
  const stepKeys = Object.values(BuildStep);
  return {
    currentStep: 0,
    steps: stepKeys.map((step) => ({
      step,
      label: BUILD_STEP_LABELS[step],
      status: BuildStepStatus.NOT_STARTED,
      startedAt: null,
      completedAt: null,
    })),
  };
}

/** Build-flow where the first N steps are completed. */
function partialBuildFlow(completedCount: number): BuildFlowProgress {
  const flow = emptyBuildFlow();
  flow.steps.forEach((s, i) => {
    if (i < completedCount) {
      s.status = BuildStepStatus.COMPLETED;
      s.startedAt = iso(30 - i);
      s.completedAt = iso(29 - i);
    } else if (i === completedCount) {
      s.status = BuildStepStatus.IN_PROGRESS;
      s.startedAt = iso(1);
    }
  });
  flow.currentStep = Math.min(completedCount, flow.steps.length - 1);
  return flow;
}

/** Full build-flow — all 11 steps completed. */
function completedBuildFlow(): BuildFlowProgress {
  const flow = emptyBuildFlow();
  flow.steps.forEach((s, i) => {
    s.status = BuildStepStatus.COMPLETED;
    s.startedAt = iso(30 - i);
    s.completedAt = iso(29 - i);
  });
  flow.currentStep = flow.steps.length - 1;
  return flow;
}

function passedValidation(): ValidationReport {
  return {
    runAt: iso(2),
    allPassed: true,
    checks: [
      { key: "contract", label: "Contract Schema Valid", description: "Input/output schema matches the expected contract", passed: true, checkedAt: iso(2) },
      { key: "latency", label: "Latency Within Threshold", description: "Inference latency is under 200 ms at p95", passed: true, checkedAt: iso(2) },
      { key: "inference", label: "Sample Inference Passed", description: "Model produces expected output on test images", passed: true, checkedAt: iso(2) },
      { key: "security", label: "Security Scan Passed", description: "No vulnerabilities detected in model artifacts", passed: true, checkedAt: iso(2) },
    ],
  };
}

// ─── Stations & Cameras ─────────────────────────────────────────────────────

export const MOCK_CAMERAS: Camera[] = [
  { id: "cam-01", name: "CAM-01 — Front Gate", stationId: "station-a", streamUrl: "rtsp://10.0.1.10/stream1", status: "online" },
  { id: "cam-02", name: "CAM-02 — Parking Lot", stationId: "station-a", streamUrl: "rtsp://10.0.1.11/stream1", status: "online" },
  { id: "cam-03", name: "CAM-03 — Loading Bay North", stationId: "station-b", streamUrl: "rtsp://10.0.2.10/stream1", status: "online" },
  { id: "cam-04", name: "CAM-04 — Loading Bay South", stationId: "station-b", streamUrl: "rtsp://10.0.2.11/stream1", status: "offline" },
  { id: "cam-05", name: "CAM-05 — Assembly Line 1", stationId: "station-c", streamUrl: "rtsp://10.0.3.10/stream1", status: "online" },
  { id: "cam-06", name: "CAM-06 — Assembly Line 2", stationId: "station-c", streamUrl: "rtsp://10.0.3.11/stream1", status: "online" },
  { id: "cam-07", name: "CAM-07 — QC Station", stationId: "station-c", streamUrl: "rtsp://10.0.3.12/stream1", status: "online" },
  { id: "cam-08", name: "CAM-08 — Warehouse Aisle A", stationId: "station-d", streamUrl: "rtsp://10.0.4.10/stream1", status: "online" },
  { id: "cam-09", name: "CAM-09 — Warehouse Aisle B", stationId: "station-d", streamUrl: "rtsp://10.0.4.11/stream1", status: "online" },
  { id: "cam-10", name: "CAM-10 — Server Room", stationId: "station-e", streamUrl: "rtsp://10.0.5.10/stream1", status: "offline" },
  { id: "cam-11", name: "CAM-11 — Perimeter East", stationId: "station-f", streamUrl: "rtsp://10.0.6.10/stream1", status: "online" },
  { id: "cam-12", name: "CAM-12 — Perimeter West", stationId: "station-f", streamUrl: "rtsp://10.0.6.11/stream1", status: "online" },
];

export const MOCK_STATIONS: Station[] = [
  { id: "station-a", name: "Main Entrance", location: "Building A — Ground Floor", cameras: MOCK_CAMERAS.filter((c) => c.stationId === "station-a") },
  { id: "station-b", name: "Loading Dock", location: "Building B — Rear", cameras: MOCK_CAMERAS.filter((c) => c.stationId === "station-b") },
  { id: "station-c", name: "Assembly Line", location: "Building C — Production Floor", cameras: MOCK_CAMERAS.filter((c) => c.stationId === "station-c") },
  { id: "station-d", name: "Warehouse", location: "Building D — Storage", cameras: MOCK_CAMERAS.filter((c) => c.stationId === "station-d") },
  { id: "station-e", name: "Server Room", location: "Building A — Basement", cameras: MOCK_CAMERAS.filter((c) => c.stationId === "station-e") },
  { id: "station-f", name: "Perimeter", location: "Outdoor — Fence Line", cameras: MOCK_CAMERAS.filter((c) => c.stationId === "station-f") },
];

// ─── Seed AI Models ─────────────────────────────────────────────────────────

const ppeVersions: ModelVersion[] = [
  { id: "v-ppe-130", version: "v1.3.0", createdAt: iso(5), status: "current", notes: "Improved accuracy on low-light conditions" },
  { id: "v-ppe-121", version: "v1.2.1", createdAt: iso(20), status: "previous", notes: "Hotfix for edge-case false positives" },
  { id: "v-ppe-120", version: "v1.2.0", createdAt: iso(40), status: "previous", notes: "Added new label classes and retrained" },
  { id: "v-ppe-110", version: "v1.1.0", createdAt: iso(75), status: "archived", notes: "Initial production-ready release" },
  { id: "v-ppe-100", version: "v1.0.0", createdAt: iso(110), status: "archived", notes: "First draft release for validation" },
];

const ppeAssignments: StationAssignment[] = [
  { id: uid(), stationId: "station-a", stationName: "Main Entrance", cameraId: "cam-01", cameraName: "CAM-01 — Front Gate", roiStatus: ROIStatus.CONFIGURED, detectionFrequency: "5s", thresholdProfile: "balanced", assignedAt: iso(30) },
  { id: uid(), stationId: "station-b", stationName: "Loading Dock", cameraId: "cam-03", cameraName: "CAM-03 — Loading Bay North", roiStatus: ROIStatus.CONFIGURED, detectionFrequency: "2s", thresholdProfile: "high-sensitivity", assignedAt: iso(28) },
  { id: uid(), stationId: "station-c", stationName: "Assembly Line", cameraId: "cam-05", cameraName: "CAM-05 — Assembly Line 1", roiStatus: ROIStatus.PENDING, detectionFrequency: "5s", thresholdProfile: "balanced", assignedAt: iso(10) },
  { id: uid(), stationId: "station-d", stationName: "Warehouse", cameraId: "cam-08", cameraName: "CAM-08 — Warehouse Aisle A", roiStatus: ROIStatus.NOT_SET, detectionFrequency: "10s", thresholdProfile: "low-false-positive", assignedAt: iso(5) },
];

const intrusionVersions: ModelVersion[] = [
  { id: "v-intr-200", version: "v2.0.0", createdAt: iso(3), status: "current", notes: "Major retrain with expanded dataset" },
  { id: "v-intr-110", version: "v1.1.0", createdAt: iso(45), status: "previous", notes: "Tuned for night-time detection" },
  { id: "v-intr-100", version: "v1.0.0", createdAt: iso(90), status: "archived", notes: "Initial release" },
];

const intrusionAssignments: StationAssignment[] = [
  { id: uid(), stationId: "station-f", stationName: "Perimeter", cameraId: "cam-11", cameraName: "CAM-11 — Perimeter East", roiStatus: ROIStatus.CONFIGURED, detectionFrequency: "1s", thresholdProfile: "high-sensitivity", assignedAt: iso(40) },
  { id: uid(), stationId: "station-f", stationName: "Perimeter", cameraId: "cam-12", cameraName: "CAM-12 — Perimeter West", roiStatus: ROIStatus.CONFIGURED, detectionFrequency: "1s", thresholdProfile: "high-sensitivity", assignedAt: iso(40) },
];

const uploadConfig: ByomUploadConfig = {
  type: "upload",
  fileName: "fire-detect-v3.1.onnx",
  fileSize: 48_000_000,
  uploadedAt: iso(15),
  packageValidated: true,
};

const restConfig: ByomRestConfig = {
  type: "rest",
  endpointUrl: "https://ml-api.example.com/v1/defect-predict",
  authType: "api-key",
  connectionTested: true,
  lastTestedAt: iso(1),
  latencyMs: 42,
};

export const SEED_MODELS: AIModel[] = [
  {
    id: "model-ppe-detect",
    name: "PPE Compliance Detector",
    framework: ModelFramework.YOLO,
    category: ModelCategory.SAFETY_MONITORING,
    outputType: OutputType.BOUNDING_BOX,
    labels: ["helmet", "vest", "gloves", "goggles", "boots"],
    integrationType: IntegrationType.BUILT,
    sourceType: ModelSourceType.PRE_DEFINED,
    status: ModelStatus.DEPLOYED,
    createdAt: iso(120),
    updatedAt: iso(5),
    currentVersionId: "v-ppe-130",
    versions: ppeVersions,
    assignments: ppeAssignments,
    byomConfig: null,
    buildFlow: completedBuildFlow(),
    validationReport: passedValidation(),
  },
  {
    id: "model-intrusion",
    name: "Intrusion Detection",
    framework: ModelFramework.YOLO,
    category: ModelCategory.SECURITY,
    outputType: OutputType.BOUNDING_BOX,
    labels: ["person", "vehicle"],
    integrationType: IntegrationType.BUILT,
    sourceType: ModelSourceType.PRE_DEFINED,
    status: ModelStatus.PUBLISHED,
    createdAt: iso(95),
    updatedAt: iso(3),
    currentVersionId: "v-intr-200",
    versions: intrusionVersions,
    assignments: intrusionAssignments,
    byomConfig: null,
    buildFlow: completedBuildFlow(),
    validationReport: passedValidation(),
  },
  {
    id: "model-fire-smoke",
    name: "Fire & Smoke Detection",
    framework: ModelFramework.ONNX,
    category: ModelCategory.SAFETY_MONITORING,
    outputType: OutputType.CLASSIFICATION,
    labels: ["fire", "smoke", "normal"],
    integrationType: IntegrationType.BYOM_UPLOAD,
    sourceType: ModelSourceType.BYOM,
    status: ModelStatus.VALIDATED,
    createdAt: iso(30),
    updatedAt: iso(15),
    currentVersionId: "v-fire-100",
    versions: [
      { id: "v-fire-100", version: "v1.0.0", createdAt: iso(15), status: "current", notes: "Uploaded ONNX package, validated" },
    ],
    assignments: [],
    byomConfig: uploadConfig,
    buildFlow: emptyBuildFlow(),
    validationReport: passedValidation(),
  },
  {
    id: "model-defect-api",
    name: "Product Defect Classifier",
    framework: null,
    category: ModelCategory.QUALITY_CONTROL,
    outputType: OutputType.ANOMALY_SCORE,
    labels: ["scratch", "dent", "discoloration", "normal"],
    integrationType: IntegrationType.BYOM_REST,
    sourceType: ModelSourceType.BYOM,
    status: ModelStatus.VALIDATED,
    createdAt: iso(20),
    updatedAt: iso(1),
    currentVersionId: null,
    versions: [],
    assignments: [
      { id: uid(), stationId: "station-c", stationName: "Assembly Line", cameraId: "cam-07", cameraName: "CAM-07 — QC Station", roiStatus: ROIStatus.CONFIGURED, detectionFrequency: "2s", thresholdProfile: "high-sensitivity", assignedAt: iso(8) },
    ],
    byomConfig: restConfig,
    buildFlow: emptyBuildFlow(),
    validationReport: passedValidation(),
  },
  {
    id: "model-crowd-analytics",
    name: "Crowd Density Analytics",
    framework: ModelFramework.PYTORCH,
    category: ModelCategory.ANALYTICS,
    outputType: OutputType.SEGMENTATION,
    labels: ["low-density", "medium-density", "high-density", "overcrowded"],
    integrationType: IntegrationType.BUILT,
    sourceType: ModelSourceType.BUILD_YOUR_MODEL,
    status: ModelStatus.DRAFT,
    createdAt: iso(7),
    updatedAt: iso(2),
    currentVersionId: null,
    versions: [],
    assignments: [],
    byomConfig: null,
    buildFlow: partialBuildFlow(4),
    validationReport: null,
  },
  {
    id: "model-forklift-safety",
    name: "Forklift Safety Monitor",
    framework: ModelFramework.TENSORFLOW,
    category: ModelCategory.SAFETY_MONITORING,
    outputType: OutputType.KEYPOINT,
    labels: ["forklift", "pedestrian", "collision-zone"],
    integrationType: IntegrationType.BUILT,
    sourceType: ModelSourceType.BUILD_YOUR_MODEL,
    status: ModelStatus.DRAFT,
    createdAt: iso(3),
    updatedAt: iso(1),
    currentVersionId: null,
    versions: [],
    assignments: [],
    byomConfig: null,
    buildFlow: partialBuildFlow(2),
    validationReport: null,
  },
];
