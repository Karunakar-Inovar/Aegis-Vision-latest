"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useChatbot } from "@/contexts/ChatbotContext";
import {
  analyzeVideo,
  getVideoAnalysisStatus,
  getVideoAnalysisResult,
} from "@/services/chatbot/api";
import type {
  VideoAnalysisProgress,
  VideoAnalysisResult,
} from "@/services/chatbot/types";

const POLL_INTERVAL_MS = 2000;
const POLL_WARNING_MS = 60_000;
const POLL_TIMEOUT_MS = 120_000;
const MAX_RETRIES = 3;

export interface UseVideoAnalysisResult {
  startAnalysis: (fileId: string, modelId: string, retryCount?: number) => Promise<void>;
  isAnalyzing: boolean;
  progress: VideoAnalysisProgress | null;
  result: VideoAnalysisResult | null;
  error: string | null;
  cancel: () => void;
  retry: () => void;
}

function getStageDisplayText(status: VideoAnalysisProgress): string {
  switch (status.stage) {
    case "extracting-frames":
      return "Extracting frames...";
    case "detecting":
      if (
        status.currentFrame != null &&
        status.totalFrames != null
      ) {
        return `Running detection (frame ${status.currentFrame}/${status.totalFrames})...`;
      }
      return "Running detection...";
    case "generating-report":
      return "Generating report...";
    case "complete":
      return "Complete";
    case "error":
      return status.message;
    default:
      return status.message;
  }
}

