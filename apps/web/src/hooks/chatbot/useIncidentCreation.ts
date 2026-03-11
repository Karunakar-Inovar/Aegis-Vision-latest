"use client";

import { useCallback, useRef, useState } from "react";
import { useChatbot } from "@/contexts/ChatbotContext";
import { createIncident } from "@/services/chatbot/api";
import type {
  Defect,
  DetectionResult,
  FlaggedFrame,
  IncidentDraft,
} from "@/services/chatbot/types";

const SEVERITY_ORDER = { critical: 0, major: 1, minor: 2 } as const;

function worstDefectFromResult(result: DetectionResult): Defect | null {
  const defects = result.defects ?? [];
  if (defects.length === 0) return null;
  return defects.reduce((a, b) =>
    SEVERITY_ORDER[a.severity] <= SEVERITY_ORDER[b.severity] ? a : b
  );
}

function worstDefectFromFrame(frame: FlaggedFrame): Defect | null {
  if (frame.defects.length === 0) return null;
  return frame.defects.reduce((a, b) =>
    SEVERITY_ORDER[a.severity] <= SEVERITY_ORDER[b.severity] ? a : b
  );
}

export interface UseIncidentCreationResult {
  startIncidentFlow: (detectionResult: DetectionResult, fileId: string) => void;
  startFrameIncidentFlow: (frame: FlaggedFrame, fileId: string) => void;
  startBatchIncidentFlow: (frames: FlaggedFrame[], fileId: string) => void;
  confirmIncident: (draft: IncidentDraft, notes?: string) => Promise<void>;
  cancelIncident: () => void;
  confirmBatchLogging: (
    messageId: string,
    metadata: { flaggedFrames: FlaggedFrame[]; fileId: string; modelId: string },
    previousIncidentIds?: string[]
  ) => Promise<void>;
  cancelBatchLogging: (messageId: string) => void;
  isCreating: boolean;
  batchProgress: { current: number; total: number } | null;
}

