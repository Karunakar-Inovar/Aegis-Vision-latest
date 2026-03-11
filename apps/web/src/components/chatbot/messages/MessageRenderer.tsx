"use client";

import type {
  ChatMessage,
  DetectionResult,
  VideoAnalysisResult,
} from "@/services/chatbot/types";
import type { FlaggedFrame } from "@/services/chatbot/types";
import { TextMessage } from "./TextMessage";
import { ImageMessage } from "./ImageMessage";
import { VideoMessage } from "./VideoMessage";
import { DetectionResultMessage } from "./DetectionResultMessage";
import { VideoReportMessage } from "./VideoReportMessage";
import { VideoAnalysisProgressMessage } from "./VideoAnalysisProgressMessage";
import { IncidentCardMessage } from "./IncidentCardMessage";
import { LogAllConfirmationMessage } from "./LogAllConfirmationMessage";
import { ErrorMessage } from "./ErrorMessage";
import { ModelSelectCardContainer } from "./ModelSelectCardContainer";
import { ModelConfirmationMessage } from "./ModelConfirmationMessage";

interface MessageRendererProps {
  message: ChatMessage;
  onLogIncident?: (
    result: DetectionResult & { sourceFileId?: string }
  ) => void;
  onLogAllIncidents?: (result: VideoAnalysisResult) => void;
  onLogFrameIncident?: (
    frame: FlaggedFrame,
    metadata: { sourceFileId?: string; modelId?: string }
  ) => void;
  onLogAllConfirm?: (
    messageId: string,
    metadata: {
      flaggedFrames: FlaggedFrame[];
      fileId: string;
      modelId: string;
    }
  ) => void;
  onLogAllCancel?: (messageId: string) => void;
  onLogAllRetryFailed?: (messageId: string) => void;
  onConfirmIncident?: (draft: import("@/services/chatbot/types").IncidentDraft, notes?: string) => void;
  onCancelIncident?: () => void;
  isCreating?: boolean;
  onRetryError?: (messageId: string) => void;
  onCancelAnalysis?: () => void;
  onModelSelectAndRun?: (messageId: string, modelId: string) => void;
  onModelSelectCancel?: (messageId: string) => void;
  onModelConfirmationRun?: (messageId: string) => void;
  onModelConfirmationChangeModel?: (messageId: string) => void;
}

export function MessageRenderer({
  message,
  onLogIncident,
  onLogAllIncidents,
  onLogFrameIncident,
  onLogAllConfirm,
  onLogAllCancel,
  onLogAllRetryFailed,
  onConfirmIncident,
  onCancelIncident,
  isCreating,
  onRetryError,
  onCancelAnalysis,
  onModelSelectAndRun,
  onModelSelectCancel,
  onModelConfirmationRun,
  onModelConfirmationChangeModel,
}: MessageRendererProps) {
  const isUser = message.role === "user";
  const isSystem = message.role === "system";

  const wrapperClass = `flex mb-4 ${isUser ? "justify-end" : "justify-start"}`;

  const content = (() => {
    switch (message.type) {
      case "text":
        return <TextMessage message={message} />;
      case "image":
        return <ImageMessage message={message} />;
      case "video":
        return <VideoMessage message={message} />;
      case "detection-result":
        return (
          <DetectionResultMessage
            message={message}
            onLogIncident={onLogIncident}
          />
        );
      case "video-report":
        return (
          <VideoReportMessage
            message={message}
            onLogAllIncidents={onLogAllIncidents}
            onLogFrameIncident={onLogFrameIncident}
          />
        );
      case "video-analysis-progress":
        return (
          <VideoAnalysisProgressMessage
            message={message}
            onCancelAnalysis={onCancelAnalysis}
          />
        );
      case "log-all-confirmation":
        return (
          <LogAllConfirmationMessage
            message={message}
            onConfirm={
              onLogAllConfirm
                ? (messageId) => {
                    const meta = (message.metadata ?? {}) as {
                      flaggedFrames?: FlaggedFrame[];
                      fileId?: string;
                      sourceFileId?: string;
                      modelId?: string;
                    };
                    const fileId = meta.fileId ?? meta.sourceFileId ?? "";
                    if (meta.flaggedFrames && fileId && meta.modelId) {
                      onLogAllConfirm(messageId, {
                        flaggedFrames: meta.flaggedFrames,
                        fileId,
                        modelId: meta.modelId,
                      });
                    }
                  }
                : () => {}
            }
            onCancel={
              onLogAllCancel
                ? (messageId) => onLogAllCancel(messageId)
                : () => {}
            }
            onRetryFailed={onLogAllRetryFailed}
          />
        );
      case "incident-card":
        return (
          <IncidentCardMessage
            message={message}
            onConfirmIncident={onConfirmIncident}
            onCancelIncident={onCancelIncident}
            isCreating={isCreating}
          />
        );
      case "api-error":
        return (
          <ErrorMessage
            message={message}
            onRetry={onRetryError}
          />
        );
      case "model-select": {
        const meta = (message.metadata ?? {}) as {
          fileId?: string;
          mediaType?: "image" | "video";
        };
        return (
          <ModelSelectCardContainer
            messageId={message.id}
            mediaType={meta.mediaType ?? "image"}
            onModelSelect={
              onModelSelectAndRun
                ? (msgId, modelId) => onModelSelectAndRun(msgId, modelId)
                : () => {}
            }
            onCancel={
              onModelSelectCancel
                ? (msgId) => onModelSelectCancel(msgId)
                : () => {}
            }
          />
        );
      }
      case "model-confirmation":
        return (
          <ModelConfirmationMessage
            message={message}
            onRunInspection={
              onModelConfirmationRun
                ? (msgId) => onModelConfirmationRun(msgId)
                : () => {}
            }
            onChangeModel={
              onModelConfirmationChangeModel
                ? (msgId) => onModelConfirmationChangeModel(msgId)
                : () => {}
            }
          />
        );
      default:
        return <TextMessage message={message} />;
    }
  })();

  return <div className={wrapperClass}>{content}</div>;
}
