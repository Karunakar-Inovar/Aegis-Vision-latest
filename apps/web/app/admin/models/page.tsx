"use client";

import { useState, useEffect, useCallback, useMemo, useRef } from "react";
import { useRouter } from "next/navigation";
import {
  Card,
  CardContent,
  Button,
  Icon,
  Badge,
  Input,
  ToggleSwitch,
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  AlertDialog,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
  Label,
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
  Checkbox,
  Snackbar,
  useSnackbar,
  Progress,
} from "ui";
import {
  Plus,
  Search,
  Pencil,
  Trash2,
  Brain,
  Upload,
  Globe,
  Cpu,
  Camera,
  Check,
  CheckCircle2,
  ArrowLeft,
  ArrowRight,
  Shield,
  Timer,
  Loader2,
  Save,
  Activity,
  X,
  XCircle,
  File,
  ChevronDown,
  ChevronUp,
  Clock,
  AlertCircle,
} from "ui/utils/icons";
import {
  useDebounce,
  featureFlags,
  uploadModel as byomUploadModel,
  validateModel as byomValidateModel,
  createUseCase as byomCreateUseCase,
  BYOM_MODEL_TYPES,
  BYOM_VERSIONS,
} from "app";
import type { ByomValidationResult, ByomModelType } from "app";
import { UI_MESSAGES } from "app/constants";
import {
  useModelStore,
  useHasHydrated,
  IntegrationType,
  ModelSourceType,
  ModelStatus,
  ModelCategory,
  ModelFramework,
  OutputType,
  BuildStep,
  BuildStepStatus,
  BUILD_STEP_LABELS,
  SOURCE_TYPE_LABELS,
  INTEGRATION_TYPE_LABELS,
  MODEL_STATUS_LABELS,
  MOCK_STATIONS,
  MOCK_CAMERAS,
  type AIModel,
  type ModelCategory as ModelCategoryType,
  type OutputType as OutputTypeVal,
  type ModelFramework as ModelFrameworkVal,
  type PackageManifest,
  type LabelMapping,
  type ByomContract,
  type ValidationCheck,
  type ValidationReport,
} from "app/store/models";

// ── Badge helpers ────────────────────────────────────────────────────────────
const frameworkColors: Record<string, string> = {
  YOLO: "bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-900/30 dark:text-blue-400",
  TensorFlow: "bg-orange-50 text-orange-700 border-orange-200 dark:bg-orange-900/30 dark:text-orange-400",
  PyTorch: "bg-red-50 text-red-700 border-red-200 dark:bg-red-900/30 dark:text-red-400",
  ONNX: "bg-cyan-50 text-cyan-700 border-cyan-200 dark:bg-cyan-900/30 dark:text-cyan-400",
  OpenVINO: "bg-indigo-50 text-indigo-700 border-indigo-200 dark:bg-indigo-900/30 dark:text-indigo-400",
  Custom: "bg-gray-50 text-gray-600 border-gray-200 dark:bg-gray-900/30 dark:text-gray-400",
};

const integrationColors: Record<string, string> = {
  [IntegrationType.BUILT]: "bg-violet-50 text-violet-700 border-violet-200 dark:bg-violet-900/30 dark:text-violet-400",
  [IntegrationType.BYOM_UPLOAD]: "bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-900/30 dark:text-amber-400",
  [IntegrationType.BYOM_REST]: "bg-teal-50 text-teal-700 border-teal-200 dark:bg-teal-900/30 dark:text-teal-400",
};

const statusColors: Record<string, string> = {
  [ModelStatus.DRAFT]: "bg-slate-50 text-slate-600 border-slate-200 dark:bg-slate-900/30 dark:text-slate-400",
  [ModelStatus.VALIDATED]: "bg-sky-50 text-sky-700 border-sky-200 dark:bg-sky-900/30 dark:text-sky-400",
  [ModelStatus.PUBLISHED]: "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-900/30 dark:text-emerald-400",
  [ModelStatus.DEPLOYED]: "bg-purple-50 text-purple-700 border-purple-200 dark:bg-purple-900/30 dark:text-purple-400",
};

const sourceTypeColors: Record<string, string> = {
  [ModelSourceType.PRE_DEFINED]: "bg-zinc-100 text-zinc-700 border-zinc-300 dark:bg-zinc-800/40 dark:text-zinc-300",
  [ModelSourceType.BYOM]: "bg-fuchsia-50 text-fuchsia-700 border-fuchsia-200 dark:bg-fuchsia-900/30 dark:text-fuchsia-400",
  [ModelSourceType.BUILD_YOUR_MODEL]: "bg-lime-50 text-lime-700 border-lime-200 dark:bg-lime-900/30 dark:text-lime-400",
};

const isDeployed = (m: AIModel) => m.status === ModelStatus.DEPLOYED;

// ── Option data ──────────────────────────────────────────────────────────────
const categoryOptions: { value: ModelCategoryType; label: string }[] = [
  { value: ModelCategory.QUALITY_CONTROL, label: "Quality Control" },
  { value: ModelCategory.SAFETY_MONITORING, label: "Safety Monitoring" },
  { value: ModelCategory.SECURITY, label: "Security" },
  { value: ModelCategory.ANALYTICS, label: "Analytics" },
  { value: ModelCategory.CUSTOM, label: "Custom" },
];

const outputTypeOptions: { value: OutputTypeVal; label: string }[] = [
  { value: OutputType.BOUNDING_BOX, label: "Bounding Box" },
  { value: OutputType.CLASSIFICATION, label: "Classification" },
  { value: OutputType.SEGMENTATION, label: "Segmentation" },
  { value: OutputType.KEYPOINT, label: "Keypoint Detection" },
  { value: OutputType.ANOMALY_SCORE, label: "Anomaly Score" },
];

const frameworkOptions: { value: ModelFrameworkVal; label: string }[] = [
  { value: ModelFramework.YOLO, label: "YOLO" },
  { value: ModelFramework.TENSORFLOW, label: "TensorFlow" },
  { value: ModelFramework.PYTORCH, label: "PyTorch" },
  { value: ModelFramework.ONNX, label: "ONNX" },
  { value: ModelFramework.OPENVINO, label: "OpenVINO" },
  { value: ModelFramework.CUSTOM, label: "Custom" },
];

const CATEGORY_LABEL_MAP: Record<string, string> = Object.fromEntries(
  categoryOptions.map((o) => [o.value, o.label])
);

const mockStationOptions = MOCK_STATIONS.map((s) => ({
  value: s.id,
  label: `${s.name} — ${s.location}`,
}));

const mockCameraOptions = MOCK_CAMERAS.map((c) => ({
  value: c.id,
  label: c.name,
  stationId: c.stationId,
}));

function uid(): string {
  return Math.random().toString(36).slice(2, 10);
}

// ── Wizard types ─────────────────────────────────────────────────────────────
type ModelPath = "build" | "bring" | null;
type BringMethod = "upload" | "rest" | null;
type AuthType = "none" | "api-key" | "bearer";

interface WizardState {
  step: number;
  path: ModelPath;
  bringMethod: BringMethod;
  uploadedFile: string | null;
  uploadedFileSize: number;
  packageValidated: boolean;
  isValidating: boolean;
  packageManifest: PackageManifest | null;
  packageValidationChecks: ValidationCheck[];
  endpointUrl: string;
  authType: AuthType;
  apiKey: string;
  bearerToken: string;
  timeoutMs: number;
  showAdvanced: boolean;
  connectionTested: boolean;
  isTesting: boolean;
  restTestLatencyMs: number | null;
  restTestError: string | null;
  restValidationChecks: ValidationCheck[];
  restSampleOutput: Record<string, unknown> | null;
  contractInputType: string;
  contractOutputType: string;
  contractLabelMappings: LabelMapping[];
  selectedStation: string;
  selectedSources: string[];
  modelName: string;
  category: string;
  outputType: string;
  labels: string;
  validationChecks: {
    contractValid: boolean;
    latencyOk: boolean;
    sampleInferenceOk: boolean;
    securityOk: boolean;
  };
  isRunningValidation: boolean;
  // ── BYOM Upload wizard (new flow) ─────────────────────────────────────
  byomModelName: string;
  byomModelType: ByomModelType;
  byomVersion: string;
  byomFile: File | null;
  byomFileName: string | null;
  byomFileSize: number;
  byomUploadId: string | null;
  byomUploading: boolean;
  byomUploadError: string | null;
  byomDuplicateError: string | null;
  byomValidating: boolean;
  byomValidationResult: ByomValidationResult | null;
  byomValidationError: string | null;
  byomUseCaseName: string;
  byomActivate: boolean;
  byomClasses: string[];
  byomClassInput: string;
  byomCreating: boolean;
  byomCreateError: string | null;
}

const initialWizardState: WizardState = {
  step: 1,
  path: null,
  bringMethod: null,
  uploadedFile: null,
  uploadedFileSize: 0,
  packageValidated: false,
  isValidating: false,
  packageManifest: null,
  packageValidationChecks: [],
  endpointUrl: "",
  authType: "none",
  apiKey: "",
  bearerToken: "",
  timeoutMs: 30000,
  showAdvanced: false,
  connectionTested: false,
  isTesting: false,
  restTestLatencyMs: null,
  restTestError: null,
  restValidationChecks: [],
  restSampleOutput: null,
  contractInputType: "image/jpeg, image/png",
  contractOutputType: "detection-boxes + class + confidence",
  contractLabelMappings: [{ externalLabel: "", internalLabel: "" }],
  selectedStation: "",
  selectedSources: [],
  modelName: "",
  category: "",
  outputType: "",
  labels: "",
  validationChecks: {
    contractValid: false,
    latencyOk: false,
    sampleInferenceOk: false,
    securityOk: false,
  },
  isRunningValidation: false,
  // BYOM upload wizard
  byomModelName: "",
  byomModelType: "YOLO" as ByomModelType,
  byomVersion: "v8",
  byomFile: null,
  byomFileName: null,
  byomFileSize: 0,
  byomUploadId: null,
  byomUploading: false,
  byomUploadError: null,
  byomDuplicateError: null,
  byomValidating: false,
  byomValidationResult: null,
  byomValidationError: null,
  byomUseCaseName: "",
  byomActivate: true,
  byomClasses: [],
  byomClassInput: "",
  byomCreating: false,
  byomCreateError: null,
};

const WIZARD_STEPS_DEFAULT = [
  { label: "Choose Path", number: 1 },
  { label: "Configure", number: 2 },
  { label: "Model Identity", number: 3 },
  { label: "Validation", number: 4 },
];

const WIZARD_STEPS_BYOM = [
  { label: "Choose Path", number: 1 },
  { label: "Upload Model", number: 2 },
  { label: "Validation", number: 3 },
  { label: "Create Use Case", number: 4 },
];

