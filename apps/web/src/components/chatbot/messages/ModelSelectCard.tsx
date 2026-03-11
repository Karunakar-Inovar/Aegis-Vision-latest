"use client";

import { useEffect, useState } from "react";
import { Cpu, CheckCircle2 } from "lucide-react";
import type { ModelInfo } from "@/services/chatbot/types";

function ModelListSkeleton() {
  return (
    <div className="space-y-1.5">
      {[1, 2, 3].map((i) => (
        <div
          key={i}
          className="animate-pulse flex items-center justify-between rounded-lg border border-gray-100 bg-gray-50 px-3 py-2.5"
        >
          <div className="flex-1">
            <div className="h-3.5 w-32 rounded bg-gray-200" />
            <div className="mt-1 h-3 w-24 rounded bg-gray-100" />
          </div>
        </div>
      ))}
    </div>
  );
}

export interface ModelSelectCardProps {
  models: ModelInfo[];
  selectedModelId: string | null;
  isLoading: boolean;
  onModelSelect: (modelId: string) => void;
  onCancel: () => void;
  mediaType: "image" | "video";
  lastUsedModelId?: string | null;
}

export function ModelSelectCard({
  models,
  selectedModelId: initialSelectedId,
  isLoading,
  onModelSelect,
  onCancel,
  mediaType,
  lastUsedModelId,
}: ModelSelectCardProps) {
  const [selectedModelId, setSelectedModelId] = useState<string | null>(
    initialSelectedId
  );

  useEffect(() => {
    setSelectedModelId(initialSelectedId);
  }, [initialSelectedId]);

  const handleModelClick = (modelId: string) => {
    setSelectedModelId(modelId);
  };

  const handleRunInspection = () => {
    if (selectedModelId) onModelSelect(selectedModelId);
  };

  return (
    <div className="max-w-[95%] animate-msg-enter">
      <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">
        {/* Header */}
        <div className="border-b border-gray-100 bg-gray-50 px-4 py-2.5">
          <div className="flex items-center gap-2">
            <Cpu className="h-4 w-4 text-indigo-500" />
            <span className="text-sm font-medium text-gray-700">
              Select Inspection Model
            </span>
          </div>
          <p className="mt-0.5 text-xs text-gray-500">
            {mediaType === "image"
              ? "Choose a model to inspect your image"
              : "Choose a model to analyze your video"}
          </p>
        </div>

        {/* Model list */}
        <div className="max-h-[200px] space-y-1.5 overflow-y-auto px-3 py-2">
          {isLoading ? (
            <ModelListSkeleton />
          ) : (
            models.map((model) => (
              <button
                key={model.id}
                type="button"
                onClick={() => handleModelClick(model.id)}
                className={`flex w-full items-center justify-between rounded-lg px-3 py-2.5 text-left transition-all duration-150 ${
                  selectedModelId === model.id
                    ? "border border-indigo-200 bg-indigo-50 ring-1 ring-indigo-100"
                    : "border border-gray-100 bg-white hover:border-gray-200 hover:bg-gray-50"
                }`}
              >
                <div>
                  <div className="flex items-center gap-1.5">
                    <span className="text-sm font-medium text-gray-800">
                      {model.name}
                    </span>
                    {lastUsedModelId === model.id && (
                      <span className="rounded bg-indigo-100 px-1.5 py-0.5 text-[10px] font-medium text-indigo-700">
                        Last used
                      </span>
                    )}
                  </div>
                  <div className="text-xs text-gray-500">{model.deployedOn}</div>
                </div>
                {selectedModelId === model.id && (
                  <CheckCircle2 className="h-4 w-4 shrink-0 text-indigo-600" />
                )}
              </button>
            ))
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between border-t border-gray-100 px-4 py-2.5">
          <button
            type="button"
            onClick={onCancel}
            className="text-xs text-gray-500 transition-colors hover:text-gray-700"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleRunInspection}
            disabled={!selectedModelId}
            className="rounded-lg bg-indigo-600 px-3 py-1.5 text-xs font-medium text-white transition-colors hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-50"
          >
            Run Inspection →
          </button>
        </div>
      </div>
    </div>
  );
}
