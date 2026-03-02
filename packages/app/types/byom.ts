/**
 * BYOM (Bring-Your-Own-Model) Data Contracts
 *
 * Shared types used by the mock API layer and every UI consumer.
 * Keep this file free of runtime imports so it can be used anywhere.
 */

// ─── Upload ──────────────────────────────────────────────────────────────────

export const BYOM_MODEL_TYPES = ["YOLO"] as const;
export type ByomModelType = (typeof BYOM_MODEL_TYPES)[number];

export const BYOM_VERSIONS: Record<ByomModelType, readonly string[]> = {
  YOLO: ["v8", "v9", "v10", "v11"],
} as const;

export interface ByomUploadPayload {
  modelName: string;
  modelType: ByomModelType;
  version: string;
  fileName: string;
  fileSize: number;
}

// ─── Validation ──────────────────────────────────────────────────────────────

export type ByomValidationStatus = "pass" | "fail";

export interface ByomValidationCheckItem {
  id: string;
  label: string;
  status: "pass" | "fail";
}

export interface ByomValidationResult {
  status: ByomValidationStatus;
  errors?: string[];
  checks: ByomValidationCheckItem[];
}

// ─── Use Case ────────────────────────────────────────────────────────────────

export interface UseCase {
  id: string;
  name: string;
  isActive: boolean;
  modelId: string;
  classes: string[];
  createdAt: string;
}

// ─── Model Catalog ───────────────────────────────────────────────────────────

export interface ModelCatalogItem {
  id: string;
  modelName: string;
  modelType: ByomModelType;
  version: string;
  useCaseId: string;
  createdAt: string;
}

// ─── Internal: temp upload record stored by the mock API ─────────────────────

export interface ByomTempUpload {
  uploadId: string;
  payload: ByomUploadPayload;
  fileName: string;
  fileSize: number;
  createdAt: string;
  validated: boolean;
  validationResult: ByomValidationResult | null;
}
