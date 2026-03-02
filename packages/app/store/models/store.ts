/**
 * AI Model Zustand Store — persisted to localStorage.
 *
 * Works offline / on Vercel preview without a backend.
 * Hydrates from SEED_MODELS on first visit, then reads from localStorage.
 */

import { useState, useEffect } from "react";
import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import {
  IntegrationType,
  ModelSourceType,
  ModelStatus,
  ROIStatus,
  BuildStepStatus,
  BUILD_STEP_LABELS,
  BuildStep,
  type AIModel,
  type Station,
  type Camera,
  type StationAssignment,
  type ModelVersion,
  type ByomConfig,
  type ValidationReport,
  type BuildFlowProgress,
} from "./types";
import { SEED_MODELS, MOCK_STATIONS, MOCK_CAMERAS } from "./mock-data";

// ─── Store shape ────────────────────────────────────────────────────────────

export interface ModelStoreState {
  /** All AI models (keyed by id for fast lookup internally, exposed as array). */
  models: AIModel[];
  /** Available stations. */
  stations: Station[];
  /** All cameras across all stations. */
  cameras: Camera[];
  /** In-progress BYOM config being edited in the wizard (not yet saved to a model). */
  draftByomConfig: ByomConfig | null;
}

export interface ModelStoreActions {
  // ── Model CRUD ──────────────────────────────────────────────────────────
  addModel: (model: AIModel) => void;
  updateModel: (id: string, patch: Partial<AIModel>) => void;
  removeModel: (id: string) => void;
  getModelById: (id: string) => AIModel | undefined;

  // ── Status transitions ──────────────────────────────────────────────────
  setModelStatus: (id: string, status: ModelStatus) => void;

  // ── Versions ────────────────────────────────────────────────────────────
  addVersion: (modelId: string, version: ModelVersion) => void;
  setCurrentVersion: (modelId: string, versionId: string) => void;

  // ── Assignments ─────────────────────────────────────────────────────────
  addAssignment: (modelId: string, assignment: StationAssignment) => void;
  updateAssignment: (modelId: string, assignmentId: string, patch: Partial<StationAssignment>) => void;
  removeAssignment: (modelId: string, assignmentId: string) => void;

  // ── BYOM config ─────────────────────────────────────────────────────────
  setByomConfig: (modelId: string, config: ByomConfig | null) => void;
  setDraftByomConfig: (config: ByomConfig | null) => void;

  // ── Build flow ──────────────────────────────────────────────────────────
  advanceBuildStep: (modelId: string) => void;
  setBuildStepStatus: (modelId: string, stepIndex: number, status: BuildStepStatus) => void;

  // ── Validation ──────────────────────────────────────────────────────────
  setValidationReport: (modelId: string, report: ValidationReport | null) => void;

  // ── Bulk / reset ────────────────────────────────────────────────────────
  resetToSeed: () => void;
}

export type ModelStore = ModelStoreState & ModelStoreActions;

// ─── Helpers ────────────────────────────────────────────────────────────────

function now(): string {
  return new Date().toISOString();
}

function patchModel(models: AIModel[], id: string, patch: Partial<AIModel>): AIModel[] {
  return models.map((m) => (m.id === id ? { ...m, ...patch, updatedAt: now() } : m));
}

function noopStorage(): Storage {
  return {
    getItem: () => null,
    setItem: () => {},
    removeItem: () => {},
    length: 0,
    clear: () => {},
    key: () => null,
  };
}

function safeLocalStorage(): Storage {
  if (typeof window !== "undefined") {
    return window.localStorage;
  }
  return noopStorage();
}

// ─── Store creation ─────────────────────────────────────────────────────────