export function useVideoAnalysis(): UseVideoAnalysisResult {
  const {
    addAssistantMessage,
    addMessage,
    updateMessage,
    removeMessage,
    setLoading,
    setVideoAnalysisProgress,
    clearVideoAnalysisProgress,
  } = useChatbot();

  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [progress, setProgress] = useState<VideoAnalysisProgress | null>(null);
  const [result, setResult] = useState<VideoAnalysisResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const cancelledRef = useRef(false);
  const statusMessageIdRef = useRef<string | null>(null);
  const pollTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const startTimeRef = useRef<number>(0);
  const lastFileIdRef = useRef<string | null>(null);
  const lastModelIdRef = useRef<string | null>(null);

  const clearPollTimeout = useCallback(() => {
    if (pollTimeoutRef.current) {
      clearTimeout(pollTimeoutRef.current);
      pollTimeoutRef.current = null;
    }
  }, []);

  const cancel = useCallback(() => {
    cancelledRef.current = true;
    clearPollTimeout();
    clearVideoAnalysisProgress();
    setLoading(false);
    setIsAnalyzing(false);
    setProgress(null);
    addAssistantMessage("Analysis cancelled.");
  }, [clearPollTimeout, clearVideoAnalysisProgress, setLoading, addAssistantMessage]);

  useEffect(() => {
    return () => {
      cancelledRef.current = true;
      clearPollTimeout();
    };
  }, [clearPollTimeout]);

  const pollWithRetry = useCallback(
    async (jobId: string): Promise<VideoAnalysisProgress> => {
      let lastErr: Error | null = null;
      for (let attempt = 0; attempt < MAX_RETRIES; attempt++) {
        try {
          return await getVideoAnalysisStatus(jobId);
        } catch (err) {
          lastErr = err instanceof Error ? err : new Error(String(err));
          if (attempt < MAX_RETRIES - 1) {
            await new Promise((r) => setTimeout(r, 1000 * (attempt + 1)));
          }
        }
      }
      throw lastErr ?? new Error("Failed to get status");
    },
    []
  );

  const startAnalysis = useCallback(
    async (fileId: string, modelId: string, retryCount = 0) => {
      setError(null);
      setResult(null);
      lastFileIdRef.current = fileId;
      lastModelIdRef.current = modelId;

      setLoading(true);
      setIsAnalyzing(true);
      cancelledRef.current = false;
      startTimeRef.current = Date.now();

      try {
        const { jobId } = await analyzeVideo({
          fileId,
          modelId,
          confidenceThreshold: 0.5,
          frameInterval: 2,
        });

        const statusMsgId = `video-status-${jobId}`;
        statusMessageIdRef.current = statusMsgId;
        addMessage({
          id: statusMsgId,
          role: "assistant",
          content: "Starting video analysis...",
          timestamp: new Date().toISOString(),
          type: "video-analysis-progress",
          metadata: {
            stage: "extracting-frames",
            progress: 0,
            message: "Starting video analysis...",
          },
        });

        const poll = async () => {
          if (cancelledRef.current) return;

          const elapsed = Date.now() - startTimeRef.current;
          if (elapsed >= POLL_TIMEOUT_MS) {
            clearPollTimeout();
            clearVideoAnalysisProgress();
            setLoading(false);
            setIsAnalyzing(false);
            setProgress(null);
            const sid = statusMessageIdRef.current;
            if (sid) {
              removeMessage(sid);
              statusMessageIdRef.current = null;
            }
            setError("Analysis timed out.");
            addMessage({
              role: "assistant",
              content: "Analysis timed out.",
              type: "api-error",
              metadata: {
                error: "Analysis timed out. Try a shorter clip or contact support.",
                operation: "analyze",
                retryCount,
                context: { fileId, modelId },
              },
            });
            return;
          }

          try {
            const status = await pollWithRetry(jobId);

            if (cancelledRef.current) return;

            setVideoAnalysisProgress(status);
            setProgress(status);

            const warningText =
              elapsed >= POLL_WARNING_MS
                ? " Analysis is taking longer than expected. Still processing..."
                : "";
            updateMessage(statusMsgId, {
              content: getStageDisplayText(status) + warningText,
              metadata: {
                stage: status.stage,
                progress: status.progress,
                currentFrame: status.currentFrame,
                totalFrames: status.totalFrames,
                message: status.message,
              },
            });

            if (status.stage === "complete") {
              clearPollTimeout();
              clearVideoAnalysisProgress();
              setLoading(false);
              setIsAnalyzing(false);
              setProgress(null);
              statusMessageIdRef.current = null;

              const analysisResult = await getVideoAnalysisResult(jobId);
              setResult(analysisResult);

              const total =
                analysisResult.defectsSummary?.total ??
                analysisResult.flaggedFrames?.reduce(
                  (sum, f) => sum + f.defects.length,
                  0
                ) ??
                0;
              const frameCount = analysisResult.flaggedFrames?.length ?? 0;
              const clipDuration = analysisResult.clipDuration ?? "—";

              addAssistantMessage(
                `Analysis complete! Found ${total} defects across ${frameCount} frames in your ${clipDuration} clip.`,
                "video-report",
                {
                  ...analysisResult,
                  sourceFileId: fileId,
                  modelId,
                }
              );
              return;
            }

            if (status.stage === "error") {
              clearPollTimeout();
              clearVideoAnalysisProgress();
              setLoading(false);
              setIsAnalyzing(false);
              setProgress(null);
              statusMessageIdRef.current = null;
              const errMsg = status.message ?? "Unknown error";
              setError(errMsg);
              addMessage({
                role: "assistant",
                content: errMsg,
                type: "api-error",
                metadata: {
                  error: errMsg,
                  operation: "analyze",
                  retryCount,
                  context: { fileId },
                },
              });
              return;
            }

            if (!cancelledRef.current) {
              pollTimeoutRef.current = setTimeout(poll, POLL_INTERVAL_MS);
            }
          } catch (err) {
            if (cancelledRef.current) return;
            clearPollTimeout();
            clearVideoAnalysisProgress();
            setLoading(false);
            setIsAnalyzing(false);
            setProgress(null);
            statusMessageIdRef.current = null;
            const errMsg =
              err instanceof Error ? err.message : "Network error during analysis.";
            setError(errMsg);
            addMessage({
              role: "assistant",
              content: errMsg,
              type: "api-error",
              metadata: {
                error: errMsg,
                operation: "analyze",
                retryCount,
                context: { fileId, modelId },
              },
            });
          }
        };

        poll();
      } catch (err) {
        setLoading(false);
        setIsAnalyzing(false);
        const errMsg =
          err instanceof Error ? err.message : "Failed to start video analysis.";
        setError(errMsg);
        addMessage({
          role: "assistant",
          content: errMsg,
          type: "api-error",
          metadata: {
            error: errMsg,
            operation: "analyze",
            retryCount,
            context: { fileId, modelId },
          },
        });
      }
    },
    [
      addAssistantMessage,
      addMessage,
      updateMessage,
      removeMessage,
      setLoading,
      setVideoAnalysisProgress,
      clearVideoAnalysisProgress,
      pollWithRetry,
      clearPollTimeout,
    ]
  );

  const retry = useCallback(() => {
    const fileId = lastFileIdRef.current;
    const modelId = lastModelIdRef.current;
    if (fileId && modelId) {
      setError(null);
      startAnalysis(fileId, modelId);
    }
  }, [startAnalysis]);

  return {
    startAnalysis,
    isAnalyzing,
    progress,
    result,
    error,
    cancel,
    retry,
  };
}
