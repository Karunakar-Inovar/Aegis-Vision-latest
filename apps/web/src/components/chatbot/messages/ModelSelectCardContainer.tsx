"use client";

import { useCallback, useEffect, useState } from "react";
import { getAvailableModels } from "@/services/chatbot/api";
import { getLastUsedModelId } from "@/services/chatbot/modelMemory";
import type { ModelInfo } from "@/services/chatbot/types";
import { ModelSelectCard } from "./ModelSelectCard";

interface ModelSelectCardContainerProps {
  messageId: string;
  mediaType: "image" | "video";
  onModelSelect: (messageId: string, modelId: string) => void;
  onCancel: (messageId: string) => void;
}

export function ModelSelectCardContainer({
  messageId,
  mediaType,
  onModelSelect,
  onCancel,
}: ModelSelectCardContainerProps) {
  const [models, setModels] = useState<ModelInfo[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const lastUsedModelId = getLastUsedModelId();

  useEffect(() => {
    let cancelled = false;
    getAvailableModels()
      .then((data) => {
        if (!cancelled) {
          setModels(Array.isArray(data) ? data : []);
        }
      })
      .catch(() => {
        if (!cancelled) setModels([]);
      })
      .finally(() => {
        if (!cancelled) setIsLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const selectedModelId = lastUsedModelId && models.some((m) => m.id === lastUsedModelId)
    ? lastUsedModelId
    : models[0]?.id ?? null;

  const handleModelSelect = useCallback(
    (modelId: string) => {
      onModelSelect(messageId, modelId);
    },
    [messageId, onModelSelect]
  );

  const handleCancel = useCallback(() => {
    onCancel(messageId);
  }, [messageId, onCancel]);

  return (
    <ModelSelectCard
      models={models}
      selectedModelId={selectedModelId}
      isLoading={isLoading}
      onModelSelect={handleModelSelect}
      onCancel={handleCancel}
      mediaType={mediaType}
      lastUsedModelId={lastUsedModelId}
    />
  );
}