export function useIncidentCreation(): UseIncidentCreationResult {
  const {
    addAssistantMessage,
    addMessage,
    updateMessage,
    removeMessage,
    selectedModelId,
  } = useChatbot();

  const [isCreating, setIsCreating] = useState(false);
  const [batchProgress, setBatchProgress] = useState<{
    current: number;
    total: number;
  } | null>(null);

  const pendingIncidentMessageIdRef = useRef<string | null>(null);

  const startIncidentFlow = useCallback(
    (detectionResult: DetectionResult, fileId: string) => {
      const defect = worstDefectFromResult(detectionResult);
      if (!defect || !selectedModelId) {
        addAssistantMessage("No defects to log or model not selected.");
        return;
      }

      const draft: IncidentDraft = {
        defectType: defect.type,
        severity: defect.severity,
        confidence: defect.confidence,
        sourceType: "chatbot-image",
        sourceFileId: fileId,
        annotatedImageUrl:
          detectionResult.annotatedImageUrl ?? detectionResult.originalImageUrl ?? "",
        modelId: selectedModelId,
        timestamp: new Date().toISOString(),
      };

      const messageId = crypto.randomUUID();
      addMessage({
        id: messageId,
        role: "assistant",
        content: "",
        timestamp: new Date().toISOString(),
        type: "incident-card",
        metadata: { status: "confirming", draft },
      });

      pendingIncidentMessageIdRef.current = messageId;
    },
    [addAssistantMessage, addMessage, selectedModelId]
  );

  const startFrameIncidentFlow = useCallback(
    (frame: FlaggedFrame, fileId: string) => {
      const defect = worstDefectFromFrame(frame);
      if (!defect || !selectedModelId) {
        addAssistantMessage("No defects to log or model not selected.");
        return;
      }

      const draft: IncidentDraft = {
        defectType: defect.type,
        severity: defect.severity,
        confidence: defect.confidence,
        sourceType: "chatbot-video-frame",
        sourceFileId: fileId,
        annotatedImageUrl:
          frame.annotatedThumbnailUrl ?? frame.thumbnailUrl,
        modelId: selectedModelId,
        frameTimestamp: frame.timestamp,
        timestamp: new Date().toISOString(),
      };

      const messageId = crypto.randomUUID();
      addMessage({
        id: messageId,
        role: "assistant",
        content: "",
        timestamp: new Date().toISOString(),
        type: "incident-card",
        metadata: { status: "confirming", draft },
      });

      pendingIncidentMessageIdRef.current = messageId;
    },
    [addAssistantMessage, addMessage, selectedModelId]
  );

  const startBatchIncidentFlow = useCallback(
    (frames: FlaggedFrame[], fileId: string) => {
      if (frames.length === 0) return;
      if (!selectedModelId) {
        addAssistantMessage("Please select a model first.");
        return;
      }

      const messageId = crypto.randomUUID();
      addMessage({
        id: messageId,
        role: "assistant",
        content: `This will create ${frames.length} incident${frames.length !== 1 ? "s" : ""}, one for each flagged frame. Proceed?`,
        timestamp: new Date().toISOString(),
        type: "log-all-confirmation",
        metadata: {
          flaggedFrames: frames,
          fileId,
          modelId: selectedModelId,
          status: "pending",
        },
      });
    },
    [addAssistantMessage, addMessage, selectedModelId]
  );

  const confirmIncident = useCallback(
    async (draft: IncidentDraft, notes?: string) => {
      const messageId = pendingIncidentMessageIdRef.current;
      if (!messageId) return;

      const finalDraft: IncidentDraft = {
        ...draft,
        notes: notes?.trim() || undefined,
      };

      setIsCreating(true);
      updateMessage(messageId, {
        metadata: { status: "creating", draft: finalDraft },
      });

      try {
        const response = await createIncident(finalDraft);
        updateMessage(messageId, {
          metadata: {
            status: "created",
            incident: response,
            draft: finalDraft,
          },
        });
      } catch (err) {
        const errorMsg =
          err instanceof Error ? err.message : "Failed to create incident.";
        updateMessage(messageId, {
          metadata: {
            status: "error",
            error: errorMsg,
            draft: finalDraft,
          },
        });
      } finally {
        setIsCreating(false);
        pendingIncidentMessageIdRef.current = null;
      }
    },
    [updateMessage]
  );

  const cancelIncident = useCallback(() => {
    const messageId = pendingIncidentMessageIdRef.current;
    if (messageId) {
      removeMessage(messageId);
      pendingIncidentMessageIdRef.current = null;
    }
    addAssistantMessage("Incident logging cancelled.");
  }, [addAssistantMessage, removeMessage]);

  const confirmBatchLogging = useCallback(
    async (
      messageId: string,
      metadata: {
        flaggedFrames: FlaggedFrame[];
        fileId: string;
        modelId: string;
      },
      previousIncidentIds: string[] = []
    ) => {
      const { flaggedFrames, fileId, modelId } = metadata;
      const total = flaggedFrames.length;
      const incidentIds: string[] = [...previousIncidentIds];

      setBatchProgress({ current: previousIncidentIds.length, total: previousIncidentIds.length + total });
      const failedFrames: FlaggedFrame[] = [];

      for (let i = 0; i < total; i++) {
        setBatchProgress({
          current: previousIncidentIds.length + i + 1,
          total: previousIncidentIds.length + total,
        });
        updateMessage(messageId, {
          metadata: {
            flaggedFrames,
            fileId,
            modelId,
            status: "progress",
            progress: {
              current: previousIncidentIds.length + i + 1,
              total: previousIncidentIds.length + total,
            },
          },
        });

        const frame = flaggedFrames[i];
        const defect = worstDefectFromFrame(frame);
        if (!defect) {
          failedFrames.push(frame);
          continue;
        }

        try {
          const res = await createIncident({
            defectType: defect.type,
            severity: defect.severity,
            confidence: defect.confidence,
            sourceType: "chatbot-video-frame",
            sourceFileId: fileId,
            annotatedImageUrl:
              frame.annotatedThumbnailUrl ?? frame.thumbnailUrl,
            modelId,
            frameTimestamp: frame.timestamp,
            timestamp: new Date().toISOString(),
          });
          incidentIds.push(res.incidentId);
        } catch {
          failedFrames.push(frame);
        }
      }

      setBatchProgress(null);

      if (failedFrames.length === 0) {
        updateMessage(messageId, {
          content: "",
          metadata: {
            flaggedFrames,
            fileId,
            modelId,
            status: "success",
            incidentIds,
          },
        });
      } else {
        updateMessage(messageId, {
          content: "",
          metadata: {
            flaggedFrames,
            fileId,
            modelId,
            status: "partial-failure",
            incidentIds,
            failedFrames,
          },
        });
      }
    },
    [updateMessage]
  );

  const cancelBatchLogging = useCallback(
    (messageId: string) => {
      updateMessage(messageId, {
        content: "Batch logging cancelled.",
        metadata: { status: "cancelled" },
      });
    },
    [updateMessage]
  );

  return {
    startIncidentFlow,
    startFrameIncidentFlow,
    startBatchIncidentFlow,
    confirmIncident,
    cancelIncident,
    confirmBatchLogging,
    cancelBatchLogging,
    isCreating,
    batchProgress,
  };
}