/** Build a fresh empty BuildFlowProgress. */
function emptyBuildFlow() {
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

function formatBytes(bytes: number): string {
  if (bytes === 0) return "0 B";
  const units = ["B", "KB", "MB", "GB"];
  const i = Math.min(Math.floor(Math.log(bytes) / Math.log(1024)), units.length - 1);
  const value = bytes / Math.pow(1024, i);
  return `${value.toFixed(i === 0 ? 0 : 1)} ${units[i]}`;
}

// ── Package validation helpers ────────────────────────────────────────────────

const SUPPORTED_FRAMEWORKS = ["YOLO", "PyTorch", "TensorFlow", "ONNX", "OpenVINO"];
const SUPPORTED_OUTPUT_TYPES = ["bounding-box", "classification", "segmentation", "keypoint", "anomaly-score"];

const FRAMEWORK_MAP: Record<string, ModelFrameworkVal> = {
  YOLO: ModelFramework.YOLO,
  PyTorch: ModelFramework.PYTORCH,
  TensorFlow: ModelFramework.TENSORFLOW,
  ONNX: ModelFramework.ONNX,
  OpenVINO: ModelFramework.OPENVINO,
};

function generateMockManifest(fileName: string, fileSize: number): PackageManifest {
  const lower = fileName.toLowerCase();
  const baseName = fileName.replace(/\.zip$/i, "");

  let framework = "ONNX";
  if (lower.includes("yolo")) framework = "YOLO";
  else if (lower.includes("pytorch") || lower.includes("torch")) framework = "PyTorch";
  else if (lower.includes("tensorflow") || lower.includes("tf-")) framework = "TensorFlow";
  else if (lower.includes("openvino")) framework = "OpenVINO";
  else if (lower.includes("onnx")) framework = "ONNX";

  const modelName = baseName
    .replace(/[-_]+/g, " ")
    .replace(/\b\w/g, (c) => c.toUpperCase());

  let labels: string[];
  if (/fire|smoke|flame/.test(lower)) labels = ["fire", "smoke", "normal"];
  else if (/ppe|helmet|safety/.test(lower)) labels = ["helmet", "vest", "gloves", "goggles"];
  else if (/defect|quality|scratch/.test(lower)) labels = ["scratch", "dent", "discoloration", "normal"];
  else if (/intrusion|security|person/.test(lower)) labels = ["person", "vehicle"];
  else if (/crowd|density/.test(lower)) labels = ["low-density", "medium-density", "high-density"];
  else labels = ["class_0", "class_1", "class_2"];

  let outputType = "bounding-box";
  if (/classif/.test(lower)) outputType = "classification";
  else if (/segment/.test(lower)) outputType = "segmentation";
  else if (/keypoint|pose/.test(lower)) outputType = "keypoint";
  else if (/anomaly|score/.test(lower)) outputType = "anomaly-score";

  const ext =
    framework === "ONNX" ? "onnx"
    : framework === "PyTorch" ? "pt"
    : framework === "TensorFlow" ? "pb"
    : "bin";

  return {
    modelName,
    framework,
    outputType,
    labels,
    inputFormat: { width: 640, height: 640, channels: 3, encoding: "RGB" },
    weightsFile: `weights.${ext}`,
  };
}

function buildPackageChecks(manifest: PackageManifest, fileSize: number): ValidationCheck[] {
  const now = new Date().toISOString();
  const fwOk = SUPPORTED_FRAMEWORKS.includes(manifest.framework);
  const otOk = SUPPORTED_OUTPUT_TYPES.includes(manifest.outputType);
  const labelsOk = manifest.labels.length > 0;
  const inputOk =
    manifest.inputFormat.width > 0 &&
    manifest.inputFormat.height > 0 &&
    manifest.inputFormat.channels > 0;
  const weightsOk = fileSize > 1024;

  return [
    {
      key: "manifest_found",
      label: "Manifest Found",
      description: "manifest.json located in archive root",
      passed: true,
      fixMessage: null,
      checkedAt: now,
    },
    {
      key: "schema_valid",
      label: "Schema Valid",
      description: "manifest.json conforms to AegisVision package schema v2",
      passed: true,
      fixMessage: null,
      checkedAt: now,
    },
    {
      key: "model_name",
      label: "Model Name Present",
      description: `Found: "${manifest.modelName}"`,
      passed: !!manifest.modelName.trim(),
      fixMessage: !manifest.modelName.trim()
        ? 'Add a non-empty "modelName" string to manifest.json'
        : null,
      checkedAt: now,
    },
    {
      key: "output_type",
      label: "Output Type Recognized",
      description: otOk
        ? `${manifest.outputType} \u2014 supported`
        : `"${manifest.outputType}" is not a recognized output type`,
      passed: otOk,
      fixMessage: otOk
        ? null
        : `Set "outputType" to one of: ${SUPPORTED_OUTPUT_TYPES.join(", ")}`,
      checkedAt: now,
    },
    {
      key: "labels_defined",
      label: "Labels Defined",
      description: labelsOk
        ? `${manifest.labels.length} label${manifest.labels.length > 1 ? "s" : ""}: ${manifest.labels.join(", ")}`
        : "No labels found in manifest",
      passed: labelsOk,
      fixMessage: labelsOk
        ? null
        : 'Add a non-empty "labels" array to manifest.json',
      checkedAt: now,
    },
    {
      key: "input_format",
      label: "Input Format Valid",
      description: inputOk
        ? `${manifest.inputFormat.width}\u00d7${manifest.inputFormat.height}\u00d7${manifest.inputFormat.channels} ${manifest.inputFormat.encoding}`
        : "Invalid input dimensions",
      passed: inputOk,
      fixMessage: inputOk
        ? null
        : 'Specify "inputFormat" with width, height, channels > 0',
      checkedAt: now,
    },
    {
      key: "framework_supported",
      label: "Framework Supported",
      description: fwOk
        ? `${manifest.framework} \u2014 supported`
        : `"${manifest.framework}" is not a supported framework`,
      passed: fwOk,
      fixMessage: fwOk
        ? null
        : `Set "framework" to one of: ${SUPPORTED_FRAMEWORKS.join(", ")}`,
      checkedAt: now,
    },
    {
      key: "weights_found",
      label: "Weights File Present",
      description: weightsOk
        ? `${manifest.weightsFile} (${formatBytes(fileSize)})`
        : `${manifest.weightsFile} not found or archive is empty`,
      passed: weightsOk,
      fixMessage: weightsOk
        ? null
        : "Include the model weights binary referenced in manifest.json",
      checkedAt: now,
    },
  ];
}

function guessCategoryFromLabels(labels: string[]): ModelCategoryType {
  const joined = labels.join(" ").toLowerCase();
  if (/fire|smoke|flame|ppe|helmet|vest|safety/.test(joined)) return ModelCategory.SAFETY_MONITORING;
  if (/person|intrusion|vehicle|weapon|security/.test(joined)) return ModelCategory.SECURITY;
  if (/scratch|dent|defect|discoloration|quality|anomaly/.test(joined)) return ModelCategory.QUALITY_CONTROL;
  if (/crowd|density|count|heatmap|analytics/.test(joined)) return ModelCategory.ANALYTICS;
  return ModelCategory.CUSTOM;
}

const TOTAL_PKG_CHECKS = 8;

// ══════════════════════════════════════════════════════════════════════════════
//  Add Model Wizard Component
// ══════════════════════════════════════════════════════════════════════════════
function AddModelWizard({
  open,
  onOpenChange,
  onModelSaved,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onModelSaved: (model: AIModel) => void;
}) {
  const router = useRouter();
  const [wiz, setWiz] = useState<WizardState>(initialWizardState);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const byomFileInputRef = useRef<HTMLInputElement>(null);
  const setDraftByomConfig = useModelStore((s) => s.setDraftByomConfig);

  const update = useCallback(
    (patch: Partial<WizardState>) => setWiz((prev) => ({ ...prev, ...patch })),
    []
  );

  useEffect(() => {
    if (!open) {
      const timeout = setTimeout(() => {
        setWiz(initialWizardState);
        setDraftByomConfig(null);
      }, 200);
      return () => clearTimeout(timeout);
    }
  }, [open, setDraftByomConfig]);

  // Sync BYOM config into the store as the user types
  useEffect(() => {
    if (wiz.path !== "bring" || !wiz.bringMethod) return;

    const contract: ByomContract | undefined =
      wiz.contractInputType.trim() && wiz.contractOutputType.trim()
        ? {
            inputType: wiz.contractInputType,
            outputType: wiz.contractOutputType,
            labelMappings: wiz.contractLabelMappings.filter(
              (m) => m.externalLabel.trim() && m.internalLabel.trim(),
            ),
          }
        : undefined;

    if (wiz.bringMethod === "upload") {
      if (!wiz.uploadedFile) { setDraftByomConfig(null); return; }
      setDraftByomConfig({
        type: "upload",
        fileName: wiz.uploadedFile,
        fileSize: wiz.uploadedFileSize,
        uploadedAt: new Date().toISOString(),
        packageValidated: wiz.packageValidated,
        manifest: wiz.packageManifest ?? undefined,
        contract,
      });
    } else {
      setDraftByomConfig({
        type: "rest",
        endpointUrl: wiz.endpointUrl,
        authType: wiz.authType,
        apiKey: wiz.authType === "api-key" ? wiz.apiKey : undefined,
        bearerToken: wiz.authType === "bearer" ? wiz.bearerToken : undefined,
        timeoutMs: wiz.timeoutMs,
        connectionTested: wiz.connectionTested,
        lastTestedAt: wiz.connectionTested ? new Date().toISOString() : null,
        latencyMs: wiz.restTestLatencyMs,
        contract,
      });
    }
  }, [
    wiz.path, wiz.bringMethod, wiz.uploadedFile, wiz.uploadedFileSize,
    wiz.packageValidated, wiz.packageManifest, wiz.endpointUrl, wiz.authType,
    wiz.apiKey, wiz.bearerToken, wiz.timeoutMs, wiz.connectionTested,
    wiz.restTestLatencyMs, wiz.contractInputType, wiz.contractOutputType,
    wiz.contractLabelMappings, setDraftByomConfig,
  ]);

  const isByomUpload = wiz.path === "bring" && wiz.bringMethod === "upload";
  const isByomRest = featureFlags.byomRest && wiz.path === "bring" && wiz.bringMethod === "rest";
  const wizardSteps = isByomUpload ? WIZARD_STEPS_BYOM : WIZARD_STEPS_DEFAULT;
  const totalSteps = 4;
  const progress = (wiz.step / totalSteps) * 100;

  const canProceed = (): boolean => {
    if (isByomUpload) {
      switch (wiz.step) {
        case 1:
          if (!featureFlags.byom) return false;
          return wiz.path === "bring";
        case 2:
          return (
            wiz.byomModelName.trim() !== "" &&
            wiz.byomFileName !== null &&
            !wiz.byomUploading &&
            !wiz.byomDuplicateError
          );
        case 3:
          return wiz.byomValidationResult?.status === "pass";
        case 4:
          return wiz.byomUseCaseName.trim() !== "" && !wiz.byomCreating && wiz.byomClasses.length > 0;
        default:
          return false;
      }
    }
    switch (wiz.step) {
      case 1:
        if (wiz.path === "build" && !featureFlags.buildOwnModel) return false;
        if (wiz.path === "bring" && !featureFlags.byom) return false;
        if (wiz.path === "bring") return wiz.bringMethod !== null;
        return wiz.path !== null;
      case 2:
        if (wiz.path === "bring" && wiz.bringMethod === "rest")
          return wiz.connectionTested && isContractValid;
        if (wiz.path === "build")
          return wiz.selectedStation !== "" && wiz.selectedSources.length > 0;
        return false;
      case 3:
        return (
          wiz.modelName.trim() !== "" &&
          wiz.category !== "" &&
          wiz.outputType !== "" &&
          wiz.labels.trim() !== ""
        );
      case 4:
        return Object.values(wiz.validationChecks).every(Boolean);
      default:
        return false;
    }
  };

  const handleNext = () => {
    if (isByomUpload && wiz.step === 2) {
      handleByomUploadAndValidate();
      return;
    }
    if (wiz.step < totalSteps && canProceed()) update({ step: wiz.step + 1 });
  };
  const handleBack = () => {
    if (isByomUpload && wiz.step === 3) {
      update({
        step: 2,
        byomUploadId: null,
        byomValidating: false,
        byomValidationResult: null,
        byomValidationError: null,
        byomUploadError: null,
      });
      return;
    }
    if (wiz.step > 1) update({ step: wiz.step - 1 });
  };

  // ── BYOM: Upload → auto-advance to Validation step ──────────────────
  const handleByomUploadAndValidate = async () => {
    if (!wiz.byomFile || !wiz.byomFileName) return;
    update({
      byomUploading: true,
      byomUploadError: null,
      byomDuplicateError: null,
      byomValidating: false,
      byomValidationResult: null,
      byomValidationError: null,
    });

    try {
      const { uploadId } = await byomUploadModel(
        {
          modelName: wiz.byomModelName.trim(),
          modelType: wiz.byomModelType,
          version: wiz.byomVersion,
          fileName: wiz.byomFileName,
          fileSize: wiz.byomFileSize,
        },
        wiz.byomFile,
      );
      update({ byomUploadId: uploadId, byomUploading: false, step: 3, byomValidating: true });

      try {
        const result = await byomValidateModel(uploadId);
        update({ byomValidating: false, byomValidationResult: result });
      } catch (valErr) {
        update({
          byomValidating: false,
          byomValidationError: valErr instanceof Error ? valErr.message : "Validation failed",
        });
      }
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Upload failed";
      const isDuplicate = msg.toLowerCase().includes("already exists");
      update({
        byomUploading: false,
        ...(isDuplicate
          ? { byomDuplicateError: msg }
          : { byomUploadError: msg }),
      });
    }
  };

  // ── BYOM: Create Use Case (final step submit) ───────────────────────
  const handleByomCreateUseCase = async () => {
    if (!wiz.byomUploadId) return;
    update({ byomCreating: true, byomCreateError: null });

    try {
      const { catalogItem } = await byomCreateUseCase({
        uploadId: wiz.byomUploadId,
        useCaseName: wiz.byomUseCaseName.trim(),
        isActive: wiz.byomActivate,
        classes: wiz.byomClasses,
      });

      const newModel: AIModel = {
        id: catalogItem.id,
        name: catalogItem.modelName,
        framework: ModelFramework.YOLO,
        category: ModelCategory.CUSTOM as ModelCategoryType,
        outputType: OutputType.BOUNDING_BOX as OutputTypeVal,
        labels: wiz.byomClasses,
        integrationType: IntegrationType.BYOM_UPLOAD,
        sourceType: ModelSourceType.BYOM,
        status: ModelStatus.VALIDATED,
        createdAt: catalogItem.createdAt,
        updatedAt: catalogItem.createdAt,
        currentVersionId: null,
        versions: [],
        assignments: [],
        byomConfig: {
          type: "upload",
          fileName: wiz.byomFileName!,
          fileSize: wiz.byomFileSize,
          uploadedAt: catalogItem.createdAt,
          packageValidated: true,
        },
        buildFlow: emptyBuildFlow(),
        validationReport: null,
      };

      onModelSaved(newModel);
      setDraftByomConfig(null);
      onOpenChange(false);
      router.push(`/admin/models/${newModel.id}`);
    } catch (err) {
      update({
        byomCreating: false,
        byomCreateError: err instanceof Error ? err.message : "Failed to create use case",
      });
    }
  };

  // ── BYOM: File selection handler ────────────────────────────────────
  const handleByomFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    update({
      byomFile: file,
      byomFileName: file.name,
      byomFileSize: file.size,
      byomUploadError: null,
      byomDuplicateError: null,
    });
    if (byomFileInputRef.current) byomFileInputRef.current.value = "";
  };

  const handleValidatePackage = () => {
    update({
      isValidating: true,
      packageValidated: false,
      packageManifest: null,
      packageValidationChecks: [],
    });

    const manifest = generateMockManifest(wiz.uploadedFile!, wiz.uploadedFileSize);
    const checks = buildPackageChecks(manifest, wiz.uploadedFileSize);

    checks.forEach((check, i) => {
      setTimeout(() => {
        setWiz((prev) => {
          const updated = [...prev.packageValidationChecks, check];
          const isLast = i === checks.length - 1;
          const allPassed = isLast && updated.every((c) => c.passed);

          return {
            ...prev,
            packageValidationChecks: updated,
            ...(isLast
              ? {
                  isValidating: false,
                  packageValidated: allPassed,
                  packageManifest: manifest,
                  ...(allPassed
                    ? {
                        modelName: prev.modelName || manifest.modelName,
                        category: prev.category || guessCategoryFromLabels(manifest.labels),
                        outputType: prev.outputType || manifest.outputType,
                        labels: prev.labels || manifest.labels.join(", "),
                      }
                    : {}),
                }
              : {}),
          };
        });
      }, (i + 1) * 350);
    });
  };

  const handleTestConnection = async () => {
    update({
      isTesting: true,
      connectionTested: false,
      restTestLatencyMs: null,
      restTestError: null,
      restValidationChecks: [],
      restSampleOutput: null,
    });

    try {
      const res = await fetch("/api/byom/test-endpoint", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          url: wiz.endpointUrl,
          authType: wiz.authType,
          apiKey: wiz.authType === "api-key" ? wiz.apiKey : undefined,
          bearerToken: wiz.authType === "bearer" ? wiz.bearerToken : undefined,
          timeoutMs: wiz.timeoutMs,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        update({
          isTesting: false,
          restTestError: data.error || `Server error ${res.status}`,
        });
        return;
      }

      const now = new Date().toISOString();
      const checks: ValidationCheck[] = (data.checks ?? []).map(
        (c: { key: string; label: string; description: string; passed: boolean; fixMessage: string | null }) => ({
          ...c,
          checkedAt: now,
        }),
      );

      update({
        isTesting: false,
        connectionTested: data.success === true,
        restTestLatencyMs: data.latencyMs ?? null,
        restValidationChecks: checks,
        restSampleOutput: data.sampleOutput ?? null,
      });
    } catch (err) {
      update({
        isTesting: false,
        restTestError:
          err instanceof Error ? err.message : "Network request failed",
      });
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    update({
      uploadedFile: file.name,
      uploadedFileSize: file.size,
      packageValidated: false,
      packageManifest: null,
      packageValidationChecks: [],
    });
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const addLabelMapping = () => {
    setWiz((prev) => ({
      ...prev,
      contractLabelMappings: [
        ...prev.contractLabelMappings,
        { externalLabel: "", internalLabel: "" },
      ],
    }));
  };

  const updateLabelMapping = (
    idx: number,
    field: "externalLabel" | "internalLabel",
    value: string,
  ) => {
    setWiz((prev) => {
      const next = [...prev.contractLabelMappings];
      next[idx] = { ...next[idx]!, [field]: value };
      return { ...prev, contractLabelMappings: next };
    });
  };

  const removeLabelMapping = (idx: number) => {
    setWiz((prev) => ({
      ...prev,
      contractLabelMappings: prev.contractLabelMappings.filter((_, i) => i !== idx),
    }));
  };

  const isContractValid =
    wiz.contractInputType.trim() !== "" &&
    wiz.contractOutputType.trim() !== "" &&
    wiz.contractLabelMappings.length > 0 &&
    wiz.contractLabelMappings.every(
      (m) => m.externalLabel.trim() !== "" && m.internalLabel.trim() !== "",
    );

  const ContractSection = () => (
    <div className="rounded-lg border border-border overflow-hidden">
      <div className="px-4 py-2.5 bg-muted/40 border-b border-border">
        <h4 className="text-sm font-semibold text-foreground flex items-center gap-2">
          <Icon icon={Shield} className="h-4 w-4 text-muted-foreground" />
          Model Contract
        </h4>
        <p className="text-xs text-muted-foreground mt-0.5">
          Define the expected input/output schema and label mapping. Required for validation.
        </p>
      </div>
      <div className="p-4 space-y-4">
        {/* Input type */}
        <div className="space-y-1.5">
          <Label htmlFor="contract-input">Input Type</Label>
          <Input
            id="contract-input"
            value={wiz.contractInputType}
            onChangeText={(v) => update({ contractInputType: v })}
            placeholder="image/jpeg, image/png"
          />
          <p className="text-xs text-muted-foreground">
            MIME types the model accepts (e.g. image/jpeg, image/png).
          </p>
        </div>

        {/* Output type */}
        <div className="space-y-1.5">
          <Label htmlFor="contract-output">Output Type</Label>
          <Input
            id="contract-output"
            value={wiz.contractOutputType}
            onChangeText={(v) => update({ contractOutputType: v })}
            placeholder="detection-boxes + class + confidence"
          />
          <p className="text-xs text-muted-foreground">
            Description of what the model returns.
          </p>
        </div>

        {/* Label mapping table */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label>Label Mapping</Label>
            <Button
              variant="outline"
              size="sm"
              onPress={addLabelMapping}
              className="h-7 text-xs"
            >
              <Icon icon={Plus} className="h-3 w-3 mr-1" />
              Add Row
            </Button>
          </div>

          <div className="rounded-md border border-border overflow-hidden">
            {/* Header */}
            <div className="grid grid-cols-[1fr_auto_1fr_auto] items-center gap-2 px-3 py-2 bg-muted/50 border-b border-border text-xs font-medium text-muted-foreground">
              <span>External Label</span>
              <span />
              <span>Internal Label</span>
              <span />
            </div>

            {/* Rows */}
            {wiz.contractLabelMappings.length === 0 ? (
              <div className="px-3 py-4 text-center text-xs text-muted-foreground">
                No mappings added. Click "Add Row" above.
              </div>
            ) : (
              wiz.contractLabelMappings.map((m, idx) => (
                <div
                  key={idx}
                  className="grid grid-cols-[1fr_auto_1fr_auto] items-center gap-2 px-3 py-2 border-b border-border last:border-b-0"
                >
                  <Input
                    value={m.externalLabel}
                    onChangeText={(v) => updateLabelMapping(idx, "externalLabel", v)}
                    placeholder="e.g. hard_hat"
                    className="h-8 text-xs"
                  />
                  <Icon icon={ArrowRight} className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                  <Input
                    value={m.internalLabel}
                    onChangeText={(v) => updateLabelMapping(idx, "internalLabel", v)}
                    placeholder="e.g. Hardhat"
                    className="h-8 text-xs"
                  />
                  <button
                    type="button"
                    onClick={() => removeLabelMapping(idx)}
                    className="p-1 rounded hover:bg-muted transition-colors shrink-0"
                  >
                    <Icon icon={Trash2} className="h-3.5 w-3.5 text-muted-foreground hover:text-red-500" />
                  </button>
                </div>
              ))
            )}
          </div>

          <p className="text-xs text-muted-foreground">
            Map each external model label to the internal AegisVision label. At least one mapping is required.
          </p>
        </div>
      </div>

      {/* Footer validation hint */}
      {!isContractValid && (
        <div className="px-4 py-2 border-t border-border bg-amber-50/50 dark:bg-amber-900/10">
          <div className="flex items-center gap-1.5">
            <Icon icon={AlertCircle} className="h-3.5 w-3.5 text-amber-500" />
            <span className="text-xs text-amber-700 dark:text-amber-400">
              Complete all contract fields to proceed.
            </span>
          </div>
        </div>
      )}
    </div>
  );

  const handleRunValidation = () => {
    update({ isRunningValidation: true });
    const isByom = wiz.path === "bring";
    const contractPasses = isByom ? isContractValid : true;

    const checks: { key: "contractValid" | "latencyOk" | "sampleInferenceOk" | "securityOk"; pass: boolean }[] = [
      { key: "contractValid", pass: contractPasses },
      { key: "latencyOk", pass: true },
      { key: "sampleInferenceOk", pass: true },
      { key: "securityOk", pass: true },
    ];
    const delays = [800, 1600, 2400, 3200];
    checks.forEach(({ key, pass }, i) => {
      setTimeout(() => {
        setWiz((prev) => ({
          ...prev,
          validationChecks: { ...prev.validationChecks, [key]: pass },
          isRunningValidation: i < checks.length - 1,
        }));
      }, delays[i]!);
    });
  };

  const handleSaveAsDraft = () => {
    const intType: IntegrationType =
      wiz.path === "build"
        ? IntegrationType.BUILT
        : wiz.bringMethod === "upload"
          ? IntegrationType.BYOM_UPLOAD
          : IntegrationType.BYOM_REST;

    const storedConfig = useModelStore.getState().draftByomConfig;

    const pkgAllPassed =
      intType === IntegrationType.BYOM_UPLOAD &&
      wiz.packageValidationChecks.length > 0 &&
      wiz.packageValidationChecks.every((c) => c.passed);

    const restAllPassed =
      intType === IntegrationType.BYOM_REST &&
      wiz.restValidationChecks.length > 0 &&
      wiz.restValidationChecks.every((c) => c.passed);

    const byomValidated = pkgAllPassed || restAllPassed;

    const manifestFramework =
      wiz.packageManifest?.framework
        ? FRAMEWORK_MAP[wiz.packageManifest.framework] ?? ModelFramework.CUSTOM
        : ModelFramework.CUSTOM;

    const byomChecks =
      intType === IntegrationType.BYOM_UPLOAD
        ? wiz.packageValidationChecks
        : intType === IntegrationType.BYOM_REST
          ? wiz.restValidationChecks
          : [];

    const validationReport: ValidationReport | null =
      byomChecks.length > 0
        ? {
            runAt: new Date().toISOString(),
            allPassed: byomValidated,
            checks: byomChecks,
          }
        : null;

    const srcType: ModelSourceType =
      wiz.path === "build" ? ModelSourceType.BUILD_YOUR_MODEL : ModelSourceType.BYOM;

    const newModel: AIModel = {
      id: `model-${uid()}`,
      name: wiz.modelName,
      framework: intType === IntegrationType.BYOM_UPLOAD ? manifestFramework : ModelFramework.CUSTOM,
      category: (wiz.category || ModelCategory.CUSTOM) as ModelCategoryType,
      outputType: (wiz.outputType || OutputType.BOUNDING_BOX) as OutputTypeVal,
      labels: wiz.labels.split(",").map((l) => l.trim()).filter(Boolean),
      integrationType: intType,
      sourceType: srcType,
      status: byomValidated ? ModelStatus.VALIDATED : ModelStatus.DRAFT,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      currentVersionId: null,
      versions: [],
      assignments: [],
      byomConfig: intType !== IntegrationType.BUILT && storedConfig ? storedConfig : null,
      buildFlow: emptyBuildFlow(),
      validationReport,
    };

    onModelSaved(newModel);
    setDraftByomConfig(null);
    onOpenChange(false);
    router.push(`/admin/models/${newModel.id}`);
  };

  // ── Step indicator ─────────────────────────────────────────────────────
  const StepIndicator = () => (
    <div className="mb-6">
      <div className="flex items-center justify-between mb-3">
        {wizardSteps.map((s, i) => {
          const isActive = wiz.step === s.number;
          const isCompleted = wiz.step > s.number;
          return (
            <div key={s.number} className="flex items-center flex-1 last:flex-none">
              <div className="flex flex-col items-center">
                <div
                  className={`
                    flex items-center justify-center w-8 h-8 rounded-full text-xs font-semibold transition-all
                    ${isCompleted
                      ? "bg-primary text-primary-foreground"
                      : isActive
                        ? "bg-primary text-primary-foreground ring-2 ring-primary/30 ring-offset-2 ring-offset-background"
                        : "bg-muted text-muted-foreground"
                    }
                  `}
                >
                  {isCompleted ? <Icon icon={Check} className="h-3.5 w-3.5" /> : s.number}
                </div>
                <span
                  className={`text-[10px] mt-1.5 whitespace-nowrap ${
                    isActive ? "text-foreground font-medium" : "text-muted-foreground"
                  }`}
                >
                  {s.label}
                </span>
              </div>
              {i < wizardSteps.length - 1 && (
                <div
                  className={`flex-1 h-0.5 mx-2 mb-5 rounded-full transition-colors ${
                    wiz.step > s.number ? "bg-primary" : "bg-muted"
                  }`}
                />
              )}
            </div>
          );
        })}
      </div>
      <div className="h-1">
        <Progress value={progress} />
      </div>
    </div>
  );

  // ── Step 1 ────────────────────────────────────────────────────────────
  const Step1 = () => (
    <div className="space-y-4">
      <p className="text-sm text-muted-foreground">How would you like to add your model?</p>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <button
          type="button"
          onClick={() => featureFlags.buildOwnModel && update({ path: "build", bringMethod: null })}
          disabled={!featureFlags.buildOwnModel}
          className={`relative flex flex-col items-center gap-3 rounded-xl border-2 p-6 text-left transition-all ${
            featureFlags.buildOwnModel
              ? `cursor-pointer hover:border-primary/50 hover:bg-primary/5 ${wiz.path === "build" ? "border-primary bg-primary/5 ring-1 ring-primary/20" : "border-border bg-background"}`
              : "cursor-not-allowed border-border bg-muted/40 opacity-60"
          }`}
        >
          {featureFlags.buildOwnModel && wiz.path === "build" && (
            <div className="absolute top-2.5 right-2.5"><Icon icon={CheckCircle2} className="h-5 w-5 text-primary" /></div>
          )}
          {!featureFlags.buildOwnModel && (
            <span className="absolute top-2.5 right-2.5 text-[10px] font-semibold uppercase tracking-wide text-muted-foreground bg-muted px-2 py-0.5 rounded-full">Coming soon</span>
          )}
          <div className={`p-3 rounded-xl ${featureFlags.buildOwnModel ? "bg-violet-100 dark:bg-violet-900/30" : "bg-muted"}`}>
            <Icon icon={Cpu} className={`h-7 w-7 ${featureFlags.buildOwnModel ? "text-violet-600 dark:text-violet-400" : "text-muted-foreground"}`} />
          </div>
          <div className="text-center">
            <h3 className={`font-semibold ${featureFlags.buildOwnModel ? "text-foreground" : "text-muted-foreground"}`}>Build your own model</h3>
            <p className="text-xs text-muted-foreground mt-1">Select stations and sources to create a dataset, then train your model</p>
          </div>
        </button>
        <button
          type="button"
          onClick={() => featureFlags.byom && update({ path: "bring", bringMethod: "upload" })}
          disabled={!featureFlags.byom}
          className={`relative flex flex-col items-center gap-3 rounded-xl border-2 p-6 text-left transition-all ${
            featureFlags.byom
              ? `cursor-pointer hover:border-primary/50 hover:bg-primary/5 ${wiz.path === "bring" ? "border-primary bg-primary/5 ring-1 ring-primary/20" : "border-border bg-background"}`
              : "cursor-not-allowed border-border bg-muted/40 opacity-60"
          }`}
        >
          {featureFlags.byom && wiz.path === "bring" && (
            <div className="absolute top-2.5 right-2.5"><Icon icon={CheckCircle2} className="h-5 w-5 text-primary" /></div>
          )}
          {!featureFlags.byom && (
            <span className="absolute top-2.5 right-2.5 text-[10px] font-semibold uppercase tracking-wide text-muted-foreground bg-muted px-2 py-0.5 rounded-full">Coming soon</span>
          )}
          <div className="p-3 rounded-xl bg-teal-100 dark:bg-teal-900/30">
            <Icon icon={Upload} className="h-7 w-7 text-teal-600 dark:text-teal-400" />
          </div>
          <div className="text-center">
            <h3 className="font-semibold text-foreground">Bring your own model</h3>
            <p className="text-xs text-muted-foreground mt-1">Upload a trained model file (.pt) for validation</p>
          </div>
        </button>
      </div>

      {/* REST integration method — hidden behind feature flag */}
      {featureFlags.byomRest && wiz.path === "bring" && (
        <div className="pt-2 space-y-2">
          <Label className="text-sm font-medium">Choose integration method</Label>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <button type="button" onClick={() => update({ bringMethod: "upload" })} className={`flex items-center gap-3 rounded-lg border p-4 transition-all cursor-pointer hover:border-primary/50 hover:bg-primary/5 ${wiz.bringMethod === "upload" ? "border-primary bg-primary/5" : "border-border"}`}>
              <div className="p-2 rounded-lg bg-amber-100 dark:bg-amber-900/30"><Icon icon={File} className="h-5 w-5 text-amber-600 dark:text-amber-400" /></div>
              <div><p className="text-sm font-medium text-foreground">Upload package</p><p className="text-xs text-muted-foreground">.pt model file</p></div>
            </button>
            <button type="button" onClick={() => update({ bringMethod: "rest" })} className={`flex items-center gap-3 rounded-lg border p-4 transition-all cursor-pointer hover:border-primary/50 hover:bg-primary/5 ${wiz.bringMethod === "rest" ? "border-primary bg-primary/5" : "border-border"}`}>
              <div className="p-2 rounded-lg bg-teal-100 dark:bg-teal-900/30"><Icon icon={Globe} className="h-5 w-5 text-teal-600 dark:text-teal-400" /></div>
              <div><p className="text-sm font-medium text-foreground">REST endpoint</p><p className="text-xs text-muted-foreground">Connect to an external inference API</p></div>
            </button>
          </div>
        </div>
      )}
    </div>
  );

  // ── Step 2 ────────────────────────────────────────────────────────────
  const Step2 = () => {
    if (wiz.path === "bring" && wiz.bringMethod === "upload") {
      return (
        <div className="space-y-5">
          <p className="text-sm text-muted-foreground">Upload your model package (.zip) for validation.</p>

          {/* Hidden native file input */}
          <input
            ref={fileInputRef}
            type="file"
            accept=".zip"
            className="hidden"
            onChange={handleFileSelect}
          />

          {/* Drop zone / click-to-browse */}
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="flex flex-col items-center justify-center gap-3 rounded-xl border-2 border-dashed border-border p-8 w-full cursor-pointer transition-colors hover:border-primary/50 hover:bg-primary/5"
          >
            <div className="p-3 rounded-full bg-muted">
              <Icon icon={Upload} className="h-6 w-6 text-muted-foreground" />
            </div>
            {wiz.uploadedFile ? (
              <div className="text-center">
                <p className="text-sm font-medium text-foreground">{wiz.uploadedFile}</p>
                <p className="text-xs text-muted-foreground mt-1">Click to replace</p>
              </div>
            ) : (
              <div className="text-center">
                <p className="text-sm font-medium text-foreground">Click to upload model package</p>
                <p className="text-xs text-muted-foreground mt-1">Accepts .zip files (max 500 MB)</p>
              </div>
            )}
          </button>

          {/* File info card */}
          {wiz.uploadedFile && (
            <div className="flex items-center gap-3 p-3 rounded-lg border border-border bg-muted/30">
              <div className="p-2 rounded-lg bg-amber-100 dark:bg-amber-900/30 shrink-0">
                <Icon icon={File} className="h-5 w-5 text-amber-600 dark:text-amber-400" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-foreground truncate">{wiz.uploadedFile}</p>
                <p className="text-xs text-muted-foreground">{formatBytes(wiz.uploadedFileSize)}</p>
              </div>
              <button
                type="button"
                onClick={() => update({ uploadedFile: null, uploadedFileSize: 0, packageValidated: false, packageManifest: null, packageValidationChecks: [] })}
                className="p-1 rounded hover:bg-muted transition-colors shrink-0"
              >
                <Icon icon={X} className="h-4 w-4 text-muted-foreground" />
              </button>
            </div>
          )}

          {/* Validate Package button */}
          {wiz.uploadedFile && wiz.packageValidationChecks.length === 0 && !wiz.isValidating && (
            <Button onPress={handleValidatePackage} className="w-full">
              Validate Package
            </Button>
          )}

          {/* Validation results panel */}
          {(wiz.packageValidationChecks.length > 0 || wiz.isValidating) && (
            <div className="rounded-lg border border-border overflow-hidden">
              <div className="flex items-center justify-between px-4 py-2.5 bg-muted/40 border-b border-border">
                <h4 className="text-sm font-semibold text-foreground">Package Validation</h4>
                <span className="text-xs text-muted-foreground">
                  {wiz.packageValidationChecks.length}/{TOTAL_PKG_CHECKS} checks
                </span>
              </div>

              <div className="divide-y divide-border">
                {wiz.packageValidationChecks.map((check) => (
                  <div key={check.key} className={`flex items-start gap-3 px-4 py-2.5 ${!check.passed ? "bg-red-50/50 dark:bg-red-900/10" : ""}`}>
                    <div className="mt-0.5 shrink-0">
                      {check.passed ? (
                        <Icon icon={CheckCircle2} className="h-4 w-4 text-green-600 dark:text-green-400" />
                      ) : (
                        <Icon icon={XCircle} className="h-4 w-4 text-red-500 dark:text-red-400" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className={`text-sm font-medium ${check.passed ? "text-foreground" : "text-red-700 dark:text-red-400"}`}>
                        {check.label}
                      </p>
                      <p className="text-xs text-muted-foreground">{check.description}</p>
                      {!check.passed && check.fixMessage && (
                        <div className="flex items-start gap-1.5 mt-1">
                          <Icon icon={AlertCircle} className="h-3 w-3 text-red-500 mt-0.5 shrink-0" />
                          <p className="text-xs text-red-600 dark:text-red-400">{check.fixMessage}</p>
                        </div>
                      )}
                    </div>
                  </div>
                ))}

                {wiz.isValidating && (
                  <div className="flex items-center gap-3 px-4 py-2.5">
                    <Icon icon={Loader2} className="h-4 w-4 animate-spin text-muted-foreground" />
                    <span className="text-sm text-muted-foreground">Running checks\u2026</span>
                  </div>
                )}
              </div>

              {/* Summary footer */}
              {!wiz.isValidating && wiz.packageValidationChecks.length === TOTAL_PKG_CHECKS && (() => {
                const passed = wiz.packageValidationChecks.filter((c) => c.passed).length;
                const failed = TOTAL_PKG_CHECKS - passed;
                const allPassed = failed === 0;
                return (
                  <div className={`px-4 py-2.5 border-t text-sm font-medium ${allPassed ? "border-green-200 bg-green-50 text-green-700 dark:border-green-800 dark:bg-green-900/20 dark:text-green-300" : "border-red-200 bg-red-50 text-red-700 dark:border-red-800 dark:bg-red-900/20 dark:text-red-300"}`}>
                    {allPassed
                      ? `All ${TOTAL_PKG_CHECKS} checks passed`
                      : `${failed} check${failed > 1 ? "s" : ""} failed \u2014 fix the issues above and re-validate`}
                  </div>
                );
              })()}
            </div>
          )}

          {/* Re-validate button when checks failed */}
          {!wiz.isValidating &&
            wiz.packageValidationChecks.length === TOTAL_PKG_CHECKS &&
            !wiz.packageValidated && (
              <Button variant="outline" onPress={handleValidatePackage} className="w-full">
                Re-validate Package
              </Button>
            )}

          {/* Manifest extract summary (shown on success) */}
          {wiz.packageValidated && wiz.packageManifest && (
            <div className="rounded-lg border border-green-200 dark:border-green-800 bg-green-50/50 dark:bg-green-900/10 p-4 space-y-3">
              <div className="flex items-center gap-2">
                <Icon icon={CheckCircle2} className="h-4 w-4 text-green-600 dark:text-green-400" />
                <h4 className="text-sm font-semibold text-green-700 dark:text-green-300">
                  Extracted from manifest.json
                </h4>
              </div>
              <div className="grid grid-cols-2 gap-x-4 gap-y-2 text-xs">
                <div>
                  <span className="text-muted-foreground">Model Name</span>
                  <p className="font-medium text-foreground">{wiz.packageManifest.modelName}</p>
                </div>
                <div>
                  <span className="text-muted-foreground">Framework</span>
                  <p className="font-medium text-foreground">{wiz.packageManifest.framework}</p>
                </div>
                <div>
                  <span className="text-muted-foreground">Output Type</span>
                  <p className="font-medium text-foreground">{wiz.packageManifest.outputType}</p>
                </div>
                <div>
                  <span className="text-muted-foreground">Input Format</span>
                  <p className="font-medium text-foreground">
                    {wiz.packageManifest.inputFormat.width}&times;{wiz.packageManifest.inputFormat.height}&times;{wiz.packageManifest.inputFormat.channels} {wiz.packageManifest.inputFormat.encoding}
                  </p>
                </div>
                <div className="col-span-2">
                  <span className="text-muted-foreground">Labels</span>
                  <p className="font-medium text-foreground">{wiz.packageManifest.labels.join(", ")}</p>
                </div>
              </div>
              <p className="text-xs text-muted-foreground italic">
                These values will pre-fill Step 3 — Model Identity.
              </p>
            </div>
          )}

          {/* Model Contract */}
          <ContractSection />
        </div>
      );
    }

    if (wiz.path === "bring" && wiz.bringMethod === "rest") {
      return (
        <div className="space-y-5">
          <p className="text-sm text-muted-foreground">Provide the REST endpoint details for your model inference API.</p>

          {/* Base URL */}
          <div className="space-y-2">
            <Label htmlFor="endpoint-url">Base URL</Label>
            <Input
              id="endpoint-url"
              placeholder="https://api.example.com/v1/predict"
              value={wiz.endpointUrl}
              onChangeText={(v) => update({ endpointUrl: v, connectionTested: false, restValidationChecks: [], restTestLatencyMs: null, restTestError: null, restSampleOutput: null })}
            />
          </div>

          {/* Authentication type */}
          <div className="space-y-2">
            <Label>Authentication</Label>
            <Select value={wiz.authType} onValueChange={(v) => update({ authType: v as AuthType, apiKey: "", bearerToken: "", connectionTested: false, restValidationChecks: [], restTestLatencyMs: null, restTestError: null, restSampleOutput: null })}>
              <SelectTrigger><SelectValue placeholder="Select auth type" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="none">No Authentication</SelectItem>
                <SelectItem value="api-key">API Key</SelectItem>
                <SelectItem value="bearer">Bearer Token</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Conditional token input */}
          {wiz.authType === "api-key" && (
            <div className="space-y-2">
              <Label htmlFor="api-key">API Key</Label>
              <Input id="api-key" type="password" placeholder="Enter your API key" value={wiz.apiKey} onChangeText={(v) => update({ apiKey: v, connectionTested: false, restValidationChecks: [], restTestLatencyMs: null, restTestError: null, restSampleOutput: null })} />
            </div>
          )}
          {wiz.authType === "bearer" && (
            <div className="space-y-2">
              <Label htmlFor="bearer-token">Bearer Token</Label>
              <Input id="bearer-token" type="password" placeholder="Enter bearer token" value={wiz.bearerToken} onChangeText={(v) => update({ bearerToken: v, connectionTested: false, restValidationChecks: [], restTestLatencyMs: null, restTestError: null, restSampleOutput: null })} />
            </div>
          )}

          {/* Advanced section (collapsible) */}
          <div className="rounded-lg border border-border">
            <button
              type="button"
              onClick={() => update({ showAdvanced: !wiz.showAdvanced })}
              className="flex items-center justify-between w-full px-4 py-3 text-sm font-medium text-foreground hover:bg-muted/50 transition-colors rounded-lg"
            >
              <span className="flex items-center gap-2">
                <Icon icon={Clock} className="h-4 w-4 text-muted-foreground" />
                Advanced Settings
              </span>
              <Icon icon={wiz.showAdvanced ? ChevronUp : ChevronDown} className="h-4 w-4 text-muted-foreground" />
            </button>
            {wiz.showAdvanced && (
              <div className="px-4 pb-4 space-y-2">
                <Label htmlFor="timeout">Request Timeout (ms)</Label>
                <Input
                  id="timeout"
                  type="number"
                  placeholder="30000"
                  value={String(wiz.timeoutMs)}
                  onChangeText={(v) => {
                    const n = parseInt(v, 10);
                    update({ timeoutMs: Number.isNaN(n) ? 30000 : n, connectionTested: false, restValidationChecks: [], restTestLatencyMs: null, restTestError: null, restSampleOutput: null });
                  }}
                />
                <p className="text-xs text-muted-foreground">
                  Time to wait for a response before timing out. Default: 30 000 ms (30 s).
                </p>
              </div>
            )}
          </div>

          {/* Test Connection button */}
          {wiz.restValidationChecks.length === 0 && !wiz.isTesting && !wiz.restTestError && (
            <Button onPress={handleTestConnection} disabled={!wiz.endpointUrl.trim()} className="w-full">
              <Icon icon={Activity} className="h-4 w-4 mr-2" />Test Connection
            </Button>
          )}

          {/* Loading state */}
          {wiz.isTesting && (
            <div className="flex items-center justify-center gap-2 p-4 rounded-lg border border-border bg-muted/30">
              <Icon icon={Loader2} className="h-4 w-4 animate-spin text-muted-foreground" />
              <span className="text-sm text-muted-foreground">Testing connection to endpoint{"\u2026"}</span>
            </div>
          )}

          {/* Network / fetch error */}
          {wiz.restTestError && (
            <div className="space-y-3">
              <div className="flex items-start gap-2 p-3 rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800">
                <Icon icon={XCircle} className="h-4 w-4 text-red-500 mt-0.5 shrink-0" />
                <div>
                  <p className="text-sm font-medium text-red-700 dark:text-red-300">Connection Failed</p>
                  <p className="text-xs text-red-600 dark:text-red-400 mt-0.5">{wiz.restTestError}</p>
                </div>
              </div>
              <Button variant="outline" onPress={handleTestConnection} disabled={!wiz.endpointUrl.trim()} className="w-full">
                Retry Connection
              </Button>
            </div>
          )}

          {/* Validation checks panel */}
          {wiz.restValidationChecks.length > 0 && (
            <div className="rounded-lg border border-border overflow-hidden">
              {/* Header with latency badge */}
              <div className="flex items-center justify-between px-4 py-2.5 bg-muted/40 border-b border-border">
                <h4 className="text-sm font-semibold text-foreground">Connection Test</h4>
                {wiz.restTestLatencyMs !== null && (
                  <Badge variant="outline" className={`text-xs font-mono ${wiz.restTestLatencyMs < 200 ? "bg-green-50 text-green-700 border-green-200 dark:bg-green-900/30 dark:text-green-400" : "bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-900/30 dark:text-amber-400"}`}>
                    {wiz.restTestLatencyMs} ms
                  </Badge>
                )}
              </div>

              {/* Check rows */}
              <div className="divide-y divide-border">
                {wiz.restValidationChecks.map((check) => (
                  <div key={check.key} className={`flex items-start gap-3 px-4 py-2.5 ${!check.passed ? "bg-red-50/50 dark:bg-red-900/10" : ""}`}>
                    <div className="mt-0.5 shrink-0">
                      {check.passed ? (
                        <Icon icon={CheckCircle2} className="h-4 w-4 text-green-600 dark:text-green-400" />
                      ) : (
                        <Icon icon={XCircle} className="h-4 w-4 text-red-500 dark:text-red-400" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className={`text-sm font-medium ${check.passed ? "text-foreground" : "text-red-700 dark:text-red-400"}`}>
                        {check.label}
                      </p>
                      <p className="text-xs text-muted-foreground">{check.description}</p>
                      {!check.passed && check.fixMessage && (
                        <div className="flex items-start gap-1.5 mt-1">
                          <Icon icon={AlertCircle} className="h-3 w-3 text-red-500 mt-0.5 shrink-0" />
                          <p className="text-xs text-red-600 dark:text-red-400">{check.fixMessage}</p>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>

              {/* Summary footer */}
              {(() => {
                const passed = wiz.restValidationChecks.filter((c) => c.passed).length;
                const total = wiz.restValidationChecks.length;
                const failed = total - passed;
                const allPassed = failed === 0;
                return (
                  <div className={`px-4 py-2.5 border-t text-sm font-medium ${allPassed ? "border-green-200 bg-green-50 text-green-700 dark:border-green-800 dark:bg-green-900/20 dark:text-green-300" : "border-red-200 bg-red-50 text-red-700 dark:border-red-800 dark:bg-red-900/20 dark:text-red-300"}`}>
                    {allPassed
                      ? `All ${total} checks passed`
                      : `${failed} check${failed > 1 ? "s" : ""} failed \u2014 fix the issues above and re-test`}
                  </div>
                );
              })()}
            </div>
          )}

          {/* Sample output preview (on success) */}
          {wiz.connectionTested && wiz.restSampleOutput && (
            <div className="rounded-lg border border-green-200 dark:border-green-800 bg-green-50/50 dark:bg-green-900/10 p-4 space-y-2">
              <div className="flex items-center gap-2">
                <Icon icon={CheckCircle2} className="h-4 w-4 text-green-600 dark:text-green-400" />
                <h4 className="text-sm font-semibold text-green-700 dark:text-green-300">Sample Inference Output</h4>
              </div>
              <pre className="text-xs font-mono bg-background/80 rounded-md p-3 overflow-x-auto border border-border">
                {JSON.stringify(wiz.restSampleOutput, null, 2)}
              </pre>
            </div>
          )}

          {/* Re-test button when checks failed */}
          {wiz.restValidationChecks.length > 0 && !wiz.connectionTested && !wiz.isTesting && (
            <Button variant="outline" onPress={handleTestConnection} disabled={!wiz.endpointUrl.trim()} className="w-full">
              Re-test Connection
            </Button>
          )}

          {/* Model Contract */}
          <ContractSection />
        </div>
      );
    }
    // Build path
    const camerasForStation = mockCameraOptions.filter((c) => !wiz.selectedStation || c.stationId === wiz.selectedStation);
    return (
      <div className="space-y-5">
        <p className="text-sm text-muted-foreground">Select a station and camera sources to begin building your dataset.</p>
        <div className="space-y-2">
          <Label>Station</Label>
          <Select value={wiz.selectedStation} onValueChange={(v) => update({ selectedStation: v, selectedSources: [] })}>
            <SelectTrigger><SelectValue placeholder="Select a station" /></SelectTrigger>
            <SelectContent>{mockStationOptions.map((s) => (<SelectItem key={s.value} value={s.value}>{s.label}</SelectItem>))}</SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label>Camera Sources</Label>
          <div className="space-y-2 rounded-lg border border-border p-3">
            {camerasForStation.map((source) => {
              const isSelected = wiz.selectedSources.includes(source.value);
              return (
                <label key={source.value} className="flex items-center gap-3 p-2 rounded-md hover:bg-muted/50 cursor-pointer transition-colors">
                  <Checkbox checked={isSelected} onCheckedChange={(checked) => { const next = checked ? [...wiz.selectedSources, source.value] : wiz.selectedSources.filter((v) => v !== source.value); update({ selectedSources: next }); }} />
                  <div className="flex items-center gap-2"><Icon icon={Camera} className="h-4 w-4 text-muted-foreground" /><span className="text-sm text-foreground">{source.label}</span></div>
                </label>
              );
            })}
          </div>
          {wiz.selectedSources.length > 0 && (<p className="text-xs text-muted-foreground">{wiz.selectedSources.length} source{wiz.selectedSources.length > 1 ? "s" : ""} selected</p>)}
        </div>
        {wiz.selectedStation && wiz.selectedSources.length > 0 && (
          <div className="flex items-center gap-2 p-3 rounded-lg bg-violet-50 dark:bg-violet-900/20 border border-violet-200 dark:border-violet-800">
            <Icon icon={Activity} className="h-4 w-4 text-violet-600 dark:text-violet-400" />
            <span className="text-sm text-violet-700 dark:text-violet-300">Ready to start dataset collection from {wiz.selectedSources.length} source{wiz.selectedSources.length > 1 ? "s" : ""}.</span>
          </div>
        )}
      </div>
    );
  };

  // ── Step 3 ────────────────────────────────────────────────────────────
  const Step3 = () => (
    <div className="space-y-4">
      <p className="text-sm text-muted-foreground">Define your model&apos;s identity and classification metadata.</p>
      <div className="space-y-2"><Label htmlFor="wizard-model-name">Model Name</Label><Input id="wizard-model-name" placeholder="e.g., PPE Compliance Detector v2" value={wiz.modelName} onChangeText={(v) => update({ modelName: v })} /></div>
      <div className="space-y-2">
        <Label>Category</Label>
        <Select value={wiz.category} onValueChange={(v) => update({ category: v })}><SelectTrigger><SelectValue placeholder="Select category" /></SelectTrigger><SelectContent>{categoryOptions.map((o) => (<SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>))}</SelectContent></Select>
      </div>
      <div className="space-y-2">
        <Label>Output Type</Label>
        <Select value={wiz.outputType} onValueChange={(v) => update({ outputType: v })}><SelectTrigger><SelectValue placeholder="Select output type" /></SelectTrigger><SelectContent>{outputTypeOptions.map((o) => (<SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>))}</SelectContent></Select>
      </div>
      <div className="space-y-2"><Label htmlFor="wizard-labels">Labels</Label><Input id="wizard-labels" placeholder="e.g., helmet, vest, gloves, goggles" value={wiz.labels} onChangeText={(v) => update({ labels: v })} /><p className="text-xs text-muted-foreground">Comma-separated list of detection labels</p></div>
    </div>
  );

  // ── Step 4 ────────────────────────────────────────────────────────────
  const Step4 = () => {
    const checks = [
      { key: "contractValid" as const, label: "Contract schema valid", description: "Input/output types and label mappings are defined in the model contract", icon: Shield },
      { key: "latencyOk" as const, label: "Latency within threshold", description: "Inference latency is under 200 ms at p95", icon: Timer },
      { key: "sampleInferenceOk" as const, label: "Sample inference passed", description: "Model produces expected output on test images", icon: Brain },
      { key: "securityOk" as const, label: "Security scan passed", description: "No vulnerabilities detected in model artifacts", icon: Shield },
    ];
    const completedCount = Object.values(wiz.validationChecks).filter(Boolean).length;
    const allPassed = completedCount === checks.length;
    return (
      <div className="space-y-5">
        <div className="flex items-center justify-between">
          <p className="text-sm text-muted-foreground">Run validation to ensure your model is ready for deployment.</p>
          {!allPassed && completedCount === 0 && (
            <Button size="sm" onPress={handleRunValidation} disabled={wiz.isRunningValidation}>
              {wiz.isRunningValidation ? (<><Icon icon={Loader2} className="h-3.5 w-3.5 mr-1.5 animate-spin" />Running...</>) : "Run All Checks"}
            </Button>
          )}
        </div>
        <div className="space-y-2">
          {checks.map((check) => {
            const passed = wiz.validationChecks[check.key];
            return (
              <div key={check.key} className={`flex items-center gap-3 p-3 rounded-lg border transition-all ${passed ? "border-green-200 bg-green-50 dark:border-green-800 dark:bg-green-900/20" : "border-border bg-background"}`}>
                <div className={`flex items-center justify-center w-8 h-8 rounded-full shrink-0 ${passed ? "bg-green-100 dark:bg-green-900/40" : "bg-muted"}`}>
                  {passed ? <Icon icon={CheckCircle2} className="h-4 w-4 text-green-600 dark:text-green-400" /> : wiz.isRunningValidation ? <Icon icon={Loader2} className="h-4 w-4 text-muted-foreground animate-spin" /> : <Icon icon={check.icon} className="h-4 w-4 text-muted-foreground" />}
                </div>
                <div className="flex-1 min-w-0"><p className={`text-sm font-medium ${passed ? "text-green-700 dark:text-green-300" : "text-foreground"}`}>{check.label}</p><p className="text-xs text-muted-foreground">{check.description}</p></div>
                {passed && <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200 dark:bg-green-900/30 dark:text-green-400 shrink-0">Passed</Badge>}
              </div>
            );
          })}
        </div>
        {allPassed && (
          <div className="flex items-center gap-2 p-3 rounded-lg bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800">
            <Icon icon={CheckCircle2} className="h-4 w-4 text-green-600 dark:text-green-400" />
            <span className="text-sm font-medium text-green-700 dark:text-green-300">All validation checks passed. Your model is ready to save.</span>
          </div>
        )}
      </div>
    );
  };

  // ── BYOM Step 2: Upload Model ──────────────────────────────────────
  const availableVersions = BYOM_VERSIONS[wiz.byomModelType] ?? [];

  const ByomStep2Upload = () => (
    <div className="space-y-4">
      <p className="text-sm text-muted-foreground">
        Provide your model details and upload the weights file.
      </p>

      {/* Model Name */}
      <div className="space-y-1.5">
        <Label htmlFor="byom-model-name">
          Model Name <span className="text-red-500">*</span>
        </Label>
        <Input
          id="byom-model-name"
          placeholder="e.g., PPE Detector v1"
          value={wiz.byomModelName}
          onChangeText={(v) =>
            update({ byomModelName: v, byomDuplicateError: null })
          }
        />
        <p className="text-xs text-muted-foreground">
          A unique name to identify this model in Aegis Vision.
        </p>
        {wiz.byomDuplicateError && (
          <p className="text-xs text-red-600 dark:text-red-400 flex items-center gap-1">
            <Icon icon={AlertCircle} className="h-3 w-3 shrink-0" />
            {wiz.byomDuplicateError}
          </p>
        )}
      </div>

      {/* Model Type (dropdown) */}
      <div className="space-y-1.5">
        <Label>
          Model Type <span className="text-red-500">*</span>
        </Label>
        <Select
          value={wiz.byomModelType}
          onValueChange={(v) => {
            const mt = v as ByomModelType;
            const versions = BYOM_VERSIONS[mt] ?? [];
            update({
              byomModelType: mt,
              byomVersion: (versions[0] as string) ?? "",
            });
          }}
        >
          <SelectTrigger><SelectValue placeholder="Select model type" /></SelectTrigger>
          <SelectContent>
            {BYOM_MODEL_TYPES.map((t) => (
              <SelectItem key={t} value={t}>{t}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        <p className="text-xs text-muted-foreground">
          Select the framework family used to train this model.
        </p>
      </div>

      {/* Version (dropdown) */}
      <div className="space-y-1.5">
        <Label>
          Version <span className="text-red-500">*</span>
        </Label>
        <Select
          value={wiz.byomVersion}
          onValueChange={(v) => update({ byomVersion: v })}
        >
          <SelectTrigger><SelectValue placeholder="Select version" /></SelectTrigger>
          <SelectContent>
            {availableVersions.map((v) => (
              <SelectItem key={v} value={v}>{v}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        <p className="text-xs text-muted-foreground">
          Select the supported version for this model type.
        </p>
      </div>

      {/* Model File */}
      <div className="space-y-1.5">
        <Label>
          Model File <span className="text-red-500">*</span>
        </Label>
        <input
          ref={byomFileInputRef}
          type="file"
          accept=".pt"
          className="hidden"
          onChange={handleByomFileSelect}
        />
        <button
          type="button"
          onClick={() => byomFileInputRef.current?.click()}
          className="flex flex-col items-center justify-center gap-3 rounded-xl border-2 border-dashed border-border p-6 w-full cursor-pointer transition-colors hover:border-primary/50 hover:bg-primary/5"
        >
          <div className="p-3 rounded-full bg-muted">
            <Icon icon={Upload} className="h-5 w-5 text-muted-foreground" />
          </div>
          {wiz.byomFileName ? (
            <div className="text-center">
              <p className="text-sm font-medium text-foreground">{wiz.byomFileName}</p>
              <p className="text-xs text-muted-foreground mt-1">
                {formatBytes(wiz.byomFileSize)} — click to replace
              </p>
            </div>
          ) : (
            <div className="text-center">
              <p className="text-sm font-medium text-foreground">Click to upload model file</p>
              <p className="text-xs text-muted-foreground mt-1">Accepts .pt files only</p>
            </div>
          )}
        </button>
        <p className="text-xs text-muted-foreground">
          Upload the trained weights file (.pt).
        </p>
        {wiz.byomFileName && (
          <div className="flex items-center gap-3 p-3 rounded-lg border border-border bg-muted/30">
            <div className="p-2 rounded-lg bg-amber-100 dark:bg-amber-900/30 shrink-0">
              <Icon icon={File} className="h-4 w-4 text-amber-600 dark:text-amber-400" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-foreground truncate">{wiz.byomFileName}</p>
              <p className="text-xs text-muted-foreground">{formatBytes(wiz.byomFileSize)}</p>
            </div>
            <button
              type="button"
              onClick={() => update({ byomFile: null, byomFileName: null, byomFileSize: 0 })}
              className="p-1 rounded hover:bg-muted transition-colors shrink-0"
            >
              <Icon icon={X} className="h-4 w-4 text-muted-foreground" />
            </button>
          </div>
        )}
      </div>

      {/* Upload error */}
      {wiz.byomUploadError && (
        <div className="flex items-start gap-2 p-3 rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800">
          <Icon icon={XCircle} className="h-4 w-4 text-red-500 mt-0.5 shrink-0" />
          <div>
            <p className="text-sm font-medium text-red-700 dark:text-red-300">Upload Failed</p>
            <p className="text-xs text-red-600 dark:text-red-400 mt-0.5">{wiz.byomUploadError}</p>
          </div>
        </div>
      )}
    </div>
  );

  // ── BYOM Step 3: Validation ──────────────────────────────────────────
  const BYOM_VALIDATION_CHECKLIST: { id: string; label: string; apiCheckId?: string; errorLabel?: string }[] = [
    { id: "fmt", label: "File format validation", apiCheckId: "ext", errorLabel: "Invalid/corrupted model file" },
    { id: "meta", label: "Load model metadata", apiCheckId: "meta", errorLabel: "Invalid/corrupted model file" },
    { id: "arch", label: `Verify architecture matches selected Model Type`, apiCheckId: "arch", errorLabel: "Model type mismatch" },
    { id: "ver", label: `Verify version matches selected Version`, apiCheckId: "ver", errorLabel: "Version mismatch" },
    { id: "input", label: "Model can accept frame input", apiCheckId: "input", errorLabel: "Frame input not supported" },
  ];

  const ByomStep3Validation = () => {
    const result = wiz.byomValidationResult;
    const isValidating = wiz.byomValidating;
    const passed = result?.status === "pass";
    const failed = result?.status === "fail";

    const resolveCheckStatus = (item: (typeof BYOM_VALIDATION_CHECKLIST)[number]): "pass" | "fail" | null => {
      if (!result) return null;
      if (item.apiCheckId) {
        const apiCheck = result.checks.find((c) => c.id === item.apiCheckId);
        return apiCheck?.status ?? null;
      }
      return result.status;
    };

    return (
      <div className="space-y-5">
        {/* Progress header */}
        {isValidating && (
          <div className="flex flex-col items-center gap-3 py-4">
            <Icon icon={Loader2} className="h-8 w-8 animate-spin text-primary" />
            <p className="text-sm font-medium text-foreground">Validating your model…</p>
            <p className="text-xs text-muted-foreground">This may take a few seconds</p>
          </div>
        )}

        {/* Checklist */}
        <div className="rounded-lg border border-border overflow-hidden">
          <div className="px-4 py-2.5 bg-muted/40 border-b border-border">
            <h4 className="text-sm font-semibold text-foreground">Validation Checks</h4>
          </div>
          <div className="divide-y divide-border">
            {BYOM_VALIDATION_CHECKLIST.map((item) => {
              const status = resolveCheckStatus(item);
              const checkPassed = status === "pass";
              const checkFailed = status === "fail";

              return (
                <div
                  key={item.id}
                  className={`flex items-center gap-3 px-4 py-3 ${
                    checkFailed ? "bg-red-50/50 dark:bg-red-900/10" : ""
                  }`}
                >
                  <div className="shrink-0">
                    {checkPassed ? (
                      <Icon icon={CheckCircle2} className="h-4 w-4 text-green-600 dark:text-green-400" />
                    ) : checkFailed ? (
                      <Icon icon={XCircle} className="h-4 w-4 text-red-500 dark:text-red-400" />
                    ) : isValidating ? (
                      <Icon icon={Loader2} className="h-4 w-4 animate-spin text-muted-foreground" />
                    ) : (
                      <div className="h-4 w-4 rounded-full border-2 border-border" />
                    )}
                  </div>
                  <span
                    className={`text-sm ${
                      checkPassed
                        ? "text-foreground font-medium"
                        : checkFailed
                          ? "text-red-700 dark:text-red-400 font-medium"
                          : "text-muted-foreground"
                    }`}
                  >
                    {item.label}
                  </span>
                </div>
              );
            })}
          </div>

          {/* Summary */}
          {passed && (
            <div className="px-4 py-2.5 border-t border-green-200 bg-green-50 dark:border-green-800 dark:bg-green-900/20">
              <div className="flex items-center gap-2">
                <Icon icon={CheckCircle2} className="h-4 w-4 text-green-600 dark:text-green-400" />
                <span className="text-sm font-medium text-green-700 dark:text-green-300">
                  All checks passed — your model is valid.
                </span>
              </div>
            </div>
          )}
          {failed && (
            <div className="px-4 py-2.5 border-t border-red-200 bg-red-50 dark:border-red-800 dark:bg-red-900/20">
              <div className="flex items-center gap-2">
                <Icon icon={XCircle} className="h-4 w-4 text-red-500 dark:text-red-400" />
                <span className="text-sm font-medium text-red-700 dark:text-red-300">
                  Validation failed
                </span>
              </div>
            </div>
          )}
        </div>

        {/* Error blocks per failed check */}
        {failed && (() => {
          const failedChecks = BYOM_VALIDATION_CHECKLIST.filter((item) => resolveCheckStatus(item) === "fail");
          return failedChecks.length > 0 ? (
            <div className="space-y-2">
              {failedChecks.map((item) => (
                <div
                  key={item.id}
                  className="flex items-start gap-2 p-3 rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800"
                >
                  <Icon icon={XCircle} className="h-4 w-4 text-red-500 mt-0.5 shrink-0" />
                  <div>
                    <p className="text-sm font-medium text-red-700 dark:text-red-300">
                      {item.errorLabel ?? item.label}
                    </p>
                    <p className="text-xs text-red-600 dark:text-red-400 mt-0.5">
                      Check "{item.label}" did not pass. Please verify your file and try again.
                    </p>
                  </div>
                </div>
              ))}
            </div>
          ) : null;
        })()}

        {/* Validation error (API level) */}
        {wiz.byomValidationError && (
          <div className="flex items-start gap-2 p-3 rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800">
            <Icon icon={XCircle} className="h-4 w-4 text-red-500 mt-0.5 shrink-0" />
            <div>
              <p className="text-sm font-medium text-red-700 dark:text-red-300">Validation Error</p>
              <p className="text-xs text-red-600 dark:text-red-400 mt-0.5">{wiz.byomValidationError}</p>
            </div>
          </div>
        )}

        {/* Try Again CTA (only on failure) */}
        {(failed || wiz.byomValidationError) && !isValidating && (
          <Button variant="outline" onPress={handleBack} className="w-full">
            <Icon icon={ArrowLeft} className="h-4 w-4 mr-1.5" />
            Try Again
          </Button>
        )}
      </div>
    );
  };

  // ── BYOM Step 4: Create Use Case ─────────────────────────────────────
  const handleAddClass = () => {
    const trimmed = wiz.byomClassInput.trim();
    if (!trimmed) return;
    if (wiz.byomClasses.some((c) => c.toLowerCase() === trimmed.toLowerCase())) return;
    update({ byomClasses: [...wiz.byomClasses, trimmed], byomClassInput: "" });
  };

  const handleRemoveClass = (cls: string) => {
    update({ byomClasses: wiz.byomClasses.filter((c) => c !== cls) });
  };

  const ByomStep4UseCase = () => (
    <div className="space-y-5">
      <p className="text-sm text-muted-foreground">
        Create a use case to start using your validated model.
      </p>

      {/* Use Case Name */}
      <div className="space-y-1.5">
        <Label htmlFor="byom-uc-name">
          Use Case Name <span className="text-red-500">*</span>
        </Label>
        <Input
          id="byom-uc-name"
          placeholder="e.g., Warehouse PPE Detection"
          value={wiz.byomUseCaseName}
          onChangeText={(v) => update({ byomUseCaseName: v })}
        />
      </div>

      {/* Activate toggle */}
      <div className="flex items-center justify-between rounded-lg border border-border p-4">
        <div>
          <p className="text-sm font-medium text-foreground">Activate on creation</p>
          <p className="text-xs text-muted-foreground mt-0.5">
            Enable the use case immediately after creation
          </p>
        </div>
        <ToggleSwitch
          checked={wiz.byomActivate}
          onCheckedChange={(v) => update({ byomActivate: v })}
        />
      </div>

      {/* Classes / Objects */}
      <div className="space-y-1.5">
        <Label>
          Classes / Objects <span className="text-red-500">*</span>
        </Label>
        <div
          className="flex items-center gap-2"
          onKeyDown={(e: React.KeyboardEvent) => {
            if (e.key === "Enter") { e.preventDefault(); handleAddClass(); }
          }}
        >
          <Input
            placeholder="e.g., Car"
            value={wiz.byomClassInput}
            onChangeText={(v) => update({ byomClassInput: v })}
            className="flex-1"
          />
          <Button
            variant="outline"
            size="sm"
            onPress={handleAddClass}
            disabled={!wiz.byomClassInput.trim()}
            className="shrink-0 h-9 px-3"
          >
            <Icon icon={Plus} className="h-4 w-4" />
          </Button>
        </div>
        <p className="text-xs text-muted-foreground">
          Add the objects this model detects. These will be used in pipelines and alert rules.
        </p>

        {/* Chips */}
        {wiz.byomClasses.length > 0 && (
          <div className="flex flex-wrap gap-2 pt-1">
            {wiz.byomClasses.map((cls) => (
              <span
                key={cls}
                className="inline-flex items-center gap-1 rounded-full border border-border bg-muted/50 px-2.5 py-1 text-xs font-medium text-foreground"
              >
                {cls}
                <button
                  type="button"
                  onClick={() => handleRemoveClass(cls)}
                  className="ml-0.5 rounded-full p-0.5 hover:bg-muted transition-colors"
                >
                  <Icon icon={X} className="h-3 w-3 text-muted-foreground hover:text-foreground" />
                </button>
              </span>
            ))}
          </div>
        )}

        {wiz.byomClasses.length === 0 && (
          <div className="flex items-center gap-1.5 pt-0.5">
            <Icon icon={AlertCircle} className="h-3.5 w-3.5 text-amber-500" />
            <span className="text-xs text-amber-700 dark:text-amber-400">
              At least one class is required.
            </span>
          </div>
        )}
      </div>

      {/* Model summary card */}
      <div className="rounded-lg border border-border bg-muted/30 p-4 space-y-2">
        <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          Model Summary
        </h4>
        <div className="grid grid-cols-2 gap-x-4 gap-y-2 text-sm">
          <div>
            <span className="text-xs text-muted-foreground">Model Name</span>
            <p className="font-medium text-foreground">{wiz.byomModelName}</p>
          </div>
          <div>
            <span className="text-xs text-muted-foreground">File</span>
            <p className="font-medium text-foreground truncate">{wiz.byomFileName}</p>
          </div>
          <div>
            <span className="text-xs text-muted-foreground">Type</span>
            <p className="font-medium text-foreground">{wiz.byomModelType}</p>
          </div>
          <div>
            <span className="text-xs text-muted-foreground">Version</span>
            <p className="font-medium text-foreground">{wiz.byomVersion}</p>
          </div>
          {wiz.byomClasses.length > 0 && (
            <div className="col-span-2">
              <span className="text-xs text-muted-foreground">Classes</span>
              <p className="font-medium text-foreground">{wiz.byomClasses.join(", ")}</p>
            </div>
          )}
        </div>
      </div>

      {/* Create error */}
      {wiz.byomCreateError && (
        <div className="flex items-start gap-2 p-3 rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800">
          <Icon icon={XCircle} className="h-4 w-4 text-red-500 mt-0.5 shrink-0" />
          <div>
            <p className="text-sm font-medium text-red-700 dark:text-red-300">
              Creation Failed
            </p>
            <p className="text-xs text-red-600 dark:text-red-400 mt-0.5">
              {wiz.byomCreateError}
            </p>
          </div>
        </div>
      )}
    </div>
  );

  const renderStep = () => {
    if (isByomUpload) {
      switch (wiz.step) {
        case 1: return <Step1 />;
        case 2: return <ByomStep2Upload />;
        case 3: return <ByomStep3Validation />;
        case 4: return <ByomStep4UseCase />;
        default: return null;
      }
    }
    switch (wiz.step) { case 1: return <Step1 />; case 2: return <Step2 />; case 3: return <Step3 />; case 4: return <Step4 />; default: return null; }
  };

  const byomDialogDescription = (): string => {
    switch (wiz.step) {
      case 1: return "Choose how you want to add your AI model";
      case 2: return "Provide model name, select your .pt file, and upload";
      case 3: return "Validating model file and architecture compatibility";
      case 4: return "Create a use case to activate your model";
      default: return "";
    }
  };

  const defaultDialogDescription = (): string => {
    switch (wiz.step) {
      case 1: return "Choose how you want to add your AI model";
      case 2: return wiz.path === "build" ? "Select station and sources for dataset collection" : "Configure your REST inference endpoint";
      case 3: return "Define model name, category, and labels";
      case 4: return "Verify model readiness before saving";
      default: return "";
    }
  };

  // For the BYOM flow, step 2 Next = "Upload" button label, step 3 has no Next (auto-validated),
  // step 4 final CTA = "Create Use Case".
  const renderFooter = () => {
    const showBack = wiz.step > 1 && !(isByomUpload && wiz.step === 3 && wiz.byomValidating);

    return (
      <div className="flex items-center justify-between w-full gap-2">
        <div>
          {showBack && (
            <Button variant="outline" onPress={handleBack}>
              <Icon icon={ArrowLeft} className="h-4 w-4 mr-1.5" />Back
            </Button>
          )}
        </div>
        <div className="flex items-center gap-2">
          <Button variant="ghost" onPress={() => onOpenChange(false)}>Cancel</Button>

          {isByomUpload ? (
            <>
              {wiz.step === 1 && (
                <Button onPress={handleNext} disabled={!canProceed()}>
                  Next<Icon icon={ArrowRight} className="h-4 w-4 ml-1.5" />
                </Button>
              )}
              {wiz.step === 2 && (
                <Button
                  onPress={handleNext}
                  disabled={!canProceed() || wiz.byomUploading}
                >
                  {wiz.byomUploading ? (
                    <><Icon icon={Loader2} className="h-4 w-4 mr-1.5 animate-spin" />Uploading…</>
                  ) : (
                    <><Icon icon={Upload} className="h-4 w-4 mr-1.5" />Upload</>
                  )}
                </Button>
              )}
              {wiz.step === 3 && wiz.byomValidationResult?.status === "pass" && (
                <Button onPress={() => update({ step: 4 })}>
                  Next<Icon icon={ArrowRight} className="h-4 w-4 ml-1.5" />
                </Button>
              )}
              {wiz.step === 4 && (
                <Button
                  onPress={handleByomCreateUseCase}
                  disabled={!canProceed()}
                >
                  {wiz.byomCreating ? (
                    <><Icon icon={Loader2} className="h-4 w-4 mr-1.5 animate-spin" />Creating…</>
                  ) : (
                    <><Icon icon={Save} className="h-4 w-4 mr-1.5" />Create Use Case</>
                  )}
                </Button>
              )}
            </>
          ) : (
            <>
              {wiz.step < totalSteps ? (
                <Button onPress={handleNext} disabled={!canProceed()}>
                  Next<Icon icon={ArrowRight} className="h-4 w-4 ml-1.5" />
                </Button>
              ) : (
                <Button onPress={handleSaveAsDraft} disabled={!canProceed()}>
                  <Icon icon={Save} className="h-4 w-4 mr-1.5" />Save as Draft
                </Button>
              )}
            </>
          )}
        </div>
      </div>
    );
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[540px] max-h-[90vh] flex flex-col overflow-hidden">
        <DialogHeader>
          <DialogTitle>Add New Model</DialogTitle>
          <DialogDescription>
            {isByomUpload ? byomDialogDescription() : defaultDialogDescription()}
          </DialogDescription>
        </DialogHeader>
        <div className="py-2 flex-1 overflow-y-auto min-h-0"><StepIndicator />{renderStep()}</div>
        <DialogFooter className="sticky bottom-0 bg-background pt-4 border-t border-border">{renderFooter()}</DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// ══════════════════════════════════════════════════════════════════════════════
//  Main ModelsPage
// ══════════════════════════════════════════════════════════════════════════════
export default function ModelsPage() {
  const router = useRouter();
  const snackbar = useSnackbar();

  // ── Store bindings (optimistic — Zustand updates are synchronous) ──────
  const models = useModelStore((s) => s.models);
  const addModel = useModelStore((s) => s.addModel);
  const updateModel = useModelStore((s) => s.updateModel);
  const removeModel = useModelStore((s) => s.removeModel);
  const hydrated = useHasHydrated();

  // ── Local UI state ─────────────────────────────────────────────────────
  const [searchQuery, setSearchQuery] = useState("");
  const debouncedSearch = useDebounce(searchQuery);
  const [sourceTypeFilter, setSourceTypeFilter] = useState<ModelSourceType | "ALL">("ALL");
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedModel, setSelectedModel] = useState<AIModel | null>(null);

  // ── Edit form state ────────────────────────────────────────────────────
  const [editForm, setEditForm] = useState({ name: "", category: "", framework: "" });

  // ── Filtered models (client-side search + source type filter) ──────────
  const filteredModels = useMemo(() => {
    let result = models;
    if (sourceTypeFilter !== "ALL") {
      result = result.filter((m) => m.sourceType === sourceTypeFilter);
    }
    if (debouncedSearch) {
      const q = debouncedSearch.toLowerCase();
      result = result.filter(
        (m) =>
          m.name.toLowerCase().includes(q) ||
          (m.framework && m.framework.toLowerCase().includes(q)) ||
          m.category.toLowerCase().includes(q) ||
          INTEGRATION_TYPE_LABELS[m.integrationType].toLowerCase().includes(q) ||
          MODEL_STATUS_LABELS[m.status].toLowerCase().includes(q) ||
          SOURCE_TYPE_LABELS[m.sourceType].toLowerCase().includes(q)
      );
    }
    return result;
  }, [models, debouncedSearch, sourceTypeFilter]);

  const sourceTypeCounts = useMemo(() => {
    const counts: Record<string, number> = { ALL: models.length };
    for (const st of Object.values(ModelSourceType)) counts[st] = 0;
    for (const m of models) counts[m.sourceType] = (counts[m.sourceType] || 0) + 1;
    return counts;
  }, [models]);

  // ── Handlers ───────────────────────────────────────────────────────────

  const handleToggleStatus = useCallback(
    (model: AIModel) => {
      const nextStatus =
        model.status === ModelStatus.DEPLOYED ? ModelStatus.PUBLISHED : ModelStatus.DEPLOYED;
      updateModel(model.id, { status: nextStatus });
      snackbar.success(
        UI_MESSAGES.models.toggleSuccess(model.name, nextStatus === ModelStatus.DEPLOYED)
      );
    },
    [updateModel, snackbar]
  );

  const handleEditClick = useCallback((model: AIModel) => {
    setSelectedModel(model);
    setEditForm({
      name: model.name,
      category: model.category,
      framework: model.framework || "",
    });
    setIsEditModalOpen(true);
  }, []);

  const handleUpdateModel = useCallback(() => {
    if (!selectedModel) return;
    updateModel(selectedModel.id, {
      name: editForm.name,
      category: editForm.category as ModelCategoryType,
      framework: (editForm.framework || null) as ModelFrameworkVal | null,
    });
    setIsEditModalOpen(false);
    snackbar.success(UI_MESSAGES.models.updateSuccess(editForm.name));
    setSelectedModel(null);
  }, [selectedModel, editForm, updateModel, snackbar]);

  const handleDeleteClick = useCallback((model: AIModel) => {
    setSelectedModel(model);
    setIsDeleteDialogOpen(true);
  }, []);

  const handleConfirmDelete = useCallback(() => {
    if (!selectedModel) return;
    removeModel(selectedModel.id);
    setIsDeleteDialogOpen(false);
    snackbar.success(UI_MESSAGES.models.deleteSuccess(selectedModel.name));
    setSelectedModel(null);
  }, [selectedModel, removeModel, snackbar]);

  const handleModelSaved = useCallback(
    (model: AIModel) => {
      addModel(model);
      const isByom = model.integrationType === IntegrationType.BYOM_UPLOAD;
      snackbar.success(
        isByom
          ? UI_MESSAGES.models.byomSuccess
          : UI_MESSAGES.models.savedAsDraft(model.name),
      );
    },
    [addModel, snackbar]
  );

  const handleCardClick = useCallback(
    (id: string) => router.push(`/admin/models/${id}`),
    [router]
  );

  // ── Render ─────────────────────────────────────────────────────────────
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">
            AI Model Management
          </h1>
          <p className="text-muted-foreground mt-1">
            Configure detection models and assignments
          </p>
        </div>
        <Button onPress={() => setIsAddModalOpen(true)} className="w-full sm:w-auto">
          <Icon icon={Plus} className="h-4 w-4 mr-2" />
          Add Model
        </Button>
      </div>

      {/* Search */}
      <div className="relative w-full">
        <Icon icon={Search} className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search models by name, framework, or category..."
          value={searchQuery}
          onChangeText={setSearchQuery}
          className="pl-10 w-full"
        />
      </div>

      {/* Source Type Filter */}
      <div className="flex items-center gap-2 flex-wrap">
        {(["ALL", ModelSourceType.PRE_DEFINED, ModelSourceType.BYOM] as const).map((type) => {
          const active = sourceTypeFilter === type;
          const label = type === "ALL" ? "All" : SOURCE_TYPE_LABELS[type];
          const count = sourceTypeCounts[type] ?? 0;
          return (
            <button
              key={type}
              type="button"
              onClick={() => setSourceTypeFilter(type)}
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium rounded-full border transition-all ${
                active
                  ? "bg-primary text-primary-foreground border-primary shadow-sm"
                  : "bg-background text-muted-foreground border-border hover:border-primary/40 hover:text-foreground"
              }`}
            >
              {label}
              <span
                className={`text-xs tabular-nums ${
                  active ? "text-primary-foreground/70" : "text-muted-foreground/60"
                }`}
              >
                {count}
              </span>
            </button>
          );
        })}
      </div>

      {/* Model Cards */}
      <div className="space-y-4">
        {!hydrated ? (
          <div className="text-center py-12">
            <p className="text-muted-foreground">Loading AI models...</p>
          </div>
        ) : filteredModels.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-muted-foreground">
              {searchQuery || sourceTypeFilter !== "ALL"
                ? "No models match your current filters."
                : "No AI models found. Click Add Model to get started."}
            </p>
          </div>
        ) : (
          filteredModels.map((model) => {
            const currentVersion = model.versions.find((v) => v.id === model.currentVersionId);
            const cameraCount = model.assignments.length;

            return (
              <div
                key={model.id}
                role="link"
                tabIndex={0}
                className="cursor-pointer"
                onClick={() => handleCardClick(model.id)}
                onKeyDown={(e: React.KeyboardEvent) => {
                  if (e.key === "Enter" || e.key === " ") {
                    e.preventDefault();
                    handleCardClick(model.id);
                  }
                }}
              >
              <Card
                className="overflow-hidden transition-shadow hover:shadow-md hover:border-primary/20"
              >
                <CardContent className="p-4 sm:p-6">
                  <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
                    {/* Left side */}
                    <div className="flex items-start gap-4 flex-1 min-w-0">
                      <div className="p-3 rounded-full bg-muted shrink-0">
                        <Icon icon={Brain} className="h-6 w-6 text-muted-foreground" />
                      </div>
                      <div className="space-y-3 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <h3 className="text-lg font-semibold text-foreground truncate">
                            {model.name}
                          </h3>
                          {/* Source type chip */}
                          <Badge variant="outline" className={sourceTypeColors[model.sourceType] || ""}>
                            {SOURCE_TYPE_LABELS[model.sourceType]}
                          </Badge>
                          {/* Framework chip */}
                          {model.framework && (
                            <Badge variant="outline" className={frameworkColors[model.framework] || ""}>
                              {model.framework}
                            </Badge>
                          )}
                          {/* Status chip */}
                          <Badge variant="outline" className={statusColors[model.status] || ""}>
                            {MODEL_STATUS_LABELS[model.status]}
                          </Badge>
                          {/* Version chip */}
                          {currentVersion && (
                            <Badge variant="outline" className="bg-violet-50 text-violet-700 border-violet-200 dark:bg-violet-900/30 dark:text-violet-400">
                              {currentVersion.version}
                            </Badge>
                          )}
                        </div>
                        <div className="flex items-start gap-8 flex-wrap">
                          <div>
                            <p className="text-sm text-muted-foreground">Category</p>
                            <p className="text-sm font-medium text-foreground">
                              {CATEGORY_LABEL_MAP[model.category] || model.category}
                            </p>
                          </div>
                          <div>
                            <p className="text-sm text-muted-foreground">Assignments</p>
                            <p className="text-sm font-medium text-foreground">
                              {cameraCount} camera{cameraCount !== 1 ? "s" : ""}
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Right side — actions */}
                    <div
                      className="flex items-center gap-3 flex-shrink-0 flex-wrap sm:flex-nowrap"
                      onClick={(e: React.MouseEvent) => e.stopPropagation()}
                      onKeyDown={(e: React.KeyboardEvent) => e.stopPropagation()}
                    >
                      {/* Enable / Disable toggle */}
                      <div className="flex items-center gap-2">
                        <Label
                          htmlFor={`model-toggle-${model.id}`}
                          className="text-sm text-muted-foreground cursor-pointer"
                        >
                          {isDeployed(model) ? "Enabled" : "Disabled"}
                        </Label>
                        <ToggleSwitch
                          id={`model-toggle-${model.id}`}
                          checked={isDeployed(model)}
                          onCheckedChange={() => handleToggleStatus(model)}
                          size="md"
                        />
                      </div>

                      <div className="h-6 w-px bg-border" />

                      {/* Edit button */}
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8"
                        onPress={() => handleEditClick(model)}
                      >
                        <Icon icon={Pencil} className="h-4 w-4 text-muted-foreground" />
                      </Button>

                      {/* Delete button */}
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20"
                        onPress={() => handleDeleteClick(model)}
                      >
                        <Icon icon={Trash2} className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
              </div>
            );
          })
        )}
      </div>

      {/* ── Add Model Wizard ──────────────────────────────────────────── */}
      <AddModelWizard
        open={isAddModalOpen}
        onOpenChange={setIsAddModalOpen}
        onModelSaved={handleModelSaved}
      />

      {/* ── Edit Model Modal ──────────────────────────────────────────── */}
      <Dialog open={isEditModalOpen} onOpenChange={setIsEditModalOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Edit Model</DialogTitle>
            <DialogDescription>Update model configuration</DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="edit-model-name">Model Name</Label>
              <Input
                id="edit-model-name"
                placeholder="e.g., Object Detection"
                value={editForm.name}
                onChangeText={(v) => setEditForm({ ...editForm, name: v })}
              />
            </div>

            <div className="space-y-2">
              <Label>Category</Label>
              <Select value={editForm.category} onValueChange={(v) => setEditForm({ ...editForm, category: v })}>
                <SelectTrigger><SelectValue placeholder="Select Category" /></SelectTrigger>
                <SelectContent>
                  {categoryOptions.map((o) => (<SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Framework</Label>
              <Select value={editForm.framework} onValueChange={(v) => setEditForm({ ...editForm, framework: v })}>
                <SelectTrigger><SelectValue placeholder="Select Framework" /></SelectTrigger>
                <SelectContent>
                  {frameworkOptions.map((o) => (<SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onPress={() => { setIsEditModalOpen(false); setSelectedModel(null); }}>Cancel</Button>
            <Button onPress={handleUpdateModel} disabled={!editForm.name.trim()}>Save Changes</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ── Delete Confirmation Dialog ────────────────────────────────── */}
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Model</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete &quot;{selectedModel?.name}&quot;? This action cannot be undone. All camera assignments using this model will be removed.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <Button variant="outline" onPress={() => setIsDeleteDialogOpen(false)}>Cancel</Button>
            <Button variant="destructive" onPress={handleConfirmDelete} className="bg-red-600 hover:bg-red-700 text-white">
              <Icon icon={Trash2} className="h-4 w-4 mr-2" />
              Delete Model
            </Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Snackbar */}
      <Snackbar
        visible={snackbar.state.visible}
        message={snackbar.state.message}
        variant={snackbar.state.variant}
        onClose={snackbar.hide}
      />
    </div>
  );
}
