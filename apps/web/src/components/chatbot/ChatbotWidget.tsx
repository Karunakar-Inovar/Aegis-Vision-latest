"use client";

import { useCallback } from "react";
import { useChatbot } from "@/contexts/ChatbotContext";
import {
  useMediaUpload,
  useDetection,
  useVideoAnalysis,
  useIncidentCreation,
} from "@/hooks/chatbot";
import { setLastUsedModelId } from "@/services/chatbot/modelMemory";
import { ChatbotPanel } from "./ChatbotPanel";
import type {
  DetectionResult,
  FlaggedFrame,
  VideoAnalysisResult,
} from "@/services/chatbot/types";

const HELP_RESPONSE = `I can help with image and video inspection:

• **Upload an image** – I'll run defect detection and show results. You can log any defects as incidents.
• **Upload a video** – I'll analyze frames, show a timeline of defects, and let you log flagged frames as incidents (one at a time or all at once).
• **Type "clear"** – Clears the conversation.
• **Type "help"** – Shows this message.

Upload a file to get started!`;

const DEFAULT_RESPONSE =
  "I can help with image and video inspection! Upload a file to get started, or type 'help' for more info.";

export function ChatbotWidget() {
  const {
    addAssistantMessage,
    addUserMessage,
    updateMessage,
    clearMessages,
    messages,
    removeMessage,
    selectModel,
  } = useChatbot();
  const { uploadMedia } = useMediaUpload();
  const { runDetection } = useDetection();
  const { startAnalysis, cancel, isAnalyzing } = useVideoAnalysis();
  const {
    startIncidentFlow,
    startFrameIncidentFlow,
    startBatchIncidentFlow,
    confirmIncident,
    cancelIncident,
    confirmBatchLogging,
    cancelBatchLogging,
    isCreating,
  } = useIncidentCreation();

  const handleSendMessage = useCallback(
    (text: string) => {
      const trimmed = text.trim();
      if (!trimmed) return;

      addUserMessage(trimmed);

      const lower = trimmed.toLowerCase();
      if (lower.includes("help")) {
        addAssistantMessage(HELP_RESPONSE);
      } else if (lower.includes("clear")) {
        clearMessages();
        addAssistantMessage("Conversation cleared.");
      } else {
        addAssistantMessage(DEFAULT_RESPONSE);
      }
    },
    [addUserMessage, addAssistantMessage, clearMessages]
  );

  const runInspectionWithModel = useCallback(
    (fileId: string, modelId: string, mediaType: "image" | "video") => {
      setLastUsedModelId(modelId);
      selectModel(modelId);
      if (mediaType === "image") {
        runDetection(fileId, modelId);
      } else {
        startAnalysis(fileId, modelId);
      }
    },
    [selectModel, runDetection, startAnalysis]
  );

  const handleFileSelected = useCallback(
    async (file: File) => {
      await uploadMedia(file);
    },
    [uploadMedia]
  );

  const handleModelSelectAndRun = useCallback(
    (messageId: string, modelId: string) => {
      const msg = messages.find((m) => m.id === messageId);
      if (!msg?.metadata) return;
      const meta = msg.metadata as { fileId?: string; mediaType?: "image" | "video" };
      const fileId = meta.fileId ?? "";
      const mediaType = meta.mediaType ?? "image";
      if (!fileId) return;

      updateMessage(messageId, {
        type: "text",
        content: "Running inspection...",
        metadata: {},
      });

      runInspectionWithModel(fileId, modelId, mediaType);
    },
    [messages, updateMessage, runInspectionWithModel]
  );

  const handleModelSelectCancel = useCallback(
    (messageId: string) => {
      const idx = messages.findIndex((m) => m.id === messageId);
      removeMessage(messageId);
      if (idx > 0) {
        const prevMsg = messages[idx - 1];
        if (prevMsg && (prevMsg.type === "image" || prevMsg.type === "video")) {
          removeMessage(prevMsg.id);
        }
      }
      addAssistantMessage(
        "Inspection cancelled. Upload another file whenever you're ready."
      );
    },
    [messages, removeMessage, addAssistantMessage]
  );

  const handleModelConfirmationRun = useCallback(
    (messageId: string) => {
      const msg = messages.find((m) => m.id === messageId);
      if (!msg?.metadata) return;
      const meta = msg.metadata as {
        fileId?: string;
        mediaType?: "image" | "video";
        modelId?: string;
      };
      const fileId = meta.fileId ?? "";
      const modelId = meta.modelId ?? "";
      const mediaType = meta.mediaType ?? "image";
      if (!fileId || !modelId) return;

      runInspectionWithModel(fileId, modelId, mediaType);
    },
    [messages, runInspectionWithModel]
  );

  const handleModelConfirmationChangeModel = useCallback(
    (messageId: string) => {
      const msg = messages.find((m) => m.id === messageId);
      if (!msg?.metadata) return;
      const meta = msg.metadata as {
        fileId?: string;
        mediaType?: "image" | "video";
      };
      const fileId = meta.fileId ?? "";
      const mediaType = meta.mediaType ?? "image";

      updateMessage(messageId, {
        type: "model-select",
        content:
          mediaType === "image"
            ? "Image received. Select a model to inspect."
            : "Video received. Select a model to analyze.",
        metadata: { fileId, mediaType },
      });
    },
    [messages, updateMessage]
  );

  const handleLogIncident = useCallback(
    (result: DetectionResult & { sourceFileId?: string }) => {
      const fileId = result.sourceFileId ?? "";
      if (fileId) startIncidentFlow(result, fileId);
    },
    [startIncidentFlow]
  );

  const handleLogFrameIncident = useCallback(
    (
      frame: FlaggedFrame,
      metadata: { sourceFileId?: string; modelId?: string }
    ) => {
      const fileId = metadata.sourceFileId ?? "";
      if (fileId) startFrameIncidentFlow(frame, fileId);
    },
    [startFrameIncidentFlow]
  );

  const handleLogAllIncidents = useCallback(
    (result: VideoAnalysisResult) => {
      const meta = result as VideoAnalysisResult & {
        sourceFileId?: string;
        modelId?: string;
      };
      const fileId = meta.sourceFileId ?? "";
      const frames = result.flaggedFrames ?? [];
      if (frames.length > 0) startBatchIncidentFlow(frames, fileId);
    },
    [startBatchIncidentFlow]
  );

  const handleLogAllConfirm = useCallback(
    (
      messageId: string,
      metadata: {
        flaggedFrames: FlaggedFrame[];
        fileId: string;
        modelId: string;
      }
    ) => {
      confirmBatchLogging(messageId, metadata);
    },
    [confirmBatchLogging]
  );

  const handleLogAllCancel = useCallback(
    (messageId: string) => {
      cancelBatchLogging(messageId);
    },
    [cancelBatchLogging]
  );

  const handleRetryError = useCallback(
    (messageId: string) => {
      const msg = messages.find((m) => m.id === messageId);
      if (!msg?.metadata) return;
      const meta = msg.metadata as {
        operation?: string;
        retryCount?: number;
        context?: { fileId?: string; modelId?: string };
      };
      const operation = meta.operation ?? "";
      const retryCount = (meta.retryCount ?? 0) + 1;
      const fileId = meta.context?.fileId ?? "";
      const modelId = meta.context?.modelId ?? "";

      removeMessage(messageId);

      if (operation === "detect" && fileId && modelId) {
        runDetection(fileId, modelId, retryCount);
      } else if (operation === "analyze" && fileId && modelId) {
        startAnalysis(fileId, modelId, retryCount);
      }
      // upload: no retry - user re-attaches file
    },
    [messages, removeMessage, runDetection, startAnalysis]
  );

  const handleRetryFailed = useCallback(
    async (messageId: string) => {
      const msg = messages.find((m) => m.id === messageId);
      if (!msg?.metadata) return;
      const meta = msg.metadata as {
        flaggedFrames: FlaggedFrame[];
        fileId: string;
        modelId: string;
        failedFrames?: FlaggedFrame[];
        incidentIds?: string[];
      };
      const failedFrames = meta.failedFrames ?? [];
      const fileId = meta.fileId ?? "";
      const modelId = meta.modelId ?? "";
      const previousIncidentIds = meta.incidentIds ?? [];
      if (failedFrames.length === 0) return;
      await confirmBatchLogging(
        messageId,
        { flaggedFrames: failedFrames, fileId, modelId },
        previousIncidentIds
      );
    },
    [messages, confirmBatchLogging]
  );

  return (
    <ChatbotPanel
      onSendMessage={handleSendMessage}
      onFileSelected={handleFileSelected}
      onRetryError={handleRetryError}
      isAnalyzing={isAnalyzing}
      onCancelAnalysis={cancel}
      onLogIncident={handleLogIncident}
      onLogFrameIncident={handleLogFrameIncident}
      onLogAllIncidents={handleLogAllIncidents}
      onLogAllConfirm={handleLogAllConfirm}
      onLogAllCancel={handleLogAllCancel}
      onLogAllRetryFailed={handleRetryFailed}
      onConfirmIncident={confirmIncident}
      onCancelIncident={cancelIncident}
      isCreating={isCreating}
      onModelSelectAndRun={handleModelSelectAndRun}
      onModelSelectCancel={handleModelSelectCancel}
      onModelConfirmationRun={handleModelConfirmationRun}
      onModelConfirmationChangeModel={handleModelConfirmationChangeModel}
    />
  );
}
