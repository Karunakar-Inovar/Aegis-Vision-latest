"use client";

import { useCallback, useState } from "react";
import { useChatbot } from "@/contexts/ChatbotContext";
import { detectDefects } from "@/services/chatbot/api";
import type { DetectionResult } from "@/services/chatbot/types";

export interface UseDetectionResult {
  runDetection: (fileId: string, modelId: string, retryCount?: number) => Promise<void>;
  isDetecting: boolean;
  lastResult: DetectionResult | null;
  error: string | null;
}

export function useDetection(): UseDetectionResult {
  const {
    addAssistantMessage,
    addMessage,
    setLoading,
  } = useChatbot();
  const [isDetecting, setIsDetecting] = useState(false);
  const [lastResult, setLastResult] = useState<DetectionResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const runDetection = useCallback(
    async (fileId: string, modelId: string, retryCount = 0) => {
      setError(null);
      setLastResult(null);

      setLoading(true);
      setIsDetecting(true);

      try {
        const result = await detectDefects({
          fileId,
          modelId,
          confidenceThreshold: 0.5,
        });

        setLastResult(result);
        setLoading(false);
        setIsDetecting(false);

        const defectCount = result.summary?.totalDefects ?? result.defects?.length ?? 0;
        const hasDefects = defectCount > 0;

        addAssistantMessage(
          hasDefects
            ? `Found ${defectCount} defect(s). You can log this as an incident or upload another image.`
            : "All clear! No defects detected.",
          "detection-result",
          { ...result, sourceFileId: fileId }
        );
      } catch (err) {
        const msg =
          err instanceof Error ? err.message : "Detection failed. Please try again.";
        setError(msg);
        setLoading(false);
        setIsDetecting(false);
        addMessage({
          role: "assistant",
          content: msg,
          type: "api-error",
          metadata: {
            error: msg,
            operation: "detect",
            retryCount,
            context: { fileId, modelId },
          },
        });
      }
    },
    [
      addAssistantMessage,
      addMessage,
      setLoading,
    ]
  );

  return { runDetection, isDetecting, lastResult, error };
}
