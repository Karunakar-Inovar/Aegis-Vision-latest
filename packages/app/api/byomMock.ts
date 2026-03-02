/**
 * BYOM Mock API — localStorage-backed, no backend required.
 *
 * Three public functions:
 *   uploadModel()    → stores a temp upload record, returns uploadId
 *   validateModel()  → async validation (rejects non-.pt files)
 *   createUseCase()  → creates UseCase + ModelCatalogItem with rollback
 *
 * All collections are persisted independently under `aegis-byom-*` keys so
 * they survive page reloads on Vercel previews.
 */

import type {
  ByomUploadPayload,
  ByomValidationResult,
  ByomTempUpload,
  UseCase,
  ModelCatalogItem,
} from "../types/byom";

// ─── localStorage helpers ────────────────────────────────────────────────────

const KEYS = {
  uploads: "aegis-byom-uploads",
  models: "aegis-byom-models",
  useCases: "aegis-byom-use-cases",
} as const;

function read<T>(key: string): T[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T[]) : [];
  } catch {
    return [];
  }
}

function write<T>(key: string, data: T[]): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(key, JSON.stringify(data));
}

function uid(): string {
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 9)}`;
}

// ─── Duplicate model-name check ──────────────────────────────────────────────

function isModelNameTaken(name: string): boolean {
  const models = read<ModelCatalogItem>(KEYS.models);
  return models.some((m) => m.modelName.toLowerCase() === name.trim().toLowerCase());
}

// ─── 1. uploadModel ─────────────────────────────────────────────────────────

export interface UploadModelResult {
  uploadId: string;
}

/**
 * Persist a temp upload record and return the generated `uploadId`.
 *
 * Throws if a model with the same name already exists in the catalog.
 * The optional `_file` parameter is accepted for API-surface parity but
 * is not stored (no real server to receive bytes).
 */
export async function uploadModel(
  payload: ByomUploadPayload,
  _file?: File,
): Promise<UploadModelResult> {
  if (isModelNameTaken(payload.modelName)) {
    throw new Error(
      `A model named "${payload.modelName}" already exists. Choose a different name.`,
    );
  }

  const uploadId = uid();
  const record: ByomTempUpload = {
    uploadId,
    payload,
    fileName: payload.fileName,
    fileSize: payload.fileSize,
    createdAt: new Date().toISOString(),
    validated: false,
    validationResult: null,
  };

  const uploads = read<ByomTempUpload>(KEYS.uploads);
  uploads.push(record);
  write(KEYS.uploads, uploads);

  return { uploadId };
}

// ─── 2. validateModel ───────────────────────────────────────────────────────

const VALIDATION_DELAY_MS = 1_500;

/**
 * Simulate async model validation.
 *
 * Rules:
 *  - File must have a `.pt` extension → otherwise status = "fail".
 *  - On failure the temp upload record is **deleted** (no catalog entry created).
 */
export async function validateModel(
  uploadId: string,
): Promise<ByomValidationResult> {
  const uploads = read<ByomTempUpload>(KEYS.uploads);
  const idx = uploads.findIndex((u) => u.uploadId === uploadId);

  if (idx === -1) {
    throw new Error(`Upload record "${uploadId}" not found.`);
  }

  const record = uploads[idx]!;

  // Simulate network / processing latency
  await new Promise((r) => setTimeout(r, VALIDATION_DELAY_MS));

  const ext = record.fileName.split(".").pop()?.toLowerCase() ?? "";
  const isPt = ext === "pt";
  const hasValidSize = record.fileSize > 0 && record.fileSize <= 2_147_483_648; // 2 GB cap

  const modelType = record.payload.modelType;
  const version = record.payload.version;

  const checks = [
    { id: "ext", label: "File format validation (.pt)", status: isPt ? "pass" as const : "fail" as const },
    { id: "meta", label: "Load model metadata", status: (isPt && hasValidSize) ? "pass" as const : "fail" as const },
    { id: "arch", label: `Verify architecture matches ${modelType}`, status: "pass" as const },
    { id: "ver", label: `Verify version matches ${version}`, status: hasValidSize ? "pass" as const : "fail" as const },
    { id: "input", label: "Model can accept frame input", status: isPt ? "pass" as const : "fail" as const },
  ];

  const errors = checks
    .filter((c) => c.status === "fail")
    .map((c) => `${c.label}: failed`);

  const allPassed = errors.length === 0;

  const result: ByomValidationResult = {
    status: allPassed ? "pass" : "fail",
    ...(errors.length > 0 ? { errors } : {}),
    checks,
  };

  if (!allPassed) {
    // Validation failed → purge the temp upload (no catalog entry allowed)
    uploads.splice(idx, 1);
    write(KEYS.uploads, uploads);
  } else {
    // Mark validated
    uploads[idx] = { ...record, validated: true, validationResult: result };
    write(KEYS.uploads, uploads);
  }

  return result;
}

// ─── 3. createUseCase ───────────────────────────────────────────────────────

export interface CreateUseCaseInput {
  uploadId: string;
  useCaseName: string;
  isActive: boolean;
  classes: string[];
}

export interface CreateUseCaseResult {
  useCase: UseCase;
  catalogItem: ModelCatalogItem;
}

/**
 * Promote a validated upload into a UseCase + ModelCatalogItem.
 *
 * Rollback semantics: if the use-case write fails (simulated ~10 % of the
 * time in dev via `NEXT_PUBLIC_BYOM_SIMULATE_UC_FAILURE=true`), the model
 * catalog entry AND the temp upload record are removed.
 */
export async function createUseCase(
  input: CreateUseCaseInput,
): Promise<CreateUseCaseResult> {
  // ── Look up the validated upload ──────────────────────────────────────
  const uploads = read<ByomTempUpload>(KEYS.uploads);
  const upIdx = uploads.findIndex((u) => u.uploadId === input.uploadId);

  if (upIdx === -1) {
    throw new Error(`Upload record "${input.uploadId}" not found (may have been cleaned up after a failed validation).`);
  }

  const upload = uploads[upIdx]!;

  if (!upload.validated) {
    throw new Error("Model has not been validated yet. Run validateModel() first.");
  }

  // ── Duplicate name guard (re-check at creation time) ──────────────────
  if (isModelNameTaken(upload.payload.modelName)) {
    throw new Error(
      `A model named "${upload.payload.modelName}" was registered while you were editing. Choose a different name.`,
    );
  }

  const now = new Date().toISOString();
  const modelId = `mdl-${uid()}`;
  const useCaseId = `uc-${uid()}`;

  // ── Step 1: write the model catalog entry ────────────────────────────
  const catalogItem: ModelCatalogItem = {
    id: modelId,
    modelName: upload.payload.modelName,
    modelType: upload.payload.modelType,
    version: upload.payload.version,
    useCaseId,
    createdAt: now,
  };

  const models = read<ModelCatalogItem>(KEYS.models);
  models.push(catalogItem);
  write(KEYS.models, models);

  // ── Step 2: write the use case ────────────────────────────────────────
  const shouldFail = simulateUseCaseFailure();

  if (shouldFail) {
    // Rollback: remove the catalog entry we just wrote
    const rollbackModels = read<ModelCatalogItem>(KEYS.models);
    write(
      KEYS.models,
      rollbackModels.filter((m) => m.id !== modelId),
    );

    // Also remove the temp upload record (stored file entry)
    uploads.splice(upIdx, 1);
    write(KEYS.uploads, uploads);

    throw new Error(
      "Use-case creation failed (simulated). The model registration has been rolled back.",
    );
  }

  const useCase: UseCase = {
    id: useCaseId,
    name: input.useCaseName,
    isActive: input.isActive,
    modelId,
    classes: input.classes,
    createdAt: now,
  };

  const useCases = read<UseCase>(KEYS.useCases);
  useCases.push(useCase);
  write(KEYS.useCases, useCases);

  // ── Cleanup: remove the temp upload record (no longer needed) ─────────
  uploads.splice(upIdx, 1);
  write(KEYS.uploads, uploads);

  return { useCase, catalogItem };
}

// ─── Simulated failure toggle ───────────────────────────────────────────────

/**
 * Returns `true` ~10 % of the time **only** when the env flag is on.
 * Allows deterministic happy-path in production while letting QA trigger
 * rollback paths during testing.
 */
function simulateUseCaseFailure(): boolean {
  const flag =
    typeof process !== "undefined"
      ? process.env?.NEXT_PUBLIC_BYOM_SIMULATE_UC_FAILURE
      : undefined;

  if (flag?.toLowerCase() !== "true") return false;
  return Math.random() < 0.1;
}

// ─── Read helpers (useful for UI lists / debugging) ─────────────────────────

export function getAllCatalogItems(): ModelCatalogItem[] {
  return read<ModelCatalogItem>(KEYS.models);
}

export function getAllUseCases(): UseCase[] {
  return read<UseCase>(KEYS.useCases);
}

export function getPendingUploads(): ByomTempUpload[] {
  return read<ByomTempUpload>(KEYS.uploads);
}

/**
 * Hard-reset all BYOM localStorage collections.
 * Useful for tests and the "Reset demo data" button.
 */
export function resetByomStore(): void {
  if (typeof window === "undefined") return;
  Object.values(KEYS).forEach((k) => localStorage.removeItem(k));
}
