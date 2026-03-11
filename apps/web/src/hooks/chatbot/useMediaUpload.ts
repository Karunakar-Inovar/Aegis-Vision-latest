"use client";

import { useCallback, useState } from "react";
import { useChatbot } from "@/contexts/ChatbotContext";
import {
  uploadMedia as apiUploadMedia,
  validateMediaFile,
  formatDuration,
  VIDEO_MAX_DURATION_SEC,
} from "@/services/chatbot/api";
import type { MediaType } from "@/services/chatbot/types";

export interface UploadResult {
  fileId: string;
  mediaType: MediaType;
  modelId?: string;
}

export interface UseMediaUploadResult {
  uploadMedia: (file: File) => Promise<UploadResult | null>;
  isUploading: boolean;
  progress: number;
  error: string | null;
  retry: () => void;
}

export function useMediaUpload(): UseMediaUploadResult {
  const {
    addMessage,
    addAssistantMessage,
    updateMessage,
    setUploadProgress,
    clearUploadProgress,
    uploadProgress,
  } = useChatbot();
  const [error, setError] = useState<string | null>(null);

  const addApiError = useCallback(
    (errMsg: string, operation: string, retryCount = 0, context?: Record<string, unknown>) => {
      addMessage({
        role: "assistant",
        content: errMsg,
        type: "api-error",
        metadata: { error: errMsg, operation, retryCount, context: context ?? {} },
      });
    },
    [addMessage]
  );

  const uploadMedia = useCallback(
    async (file: File): Promise<UploadResult | null> => {
      setError(null);

      const validation = validateMediaFile(file);
      if (!validation.valid) {
        setError(validation.error ?? "Invalid file");
        return null;
      }

      const mediaType = validation.mediaType;
      const messageId = crypto.randomUUID();
      const localPreviewUrl = URL.createObjectURL(file);

      addMessage({
        id: messageId,
        role: "user",
        content: file.name,
        timestamp: new Date().toISOString(),
        type: mediaType,
        metadata:
          mediaType === "image"
            ? {
                fileName: file.name,
                fileSize: file.size,
                fileUrl: localPreviewUrl,
                thumbnailUrl: localPreviewUrl,
                status: "uploading",
              }
            : {
                fileName: file.name,
                fileSize: file.size,
                fileUrl: localPreviewUrl,
                thumbnailUrl: localPreviewUrl,
                duration: null,
                status: "uploading",
              },
      });

      setUploadProgress(0, file.name, mediaType, file.size);

      try {
        const result = await apiUploadMedia(file, (percent) => {
          setUploadProgress(percent, file.name, mediaType, file.size);
        });

        clearUploadProgress();

        updateMessage(messageId, {
          metadata: {
            fileUrl: localPreviewUrl,
            thumbnailUrl: localPreviewUrl,
            fileName: result.fileName,
            fileSize: result.fileSize,
            status: "loaded",
            ...(mediaType === "video" && result.duration != null
              ? { duration: result.duration }
              : {}),
          },
        });

        if (
          result.duration != null &&
          result.duration > VIDEO_MAX_DURATION_SEC
        ) {
          updateMessage(messageId, {
            metadata: { status: "failed", error: "Video exceeds 5 minute limit." },
          });
          addApiError(
            "Video exceeds 5 minute limit. Please trim and re-upload.",
            "upload",
            0
          );
          URL.revokeObjectURL(localPreviewUrl);
          return null;
        }

        const durationStr =
          result.duration != null ? formatDuration(result.duration) : "—";

        addAssistantMessage(
          mediaType === "image"
            ? "Image received. Select a model to inspect."
            : `Video received (${durationStr}). Select a model to analyze.`,
          "model-select",
          { fileId: result.fileId, mediaType }
        );

        return null;
      } catch (err) {
        clearUploadProgress();
        URL.revokeObjectURL(localPreviewUrl);
        const errMsg =
          err instanceof Error ? err.message : "Upload failed. Please try again.";
        setError(errMsg);

        updateMessage(messageId, {
          metadata: {
            status: "failed",
            error: errMsg,
          },
        });

        addApiError(errMsg, "upload", 0);
        return null;
      }
    },
    [
      addMessage,
      addAssistantMessage,
      addApiError,
      updateMessage,
      setUploadProgress,
      clearUploadProgress,
    ]
  );

  const retry = useCallback(() => {
    setError(null);
  }, []);

  return {
    uploadMedia,
    isUploading: uploadProgress?.active ?? false,
    progress: uploadProgress?.progress ?? 0,
    error,
    retry,
  };
}