export const useModelStore = create<ModelStore>()(
  persist(
    (set, get) => ({
      // ── Initial state ─────────────────────────────────────────────────
      models: SEED_MODELS,
      stations: MOCK_STATIONS,
      cameras: MOCK_CAMERAS,
      draftByomConfig: null,

      // ── Model CRUD ────────────────────────────────────────────────────
      addModel: (model) =>
        set((state) => ({ models: [model, ...state.models] })),

      updateModel: (id, patch) =>
        set((state) => ({ models: patchModel(state.models, id, patch) })),

      removeModel: (id) =>
        set((state) => ({ models: state.models.filter((m) => m.id !== id) })),

      getModelById: (id) => get().models.find((m) => m.id === id),

      // ── Status transitions ────────────────────────────────────────────
      setModelStatus: (id, status) =>
        set((state) => ({ models: patchModel(state.models, id, { status }) })),

      // ── Versions ──────────────────────────────────────────────────────
      addVersion: (modelId, version) =>
        set((state) => ({
          models: state.models.map((m) =>
            m.id === modelId
              ? {
                  ...m,
                  versions: [version, ...m.versions],
                  currentVersionId: version.id,
                  updatedAt: now(),
                }
              : m
          ),
        })),

      setCurrentVersion: (modelId, versionId) =>
        set((state) => ({
          models: patchModel(state.models, modelId, { currentVersionId: versionId }),
        })),

      // ── Assignments ───────────────────────────────────────────────────
      addAssignment: (modelId, assignment) =>
        set((state) => ({
          models: state.models.map((m) =>
            m.id === modelId
              ? { ...m, assignments: [...m.assignments, assignment], updatedAt: now() }
              : m
          ),
        })),

      updateAssignment: (modelId, assignmentId, patch) =>
        set((state) => ({
          models: state.models.map((m) =>
            m.id === modelId
              ? {
                  ...m,
                  assignments: m.assignments.map((a) =>
                    a.id === assignmentId ? { ...a, ...patch } : a
                  ),
                  updatedAt: now(),
                }
              : m
          ),
        })),

      removeAssignment: (modelId, assignmentId) =>
        set((state) => ({
          models: state.models.map((m) =>
            m.id === modelId
              ? {
                  ...m,
                  assignments: m.assignments.filter((a) => a.id !== assignmentId),
                  updatedAt: now(),
                }
              : m
          ),
        })),

      // ── BYOM config ───────────────────────────────────────────────────
      setByomConfig: (modelId, config) =>
        set((state) => ({
          models: patchModel(state.models, modelId, { byomConfig: config }),
        })),

      setDraftByomConfig: (config) => set({ draftByomConfig: config }),

      // ── Build flow ────────────────────────────────────────────────────
      advanceBuildStep: (modelId) =>
        set((state) => ({
          models: state.models.map((m) => {
            if (m.id !== modelId) return m;
            const flow = { ...m.buildFlow, steps: [...m.buildFlow.steps] };
            const current = flow.currentStep;
            const currentStepData = flow.steps[current];
            if (currentStepData) {
              flow.steps[current] = {
                ...currentStepData,
                status: BuildStepStatus.COMPLETED,
                completedAt: now(),
              };
            }
            const nextIdx = current + 1;
            if (nextIdx < flow.steps.length) {
              const nextStepData = flow.steps[nextIdx];
              if (nextStepData) {
                flow.steps[nextIdx] = {
                  ...nextStepData,
                  status: BuildStepStatus.IN_PROGRESS,
                  startedAt: now(),
                };
              }
              flow.currentStep = nextIdx;
            }
            return { ...m, buildFlow: flow, updatedAt: now() };
          }),
        })),

      setBuildStepStatus: (modelId, stepIndex, status) =>
        set((state) => ({
          models: state.models.map((m) => {
            if (m.id !== modelId) return m;
            const flow = { ...m.buildFlow, steps: [...m.buildFlow.steps] };
            const stepData = flow.steps[stepIndex];
            if (stepData) {
              flow.steps[stepIndex] = {
                ...stepData,
                status,
                ...(status === BuildStepStatus.IN_PROGRESS ? { startedAt: now() } : {}),
                ...(status === BuildStepStatus.COMPLETED ? { completedAt: now() } : {}),
              };
            }
            return { ...m, buildFlow: flow, updatedAt: now() };
          }),
        })),

      // ── Validation ────────────────────────────────────────────────────
      setValidationReport: (modelId, report) =>
        set((state) => ({
          models: patchModel(state.models, modelId, { validationReport: report }),
        })),

      // ── Reset ─────────────────────────────────────────────────────────
      resetToSeed: () =>
        set({
          models: SEED_MODELS,
          stations: MOCK_STATIONS,
          cameras: MOCK_CAMERAS,
          draftByomConfig: null,
        }),
    }),
    {
      name: "aegis-model-store",
      version: 1,
      storage: createJSONStorage(() => safeLocalStorage()),
      partialize: (state) => ({
        models: state.models,
        stations: state.stations,
        cameras: state.cameras,
        draftByomConfig: state.draftByomConfig,
      }),
      migrate: (persisted: unknown, version: number) => {
        const state = persisted as ModelStoreState;
        if (version === 0 && state.models) {
          state.models = state.models.map((m) => {
            if ((m as AIModel).sourceType) return m;
            const it = m.integrationType;
            if (it === IntegrationType.BYOM_UPLOAD || it === IntegrationType.BYOM_REST) {
              return { ...m, sourceType: ModelSourceType.BYOM };
            }
            if (it === IntegrationType.BUILT && m.status === ModelStatus.DRAFT) {
              return { ...m, sourceType: ModelSourceType.BUILD_YOUR_MODEL };
            }
            return { ...m, sourceType: ModelSourceType.PRE_DEFINED };
          });
        }
        return state;
      },
    }
  )
);

// ─── Hydration hook (Zustand v5 recommended pattern) ─────────────────────

/**
 * Returns `true` once the persist middleware has finished reading from
 * localStorage and merging into the store.  Use this instead of the old
 * `_hydrated` flag to avoid the closure-timing issue in Zustand v5.
 */
export function useHasHydrated(): boolean {
  const [hydrated, setHydrated] = useState(useModelStore.persist.hasHydrated());

  useEffect(() => {
    const unsub = useModelStore.persist.onFinishHydration(() =>
      setHydrated(true)
    );
    return unsub;
  }, []);

  return hydrated;
}
